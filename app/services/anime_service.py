from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.anime import Anime


class AnimeService:

    @staticmethod
    async def get_all(db: AsyncSession):
        result = await db.execute(
            select(Anime)
        )

        return result.scalars().all()