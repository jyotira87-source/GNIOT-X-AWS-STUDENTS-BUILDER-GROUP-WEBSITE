import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class EventCreate(BaseModel):
    title: str = Field(min_length=3, max_length=180)
    description: str = Field(min_length=10)
    location: str = Field(min_length=2, max_length=120)
    start_time: datetime
    end_time: datetime
    rsvp_limit: int = Field(ge=1, le=5000)


class EventRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    description: str
    location: str
    start_time: datetime
    end_time: datetime
    rsvp_limit: int
    rsvp_count: int
    spots_left: int
    is_rsvped: bool
