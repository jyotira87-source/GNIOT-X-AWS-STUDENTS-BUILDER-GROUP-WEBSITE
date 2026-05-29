from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.email import send_email
from app.core.config import get_settings
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.core.security import (
    create_access_token,
    create_token,
    decode_token,
    get_password_hash,
    verify_password,
)
from app.models.enums import UserRole
from app.models.user import User
from app.schemas.auth import AuthResponse, LoginRequest, RegisterRequest
from app.schemas.auth import ForgotPasswordRequest, ResetPasswordRequest, VerifyEmailRequest
from app.schemas.user import UserRead

router = APIRouter(prefix="/auth", tags=["auth"])
settings = get_settings()


def _set_auth_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        key=settings.cookie_name,
        value=token,
        httponly=True,
        secure=settings.cookie_secure,
        samesite=settings.cookie_samesite,
        max_age=settings.access_token_expire_minutes * 60,
        path="/",
    )


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, response: Response, db: Session = Depends(get_db)) -> AuthResponse:
    existing_user = db.scalar(select(User).where(User.email == payload.email.lower()))
    if existing_user:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    role = UserRole.ADMIN_LEADER if payload.email.lower() == settings.admin_seed_email.lower() else UserRole.MEMBER

    new_user = User(
        name=payload.name,
        email=payload.email.lower(),
        hashed_password=get_password_hash(payload.password),
        department=payload.department,
        role=role,
        github_url=payload.github_url,
        linkedin_url=payload.linkedin_url,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = create_access_token(str(new_user.id), expires_delta=timedelta(minutes=settings.access_token_expire_minutes))
    _set_auth_cookie(response, token)

    # Send verification email (non-blocking in production is preferable)
    try:
        verification_token = create_token(str(new_user.id), "email_verification", expires_delta=timedelta(hours=24))
        verify_link = f"{settings.frontend_url}/verify-email?token={verification_token}"
        send_email(
            to=new_user.email,
            subject="Verify your GNIOT X AWS Builders Hub account",
            body=f"Hi {new_user.name},\n\nPlease verify your email by visiting: {verify_link}\n\nIf you didn't sign up, ignore this message.",
            html=f"<p>Hi {new_user.name},</p><p>Please verify your email by clicking <a href=\"{verify_link}\">here</a>.</p>",
        )
    except Exception:
        # Don't break registration on email errors; log in real app
        pass
    return AuthResponse(user=UserRead.model_validate(new_user))


@router.post("/login", response_model=AuthResponse)
def login(payload: LoginRequest, response: Response, db: Session = Depends(get_db)) -> AuthResponse:
    user = db.scalar(select(User).where(User.email == payload.email.lower()))
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    token = create_access_token(str(user.id), expires_delta=timedelta(minutes=settings.access_token_expire_minutes))
    _set_auth_cookie(response, token)
    return AuthResponse(user=UserRead.model_validate(user))



@router.post("/forgot-password", status_code=status.HTTP_204_NO_CONTENT)
def forgot_password(payload: ForgotPasswordRequest, db: Session = Depends(get_db)) -> None:
    user = db.scalar(select(User).where(User.email == payload.email.lower()))
    if not user:
        # Return 204 to avoid user enumeration
        return None

    reset_token = create_token(str(user.id), "password_reset", expires_delta=timedelta(hours=1))
    reset_link = f"{settings.frontend_url}/reset-password?token={reset_token}"
    try:
        send_email(
            to=user.email,
            subject="Reset your Builder Hub password",
            body=f"Hello {user.name},\n\nReset your password here: {reset_link}\n\nIf you didn't request this, ignore.",
            html=f"<p>Hello {user.name},</p><p>Reset your password <a href=\"{reset_link}\">here</a>.</p>",
        )
    except Exception:
        pass
    return None


@router.post("/reset-password")
def reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db)) -> Response:
    data = decode_token(payload.token)
    if not data or data.get("purpose") != "password_reset":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired token")

    user_id = data.get("sub")
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    user.hashed_password = get_password_hash(payload.new_password)
    db.add(user)
    db.commit()
    return Response(status_code=status.HTTP_200_OK)


@router.post("/verify-email")
def verify_email(payload: VerifyEmailRequest, db: Session = Depends(get_db)) -> Response:
    data = decode_token(payload.token)
    if not data or data.get("purpose") != "email_verification":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired token")

    user_id = data.get("sub")
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    user.email_verified = True
    db.add(user)
    db.commit()
    return Response(status_code=status.HTTP_200_OK)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(response: Response) -> Response:
    response.delete_cookie(key=settings.cookie_name, path="/")
    return response


@router.get("/me", response_model=AuthResponse)
def me(current_user: User = Depends(get_current_user)) -> AuthResponse:
    return AuthResponse(user=UserRead.model_validate(current_user))
