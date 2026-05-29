from fastapi import APIRouter

from app.api.v1.endpoints import auth, dashboard, events, projects, users, notifications, search

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(events.router)
api_router.include_router(projects.router)
api_router.include_router(dashboard.router)
api_router.include_router(notifications.router)
api_router.include_router(search.router)
