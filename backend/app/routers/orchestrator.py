import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import OrchestratorLog, Project
from app.schemas import OrchestratorRequest, OrchestratorResponse

router = APIRouter(prefix="/api/projects", tags=["orchestrator"])


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


@router.post("/{project_id}/orchestrate", response_model=OrchestratorResponse)
async def orchestrate(
    project_id: uuid.UUID,
    data: OrchestratorRequest,
    db: AsyncSession = Depends(get_db),
) -> OrchestratorResponse:
    # Load project
    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Log the orchestration
    log = OrchestratorLog(
        project_id=project_id,
        action=data.command.value,
        input_data={"params": data.params.model_dump() if data.params else {}},
        model_used="claude-sonnet-4-20250514",
    )
    db.add(log)
    await db.commit()
    await db.refresh(log)

    # TODO: Implement actual LLM orchestration with tool calling
    # For now, return mock response

    return OrchestratorResponse(
        success=True,
        action=data.command.value,
        results={"message": "Orchestrator not yet connected to LLM"},
        message="Use OpenAI/Anthropic API key to enable AI orchestration",
    )
