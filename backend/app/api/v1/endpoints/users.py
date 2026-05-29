from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.user import UserRead, UserUpdate

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserRead)
def read_current_user(current_user: User = Depends(get_current_user)) -> UserRead:
    return UserRead.model_validate(current_user)


@router.patch("/me", response_model=UserRead)
def update_current_user(
    payload: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> UserRead:
    if payload.name is not None:
        current_user.name = payload.name
    if payload.github_url is not None:
        current_user.github_url = str(payload.github_url)
    if payload.linkedin_url is not None:
        current_user.linkedin_url = str(payload.linkedin_url)

    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return UserRead.model_validate(current_user)
