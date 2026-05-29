from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, Integer, String, Text
from sqlalchemy import DateTime, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.models.user import User


class Event(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "events"

    title: Mapped[str] = mapped_column(String(180), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    location: Mapped[str] = mapped_column(String(120), nullable=False)
    start_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    end_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    rsvp_limit: Mapped[int] = mapped_column(Integer, nullable=False, default=50)

    rsvps: Mapped[list["User"]] = relationship(
        "User",
        secondary="event_rsvps",
        back_populates="rsvp_events",
    )
    waitlist: Mapped[list["EventWaitlist"]] = relationship(
        "EventWaitlist",
        back_populates="event",
        cascade="all, delete-orphan",
    )


class EventWaitlist(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "event_waitlist"
    __table_args__ = (UniqueConstraint("event_id", "user_id", name="uq_event_user_waitlist"),)

    event_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("events.id", ondelete="CASCADE"), nullable=False)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    user: Mapped["User"] = relationship("User", back_populates="waitlisted_events")
    event: Mapped["Event"] = relationship("Event", back_populates="waitlist")
