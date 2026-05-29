import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field, HttpUrl

from app.models.enums import Department, UserRole


class UserBase(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    department: Department
    github_url: HttpUrl | None = None
    linkedin_url: HttpUrl | None = None


class UserCreate(UserBase):
    password: str = Field(min_length=8, max_length=128)


class UserUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=120)
    github_url: HttpUrl | None = None
    linkedin_url: HttpUrl | None = None


class UserRead(UserBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    role: UserRole
    email_verified: bool
    created_at: datetime
    updated_at: datetime
