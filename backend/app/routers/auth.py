"""Authentication router."""

import jwt
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from app.config import settings
from app.deps import TokenData, get_current_user

router = APIRouter(prefix="/api/auth", tags=["auth"])


class UserResponse(BaseModel):
    """Response schema for authenticated user."""

    id: str
    email: str
    name: str | None = None
    picture: str | None = None


class LoginRequest(BaseModel):
    """Request schema for token verification."""

    token: str


@router.post("/login", response_model=UserResponse)
async def login(data: LoginRequest) -> UserResponse:
    """Verify NextAuth JWT token and return user data.

    The frontend sends the JWT token from NextAuth session.
    We verify it and return the user info.
    """
    try:
        payload = jwt.decode(
            data.token,
            settings.AUTH_SECRET,
            algorithms=["HS256"],
            options={"verify_signature": True},
        )

        return UserResponse(
            id=payload.get("sub", ""),
            email=payload.get("email", ""),
            name=payload.get("name"),
            picture=payload.get("picture"),
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


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: TokenData = Depends(get_current_user)) -> UserResponse:
    """Get current authenticated user.

    Requires Bearer token in Authorization header.
    """
    return UserResponse(
        id=current_user.sub,
        email=current_user.email,
        name=current_user.name,
        picture=current_user.picture,
    )


@router.post("/logout")
async def logout(current_user: TokenData = Depends(get_current_user)) -> dict[str, str]:
    """Logout endpoint (stateless JWT - token invalidation is client-side).

    The client should discard the token.
    """
    return {"message": "Logged out successfully"}
