from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers.anime import router as anime_router
from app.routers.reviews import router as reviews_router

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


@app.get("/")
async def root():
    return {
        "message": "Anime Project API is running"
    }