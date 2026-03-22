import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.deps import TokenData, get_current_user
from app.models import Scene
from app.schemas import SceneCreate, SceneReorder, SceneResponse, SceneUpdate

router = APIRouter(prefix="/api/scenes", tags=["scenes"])


@router.get("/project/{project_id}", response_model=list[SceneResponse])
async def list_scenes(
    project_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_user),
) -> list[Scene]:
    result = await db.execute(
        select(Scene).where(Scene.project_id == project_id).order_by(Scene.order)
    )
    return list(result.scalars().all())


@router.post("/project/{project_id}", response_model=SceneResponse, status_code=201)
async def create_scene(
    project_id: uuid.UUID,
    data: SceneCreate,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_user),
) -> Scene:
    scene = Scene(
        project_id=project_id,
        order=data.order,
        act=data.act,
        title=data.title,
        description=data.description,
        int_ext=data.int_ext.value if data.int_ext else None,
        time_of_day=data.time_of_day.value if data.time_of_day else None,
        location_id=data.location_id,
        dramatic_function=data.dramatic_function,
        source_chapter=data.source_chapter,
        status=data.status.value if data.status else "draft",
    )
    db.add(scene)
    await db.commit()
    await db.refresh(scene)
    return scene


@router.patch("/{scene_id}", response_model=SceneResponse)
async def update_scene(
    scene_id: uuid.UUID,
    data: SceneUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_user),
) -> Scene:
    result = await db.execute(select(Scene).where(Scene.id == scene_id))
    scene = result.scalar_one_or_none()
    if not scene:
        raise HTTPException(status_code=404, detail="Scene not found")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        if key in ("int_ext", "time_of_day", "status") and value is not None:
            value = value.value if hasattr(value, "value") else value
        if value is not None:
            setattr(scene, key, value)

    await db.commit()
    await db.refresh(scene)
    return scene


@router.delete("/{scene_id}", status_code=204)
async def delete_scene(
    scene_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_user),
) -> None:
    result = await db.execute(select(Scene).where(Scene.id == scene_id))
    scene = result.scalar_one_or_none()
    if not scene:
        raise HTTPException(status_code=404, detail="Scene not found")
    await db.delete(scene)
    await db.commit()


@router.patch("/project/{project_id}/reorder", status_code=204)
async def reorder_scenes(
    project_id: uuid.UUID,
    data: SceneReorder,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_user),
) -> None:
    for idx, scene_id in enumerate(data.scene_ids):
        await db.execute(
            update(Scene)
            .where(Scene.id == scene_id, Scene.project_id == project_id)
            .values(order=idx)
        )
    await db.commit()
