from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_admin
from app.models.project import Project, ProjectComment, ProjectUpvote
from app.models.user import User
from app.models.notification import Notification
from app.schemas.project import (
    ProjectApproval,
    ProjectRead,
    ProjectSubmit,
    ProjectCommentCreate,
    ProjectCommentRead,
    UpvoteResponse,
)

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


@router.get("/{project_id}/comments", response_model=list[ProjectCommentRead])
def list_project_comments(project_id: str, db: Session = Depends(get_db)) -> list[ProjectCommentRead]:
    comments = db.scalars(select(ProjectComment).where(ProjectComment.project_id == project_id).order_by(ProjectComment.created_at.asc())).all()
    return [ProjectCommentRead.model_validate(c) for c in comments]


@router.post("/{project_id}/comments", response_model=ProjectCommentRead, status_code=status.HTTP_201_CREATED)
def create_project_comment(
    project_id: str,
    payload: ProjectCommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ProjectCommentRead:
    project = db.scalar(select(Project).where(Project.id == project_id))
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    comment = ProjectComment(project_id=project_id, user_id=current_user.id, content=payload.content)
    db.add(comment)
    db.commit()
    db.refresh(comment)
    # notify project creator (if commenter is not the creator)
    try:
        project_creator = db.scalar(select(User).where(User.id == project.creator_id))
        if project_creator and project_creator.id != current_user.id:
            note = Notification(user_id=project_creator.id, message=f"{current_user.name} commented on your project '{project.title}'", url=f"/projects/{project.id}")
            db.add(note)
            db.commit()
    except Exception:
        db.rollback()
    return ProjectCommentRead.model_validate(comment)


@router.post("/{project_id}/upvote", response_model=UpvoteResponse)
def upvote_project(project_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)) -> UpvoteResponse:
    project = db.scalar(select(Project).where(Project.id == project_id))
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    upvote = ProjectUpvote(project_id=project_id, user_id=current_user.id)
    db.add(upvote)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        # Already upvoted — return current total without error
    total = db.scalar(select(ProjectUpvote).where(ProjectUpvote.project_id == project_id).count())
    # notify project creator about upvote
    try:
        project_creator = db.scalar(select(User).where(User.id == project.creator_id))
        if project_creator and project_creator.id != current_user.id:
            note = Notification(user_id=project_creator.id, message=f"{current_user.name} upvoted your project '{project.title}'", url=f"/projects/{project.id}")
            db.add(note)
            db.commit()
    except Exception:
        db.rollback()
    return UpvoteResponse(total=int(total))


@router.get("/{project_id}/upvotes", response_model=UpvoteResponse)
def get_project_upvotes(project_id: str, db: Session = Depends(get_db)) -> UpvoteResponse:
    total = db.scalar(select(ProjectUpvote).where(ProjectUpvote.project_id == project_id).count())
    return UpvoteResponse(total=int(total))


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
