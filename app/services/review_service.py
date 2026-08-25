from sqlalchemy import func, select, text
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.anime import Anime
from app.models.review import Review
from app.schemas.review import CreateReviewSchema


class ReviewService:

    @staticmethod
    async def get_all(
        db: AsyncSession,
    ):
        query = (
            select(Review)
            .options(
                selectinload(Review.user),
                selectinload(Review.anime)
                .selectinload(Anime.genres),
            )
            .order_by(
                Review.created_at.desc()
            )
        )

        result = await db.execute(query)

        reviews = result.scalars().all()

        return [
            ReviewService._to_dict(review)
            for review in reviews
        ]

    @staticmethod
    async def get_by_anime_id(
        db: AsyncSession,
        anime_id: int,
    ):
        query = (
            select(Review)
            .where(
                Review.anime_id == anime_id
            )
            .options(
                selectinload(Review.user),
                selectinload(Review.anime)
                .selectinload(Anime.genres),
            )
            .order_by(
                Review.created_at.desc()
            )
        )

        result = await db.execute(query)

        reviews = result.scalars().all()

        return [
            ReviewService._to_dict(review)
            for review in reviews
        ]

    @staticmethod
    async def create(
        db: AsyncSession,
        data: CreateReviewSchema,
    ):
        result = await db.execute(
            text(
                """
                SELECT create_review(
                    :user_id,
                    :anime_id,
                    :text,
                    :score
                )
                """
            ),
            {
                "user_id": data.userId,
                "anime_id": data.animeId,
                "text": data.text,
                "score": data.score,
            },
        )

        review_id = result.scalar()

        if review_id is None:
            raise ValueError(
                "Функция create_review не вернула review_id"
            )

        await ReviewService._recalculate_anime_rating(
            db,
            data.animeId,
        )

        await db.commit()

        return int(review_id)

    @staticmethod
    async def delete(
        db: AsyncSession,
        user_id: int,
        review_id: int,
    ):
        query = (
            select(Review)
            .where(
                Review.review_id == review_id,
                Review.user_id == user_id,
            )
        )

        result = await db.execute(query)

        review = result.scalar_one_or_none()

        if review is None:
            raise ValueError(
                "Отзыв не найден или не принадлежит пользователю"
            )

        anime_id = review.anime_id

        result = await db.execute(
            text(
                """
                SELECT delete_review(
                    :user_id,
                    :review_id
                )
                """
            ),
            {
                "user_id": user_id,
                "review_id": review_id,
            },
        )

        deleted = result.scalar()

        if not deleted:
            raise ValueError(
                "Отзыв не был удалён"
            )

        await ReviewService._recalculate_anime_rating(
            db,
            anime_id,
        )

        await db.commit()

    @staticmethod
    async def _recalculate_anime_rating(
        db: AsyncSession,
        anime_id: int,
    ):
        result = await db.execute(
            select(func.avg(Review.score))
            .where(
                Review.anime_id == anime_id
            )
        )

        average_rating = result.scalar()

        anime = await db.get(
            Anime,
            anime_id,
        )

        if anime is None:
            return

        anime.average_rating = average_rating

    @staticmethod
    def _to_dict(
        review: Review,
    ):
        anime = review.anime

        return {
            "reviewId": review.review_id,
            "userId": review.user_id,
            "animeId": review.anime_id,
            "userNickname": (
                review.user.nickname
                if review.user
                else None
            ),
            "animeTitleRu": (
                anime.title_ru
                if anime
                else None
            ),
            "animeTitleOriginal": (
                anime.title_original
                if anime
                else None
            ),
            "posterUrl": (
                anime.poster_url
                if anime
                else None
            ),
            "releaseYear": (
                anime.release_year
                if anime
                else None
            ),
            "type": (
                anime.type
                if anime
                else None
            ),
            "averageRating": (
                float(anime.average_rating)
                if anime
                and anime.average_rating is not None
                else None
            ),
            "text": review.text,
            "score": review.score,
            "createdAt": review.created_at,
            "genres": [
                genre.name
                for genre in anime.genres
            ] if anime else [],
        }