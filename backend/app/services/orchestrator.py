"""AI Orchestrator service for managing LLM interactions."""

import json
import uuid
from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import (
    OrchestratorLog,
    Project,
)
from app.services.llm_client import llm_client
from app.services.tool_executor import ToolExecutor
from app.services.tools import (
    get_all_tools,
    get_character_tools,
    get_clip_tools,
    get_location_tools,
    get_scene_tools,
    get_script_tools,
)


class Orchestrator:
    """Manages AI orchestration workflow."""

    SYSTEM_PROMPTS = {
        "ingest_and_extract": """Ты — AI-ассистент "Инжестор". Твоя задача — проанализировать текст книги
и извлечь структурированные данные.

Из текста извлеки:
1. Список всех персонажей: имя, прозвища, роль (protagonist/antagonist/supporting/minor),
   краткое описание, внешность (для визуальных промптов), арка.
2. Список всех локаций: название, описание, визуальное описание, INT/EXT.
3. Хронологию ключевых событий.

Используй предоставленные tools для сохранения каждого персонажа и локации.
Будь исчерпывающим — не пропускай даже второстепенных персонажей.""",

        "generate_story_structure": """Ты — AI-ассистент "Драматург". Твоя задача — превратить текст книги
в кинематографическую структуру.

На основе текста книги и уже извлечённых персонажей/локаций создай:
1. Логлайн (1–2 предложения).
2. Синопсис (1 страница).
3. Разбиение на 3 акта.
4. Список сцен для каждого акта.

Для каждой сцены укажи:
- order: порядковый номер
- act: номер акта (1/2/3)
- title: короткое название
- description: 2–3 предложения о содержании
- int_ext: INT / EXT / INT/EXT
- time_of_day: night / day / dawn / dusk / evening
- location: название локации (из уже извлечённых)
- dramatic_function: зачем эта сцена нужна в фильме
- source_chapter: из какой главы книги

Думай как голливудский сценарист: каждая сцена должна двигать сюжет
или раскрывать персонажа.""",

        "generate_script": """Ты — AI-ассистент "Сценарист". Переводишь описание сцены в профессиональный
сценарный формат.

Формат:
- Заголовок сцены: INT./EXT. ЛОКАЦИЯ — ВРЕМЯ СУТОК
- Описание действия (настоящее время, визуальный язык).
- Диалоги: ИМЯ ПЕРСОНАЖА (в центре), реплика под ним.
- Ремарки в скобках при необходимости.

Сохраняй тон и стиль книги. Диалоги адаптируй для экрана — короче, острее.""",

        "generate_vision_prompts": """Ты — AI-ассистент "Визуальный режиссёр". Создаёшь промпты для генерации
видео-клипов по сценам.

Для каждой сцены создай 2–4 клипа по 6–8 секунд.
Каждый промпт должен содержать:
- Описание кадра: что видно, кто в кадре, что происходит.
- Камера: тип движения (dolly, pan, static, crane, tracking).
- Освещение: тип, цветовая температура, настроение.
- Стиль: реалистичный кинематографичный техно-триллер.
- Ограничения: без текста, без субтитров, без UI-элементов.

Используй визуальные описания персонажей и локаций из базы проекта.
Обеспечивай консистентность внешнего вида персонажей между клипами.""",
    }

    def __init__(self, db: AsyncSession, project_id: uuid.UUID):
        self.db = db
        self.project_id = project_id
        self.executor = ToolExecutor(db, project_id)
        self.action_log: list[dict[str, Any]] = []

    async def run(
        self,
        command: str,
        input_data: dict[str, Any],
    ) -> dict[str, Any]:
        """Run an orchestration command."""
        # Load project
        result = await self.db.execute(
            select(Project).where(Project.id == self.project_id)
        )
        project = result.scalar_one_or_none()
        if not project:
            raise ValueError("Project not found")

        # Get system prompt for this command
        system_prompt = self.SYSTEM_PROMPTS.get(command)
        if not system_prompt:
            raise ValueError(f"Unknown command: {command}")

        # Select tools based on command
        tools = self._get_tools_for_command(command)

        # Build messages
        messages = self._build_messages(command, input_data, project)

        # Log the orchestration
        log = OrchestratorLog(
            project_id=self.project_id,
            action=command,
            input_data={"params": input_data},
            model_used=llm_client.provider,
        )
        self.db.add(log)
        await self.db.commit()
        await self.db.refresh(log)

        # Run completion with tool calling
        response = llm_client.complete(
            system=system_prompt,
            messages=messages,
            tools=tools,
            max_tokens=4096,
        )

        # Process tool calls if any
        if response.get("tool_calls"):
            await self._process_tool_calls(response["tool_calls"])

        return {
            "success": True,
            "action": command,
            "results": {
                "message": "Orchestration complete",
                "log_id": str(log.id),
                "actions": self.action_log,
            },
            "message": f"Executed {command} successfully",
        }

    def _get_tools_for_command(self, command: str) -> list[dict[str, Any]]:
        """Get tools for a specific command."""
        if command == "ingest_and_extract":
            return get_character_tools() + get_location_tools()
        elif command == "generate_story_structure":
            return get_scene_tools()
        elif command == "generate_script":
            return get_script_tools()
        elif command == "generate_vision_prompts":
            return get_clip_tools()
        return get_all_tools()

    def _build_messages(
        self,
        command: str,
        input_data: dict[str, Any],
        project: Project,
    ) -> list[dict[str, str]]:
        """Build messages for the LLM."""
        messages = []

        if command == "ingest_and_extract":
            messages.append({
                "role": "user",
                "content": f"Анализируй следующий текст книги проекта {project.title}:\n\n{project.source_text or 'Текст не загружен'}",
            })
        elif command == "generate_story_structure":
            messages.append({
                "role": "user",
                "content": f"Создай структуру сцен для книги {project.title}",
            })
        elif command == "generate_script":
            scene_id = input_data.get("scene_id")
            messages.append({
                "role": "user",
                "content": f"Напиши сценарий для сцены {scene_id}",
            })
        elif command == "generate_vision_prompts":
            messages.append({
                "role": "user",
                "content": "Создай видео-промпты для всех сцен",
            })

        return messages

    async def _process_tool_calls(self, tool_calls: list[Any]) -> None:
        """Process tool calls from LLM response."""
        for call in tool_calls:
            tool_name = call.function.name
            arguments = call.function.arguments

            if isinstance(arguments, str):
                arguments = json.loads(arguments)

            result = await self.executor.execute(tool_name, arguments)
            self.action_log.append({
                "tool": tool_name,
                "arguments": arguments,
                "result": str(result)[:200],
            })
