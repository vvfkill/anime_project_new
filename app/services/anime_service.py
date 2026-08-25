from math import ceil

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.anime import Anime
from app.models.genre import Genre
from app.models.tag import Tag
from app.models.studio import Studio
from app.schemas.anime import CreateAnimeSchema


class AnimeService:

    @staticmethod
    async def get_all(
        db: AsyncSession,
        search: str | None = None,
        genre_id: int | None = None,
        tag_id: int | None = None,
        studio_id: int | None = None,
        year: int | None = None,
        min_rating: float | None = None,
        page: int = 1,
        page_size: int = 10,
    ):
        if page < 1:
            page = 1

        if page_size < 1 or page_size > 50:
            page_size = 10

        query = select(Anime)

        if search:
            search = search.lower()

            query = query.where(
                (func.lower(Anime.title_ru).contains(search))
                | (func.lower(Anime.title_original).contains(search))
            )

        if genre_id is not None:
            query = query.where(
                Anime.genres.any(
                    Genre.genre_id == genre_id
                )
            )

        if tag_id is not None:
            query = query.where(
                Anime.tags.any(
                    Tag.tag_id == tag_id
                )
            )

        if studio_id is not None:
            query = query.where(
                Anime.studios.any(
                    Studio.studio_id == studio_id
                )
            )

        if year is not None:
            query = query.where(
                Anime.release_year == year
            )

        if min_rating is not None:
            query = query.where(
                Anime.average_rating >= min_rating
            )

        count_query = select(
            func.count()
        ).select_from(
            query.subquery()
        )

        total_count = await db.scalar(count_query)

        query = (
            query
            .options(
                selectinload(Anime.genres)
            )
            .order_by(Anime.anime_id)
            .offset((page - 1) * page_size)
            .limit(page_size)
        )

        result = await db.execute(query)

        anime_list = result.scalars().all()

        items = []

        for anime in anime_list:
            items.append(
                {
                    "animeId": anime.anime_id,
                    "titleRu": anime.title_ru,
                    "titleOriginal": anime.title_original,
                    "releaseYear": anime.release_year,
                    "type": anime.type,
                    "averageRating": anime.average_rating,
                    "posterUrl": anime.poster_url,
                    "genres": [
                        genre.name
                        for genre in anime.genres
                    ],
                }
            )

        total_count = total_count or 0

        return {
            "page": page,
            "pageSize": page_size,
            "totalCount": total_count,
            "totalPages": ceil(
                total_count / page_size
            ),
            "items": items,
        }

    @staticmethod
    async def get_by_id(
        db: AsyncSession,
        anime_id: int,
    ):
        query = (
            select(Anime)
            .where(
                Anime.anime_id == anime_id
            )
            .options(
                selectinload(Anime.genres),
                selectinload(Anime.studios),
                selectinload(Anime.tags),
                selectinload(Anime.categories),
                selectinload(Anime.seasons),
                selectinload(Anime.reviews),
                selectinload(Anime.characters)
                .selectinload("seiyus"),
            )
        )

        result = await db.execute(query)

        anime = result.scalar_one_or_none()

        if anime is None:
            return None

        genre_ids = [
            genre.genre_id
            for genre in anime.genres
        ]

        similar_anime = []

        if genre_ids:
            similar_query = (
                select(Anime)
                .where(
                    Anime.anime_id != anime_id
                )
                .where(
                    Anime.genres.any(
                        Genre.genre_id.in_(genre_ids)
                    )
                )
                .options(
                    selectinload(Anime.genres)
                )
                .order_by(
                    Anime.average_rating.desc()
                )
                .limit(6)
            )

            similar_result = await db.execute(
                similar_query
            )

            similar_anime = (
                similar_result.scalars().all()
            )

        characters = []

        for character in anime.characters:
            characters.append(
                {
                    "characterId": character.character_id,
                    "name": character.name,
                    "nameOriginal": character.name_original,
                    "description": character.description,
                    "gender": character.gender,
                    "roleType": character.role_type,
                    "imageUrl": character.image_url,
                    "seiyus": [
                        {
                            "seiyuId": seiyu.seiyu_id,
                            "name": seiyu.name,
                            "nameOriginal": seiyu.name_original,
                            "country": seiyu.country,
                            "photoUrl": seiyu.photo_url,
                        }
                        for seiyu in character.seiyus
                    ],
                }
            )

        return {
            "animeId": anime.anime_id,
            "titleRu": anime.title_ru,
            "titleOriginal": anime.title_original,
            "description": anime.description,
            "fullDescription": anime.full_description,
            "releaseYear": anime.release_year,
            "episodesTotal": anime.episodes_total,
            "averageRating": anime.average_rating,
            "posterUrl": anime.poster_url,
            "genres": [
                genre.name
                for genre in anime.genres
            ],
            "studios": [
                studio.name
                for studio in anime.studios
            ],
            "tags": [
                tag.name
                for tag in anime.tags
            ],
            "characters": characters,
            "similarAnime": [
                {
                    "animeId": item.anime_id,
                    "titleRu": item.title_ru,
                    "titleOriginal": item.title_original,
                    "releaseYear": item.release_year,
                    "type": item.type,
                    "averageRating": item.average_rating,
                    "posterUrl": item.poster_url,
                    "genres": [
                        genre.name
                        for genre in item.genres
                    ],
                }
                for item in similar_anime
            ],
        }

    @staticmethod
    async def create(
        db: AsyncSession,
        data: CreateAnimeSchema,
    ):
        if not data.titleOriginal:
            raise ValueError(
                "TitleOriginal is required"
            )

        anime = Anime(
            title_original=data.titleOriginal,
            title_ru=data.titleRu,
            description=data.description,
            release_year=data.releaseYear,
            episodes_total=data.episodesTotal,
            duration_minutes=data.durationMinutes,
            poster_url=data.posterUrl,
            status="ongoing",
        )

        db.add(anime)

        await db.commit()

        await db.refresh(anime)

        return anime.anime_id