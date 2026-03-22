import uuid
from datetime import datetime
from enum import StrEnum

from pydantic import BaseModel


class CharacterRole(StrEnum):
    PROTAGONIST = "protagonist"
    ANTAGONIST = "antagonist"
    SUPPORTING = "supporting"
    MINOR = "minor"


class CharacterBase(BaseModel):
    name: str
    aliases: list[str] | None = None
    description: str | None = None
    role: CharacterRole | None = None
    appearance: str | None = None
    arc: str | None = None


class CharacterCreate(CharacterBase):
    project_id: uuid.UUID


class CharacterUpdate(BaseModel):
    name: str | None = None
    aliases: list[str] | None = None
    description: str | None = None
    role: CharacterRole | None = None
    appearance: str | None = None
    arc: str | None = None


class CharacterResponse(CharacterBase):
    id: uuid.UUID
    project_id: uuid.UUID
    created_at: datetime

    model_config = {"from_attributes": True}
