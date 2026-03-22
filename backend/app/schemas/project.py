import uuid
from datetime import datetime
from enum import StrEnum

from pydantic import BaseModel


class ProjectStatus(StrEnum):
    DRAFT = "draft"
    INGESTED = "ingested"
    STRUCTURED = "structured"
    IN_PRODUCTION = "in_production"


class ProjectFormat(StrEnum):
    FILM = "film"
    SERIES = "series"
    ANIMATION = "animation"
    GAME = "game"


class ProjectBase(BaseModel):
    title: str
    description: str | None = None
    format: ProjectFormat = ProjectFormat.FILM


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    format: ProjectFormat | None = None
    logline: str | None = None
    synopsis: str | None = None
    status: ProjectStatus | None = None


class ProjectResponse(ProjectBase):
    id: uuid.UUID
    owner_id: uuid.UUID
    source_file_url: str | None = None
    source_text: str | None = None
    logline: str | None = None
    synopsis: str | None = None
    status: ProjectStatus
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
