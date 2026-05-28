import csv
import io
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.core.database import get_db
from app.core.dependencies import get_current_user, get_optional_current_user, require_admin
from app.models.event import Event
from app.models.user import User
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
