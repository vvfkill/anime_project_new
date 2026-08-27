from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from datetime import datetime

from app.models.anime import Anime
from app.models.bookmark import Bookmark
from app.schemas.bookmark import AddBookmarkSchema


class BookmarkService:

    @staticmethod
    async def add(
        db: AsyncSession,
        data: AddBookmarkSchema,
    ) -> int:

        result = await db.execute(
            select(Bookmark)
            .where(
                Bookmark.user_id == data.userId,
                Bookmark.anime_id == data.animeId,
            )
        )

        existing = result.scalar_one_or_none()

        if existing is not None:
            raise ValueError(
                "Аниме уже добавлено в закладки"
            )

        bookmark = Bookmark(
            user_id=data.userId,
            anime_id=data.animeId,
            created_at=datetime.now(),
        )

        db.add(bookmark)

        await db.commit()

        await db.refresh(bookmark)

        return bookmark.bookmark_id

    @staticmethod
    async def delete(
        db: AsyncSession,
        user_id: int,
        anime_id: int,
    ) -> None:

        result = await db.execute(
            select(Bookmark)
            .where(
                Bookmark.user_id == user_id,
                Bookmark.anime_id == anime_id,
            )
        )

        bookmark = result.scalar_one_or_none()

        if bookmark is None:
            raise ValueError(
                "Закладка не найдена"
            )

        await db.delete(bookmark)

        await db.commit()

    @staticmethod
    async def get_by_user_id(
        db: AsyncSession,
        user_id: int,
    ):

        result = await db.execute(
            select(Bookmark)
            .where(
                Bookmark.user_id == user_id
            )
            .options(
                selectinload(Bookmark.anime)
            )
            .order_by(
                Bookmark.created_at.desc()
            )
        )

        bookmarks = result.scalars().all()

        return [
            {
                "bookmarkId": bookmark.bookmark_id,
                "userId": bookmark.user_id,
                "animeId": bookmark.anime_id,
                "titleRu": bookmark.anime.title_ru,
                "titleOriginal": (
                    bookmark.anime.title_original
                ),
                "posterUrl": bookmark.anime.poster_url,
                "createdAt": bookmark.created_at,
            }
            for bookmark in bookmarks
        ]

    @staticmethod
    async def is_bookmarked(
        db: AsyncSession,
        user_id: int,
        anime_id: int,
    ) -> bool:

        result = await db.execute(
            select(Bookmark)
            .where(
                Bookmark.user_id == user_id,
                Bookmark.anime_id == anime_id,
            )
        )

        bookmark = result.scalar_one_or_none()

        return bookmark is not None