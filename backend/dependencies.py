from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User
from app.auth import decode_access_token


bearer_scheme = HTTPBearer()


# Get the currently logged-in user
def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db),
):
    token = credentials.credentials

    try:
        payload = decode_access_token(token)

        if not payload:
            raise ValueError("Invalid token")

        user_id = payload.get("user_id")

        if user_id is None:
            raise ValueError("Token is missing user_id")

        user_id = int(user_id)

    except (ValueError, TypeError, AttributeError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = db.query(User).filter(User.id == user_id).first()

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user


# Check allowed roles
def require_role(*allowed_roles: str):
    allowed = {role.upper() for role in allowed_roles}

    def role_checker(
        current_user: User = Depends(get_current_user),
    ):
        current_role = (current_user.role or "").upper()

        if current_role not in allowed:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission",
            )

        return current_user

    return role_checker


# Allow organizers and admins
def require_organizer(
    current_user: User = Depends(get_current_user),
):
    role = (current_user.role or "").upper()

    if role not in {"ORGANIZER", "ADMIN"}:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Organizer or admin access required",
        )

    return current_user


# Alias for multi-role checks
def require_roles(*allowed_roles: str):
    return require_role(*allowed_roles)


# Allow admins only
def require_admin(
    current_user: User = Depends(get_current_user),
):
    role = (current_user.role or "").strip().upper()

    if role != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Admin access required. Current role: {role}",
        )

    return current_user