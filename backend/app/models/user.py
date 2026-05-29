from typing import TYPE_CHECKING

from sqlalchemy import Enum, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDPrimaryKeyMixin
from app.models.enums import Department, UserRole

if TYPE_CHECKING:
    from app.models.event import Event
    from app.models.project import Project


class User(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "users"

    name: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)

    role: Mapped[UserRole] = mapped_column(Enum(UserRole, name="user_role"), default=UserRole.MEMBER, nullable=False)
    department: Mapped[Department] = mapped_column(Enum(Department, name="department"), nullable=False)

    github_url: Mapped[str | None] = mapped_column(String(255), nullable=True)
    linkedin_url: Mapped[str | None] = mapped_column(String(255), nullable=True)
    email_verified: Mapped[bool] = mapped_column(default=False, nullable=False)

    created_projects: Mapped[list["Project"]] = relationship("Project", back_populates="creator", cascade="all, delete-orphan")
    rsvp_events: Mapped[list["Event"]] = relationship(
        "Event",
        secondary="event_rsvps",
        back_populates="rsvps",
    )
