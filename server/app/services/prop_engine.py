"""
SwisTrade — Prop Challenge Engine
Real-time rule enforcement. Immediate blow on violation.
Checks: daily loss, total loss, SL/TP required, lot limits, leverage, trade count.
"""

from datetime import datetime, timezone, timedelta
from typing import Optional

from beanie import PydanticObjectId
from app.models.prop import PropAccount, PropAccountStatus, PhaseStatus
from app.models.trade import Trade, TradeStatus, TradeDirection
from app.models.account import TradingAccount, AccountStatus


async def check_prop_rules(
    prop_account_id: PydanticObjectId,
    event_type: str,  # "trade_open", "trade_close", "price_update"
    trade: Optional[Trade] = None,
):
    """
    Run on every trade event. If any rule is violated, IMMEDIATELY blow the account.
    This is the core enforcement engine for prop challenges.
    """
    prop = await PropAccount.get(prop_account_id)
    if not prop or prop.status != PropAccountStatus.ACTIVE:
        return

    rules = prop.risk_rules
    if not rules:
        return

    account = await TradingAccount.get(prop.trading_account_id)
    if not account:
        return

    # --- Check SL Required (on trade open) ---
    if event_type == "trade_open" and trade:
        if rules.get("sl_required") and not trade.stop_loss:
            await _blow_account(prop, account, "Stop loss not set on trade (SL required)")
            return

        if rules.get("tp_required") and not trade.take_profit:
            await _blow_account(prop, account, "Take profit not set on trade (TP required)")
            return

    # --- Check Lot Size Limit ---
    if trade and rules.get("max_lot_size", 0) > 0:
        if trade.lot_size > rules["max_lot_size"]:
            await _blow_account(prop, account, f"Lot size {trade.lot_size} exceeds max {rules['max_lot_size']}")
            return

    # --- Check Max Open Trades ---
    if event_type == "trade_open" and rules.get("max_open_trades", 0) > 0:
        open_count = await Trade.find(
            Trade.account_id == account.id,
            Trade.status == TradeStatus.OPEN,
        ).count()
        if open_count > rules["max_open_trades"]:
            await _blow_account(prop, account, f"Exceeded max open trades ({rules['max_open_trades']})")
            return

    # --- Check Daily Trade Limit ---
    if event_type == "trade_open" and rules.get("daily_trade_limit", 0) > 0:
        today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
        today_trades = await Trade.find(
            Trade.account_id == account.id,
            Trade.open_time >= today_start,
        ).count()
        if today_trades > rules["daily_trade_limit"]:
            await _blow_account(prop, account, f"Daily trade limit exceeded ({rules['daily_trade_limit']})")
            return

    # --- Check Daily Loss Limit ---
    if rules.get("max_daily_loss_pct", 0) > 0:
        daily_pnl = await _get_daily_pnl(account.id)
        max_daily_loss = prop.account_size * (rules["max_daily_loss_pct"] / 100)
        if daily_pnl <= -max_daily_loss:
            await _blow_account(prop, account, f"Daily loss limit exceeded (${abs(daily_pnl):.2f} > ${max_daily_loss:.2f})")
            return

    # --- Check Total Loss Limit (drawdown from initial balance) ---
    if rules.get("max_total_loss_pct", 0) > 0:
        max_loss = prop.account_size * (rules["max_total_loss_pct"] / 100)
        total_loss = prop.account_size - account.equity
        if total_loss >= max_loss:
            await _blow_account(prop, account, f"Total loss limit exceeded (equity ${account.equity:.2f})")
            return

    # --- Check Leverage Limit ---
    if trade and rules.get("max_leverage", 0) > 0:
        if account.leverage > rules["max_leverage"]:
            await _blow_account(prop, account, f"Leverage {account.leverage} exceeds max {rules['max_leverage']}")
            return

    # --- Check Profit Target (phase passed!) ---
    if rules.get("profit_target_pct", 0) > 0:
        profit = account.equity - prop.account_size
        target = prop.account_size * (rules["profit_target_pct"] / 100)
        if profit >= target:
            # Check min trading days
            min_days = rules.get("min_trading_days", 0)
            if min_days > 0:
                days_traded = await _count_trading_days(account.id, prop.purchased_at)
                if days_traded < min_days:
                    return  # Not enough trading days yet, keep going

            await _pass_phase(prop, account)
            return


async def _get_daily_pnl(account_id: PydanticObjectId) -> float:
    """Get total P&L for today (realized + unrealized)."""
    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)

    # Realized P&L from today's closed trades
    closed_today = await Trade.find(
        Trade.account_id == account_id,
        Trade.status == TradeStatus.CLOSED,
        Trade.close_time >= today_start,
    ).to_list()
    realized = sum(t.pnl for t in closed_today)

    # Unrealized P&L from open trades
    open_trades = await Trade.find(
        Trade.account_id == account_id,
        Trade.status == TradeStatus.OPEN,
    ).to_list()
    unrealized = 0.0
    for t in open_trades:
        if t.direction == TradeDirection.BUY:
            unrealized += (t.current_price - t.open_price) * t.lot_size * 100000
        else:
            unrealized += (t.open_price - t.current_price) * t.lot_size * 100000

    return realized + unrealized


async def _count_trading_days(account_id: PydanticObjectId, since: datetime) -> int:
    """Count unique days where at least one trade was opened."""
    trades = await Trade.find(
        Trade.account_id == account_id,
        Trade.open_time >= since,
    ).to_list()

    unique_days = set()
    for t in trades:
        unique_days.add(t.open_time.date())
    return len(unique_days)


async def _blow_account(prop: PropAccount, account: TradingAccount, reason: str):
    """
    IMMEDIATELY blow the prop account.
    Freezes the trading account, closes all open trades at current price.
    """
    # Close all open trades at current price
    open_trades = await Trade.find(
        Trade.account_id == account.id,
        Trade.status == TradeStatus.OPEN,
    ).to_list()

    for trade in open_trades:
        trade.status = TradeStatus.CLOSED
        trade.close_price = trade.current_price
        if trade.direction == TradeDirection.BUY:
            trade.pnl = (trade.current_price - trade.open_price) * trade.lot_size * 100000
        else:
            trade.pnl = (trade.open_price - trade.current_price) * trade.lot_size * 100000
        trade.close_time = datetime.now(timezone.utc)
        await trade.save()

    # Blow the prop account
    prop.is_blown = True
    prop.blown_reason = reason
    prop.blown_at = datetime.now(timezone.utc)
    prop.status = PropAccountStatus.BLOWN

    # Update current phase
    if prop.phases:
        prop.phases[-1]["status"] = "blown"
        prop.phases[-1]["end_date"] = datetime.now(timezone.utc).isoformat()
    await prop.save()

    # Freeze the trading account
    account.status = AccountStatus.SUSPENDED
    account.updated_at = datetime.now(timezone.utc)
    await account.save()

    print(f"[PROP BLOW] Account {account.account_number} blown: {reason}")


async def _pass_phase(prop: PropAccount, account: TradingAccount):
    """
    Mark current phase as passed.
    If all phases done → create funded live account.
    If more phases → advance to next phase.
    """
    # Mark current phase as passed
    if prop.phases:
        prop.phases[-1]["status"] = "passed"
        prop.phases[-1]["end_date"] = datetime.now(timezone.utc).isoformat()
        prop.phases[-1]["current_balance"] = account.equity

    if prop.current_phase >= prop.total_phases:
        # All phases passed! Create live funded account
        prop.status = PropAccountStatus.FUNDED

        # Create a new live trading account with the prop account size
        live_account = TradingAccount(
            user_id=prop.user_id,
            account_type=account.account_type,
            balance=prop.account_size,
            equity=prop.account_size,
            free_margin=prop.account_size,
            leverage=account.leverage,
            is_funded=True,
            initial_deposit=prop.account_size,
            is_prop_account=True,
            prop_account_id=prop.id,
        )
        # Generate unique account number
        while await TradingAccount.find_one(TradingAccount.account_number == live_account.account_number):
            from app.models.account import generate_account_number
            live_account.account_number = generate_account_number()

        await live_account.insert()
        prop.live_account_id = live_account.id
        await prop.save()

        print(f"[PROP FUNDED] User's prop challenge funded! Live account: {live_account.account_number}")
    else:
        # Advance to next phase
        prop.current_phase += 1
        new_phase = {
            "phase_num": prop.current_phase,
            "status": "active",
            "start_date": datetime.now(timezone.utc).isoformat(),
            "end_date": None,
            "starting_balance": prop.account_size,
            "current_balance": prop.account_size,
            "trading_account_id": None,  # Will be set when new account is created
        }

        # Create new trading account for next phase
        new_account = TradingAccount(
            user_id=prop.user_id,
            account_type=account.account_type,
            balance=prop.account_size,
            equity=prop.account_size,
            free_margin=prop.account_size,
            leverage=account.leverage,
            is_funded=True,
            initial_deposit=prop.account_size,
            is_prop_account=True,
            prop_account_id=prop.id,
        )
        while await TradingAccount.find_one(TradingAccount.account_number == new_account.account_number):
            from app.models.account import generate_account_number
            new_account.account_number = generate_account_number()

        await new_account.insert()

        new_phase["trading_account_id"] = str(new_account.id)
        prop.phases.append(new_phase)
        prop.trading_account_id = new_account.id
        await prop.save()

        print(f"[PROP PHASE] Advanced to phase {prop.current_phase}")
