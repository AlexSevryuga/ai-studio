# AI Studio Phase 1 — Prompt: Доделать MVP

## Контекст
Репозиторий: https://github.com/AlexSevryuga/ai-studio
Ветка: main
ТЗ: docs/TZ_PHASE1.md
Стек: Backend — Python 3.12+, FastAPI, SQLAlchemy, PostgreSQL. Frontend — Next.js 14+, TypeScript, Tailwind, shadcn/ui.

## Что уже сделано (80%)
- Backend: models (user, project, character, location, scene, clip, script, log), schemas (Pydantic v2), routers (projects, characters, locations, scenes, clips, scripts, orchestrator), services (orchestrator, llm_client, tools, tool_executor), config, database, main.py, Dockerfile
- Frontend: Next.js App Router, pages (landing, login, dashboard, projects/new, projects/[id] с sub-pages: story, characters, locations, scenes, vision, assembly), NextAuth, OrchestratorChat component, middleware, Dockerfile
- Docker: docker-compose.yml (root + backend + frontend)

## Что нужно доделать (5 задач)

### Задача 1: Alembic миграции
Создай конфигурацию Alembic в `backend/`:
- `alembic.ini` в корне backend/
- `backend/alembic/` — папка с `env.py` и `versions/`
- Начальная миграция из всех моделей в `backend/app/models/`
- В `env.py` импортировать все модели и использовать `target_metadata = Base.metadata`
- Команда: `alembic revision --autogenerate -m "initial"`, затем `alembic upgrade head`

### Задача 2: Auth роутер на бэкенде
Создай `backend/app/routers/auth.py`:
- `POST /api/auth/login` — принимает JWT-токен от NextAuth, валидирует, возвращает user
- `GET /api/auth/me` — текущий пользователь по Bearer token
- `POST /api/auth/logout` — инвалидация (опционально, stateless JWT)
- Dependency `get_current_user` в `backend/app/deps.py` — извлекает user из JWT
- Защитить все роутеры projects/characters/scenes/clips/scripts через `Depends(get_current_user)`
- Добавить роутер в `backend/app/main.py`

### Задача 3: Celery + Redis для фоновых задач
Настрой очереди:
- `backend/app/celery_app.py` — создание Celery instance с Redis broker
- `backend/app/tasks/` — папка с задачами:
  - `ingest.py` — задача парсинга загруженной книги (извлечение персонажей, локаций, сцен)
  - `orchestrate.py` — задача запуска AI-оркестратора (длительная, с промежуточными результатами)
  - `render.py` — задача отправки промпта на видео-генерацию и polling статуса
- Добавить Redis и Celery worker в `docker-compose.yml` (root)
- Эндпоинт `POST /api/projects/{id}/orchestrate` должен запускать Celery task и возвращать task_id
- Эндпоинт `GET /api/tasks/{task_id}` — статус задачи

### Задача 4: Cloudflare R2 файловое хранилище
Создай `backend/app/services/storage.py`:
- S3-совместимый клиент через `boto3` (endpoint: R2)
- Функции: `upload_file(file, path) -> url`, `get_presigned_url(path) -> url`, `delete_file(path)`
- Конфиг через env: `R2_ACCOUNT_ID`, `R2_ACCESS_KEY`, `R2_SECRET_KEY`, `R2_BUCKET`
- Добавить в `.env.example`
- Интегрировать в `POST /api/projects/{id}/upload` — загрузка книги в R2, сохранение `source_file_url` в project
- Добавить boto3 в зависимости (`pyproject.toml`)

### Задача 5: Системные промпты оркестратора
Проверь и дополни `backend/app/services/orchestrator.py`:
- Ingestor prompt: парсит текст книги, извлекает персонажей (имя, описание, внешность, арка), локации (название, описание, визуал), разбивает на сцены по 3-актной структуре
- Story Assistant prompt: работает со сценами, генерирует логлайн, синопсис, драматическую функцию каждой сцены
- Script Assistant prompt: превращает описание сцены в сценарий (диалоги, ремарки, действие)
- Vision Assistant prompt: генерирует промпты для видео-моделей (Veo 3.1) с описанием камеры, освещения, настроения
- Каждый промпт должен возвращать structured JSON через tool-calling
- Tools: `create_character`, `create_location`, `create_scene`, `update_scene`, `create_clip`, `create_script`

## Порядок выполнения
1 -> 2 -> 4 -> 3 -> 5

## Проверка
После всех задач должно работать:
1. `docker-compose up` поднимает PostgreSQL, Redis, backend, frontend, celery worker
2. Пользователь логинится через NextAuth (GitHub)
3. Создает проект, загружает файл книги -> файл уходит в R2
4. Нажимает "Analyze" -> Celery task парсит книгу через Ingestor
5. Персонажи, локации, сцены появляются в UI
6. Нажимает "Generate Script" на сцене -> Script Assistant генерирует сценарий
7. Vision Assistant генерирует промпты для видео-клипов
