import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import Clip
from app.schemas import ClipCreate, ClipResponse, ClipUpdate

router = APIRouter(prefix="/api/clips", tags=["clips"])


@router.get("/scene/{scene_id}", response_model=list[ClipResponse])
async def list_clips(
    scene_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> list[Clip]:
    result = await db.execute(
        select(Clip).where(Clip.scene_id == scene_id).order_by(Clip.order)
    )
    return list(result.scalars().all())


@router.post("/scene/{scene_id}", response_model=ClipResponse, status_code=201)
async def create_clip(
    scene_id: uuid.UUID,
    data: ClipCreate,
    db: AsyncSession = Depends(get_db),
) -> Clip:
    clip = Clip(
        scene_id=scene_id,
        order=data.order,
        prompt=data.prompt,
        model=data.model,
        duration_seconds=data.duration_seconds,
        aspect_ratio=data.aspect_ratio,
    )
    db.add(clip)
    await db.commit()
    await db.refresh(clip)
    return clip


@router.patch("/{clip_id}", response_model=ClipResponse)
async def update_clip(
    clip_id: uuid.UUID,
    data: ClipUpdate,
    db: AsyncSession = Depends(get_db),
) -> Clip:
    result = await db.execute(select(Clip).where(Clip.id == clip_id))
    clip = result.scalar_one_or_none()
    if not clip:
        raise HTTPException(status_code=404, detail="Clip not found")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        if value is not None:
            setattr(clip, key, value)

    await db.commit()
    await db.refresh(clip)
    return clip


@router.delete("/{clip_id}", status_code=204)
async def delete_clip(
    clip_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> None:
    result = await db.execute(select(Clip).where(Clip.id == clip_id))
    clip = result.scalar_one_or_none()
    if not clip:
        raise HTTPException(status_code=404, detail="Clip not found")
    await db.delete(clip)
    await db.commit()


@router.post("/{clip_id}/render", status_code=202)
async def render_clip(
    clip_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> dict[str, str]:
    result = await db.execute(select(Clip).where(Clip.id == clip_id))
    clip = result.scalar_one_or_none()
    if not clip:
        raise HTTPException(status_code=404, detail="Clip not found")

    # TODO: Call video generation API (Veo, Sora, etc.)
    clip.status = "queued"
    await db.commit()

    return {"status": "queued", "message": "Render job queued"}


@router.get("/{clip_id}/render-status")
async def render_status(
    clip_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> dict[str, str]:
    result = await db.execute(select(Clip).where(Clip.id == clip_id))
    clip = result.scalar_one_or_none()
    if not clip:
        raise HTTPException(status_code=404, detail="Clip not found")

    return {"status": clip.status, "video_url": clip.video_url or ""}
