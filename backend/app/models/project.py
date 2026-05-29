import uuid
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, ForeignKey, String, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import ARRAY, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.models.user import User


class Project(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "projects"

    title: Mapped[str] = mapped_column(String(180), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    tech_stack: Mapped[list[str]] = mapped_column(ARRAY(String), nullable=False, default=list)

    github_repo: Mapped[str] = mapped_column(String(255), nullable=False)
    live_demo_url: Mapped[str | None] = mapped_column(String(255), nullable=True)

    creator_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    approved: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    creator: Mapped["User"] = relationship("User", back_populates="created_projects")
    comments: Mapped[list["ProjectComment"]] = relationship(
        "ProjectComment",
        back_populates="project",
        cascade="all, delete-orphan",
    )
    upvotes: Mapped[list["ProjectUpvote"]] = relationship(
        "ProjectUpvote",
        back_populates="project",
        cascade="all, delete-orphan",
    )


class ProjectComment(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "project_comments"

    project_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    content: Mapped[str] = mapped_column(Text, nullable=False)

    user: Mapped["User"] = relationship("User", back_populates="project_comments")
    project: Mapped["Project"] = relationship("Project", back_populates="comments")


class ProjectUpvote(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "project_upvotes"
    __table_args__ = (UniqueConstraint("project_id", "user_id", name="uq_project_user_upvote"),)

    project_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )

    user: Mapped["User"] = relationship("User", back_populates="project_upvotes")
    project: Mapped["Project"] = relationship("Project", back_populates="upvotes")
