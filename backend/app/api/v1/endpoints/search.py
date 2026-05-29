from fastapi import APIRouter, Query, Depends
from sqlalchemy import select, func
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.project import Project
from app.models.event import Event

router = APIRouter(prefix="", tags=["search"])


@router.get("/api/v1/search")
def search(q: str = Query(..., min_length=1), db: Session = Depends(get_db)):
    # Use Postgres full-text search if available; fallback to ILIKE
    try:
        proj_q = select(Project).where(
            func.to_tsvector('english', func.concat(Project.title, ' ', Project.description)).op('@@')(func.plainto_tsquery('english', q))
        ).limit(10)
        projects = db.scalars(proj_q).all()

        event_q = select(Event).where(
            func.to_tsvector('english', func.concat(Event.title, ' ', Event.description)).op('@@')(func.plainto_tsquery('english', q))
        ).limit(10)
        events = db.scalars(event_q).all()
    except Exception:
        ilike_q = f"%{q}%"
        projects = db.scalars(select(Project).where(Project.title.ilike(ilike_q) | Project.description.ilike(ilike_q)).limit(10)).all()
        events = db.scalars(select(Event).where(Event.title.ilike(ilike_q) | Event.description.ilike(ilike_q)).limit(10)).all()

    return {"projects": [
        {"id": p.id, "title": p.title, "description": p.description, "created_at": p.created_at} for p in projects
    ], "events": [
        {"id": e.id, "title": e.title, "description": e.description, "start_time": e.start_time} for e in events
    ]}
