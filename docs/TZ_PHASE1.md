# AI Studio — Фаза 1 (MVP)

## 1. Общее описание продукта

AI Studio — онлайн-сервис для адаптации литературных IP в мультимедиа (кино, анимация, игры). Пользователь загружает книгу, система автоматически разбирает её на структурные элементы (персонажи, локации, сцены), а набор AI-ассистентов последовательно превращает текст в сценарий, раскадровку, промпты для видео-генерации и финальный монтаж.

Фаза 1 — фундамент: авторизация, загрузка книги, парсинг, AI-оркестратор со Story-ассистентом, базовый UI для работы со сценами.

## 2. Стек технологий

| Слой | Технология |
|------|------------|
| Frontend | Next.js 14+ (App Router), TypeScript, Tailwind CSS, shadcn/ui |
| Backend API | Python 3.12+, FastAPI, Pydantic v2 |
| База данных | PostgreSQL 16 (через SQLAlchemy / Alembic) |
| Файловое хранилище | Cloudflare R2 (S3-совместимый) |
| Аутентификация | NextAuth.js (GitHub + Email magic link) |
| LLM-оркестратор | OpenAI-совместимый API с tool-calling (Claude / GPT-4o / Perplexity) |
| Очереди задач | Celery + Redis (для длительных AI-операций) |
| Деплой | Docker Compose → VPS или Vercel (front) + Railway/Fly.io (back) |

## 3. Структура базы данных

### 3.1 users

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3.2 projects

```sql
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    source_file_url TEXT,
    source_text TEXT,
    logline TEXT,
    synopsis TEXT,
    status VARCHAR(50) DEFAULT 'draft',
    format VARCHAR(50) DEFAULT 'film',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3.3 characters

```sql
CREATE TABLE characters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    aliases TEXT[],
    description TEXT,
    role VARCHAR(50),
    appearance TEXT,
    arc TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3.4 locations

```sql
CREATE TABLE locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    visual_description TEXT,
    int_ext VARCHAR(10),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3.5 scenes

```sql
CREATE TABLE scenes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    "order" INTEGER NOT NULL,
    act INTEGER,
    title VARCHAR(500),
    description TEXT NOT NULL,
    int_ext VARCHAR(10),
    time_of_day VARCHAR(20),
    location_id UUID REFERENCES locations(id),
    dramatic_function TEXT,
    source_chapter VARCHAR(100),
    status VARCHAR(50) DEFAULT 'draft',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3.6 scene_characters (many-to-many)

```sql
CREATE TABLE scene_characters (
    scene_id UUID REFERENCES scenes(id) ON DELETE CASCADE,
    character_id UUID REFERENCES characters(id) ON DELETE CASCADE,
    PRIMARY KEY (scene_id, character_id)
);
```

### 3.7 clips

```sql
CREATE TABLE clips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scene_id UUID REFERENCES scenes(id) ON DELETE CASCADE,
    "order" INTEGER NOT NULL,
    prompt TEXT NOT NULL,
    model VARCHAR(50) DEFAULT 'veo-3.1',
    duration_seconds INTEGER DEFAULT 8,
    aspect_ratio VARCHAR(10) DEFAULT '16:9',
    status VARCHAR(50) DEFAULT 'draft',
    video_url TEXT,
    thumbnail_url TEXT,
    render_job_id VARCHAR(255),
    selected BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3.8 scripts

```sql
CREATE TABLE scripts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scene_id UUID REFERENCES scenes(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    version INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3.9 orchestrator_logs

```sql
CREATE TABLE orchestrator_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    input_data JSONB,
    output_data JSONB,
    model_used VARCHAR(100),
    tokens_used INTEGER,
    duration_ms INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 4. API эндпоинты (FastAPI)

### 4.1 Авторизация

- `POST /api/auth/login` — magic link / OAuth callback
- `GET /api/auth/me` — текущий пользователь
- `POST /api/auth/logout`

### 4.2 Проекты

- `POST /api/projects` — создать проект
- `GET /api/projects` — список проектов пользователя
- `GET /api/projects/{id}` — детали проекта
- `PATCH /api/projects/{id}` — обновить (title, description, format)
- `DELETE /api/projects/{id}` — удалить
- `POST /api/projects/{id}/upload` — загрузить файл книги

### 4.3 Оркестратор

- `POST /api/projects/{id}/orchestrate` — главный эндпоинт

### 4.4 Сцены, Персонажи, Локации, Клипы, Скрипты

См. полное ТЗ.

## 5. Фронтенд — страницы

- `/` — Landing
- `/login` — Авторизация
- `/dashboard` — Список проектов
- `/projects/new` — Создание проекта
- `/projects/[id]` — Overview
- `/projects/[id]/story` — Story модуль
- `/projects/[id]/characters` — Персонажи
- `/projects/[id]/locations` — Локации
- `/projects/[id]/scenes/[sid]` — Детали сцены
- `/projects/[id]/vision` — Vision модуль
- `/projects/[id]/assembly` — Assembly (заглушка)

## 6. Оркестратор — системные промпты

См. полное ТЗ для Ingestor, Story Assistant, Script Assistant, Vision Assistant.

## 7. Файловая структура

```
ai-studio/
├── frontend/
│   ├── app/
│   ├── components/
│   ├── lib/
│   └── package.json
├── backend/
│   ├── app/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── routers/
│   │   └── services/
│   └── requirements.txt
└── docs/
    └── TZ_PHASE1.md
```
