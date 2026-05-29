import csv
import io
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.core.database import get_db
from app.core.dependencies import get_current_user, get_optional_current_user, require_admin
from app.models.event import Event, EventWaitlist
from app.models.user import User
from app.models.notification import Notification
from app.schemas.event import EventCreate, EventRead

router = APIRouter(prefix="/events", tags=["events"])


@router.get("", response_model=list[EventRead])
def list_events(db: Session = Depends(get_db), current_user: User | None = Depends(get_optional_current_user)) -> list[EventRead]:
    events = db.scalars(select(Event).options(selectinload(Event.rsvps)).order_by(Event.start_time.asc())).all()
    return [
        EventRead(
            id=event.id,
            title=event.title,
            description=event.description,
            location=event.location,
            start_time=event.start_time,
            end_time=event.end_time,
            rsvp_limit=event.rsvp_limit,
            rsvp_count=len(event.rsvps),
            spots_left=max(event.rsvp_limit - len(event.rsvps), 0),
            is_rsvped=bool(current_user and any(rsvp_user.id == current_user.id for rsvp_user in event.rsvps)),
        )
        for event in events
    ]


@router.post("", response_model=EventRead, status_code=status.HTTP_201_CREATED)
def create_event(
    payload: EventCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
) -> EventRead:
    if payload.end_time <= payload.start_time:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Event end time must be after start time")

    event = Event(
        title=payload.title,
        description=payload.description,
        location=payload.location,
        start_time=payload.start_time,
        end_time=payload.end_time,
        rsvp_limit=payload.rsvp_limit,
    )
    db.add(event)
    db.commit()
    db.refresh(event)

    return EventRead(
        id=event.id,
        title=event.title,
        description=event.description,
        location=event.location,
        start_time=event.start_time,
        end_time=event.end_time,
        rsvp_limit=event.rsvp_limit,
        rsvp_count=0,
        spots_left=event.rsvp_limit,
        is_rsvped=False,
    )


@router.post("/{event_id}/rsvp", response_model=EventRead)
def rsvp_event(event_id: UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)) -> EventRead:
    event = db.scalar(select(Event).options(selectinload(Event.rsvps)).where(Event.id == event_id))
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")

    if current_user in event.rsvps:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Already RSVPed")

    if len(event.rsvps) >= event.rsvp_limit:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="RSVP limit reached")

    event.rsvps.append(current_user)
    db.commit()
    db.refresh(event)

    return EventRead(
        id=event.id,
        title=event.title,
        description=event.description,
        location=event.location,
        start_time=event.start_time,
        end_time=event.end_time,
        rsvp_limit=event.rsvp_limit,
        rsvp_count=len(event.rsvps),
        spots_left=max(event.rsvp_limit - len(event.rsvps), 0),
        is_rsvped=True,
    )



@router.post("/{event_id}/waitlist", response_model=EventRead)
def join_waitlist(event_id: UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)) -> EventRead:
    event = db.scalar(select(Event).options(selectinload(Event.rsvps)).where(Event.id == event_id))
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")

    # if already RSVPed, nothing to do
    if current_user in event.rsvps:
        pass

    # if spots are available, add as RSVP
    if len(event.rsvps) < event.rsvp_limit:
        event.rsvps.append(current_user)
        db.commit()
        db.refresh(event)
        return EventRead(
            id=event.id,
            title=event.title,
            description=event.description,
            location=event.location,
            start_time=event.start_time,
            end_time=event.end_time,
            rsvp_limit=event.rsvp_limit,
            rsvp_count=len(event.rsvps),
            spots_left=max(event.rsvp_limit - len(event.rsvps), 0),
            is_rsvped=True,
        )

    # otherwise add to waitlist if not already present
    existing = db.scalar(select(EventWaitlist).where(EventWaitlist.event_id == event_id, EventWaitlist.user_id == current_user.id))
    if existing:
        # already waitlisted
        pass
    else:
        entry = EventWaitlist(event_id=event_id, user_id=current_user.id)
        db.add(entry)
        try:
            db.commit()
        except Exception:
            db.rollback()

    # return current event state
    db.refresh(event)
    return EventRead(
        id=event.id,
        title=event.title,
        description=event.description,
        location=event.location,
        start_time=event.start_time,
        end_time=event.end_time,
        rsvp_limit=event.rsvp_limit,
        rsvp_count=len(event.rsvps),
        spots_left=max(event.rsvp_limit - len(event.rsvps), 0),
        is_rsvped=bool(current_user and any(rsvp_user.id == current_user.id for rsvp_user in event.rsvps)),
    )


@router.delete("/{event_id}/rsvp", response_model=EventRead)
def cancel_rsvp(event_id: UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)) -> EventRead:
    event = db.scalar(select(Event).options(selectinload(Event.rsvps)).where(Event.id == event_id))
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")

    if current_user not in event.rsvps:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not RSVPed")

    # remove RSVP
    event.rsvps.remove(current_user)
    db.commit()

    # promote first waitlist user if exists
    next_in_line = db.scalar(select(EventWaitlist).where(EventWaitlist.event_id == event_id).order_by(EventWaitlist.created_at.asc()))
    if next_in_line:
        # add user to rsvps
        promoted_user = db.scalar(select(User).where(User.id == next_in_line.user_id))
        if promoted_user:
            event.rsvps.append(promoted_user)
            # remove waitlist entry
            db.delete(next_in_line)
            db.commit()
            # notify the promoted user
            try:
                note = Notification(user_id=promoted_user.id, message=f"You've been moved from the waitlist into RSVPs for '{event.title}'", url=f"/events/{event.id}")
                db.add(note)
                db.commit()
            except Exception:
                db.rollback()

    db.refresh(event)
    return EventRead(
        id=event.id,
        title=event.title,
        description=event.description,
        location=event.location,
        start_time=event.start_time,
        end_time=event.end_time,
        rsvp_limit=event.rsvp_limit,
        rsvp_count=len(event.rsvps),
        spots_left=max(event.rsvp_limit - len(event.rsvps), 0),
        is_rsvped=bool(current_user and any(rsvp_user.id == current_user.id for rsvp_user in event.rsvps)),
    )


@router.get("/{event_id}/rsvps/export")
def export_event_rsvps(event_id: UUID, db: Session = Depends(get_db), _: User = Depends(require_admin)) -> StreamingResponse:
    event = db.scalar(select(Event).options(selectinload(Event.rsvps)).where(Event.id == event_id))
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["name", "email", "department", "role"])
    for attendee in event.rsvps:
        writer.writerow([attendee.name, attendee.email, attendee.department.value, attendee.role.value])

    output.seek(0)
    filename = f"event_{event_id}_rsvps.csv"
    headers = {"Content-Disposition": f"attachment; filename={filename}"}
    return StreamingResponse(iter([output.getvalue()]), media_type="text/csv", headers=headers)
