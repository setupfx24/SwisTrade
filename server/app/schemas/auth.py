"""
ProTrader — Auth Request/Response Schemas
Pydantic models for input validation. All user input is validated here.
"""

from pydantic import BaseModel, EmailStr, Field, field_validator
import re


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)
    name: str = Field(..., min_length=2, max_length=100)
    phone: str | None = Field(None, max_length=20)

    @field_validator("password")
    @classmethod
    def validate_password_strength(cls, v: str) -> str:
        """Enforce strong passwords."""
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not re.search(r"[a-z]", v):
            raise ValueError("Password must contain at least one lowercase letter")
        if not re.search(r"[0-9]", v):
            raise ValueError("Password must contain at least one digit")
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', v):
            raise ValueError("Password must contain at least one special character")
        return v

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        """Sanitize name — prevent injection."""
        v = v.strip()
        if not re.match(r"^[a-zA-Z\s\-'.]+$", v):
            raise ValueError("Name contains invalid characters")
        return v

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v: str | None) -> str | None:
        if v is None:
            return v
        v = v.strip()
        if v and not re.match(r"^\+?[\d\s\-()]{7,20}$", v):
            raise ValueError("Invalid phone number format")
        return v


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=1, max_length=128)


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str | None = None
    token_type: str = "bearer"
    user: "UserPublic"


class RefreshRequest(BaseModel):
    refresh_token: str


class UserPublic(BaseModel):
    """Public user data — never includes password_hash or sensitive fields."""
    id: str
    email: str
    name: str
    phone: str | None = None
    role: str
    kyc_status: str
    profile_image: str | None = None
    avatar_type: str | None = None
    is_active: bool
    is_blocked: bool
    is_trading_restricted: bool
    created_at: str


class MessageResponse(BaseModel):
    message: str


# Resolve forward reference
TokenResponse.model_rebuild()
