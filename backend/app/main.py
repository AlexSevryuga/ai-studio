from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import characters, clips, locations, orchestrator, projects, scenes, scripts

app = FastAPI(
    title="AI Studio API",
    description="AI Studio - Literary IP to Multimedia Adaptation",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https?://(localhost:3000|.*\.vercel\.app)",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(projects.router)
app.include_router(characters.router)
app.include_router(locations.router)
app.include_router(scenes.router)
app.include_router(clips.router)
app.include_router(scripts.router)
app.include_router(orchestrator.router)


@app.get("/api/health")
async def health_check() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/")
async def root() -> dict[str, str]:
    return {"message": "AI Studio API"}
