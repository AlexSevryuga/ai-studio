import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import Location
from app.schemas import LocationCreate, LocationResponse, LocationUpdate

router = APIRouter(prefix="/api/locations", tags=["locations"])


@router.get("/project/{project_id}", response_model=list[LocationResponse])
async def list_locations(
    project_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> list[Location]:
    result = await db.execute(
        select(Location).where(Location.project_id == project_id).order_by(Location.name)
    )
    return list(result.scalars().all())


@router.post("/project/{project_id}", response_model=LocationResponse, status_code=201)
async def create_location(
    project_id: uuid.UUID,
    data: LocationCreate,
    db: AsyncSession = Depends(get_db),
) -> Location:
    location = Location(
        project_id=project_id,
        name=data.name,
        description=data.description,
        visual_description=data.visual_description,
        int_ext=data.int_ext.value if data.int_ext else None,
    )
    db.add(location)
    await db.commit()
    await db.refresh(location)
    return location


@router.patch("/{location_id}", response_model=LocationResponse)
async def update_location(
    location_id: uuid.UUID,
    data: LocationUpdate,
    db: AsyncSession = Depends(get_db),
) -> Location:
    result = await db.execute(select(Location).where(Location.id == location_id))
    location = result.scalar_one_or_none()
    if not location:
        raise HTTPException(status_code=404, detail="Location not found")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        if key == "int_ext" and value is not None:
            value = value.value if hasattr(value, "value") else value
        if value is not None:
            setattr(location, key, value)

    await db.commit()
    await db.refresh(location)
    return location


@router.delete("/{location_id}", status_code=204)
async def delete_location(
    location_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> None:
    result = await db.execute(select(Location).where(Location.id == location_id))
    location = result.scalar_one_or_none()
    if not location:
        raise HTTPException(status_code=404, detail="Location not found")
    await db.delete(location)
    await db.commit()
