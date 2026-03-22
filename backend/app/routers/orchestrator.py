import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import get_db
from app.models import Project
from app.schemas import OrchestratorRequest, OrchestratorResponse
from app.services.orchestrator import Orchestrator

router = APIRouter(prefix="/api/projects", tags=["orchestrator"])


@router.post("/{project_id}/orchestrate", response_model=OrchestratorResponse)
async def orchestrate(
    project_id: uuid.UUID,
    data: OrchestratorRequest,
    db: AsyncSession = Depends(get_db),
) -> OrchestratorResponse:
    # Load project
    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Check API keys
    if settings.LLM_PROVIDER == "anthropic" and not settings.ANTHROPIC_API_KEY:
        return OrchestratorResponse(
            success=False,
            action=data.command.value,
            results={"error": "ANTHROPIC_API_KEY not configured"},
            message="Set ANTHROPIC_API_KEY in environment",
        )
    if settings.LLM_PROVIDER == "openai" and not settings.OPENAI_API_KEY:
        return OrchestratorResponse(
            success=False,
            action=data.command.value,
            results={"error": "OPENAI_API_KEY not configured"},
            message="Set OPENAI_API_KEY in environment",
        )

    # Run orchestration
    orchestrator = Orchestrator(db, project_id)
    params = data.params.model_dump() if data.params else {}

    try:
        result = await orchestrator.run(data.command.value, params)
        return OrchestratorResponse(
            success=result["success"],
            action=result["action"],
            results=result["results"],
            message=result["message"],
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Orchestration error: {str(e)}") from e
