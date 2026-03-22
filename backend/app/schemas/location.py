import uuid
from datetime import datetime
from enum import StrEnum

from pydantic import BaseModel


class IntExt(StrEnum):
    INT = "INT"
    EXT = "EXT"
    INT_EXT = "INT/EXT"


class LocationBase(BaseModel):
    name: str
    description: str | None = None
    visual_description: str | None = None
    int_ext: IntExt | None = None


class LocationCreate(LocationBase):
    project_id: uuid.UUID


class LocationUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    visual_description: str | None = None
    int_ext: IntExt | None = None


class LocationResponse(LocationBase):
    id: uuid.UUID
    project_id: uuid.UUID
    created_at: datetime

    model_config = {"from_attributes": True}
