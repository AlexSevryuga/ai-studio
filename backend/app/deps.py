"""Authentication dependencies."""

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel

from app.config import settings


class TokenData(BaseModel):
    """Token payload from NextAuth JWT."""

    email: str
    name: str | None = None
    picture: str | None = None
    sub: str  # user ID


security = HTTPBearer(auto_error=False)


async def get_token_data(token: str) -> TokenData:
    """Decode and validate JWT token from NextAuth."""
    try:
        payload = jwt.decode(
            token,
            settings.AUTH_SECRET,
            algorithms=["HS256"],
            options={"verify_signature": True},
        )
        return TokenData(
            email=payload.get("email", ""),
            name=payload.get("name"),
            picture=payload.get("picture"),
            sub=payload.get("sub", ""),
        )
    except jwt.ExpiredSignatureError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
        ) from e
    except jwt.InvalidTokenError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        ) from e


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
) -> TokenData:
    """Get current user from JWT token.

    Used as a dependency to protect API routes.
    """
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return await get_token_data(credentials.credentials)
