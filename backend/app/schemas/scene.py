import uuid
from datetime import datetime
from enum import StrEnum

from pydantic import BaseModel


class SceneStatus(StrEnum):
    DRAFT = "draft"
    READY = "ready"
    IN_REVIEW = "in_review"


class IntExt(StrEnum):
    INT = "INT"
    EXT = "EXT"
    INT_EXT = "INT/EXT"


class TimeOfDay(StrEnum):
    NIGHT = "night"
    DAY = "day"
    DAWN = "dawn"
    DUST = "dusk"
    EVENING = "evening"


class SceneBase(BaseModel):
    order: int
    act: int | None = None
    title: str | None = None
    description: str
    int_ext: IntExt | None = None
    time_of_day: TimeOfDay | None = None
    location_id: uuid.UUID | None = None
    dramatic_function: str | None = None
    source_chapter: str | None = None
    status: SceneStatus = SceneStatus.DRAFT


class SceneCreate(SceneBase):
    project_id: uuid.UUID


class SceneUpdate(BaseModel):
    order: int | None = None
    act: int | None = None
    title: str | None = None
    description: str | None = None
    int_ext: IntExt | None = None
    time_of_day: TimeOfDay | None = None
    location_id: uuid.UUID | None = None
    dramatic_function: str | None = None
    source_chapter: str | None = None
    status: SceneStatus | None = None


class SceneResponse(SceneBase):
    id: uuid.UUID
    project_id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class SceneReorder(BaseModel):
    scene_ids: list[uuid.UUID]
