import uuid
from datetime import datetime
from enum import StrEnum

from pydantic import BaseModel


class ClipStatus(StrEnum):
    DRAFT = "draft"
    QUEUED = "queued"
    RENDERING = "rendering"
    READY = "ready"
    FAILED = "failed"


class ClipBase(BaseModel):
    order: int
    prompt: str
    model: str = "veo-3.1"
    duration_seconds: int = 8
    aspect_ratio: str = "16:9"


class ClipCreate(ClipBase):
    scene_id: uuid.UUID


class ClipUpdate(BaseModel):
    order: int | None = None
    prompt: str | None = None
    model: str | None = None
    duration_seconds: int | None = None
    aspect_ratio: str | None = None
    selected: bool | None = None


class ClipResponse(ClipBase):
    id: uuid.UUID
    scene_id: uuid.UUID
    status: ClipStatus
    video_url: str | None = None
    thumbnail_url: str | None = None
    render_job_id: str | None = None
    selected: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
