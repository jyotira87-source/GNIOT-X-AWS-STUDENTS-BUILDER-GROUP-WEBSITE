from fastapi import APIRouter, Depends
from sqlalchemy import desc, func, select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import require_admin
from app.models.association import rsvp_association_table
from app.models.event import Event
from app.models.project import Project
from app.models.user import User
from app.schemas.dashboard import DashboardStats

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/stats", response_model=DashboardStats)
def get_dashboard_stats(db: Session = Depends(get_db), _=Depends(require_admin)) -> DashboardStats:
    total_members = db.scalar(select(func.count(User.id))) or 0
    total_events = db.scalar(select(func.count(Event.id))) or 0
    total_rsvps = db.scalar(select(func.count()).select_from(rsvp_association_table)) or 0

    top_projects_query = (
        select(Project.title, func.cardinality(Project.tech_stack).label("stack_size"))
        .where(Project.approved.is_(True))
        .order_by(desc("stack_size"), Project.created_at.desc())
        .limit(5)
    )
    top_projects_rows = db.execute(top_projects_query).all()
    top_projects = [{"title": row.title, "stack_size": row.stack_size} for row in top_projects_rows]

    return DashboardStats(
        total_members=total_members,
        total_events=total_events,
        total_rsvps=total_rsvps,
        top_projects=top_projects,
    )
