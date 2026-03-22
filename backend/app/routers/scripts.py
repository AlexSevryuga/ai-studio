import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import Script

router = APIRouter(prefix="/api/scripts", tags=["scripts"])

# Note: reusing Clip schemas for simplicity - in real app would have separate schemas


@router.get("/scene/{scene_id}")
async def list_scripts(
    scene_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> list[dict]:
    result = await db.execute(
        select(Script).where(Script.scene_id == scene_id).order_by(Script.version.desc())
    )
    scripts = result.scalars().all()
    return [
        {
            "id": str(s.id),
            "scene_id": str(s.scene_id),
            "content": s.content,
            "version": s.version,
            "created_at": s.created_at.isoformat() if s.created_at else None,
        }
        for s in scripts
    ]


@router.post("/scene/{scene_id}")
async def create_script(
    scene_id: uuid.UUID,
    content: str,
    db: AsyncSession = Depends(get_db),
) -> dict:
    # Get max version
    result = await db.execute(
        select(Script).where(Script.scene_id == scene_id).order_by(Script.version.desc())
    )
    last_script = result.scalar_one_or_none()
    next_version = (last_script.version + 1) if last_script else 1

    script = Script(
        scene_id=scene_id,
        content=content,
        version=next_version,
    )
    db.add(script)
    await db.commit()
    await db.refresh(script)

    return {
        "id": str(script.id),
        "scene_id": str(script.scene_id),
        "content": script.content,
        "version": script.version,
        "created_at": script.created_at.isoformat() if script.created_at else None,
    }


@router.patch("/{script_id}")
async def update_script(
    script_id: uuid.UUID,
    content: str,
    db: AsyncSession = Depends(get_db),
) -> dict:
    result = await db.execute(select(Script).where(Script.id == script_id))
    script = result.scalar_one_or_none()
    if not script:
        raise HTTPException(status_code=404, detail="Script not found")

    script.content = content
    await db.commit()
    await db.refresh(script)

    return {
        "id": str(script.id),
        "scene_id": str(script.scene_id),
        "content": script.content,
        "version": script.version,
        "created_at": script.created_at.isoformat() if script.created_at else None,
    }
