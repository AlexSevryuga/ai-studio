"""Orchestration task - runs AI orchestration."""

import uuid

from sqlalchemy import select

from app.celery_app import celery_app
from app.database import async_session_maker
from app.models import OrchestratorLog, Project


@celery_app.task(bind=True)
def run_orchestration(self, project_id: str, command: str, params: dict | None = None) -> dict:
    """Run AI orchestration command.

    Args:
        project_id: UUID of project
        command: Orchestration command (ingest_and_extract, generate_story_structure, etc.)
        params: Optional parameters for the command

    Returns:
        Dict with orchestration results
    """
    task_id = self.request.id
    results = {
        "task_id": task_id,
        "project_id": project_id,
        "command": command,
        "status": "processing",
    }

    async def _process():
        async with async_session_maker() as db:
            # Load project
            result = await db.execute(select(Project).where(Project.id == uuid.UUID(project_id)))
            project = result.scalar_one_or_none()

            if not project:
                results["status"] = "error"
                results["error"] = "Project not found"
                return results

            # Log the orchestration
            log = OrchestratorLog(
                project_id=uuid.UUID(project_id),
                action=command,
                input_data={"params": params or {}},
                model_used="celery-task",
            )
            db.add(log)
            await db.commit()
            await db.refresh(log)

            # For now, this is a placeholder. In production:
            # 1. Load project source text
            # 2. Run appropriate LLM orchestration
            # 3. Process tool calls to create entities

            results["status"] = "completed"
            results["log_id"] = str(log.id)
            results["message"] = f"Orchestration '{command}' completed (placeholder)"
            return results

    # Run async code
    import asyncio
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        result = loop.run_until_complete(_process())
        return result
    finally:
        loop.close()
