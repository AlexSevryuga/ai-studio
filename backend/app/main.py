from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="AI Studio API",
    description="AI Studio - Literary IP to Multimedia Adaptation",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,  # type: ignore[invalid-argument-type]
    allow_origin_regex=r"https?://(localhost:3000|.*\.vercel\.app)",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
async def health_check() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/")
async def root() -> dict[str, str]:
    return {"message": "AI Studio API"}
