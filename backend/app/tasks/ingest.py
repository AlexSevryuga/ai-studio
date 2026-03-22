"""Ingest task - parses uploaded book files."""

import uuid

from sqlalchemy import select

from app.celery_app import celery_app
from app.database import async_session_maker
from app.models import Project


@celery_app.task(bind=True)
def ingest_book(self, project_id: str) -> dict:
    """Parse uploaded book and extract characters/locations.

    Args:
        project_id: UUID of project to ingest

    Returns:
        Dict with extraction results
    """

    task_id = self.request.id
    results = {
        "task_id": task_id,
        "project_id": project_id,
        "characters_created": 0,
        "locations_created": 0,
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

            # Get source file URL
            if not project.source_file_url:
                results["status"] = "error"
                results["error"] = "No source file uploaded"
                return results

            # For now, we can't actually parse the file without the R2 presigned URL
            # and a proper document parser. This is a placeholder.
            # In production, you would:
            # 1. Download file from R2 using presigned URL
            # 2. Parse PDF/DOCX/TXT using document parser (e.g., PyPDF2, python-docx)
            # 3. Extract text content
            # 4. Run Ingestor LLM to extract characters and locations

            results["status"] = "completed"
            results["message"] = "Ingest task completed (placeholder)"
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
