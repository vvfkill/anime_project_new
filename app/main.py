from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.routers.anime import router as anime_router
from app.routers.reviews import router as reviews_router
from app.routers import user
from app.routers import bookmark


BASE_DIR = Path(__file__).resolve().parent.parent

app = FastAPI(
    title="Anime Project API",
    version="1.0.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(anime_router)
app.include_router(reviews_router)
app.include_router(user.router)
app.include_router(bookmark.router)


app.mount(
    "/",
    StaticFiles(
        directory=BASE_DIR / "frontend",
        html=True,
    ),
    name="frontend",
)