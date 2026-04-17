"""
SwisTrade — Prop Challenges Router
Browse available challenges, purchase, view active props, phase tracking.
"""

from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel

from app.middleware.auth import get_current_user
from app.models.user import User
from app.models.prop import PropAccount, PropSettings, PropType, PropAccountStatus
from app.models.account import TradingAccount, AccountType
from app.models.wallet import Wallet
from app.models.transaction import Transaction, TransactionType, TransactionMethod, TransactionStatus

router = APIRouter(prefix="/prop", tags=["Prop Challenges"])


@router.get("/available")
async def list_available_challenges(user: User = Depends(get_current_user)):
    """List all available prop challenge options (sizes, prices, rules)."""
    settings = await PropSettings.find(PropSettings.is_active == True).sort("account_size").to_list()
    return [
        {
            "id": str(s.id),
            "prop_type": s.prop_type.value,
            "account_size": s.account_size,
            "price": s.price,
            "phases_count": s.phases_count,
            "rules": {
                "max_daily_loss_pct": s.max_daily_loss_pct,
                "max_total_loss_pct": s.max_total_loss_pct,
                "profit_target_pct": s.profit_target_pct,
                "min_trading_days": s.min_trading_days,
                "max_trading_days": s.max_trading_days,
                "sl_required": s.sl_required,
                "tp_required": s.tp_required,
                "max_lot_size": s.max_lot_size,
                "max_leverage": s.max_leverage,
                "daily_trade_limit": s.daily_trade_limit,
                "max_open_trades": s.max_open_trades,
            },
        }
        for s in settings
    ]


class PurchasePropRequest(BaseModel):
    prop_settings_id: str


@router.post("/purchase", status_code=201)
async def purchase_prop_challenge(data: PurchasePropRequest, user: User = Depends(get_current_user)):
    """
    Purchase a prop challenge. Deducts from wallet balance.
    Creates a trading account with challenge balance and links it to the prop account.
    """
    settings = await PropSettings.get(data.prop_settings_id)
    if not settings or not settings.is_active:
        raise HTTPException(status_code=404, detail="Prop challenge not found or inactive")

    # Check wallet balance
    wallet = await Wallet.find_one(Wallet.user_id == user.id)
    if not wallet or wallet.balance < settings.price:
        raise HTTPException(status_code=400, detail=f"Insufficient wallet balance. Need ${settings.price}")

    # Deduct from wallet
    wallet.balance -= settings.price
    wallet.updated_at = datetime.now(timezone.utc)
    await wallet.save()

    # Record purchase transaction
    txn = Transaction(
        user_id=user.id,
        type=TransactionType.PROP_PURCHASE,
        method=TransactionMethod.INTERNAL,
        status=TransactionStatus.COMPLETED,
        amount=settings.price,
    )
    await txn.insert()

    # Create trading account for the challenge
    trading_acct = TradingAccount(
        user_id=user.id,
        account_type=AccountType.STANDARD,
        balance=settings.account_size,
        equity=settings.account_size,
        free_margin=settings.account_size,
        leverage=settings.max_leverage,
        is_funded=True,
        initial_deposit=settings.account_size,
        is_prop_account=True,
    )
    while await TradingAccount.find_one(TradingAccount.account_number == trading_acct.account_number):
        from app.models.account import generate_account_number
        trading_acct.account_number = generate_account_number()
    await trading_acct.insert()

    # Snapshot rules
    rules_snapshot = {
        "max_daily_loss_pct": settings.max_daily_loss_pct,
        "max_total_loss_pct": settings.max_total_loss_pct,
        "profit_target_pct": settings.profit_target_pct,
        "min_trading_days": settings.min_trading_days,
        "max_trading_days": settings.max_trading_days,
        "sl_required": settings.sl_required,
        "tp_required": settings.tp_required,
        "max_lot_size": settings.max_lot_size,
        "max_leverage": settings.max_leverage,
        "partial_close_required": settings.partial_close_required,
        "daily_trade_limit": settings.daily_trade_limit,
        "max_open_trades": settings.max_open_trades,
    }

    # Create prop account
    prop = PropAccount(
        user_id=user.id,
        prop_type=settings.prop_type,
        account_size=settings.account_size,
        price_paid=settings.price,
        total_phases=settings.phases_count,
        trading_account_id=trading_acct.id,
        risk_rules=rules_snapshot,
        phases=[{
            "phase_num": 1,
            "status": "active",
            "start_date": datetime.now(timezone.utc).isoformat(),
            "end_date": None,
            "starting_balance": settings.account_size,
            "current_balance": settings.account_size,
            "trading_account_id": str(trading_acct.id),
        }],
    )
    await prop.insert()

    # Link trading account to prop
    trading_acct.prop_account_id = prop.id
    await trading_acct.save()
    txn.prop_account_id = prop.id
    await txn.save()

    return {
        "prop_id": str(prop.id),
        "trading_account_id": str(trading_acct.id),
        "account_number": trading_acct.account_number,
        "account_size": settings.account_size,
        "prop_type": settings.prop_type.value,
        "phases": settings.phases_count,
        "rules": rules_snapshot,
        "message": "Prop challenge purchased successfully!",
    }


@router.get("/my-challenges")
async def list_my_challenges(
    user: User = Depends(get_current_user),
    status_filter: str = Query(None, alias="status"),
):
    """List all user's prop challenge accounts."""
    query = PropAccount.find(PropAccount.user_id == user.id)
    if status_filter:
        query = query.find(PropAccount.status == status_filter)

    props = await query.sort("-created_at").to_list()
    result = []
    for p in props:
        acct = await TradingAccount.get(p.trading_account_id) if p.trading_account_id else None
        result.append({
            "id": str(p.id),
            "prop_type": p.prop_type.value,
            "account_size": p.account_size,
            "price_paid": p.price_paid,
            "status": p.status.value,
            "current_phase": p.current_phase,
            "total_phases": p.total_phases,
            "phases": p.phases,
            "risk_rules": p.risk_rules,
            "is_blown": p.is_blown,
            "blown_reason": p.blown_reason,
            "trading_account": {
                "id": str(acct.id),
                "account_number": acct.account_number,
                "balance": acct.balance,
                "equity": acct.equity,
            } if acct else None,
            "purchased_at": p.purchased_at.isoformat(),
        })
    return result


@router.get("/{prop_id}")
async def get_prop_detail(prop_id: str, user: User = Depends(get_current_user)):
    """Get detailed info about a specific prop challenge."""
    prop = await PropAccount.get(prop_id)
    if not prop or prop.user_id != user.id:
        raise HTTPException(status_code=404, detail="Prop challenge not found")

    acct = await TradingAccount.get(prop.trading_account_id) if prop.trading_account_id else None
    from app.models.trade import Trade, TradeStatus
    trades = await Trade.find(
        Trade.account_id == prop.trading_account_id,
    ).sort("-open_time").limit(50).to_list() if prop.trading_account_id else []

    return {
        "id": str(prop.id),
        "prop_type": prop.prop_type.value,
        "account_size": prop.account_size,
        "status": prop.status.value,
        "current_phase": prop.current_phase,
        "total_phases": prop.total_phases,
        "phases": prop.phases,
        "risk_rules": prop.risk_rules,
        "is_blown": prop.is_blown,
        "blown_reason": prop.blown_reason,
        "blown_at": prop.blown_at.isoformat() if prop.blown_at else None,
        "account": {
            "balance": acct.balance,
            "equity": acct.equity,
            "total_trades": acct.total_trades,
            "total_pnl": acct.total_pnl,
        } if acct else None,
        "recent_trades": [
            {
                "instrument": t.instrument,
                "direction": t.direction.value,
                "lot_size": t.lot_size,
                "pnl": round(t.pnl, 2),
                "status": t.status.value,
                "open_time": t.open_time.isoformat(),
            }
            for t in trades
        ],
    }
