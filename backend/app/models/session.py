"""
ProTrader — Session Document Model
Tracks every login — device, IP, location.
Used for security monitoring and "login as user" audit.
"""

from datetime import datetime, timezone
from typing import Optional

from beanie import Document, PydanticObjectId
from pydantic import Field


class Session(Document):
    user_id: PydanticObjectId
    device_info: str = ""  # User-Agent string
    ip_address: str = ""
    location: Optional[str] = None  # Derived from IP (optional)

    # Token tracking — we store a hash of the refresh token, NOT the token itself
    refresh_token_hash: str = ""

    is_active: bool = True

    # Admin impersonation tracking
    is_impersonation: bool = False
    impersonated_by: Optional[PydanticObjectId] = None

    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    last_activity: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "sessions"
