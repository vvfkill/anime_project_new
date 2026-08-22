from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.services.anime_service import AnimeService


router = APIRouter(
    prefix="/api/anime",
    tags=["Anime"],
)


@router.get("/")
async def get_anime(
    db: AsyncSession = Depends(get_db),
):
    return await AnimeService.get_all(db)