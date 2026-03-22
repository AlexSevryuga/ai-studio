import uuid
from enum import StrEnum

from pydantic import BaseModel


class OrchestratorCommand(StrEnum):
    INGEST_AND_EXTRACT = "ingest_and_extract"
    GENERATE_STORY_STRUCTURE = "generate_story_structure"
    REFINE_SCENE = "refine_scene"
    GENERATE_SCRIPT = "generate_script"
    GENERATE_VISION_PROMPTS = "generate_vision_prompts"


class OrchestratorParams(BaseModel):
    format: str = "film"
    num_acts: int = 3
    scene_id: uuid.UUID | None = None


class OrchestratorRequest(BaseModel):
    command: OrchestratorCommand
    params: OrchestratorParams | None = None


class OrchestratorResponse(BaseModel):
    success: bool
    action: str
    results: dict | None = None
    message: str | None = None
