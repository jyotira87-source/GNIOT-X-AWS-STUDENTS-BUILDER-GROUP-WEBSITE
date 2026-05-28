import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, HttpUrl


class ProjectSubmit(BaseModel):
    title: str = Field(min_length=3, max_length=180)
    description: str = Field(min_length=10)
    tech_stack: list[str] = Field(min_length=1)
    github_repo: HttpUrl
    live_demo_url: HttpUrl | None = None


class ProjectRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    description: str
    tech_stack: list[str]
    github_repo: str
    live_demo_url: str | None
    creator_id: uuid.UUID
    approved: bool
    created_at: datetime


class ProjectApproval(BaseModel):
    approved: bool = True
