"""
ProTrader — Auth Middleware
Verifies JWT on every protected request. Role checked SERVER-SIDE only.
Never trust client-side role claims.
"""

from typing import Optional, List

from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.utils.security import decode_access_token
from app.models.user import User, UserRole

# Bearer token extractor — expects "Authorization: Bearer <token>"
security_scheme = HTTPBearer(auto_error=False)


async def get_current_user(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme),
) -> User:
    """
    Extract and verify the user from the JWT access token.
    This runs on EVERY protected endpoint — no exceptions.
    """
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Decode token — server-side verification
    payload = decode_access_token(credentials.credentials)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
        )

    # Always fetch fresh user from DB — never trust token claims for role/status
    user = await User.get(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    # Check if user is active and not blocked
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account deactivated",
        )

    if user.is_blocked:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account blocked",
        )

    return user


def require_roles(allowed_roles: List[UserRole]):
    """
    Dependency factory for role-based access control.
    Checks role from DATABASE, not from JWT or client.

    Usage:
        @router.get("/admin/users", dependencies=[Depends(require_roles([UserRole.SUPER_ADMIN]))])
    """
    async def role_checker(user: User = Depends(get_current_user)) -> User:
        if user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions",
            )
        return user

    return role_checker


# Convenience dependencies
get_admin_user = require_roles([UserRole.SUPER_ADMIN, UserRole.SUB_ADMIN])
get_super_admin = require_roles([UserRole.SUPER_ADMIN])
