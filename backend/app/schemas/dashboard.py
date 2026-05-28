from pydantic import BaseModel


class DashboardStats(BaseModel):
    total_members: int
    total_events: int
    total_rsvps: int
    top_projects: list[dict[str, str | int]]
