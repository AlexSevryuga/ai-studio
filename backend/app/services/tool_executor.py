"""Tool executor for orchestrator."""

import uuid
from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Character, Clip, Location, Scene, Script


class ToolExecutor:
    """Executes tools called by the LLM."""

    def __init__(self, db: AsyncSession, project_id: uuid.UUID):
        self.db = db
        self.project_id = project_id

    async def execute(self, tool_name: str, arguments: dict[str, Any]) -> dict[str, Any]:
        """Execute a tool by name with arguments."""
        method = getattr(self, tool_name, None)
        if not method:
            return {"error": f"Unknown tool: {tool_name}"}
        return await method(arguments)

    async def create_character(self, data: dict[str, Any]) -> dict[str, Any]:
        """Create a character."""
        character = Character(
            project_id=self.project_id,
            name=data["name"],
            aliases=data.get("aliases"),
            role=data.get("role", "minor"),
            description=data.get("description"),
            visual_prompt=data.get("visual_prompt"),
            character_arc=data.get("character_arc"),
        )
        self.db.add(character)
        await self.db.commit()
        await self.db.refresh(character)
        return {"id": str(character.id), "name": character.name}

    async def update_character(self, data: dict[str, Any]) -> dict[str, Any]:
        """Update a character."""
        character_id = uuid.UUID(data["character_id"])
        result = await self.db.execute(
            select(Character).where(Character.id == character_id)
        )
        character = result.scalar_one_or_none()
        if not character:
            return {"error": "Character not found"}

        updates = data.get("updates", {})
        for key, value in updates.items():
            if hasattr(character, key):
                setattr(character, key, value)

        await self.db.commit()
        await self.db.refresh(character)
        return {"id": str(character.id), "updated": True}

    async def create_location(self, data: dict[str, Any]) -> dict[str, Any]:
        """Create a location."""
        location = Location(
            project_id=self.project_id,
            name=data["name"],
            description=data.get("description"),
            visual_prompt=data.get("visual_prompt"),
            int_ext=data.get("int_ext", "INT"),
        )
        self.db.add(location)
        await self.db.commit()
        await self.db.refresh(location)
        return {"id": str(location.id), "name": location.name}

    async def create_scene(self, data: dict[str, Any]) -> dict[str, Any]:
        """Create a scene."""
        # Resolve location by name
        location_id = None
        location_name = data.get("location_name")
        if location_name:
            result = await self.db.execute(
                select(Location).where(
                    Location.project_id == self.project_id,
                    Location.name == location_name,
                )
            )
            location = result.scalar_one_or_none()
            if location:
                location_id = location.id

        scene = Scene(
            project_id=self.project_id,
            order=data["order"],
            act=data["act"],
            title=data["title"],
            description=data.get("description"),
            int_ext=data.get("int_ext"),
            time_of_day=data.get("time_of_day"),
            location_id=location_id,
            dramatic_function=data.get("dramatic_function"),
            source_chapter=data.get("source_chapter"),
            status="draft",
        )
        self.db.add(scene)
        await self.db.commit()
        await self.db.refresh(scene)
        return {"id": str(scene.id), "title": scene.title}

    async def update_scene(self, data: dict[str, Any]) -> dict[str, Any]:
        """Update a scene."""
        scene_id = uuid.UUID(data["scene_id"])
        result = await self.db.execute(
            select(Scene).where(Scene.id == scene_id)
        )
        scene = result.scalar_one_or_none()
        if not scene:
            return {"error": "Scene not found"}

        updates = data.get("updates", {})
        for key, value in updates.items():
            if hasattr(scene, key):
                setattr(scene, key, value)

        await self.db.commit()
        await self.db.refresh(scene)
        return {"id": str(scene.id), "updated": True}

    async def create_clip(self, data: dict[str, Any]) -> dict[str, Any]:
        """Create a video clip."""
        clip = Clip(
            scene_id=uuid.UUID(data["scene_id"]),
            order=data["order"],
            prompt=data["prompt"],
            model=data.get("model", "default"),
            duration_seconds=data.get("duration_seconds", 6),
            aspect_ratio=data.get("aspect_ratio", "16:9"),
        )
        self.db.add(clip)
        await self.db.commit()
        await self.db.refresh(clip)
        return {"id": str(clip.id), "order": clip.order}

    async def create_script(self, data: dict[str, Any]) -> dict[str, Any]:
        """Create a script version."""
        scene_id = uuid.UUID(data["scene_id"])

        # Get max version
        result = await self.db.execute(
            select(Script)
            .where(Script.scene_id == scene_id)
            .order_by(Script.version.desc())
        )
        last_script = result.scalar_one_or_none()
        next_version = (last_script.version + 1) if last_script else 1

        script = Script(
            scene_id=scene_id,
            content=data["content"],
            version=next_version,
        )
        self.db.add(script)
        await self.db.commit()
        await self.db.refresh(script)
        return {"id": str(script.id), "version": script.version}
