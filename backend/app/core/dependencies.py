from uuid import UUID

from fastapi import Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.database import get_db
from app.core.security import decode_access_token
from app.models.enums import UserRole
from app.models.user import User

settings = get_settings()


credentials_exception = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Could not validate credentials",
)


def get_current_user(request: Request, db: Session = Depends(get_db)) -> User:
    token = request.cookies.get(settings.cookie_name)
    if not token:
        raise credentials_exception

    payload = decode_access_token(token)
    if not payload:
        raise credentials_exception

    subject = payload.get("sub")
    if not subject:
        raise credentials_exception

    try:
        user_id = UUID(subject)
    except ValueError as exc:
        raise credentials_exception from exc

    stmt = select(User).where(User.id == user_id)
    user = db.scalar(stmt)
    if not user:
        raise credentials_exception

    return user


def get_optional_current_user(request: Request, db: Session = Depends(get_db)) -> User | None:
    token = request.cookies.get(settings.cookie_name)
    if not token:
        return None

    payload = decode_access_token(token)
    if not payload:
        return None

    subject = payload.get("sub")
    if not subject:
        return None

    try:
        user_id = UUID(subject)
    except ValueError:
        return None

    stmt = select(User).where(User.id == user_id)
    return db.scalar(stmt)


def require_admin(user: User = Depends(get_current_user)) -> User:
    if user.role != UserRole.ADMIN_LEADER:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return user
