"""Tasks router for Celery task status."""


from celery.result import AsyncResult
from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.celery_app import celery_app
from app.deps import TokenData, get_current_user

router = APIRouter(prefix="/api/tasks", tags=["tasks"])


class TaskStatusResponse(BaseModel):
    """Response schema for task status."""

    task_id: str
    status: str
    result: dict | None = None


@router.get("/{task_id}", response_model=TaskStatusResponse)
async def get_task_status(
    task_id: str,
    current_user: TokenData = Depends(get_current_user),
) -> TaskStatusResponse:
    """Get Celery task status.

    Args:
        task_id: UUID of task

    Returns:
        Task status and result if available
    """
    result = AsyncResult(task_id, app=celery_app)

    response = TaskStatusResponse(
        task_id=task_id,
        status=result.state,
        result=result.result if result.ready() else None,
    )

    return response
