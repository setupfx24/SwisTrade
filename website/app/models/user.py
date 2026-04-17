"""
ProTrader — User Document Model
Stored in MongoDB 'users' collection via Beanie ODM.
"""

from datetime import datetime, timezone
from typing import Optional
from enum import Enum

from beanie import Document
from pydantic import EmailStr, Field


class UserRole(str, Enum):
    USER = "user"
    SUB_ADMIN = "sub_admin"
    SUPER_ADMIN = "super_admin"


class KYCStatus(str, Enum):
    NOT_SUBMITTED = "not_submitted"
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


class User(Document):
    email: EmailStr
    password_hash: str  # bcrypt hashed — never store plaintext
    name: str
    phone: Optional[str] = None

    role: UserRole = UserRole.USER

    # KYC
    kyc_status: KYCStatus = KYCStatus.NOT_SUBMITTED

    # Profile
    profile_image: Optional[str] = None  # file path on server
    avatar_type: Optional[str] = None  # emotion-based avatar choice

    # Read-only access
    read_only_password: Optional[str] = None  # hashed, for spectator mode

    # Account status — admin can block/ban users
    is_active: bool = True
    is_blocked: bool = False
    block_reason: Optional[str] = None

    # Trading restriction (admin can restrict without full block)
    is_trading_restricted: bool = False

    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "users"  # MongoDB collection name
        use_state_management = True

    class Config:
        json_schema_extra = {
            "example": {
                "email": "trader@example.com",
                "name": "John Doe",
                "role": "user",
            }
        }
