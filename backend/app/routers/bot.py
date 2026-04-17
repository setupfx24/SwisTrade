"""
SwisTrade — Bot / Algo Router
Create bots, get webhook URLs, receive TradingView alerts, signal history.
"""

from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query, Request
from pydantic import BaseModel, Field
from typing import Optional

from app.middleware.auth import get_current_user
from app.models.user import User
from app.models.bot import Bot, BotSignal, BotStatus, BotSignalStatus
from app.models.account import TradingAccount
from app.models.trade import Trade

router = APIRouter(prefix="/bots", tags=["Algo Bots"])


class CreateBotRequest(BaseModel):
    account_id: str
    name: str = Field("My Bot", max_length=100)
    strategy_name: str = Field("", max_length=100)
    default_lot_size: float = Field(0.01, gt=0, le=100)
    max_lot_size: float = Field(1.0, gt=0, le=100)


@router.post("/", status_code=201)
async def create_bot(data: CreateBotRequest, user: User = Depends(get_current_user)):
    """Create a new algo bot linked to a trading account."""
    account = await TradingAccount.get(data.account_id)
    if not account or account.user_id != user.id:
        raise HTTPException(status_code=404, detail="Account not found")
    if not account.is_funded:
        raise HTTPException(status_code=400, detail="Account must be funded")

    bot = Bot(
        user_id=user.id,
        account_id=account.id,
        name=data.name,
        strategy_name=data.strategy_name,
        default_lot_size=data.default_lot_size,
        max_lot_size=data.max_lot_size,
    )
    await bot.insert()

    return {
        "id": str(bot.id),
        "name": bot.name,
        "webhook_url": f"https://swistrade.com/api/v1/bots/webhook/{bot.webhook_secret}",
        "webhook_secret": bot.webhook_secret,
        "account_number": account.account_number,
        "message": "Bot created. Use the webhook URL in your TradingView strategy alerts.",
    }


@router.get("/")
async def list_bots(user: User = Depends(get_current_user)):
    """List all user's bots."""
    bots = await Bot.find(Bot.user_id == user.id).sort("-created_at").to_list()
    result = []
    for b in bots:
        acct = await TradingAccount.get(b.account_id)
        result.append({
            "id": str(b.id),
            "name": b.name,
            "strategy_name": b.strategy_name,
            "status": b.status.value,
            "account_number": acct.account_number if acct else "",
            "webhook_url": f"https://swistrade.com/api/v1/bots/webhook/{b.webhook_secret}",
            "total_signals": b.total_signals,
            "total_trades_executed": b.total_trades_executed,
            "total_pnl": round(b.total_pnl, 2),
            "created_at": b.created_at.isoformat(),
        })
    return result


@router.post("/webhook/{webhook_secret}")
async def receive_webhook(webhook_secret: str, request: Request):
    """
    TradingView webhook endpoint. Receives alert → parses → auto-executes trade.
    No auth required (uses webhook secret for verification).
    """
    bot = await Bot.find_one(Bot.webhook_secret == webhook_secret, Bot.is_active == True)
    if not bot:
        raise HTTPException(status_code=404, detail="Bot not found")

    if bot.status != BotStatus.ACTIVE:
        raise HTTPException(status_code=400, detail="Bot is paused or disabled")

    try:
        payload = await request.json()
    except Exception:
        body = await request.body()
        payload = {"raw": body.decode("utf-8", errors="replace")}

    # Parse TradingView alert format
    action = str(payload.get("action", payload.get("strategy", {}).get("order_action", ""))).lower()
    instrument = str(payload.get("ticker", payload.get("symbol", ""))).upper().replace("/", "")
    lot_size = float(payload.get("lot_size", payload.get("contracts", bot.default_lot_size)))
    price = float(payload.get("price", payload.get("close", 0)))
    sl = float(payload.get("sl", payload.get("stop_loss", 0)))
    tp = float(payload.get("tp", payload.get("take_profit", 0)))

    lot_size = min(lot_size, bot.max_lot_size)

    signal = BotSignal(
        bot_id=bot.id,
        raw_payload=payload,
        action=action,
        instrument=instrument,
        lot_size=lot_size,
        price=price,
        sl=sl,
        tp=tp,
    )

    bot.total_signals += 1

    # Execute based on action
    if action in ("buy", "sell"):
        try:
            account = await TradingAccount.get(bot.account_id)
            if not account or not account.is_funded:
                signal.status = BotSignalStatus.FAILED
                signal.error_message = "Account not funded"
            else:
                from app.services.trade_engine import open_trade
                trade = await open_trade(
                    account=account,
                    instrument_symbol=instrument,
                    direction=action,
                    lot_size=lot_size,
                    price=price,
                    stop_loss=sl if sl > 0 else None,
                    take_profit=tp if tp > 0 else None,
                )
                trade.is_bot_trade = True
                trade.bot_id = bot.id
                await trade.save()

                signal.trade_id = trade.id
                signal.status = BotSignalStatus.EXECUTED
                bot.total_trades_executed += 1
        except Exception as e:
            signal.status = BotSignalStatus.FAILED
            signal.error_message = str(e)

    elif action in ("close", "closelong", "closeshort"):
        # Close matching open trades
        from app.models.trade import TradeStatus, TradeDirection
        query_filter = {
            "account_id": bot.account_id,
            "status": TradeStatus.OPEN,
            "instrument": instrument,
        }
        if action == "closelong":
            query_filter["direction"] = TradeDirection.BUY
        elif action == "closeshort":
            query_filter["direction"] = TradeDirection.SELL

        open_trades = await Trade.find(query_filter).to_list()
        if open_trades:
            from app.services.trade_engine import close_trade
            for t in open_trades:
                await close_trade(t, price)
            signal.status = BotSignalStatus.EXECUTED
        else:
            signal.status = BotSignalStatus.IGNORED
            signal.error_message = "No matching open trades"
    else:
        signal.status = BotSignalStatus.IGNORED
        signal.error_message = f"Unknown action: {action}"

    await signal.insert()
    await bot.save()

    return {"status": signal.status.value, "message": signal.error_message or "OK"}


@router.get("/{bot_id}/signals")
async def get_bot_signals(
    bot_id: str,
    user: User = Depends(get_current_user),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
):
    """Get signal history for a bot."""
    bot = await Bot.get(bot_id)
    if not bot or bot.user_id != user.id:
        raise HTTPException(status_code=404, detail="Bot not found")

    total = await BotSignal.find(BotSignal.bot_id == bot.id).count()
    skip = (page - 1) * per_page
    signals = await BotSignal.find(BotSignal.bot_id == bot.id).sort("-created_at").skip(skip).limit(per_page).to_list()

    return {
        "signals": [
            {
                "id": str(s.id),
                "action": s.action,
                "instrument": s.instrument,
                "lot_size": s.lot_size,
                "price": s.price,
                "status": s.status.value,
                "error_message": s.error_message,
                "trade_id": str(s.trade_id) if s.trade_id else None,
                "created_at": s.created_at.isoformat(),
            }
            for s in signals
        ],
        "total": total,
        "page": page,
    }


@router.patch("/{bot_id}/toggle")
async def toggle_bot(bot_id: str, user: User = Depends(get_current_user)):
    """Pause or activate a bot."""
    bot = await Bot.get(bot_id)
    if not bot or bot.user_id != user.id:
        raise HTTPException(status_code=404, detail="Bot not found")

    bot.status = BotStatus.PAUSED if bot.status == BotStatus.ACTIVE else BotStatus.ACTIVE
    await bot.save()
    return {"status": bot.status.value}
