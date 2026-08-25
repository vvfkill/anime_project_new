from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.schemas.review import ReviewSchema
from app.services.review_service import ReviewService


from app.database import get_db
from app.schemas.anime import (
    AnimePagedResultSchema,
    AnimeSchema,
    CreateAnimeSchema,
)
from app.services.anime_service import AnimeService


from app.schemas.review import (
    CreateReviewSchema,
    ReviewSchema,
)

router = APIRouter(
    prefix="/api/anime",
    tags=["Anime"],
)


@router.get(
    "/",
    response_model=AnimePagedResultSchema,
)
async def get_anime(
    search: str | None = None,
    genre_id: int | None = None,
    tag_id: int | None = None,
    studio_id: int | None = None,
    year: int | None = None,
    min_rating: float | None = None,
    page: int = 1,
    page_size: int = 10,
    db: AsyncSession = Depends(get_db),
):
    return await AnimeService.get_all(
        db=db,
        search=search,
        genre_id=genre_id,
        tag_id=tag_id,
        studio_id=studio_id,
        year=year,
        min_rating=min_rating,
        page=page,
        page_size=page_size,
    )


@router.get(
    "/{anime_id}",
    response_model=AnimeSchema,
)
async def get_anime_by_id(
    anime_id: int,
    db: AsyncSession = Depends(get_db),
):
    anime = await AnimeService.get_by_id(
        db,
        anime_id,
    )

    if anime is None:
        raise HTTPException(
            status_code=404,
            detail="Anime not found",
        )

    return anime


@router.get(
    "/{anime_id}/reviews",
    response_model=list[ReviewSchema],
)
async def get_anime_reviews(
    anime_id: int,
    db: AsyncSession = Depends(get_db),
):
    return await ReviewService.get_by_anime_id(
        db,
        anime_id,
    )

@router.post(
    "/",
)
async def create_anime(
    data: CreateAnimeSchema,
    db: AsyncSession = Depends(get_db),
):
    try:
        anime_id = await AnimeService.create(
            db,
            data,
        )

        return {
            "message": "Anime created",
            "animeId": anime_id,
        }

    except ValueError as ex:
        raise HTTPException(
            status_code=400,
            detail=str(ex),
        )