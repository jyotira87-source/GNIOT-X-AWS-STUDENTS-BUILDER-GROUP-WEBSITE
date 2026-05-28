from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_admin
from app.models.project import Project
from app.models.user import User
from app.schemas.project import ProjectApproval, ProjectRead, ProjectSubmit

router = APIRouter(prefix="/projects", tags=["projects"])


@router.get("", response_model=list[ProjectRead])
def list_approved_projects(db: Session = Depends(get_db)) -> list[ProjectRead]:
    projects = db.scalars(select(Project).where(Project.approved.is_(True)).order_by(Project.created_at.desc())).all()
    return [ProjectRead.model_validate(project) for project in projects]


@router.get("/all", response_model=list[ProjectRead])
def list_all_projects(db: Session = Depends(get_db), _: User = Depends(require_admin)) -> list[ProjectRead]:
    projects = db.scalars(select(Project).order_by(Project.created_at.desc())).all()
    return [ProjectRead.model_validate(project) for project in projects]


@router.post("/submit", response_model=ProjectRead, status_code=status.HTTP_201_CREATED)
def submit_project(payload: ProjectSubmit, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)) -> ProjectRead:
    project = Project(
        title=payload.title,
        description=payload.description,
        tech_stack=[item.strip() for item in payload.tech_stack if item.strip()],
        github_repo=str(payload.github_repo),
        live_demo_url=str(payload.live_demo_url) if payload.live_demo_url else None,
        creator_id=current_user.id,
        approved=False,
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    return ProjectRead.model_validate(project)


@router.patch("/{project_id}/approve", response_model=ProjectRead)
def approve_project(
    project_id: str,
    payload: ProjectApproval,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
) -> ProjectRead:
    project = db.scalar(select(Project).where(Project.id == project_id))
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    project.approved = payload.approved
    db.commit()
    db.refresh(project)
    return ProjectRead.model_validate(project)
