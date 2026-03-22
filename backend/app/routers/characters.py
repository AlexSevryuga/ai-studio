import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import Character
from app.schemas import CharacterCreate, CharacterResponse, CharacterUpdate

router = APIRouter(prefix="/api/characters", tags=["characters"])


@router.get("/project/{project_id}", response_model=list[CharacterResponse])
async def list_characters(
    project_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> list[Character]:
    result = await db.execute(
        select(Character).where(Character.project_id == project_id).order_by(Character.name)
    )
    return list(result.scalars().all())


@router.post("/project/{project_id}", response_model=CharacterResponse, status_code=201)
async def create_character(
    project_id: uuid.UUID,
    data: CharacterCreate,
    db: AsyncSession = Depends(get_db),
) -> Character:
    character = Character(
        project_id=project_id,
        name=data.name,
        aliases=data.aliases,
        description=data.description,
        role=data.role.value if data.role else None,
        appearance=data.appearance,
        arc=data.arc,
    )
    db.add(character)
    await db.commit()
    await db.refresh(character)
    return character


@router.patch("/{character_id}", response_model=CharacterResponse)
async def update_character(
    character_id: uuid.UUID,
    data: CharacterUpdate,
    db: AsyncSession = Depends(get_db),
) -> Character:
    result = await db.execute(select(Character).where(Character.id == character_id))
    character = result.scalar_one_or_none()
    if not character:
        raise HTTPException(status_code=404, detail="Character not found")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        if key == "role" and value is not None:
            value = value.value if hasattr(value, "value") else value
        if value is not None:
            setattr(character, key, value)

    await db.commit()
    await db.refresh(character)
    return character


@router.delete("/{character_id}", status_code=204)
async def delete_character(
    character_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> None:
    result = await db.execute(select(Character).where(Character.id == character_id))
    character = result.scalar_one_or_none()
    if not character:
        raise HTTPException(status_code=404, detail="Character not found")
    await db.delete(character)
    await db.commit()
