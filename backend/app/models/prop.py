"""
SwisTrade — Prop Challenge Models
One-step, Two-step, Instant Fund accounts with real-time rule enforcement.
Auto-blow on violation (immediate).
"""

from datetime import datetime, timezone
from typing import Optional, List
from enum import Enum

from beanie import Document, PydanticObjectId
from pydantic import Field


class PropType(str, Enum):
    ONE_STEP = "one_step"
    TWO_STEP = "two_step"
    INSTANT_FUND = "instant_fund"


class PhaseStatus(str, Enum):
    ACTIVE = "active"
    PASSED = "passed"
    FAILED = "failed"
    BLOWN = "blown"


class PropAccountStatus(str, Enum):
    ACTIVE = "active"
    PASSED = "passed"             # All phases passed
    FUNDED = "funded"             # Live funded account active
    BLOWN = "blown"               # Failed due to rule violation
    EXPIRED = "expired"


class PropPhase(dict):
    """Embedded phase tracking within a prop account."""
    pass
    # Structure:
    # {
    #   "phase_num": 1,
    #   "status": "active|passed|failed|blown",
    #   "trading_account_id": "...",
    #   "start_date": "...",
    #   "end_date": null,
    #   "starting_balance": 10000,
    #   "current_balance": 10500,
    #   "max_daily_loss_hit": false,
    #   "max_total_loss_hit": false,
    #   "min_trading_days_met": false,
    #   "trading_days_count": 5,
    #   "total_pnl": 500,
    #   "total_trades": 15,
    # }


class PropRules(dict):
    """Rules snapshot for a prop account. Copied from PropSettings at purchase time."""
    pass
    # Structure:
    # {
    #   "max_daily_loss_pct": 5,
    #   "max_total_loss_pct": 10,
    #   "profit_target_pct": 8,
    #   "min_trading_days": 5,
    #   "max_trading_days": 30,
    #   "sl_required": true,
    #   "tp_required": false,
    #   "max_lot_size": 10.0,
    #   "max_leverage": 100,
    #   "partial_close_required": false,
    #   "daily_trade_limit": 0 (0=unlimited),
    #   "max_open_trades": 0 (0=unlimited),
    # }


class PropAccount(Document):
    user_id: PydanticObjectId
    prop_type: PropType
    account_size: float                    # e.g. 10000, 25000, 50000, 100000
    price_paid: float                      # How much user paid for this challenge
    currency: str = "USD"

    status: PropAccountStatus = PropAccountStatus.ACTIVE
    current_phase: int = 1                 # Which phase they're on (1 or 2)
    total_phases: int = 1                  # 1 for one-step/instant, 2 for two-step

    phases: List[dict] = Field(default_factory=list)   # PropPhase dicts
    risk_rules: dict = Field(default_factory=dict)     # PropRules snapshot

    # Trading account linked to current phase
    trading_account_id: Optional[PydanticObjectId] = None

    # Live funded account (created after passing all phases)
    live_account_id: Optional[PydanticObjectId] = None

    # Blow tracking
    is_blown: bool = False
    blown_reason: Optional[str] = None
    blown_at: Optional[datetime] = None
    blown_rule: Optional[str] = None       # Which rule was violated

    purchased_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "prop_accounts"


class PropSettings(Document):
    """
    Admin-configurable prop challenge options.
    Defines sizes, prices, and rules for each prop type.
    """
    prop_type: PropType
    account_size: float                   # e.g. 10000
    price: float                          # e.g. 99.00 to buy this challenge
    phases_count: int = 1                 # 1 for one-step, 2 for two-step
    is_active: bool = True

    # Rules
    max_daily_loss_pct: float = 5.0
    max_total_loss_pct: float = 10.0
    profit_target_pct: float = 8.0
    min_trading_days: int = 5
    max_trading_days: int = 30            # 0 = unlimited
    sl_required: bool = True
    tp_required: bool = False
    max_lot_size: float = 10.0
    max_leverage: int = 100
    partial_close_required: bool = False
    daily_trade_limit: int = 0            # 0 = unlimited
    max_open_trades: int = 0              # 0 = unlimited

    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "prop_settings"
