"""Render task - sends clips to video generation API."""

import uuid

from sqlalchemy import select

from app.celery_app import celery_app
from app.database import async_session_maker
from app.models import Clip


@celery_app.task(bind=True)
def render_clip(self, clip_id: str) -> dict:
    """Send clip to video generation API.

    Args:
        clip_id: UUID of clip to render

    Returns:
        Dict with render job results
    """
    task_id = self.request.id
    results = {
        "task_id": task_id,
        "clip_id": clip_id,
        "status": "processing",
    }

    async def _process():
        async with async_session_maker() as db:
            # Load clip
            result = await db.execute(select(Clip).where(Clip.id == uuid.UUID(clip_id)))
            clip = result.scalar_one_or_none()

            if not clip:
                results["status"] = "error"
                results["error"] = "Clip not found"
                return results

            # Update clip status
            clip.status = "rendering"
            clip.render_job_id = task_id
            await db.commit()

            # For now, this is a placeholder. In production:
            # 1. Send prompt to video API (Veo 3.1, Sora, etc.)
            # 2. Get job ID
            # 3. Store job ID for polling

            results["status"] = "queued"
            results["message"] = "Render job queued (placeholder)"
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


@celery_app.task(bind=True)
def poll_render_status(self, clip_id: str, job_id: str) -> dict:
    """Poll video generation API for render status.

    Args:
        clip_id: UUID of clip
        job_id: Render job ID to poll

    Returns:
        Dict with updated status
    """
    task_id = self.request.id
    results = {
        "task_id": task_id,
        "clip_id": clip_id,
        "job_id": job_id,
        "status": "processing",
    }

    async def _process():
        async with async_session_maker() as db:
            result = await db.execute(select(Clip).where(Clip.id == uuid.UUID(clip_id)))
            clip = result.scalar_one_or_none()

            if not clip:
                results["status"] = "error"
                results["error"] = "Clip not found"
                return results

            # For now, this is a placeholder. In production:
            # 1. Poll video API for job status
            # 2. Update clip with video URL when complete
            # 3. Handle failures

            results["status"] = clip.status
            results["message"] = "Poll completed (placeholder)"
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
