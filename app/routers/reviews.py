from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.review import (
    CreateReviewSchema,
    ReviewSchema,
)
from app.services.review_service import ReviewService


router = APIRouter(
    prefix="/api/reviews",
    tags=["Reviews"],
)


@router.get(
    "/",
    response_model=list[ReviewSchema],
)
async def get_reviews(
    db: AsyncSession = Depends(get_db),
):
    return await ReviewService.get_all(db)


@router.get(
    "/anime/{anime_id}",
    response_model=list[ReviewSchema],
)
async def get_reviews_by_anime(
    anime_id: int,
    db: AsyncSession = Depends(get_db),
):
    return await ReviewService.get_by_anime_id(
        db,
        anime_id,
    )


@router.post("/")
async def create_review(
    data: CreateReviewSchema,
    db: AsyncSession = Depends(get_db),
):
    try:
        review_id = await ReviewService.create(
            db,
            data,
        )

        return {
            "message": "Отзыв создан",
            "reviewId": review_id,
        }

    except Exception as ex:
        await db.rollback()

        raise HTTPException(
            status_code=400,
            detail=str(ex),
        )


@router.delete("/{review_id}")
async def delete_review(
    review_id: int,
    user_id: int,
    db: AsyncSession = Depends(get_db),
):
    try:
        await ReviewService.delete(
            db,
            user_id,
            review_id,
        )

        return {
            "message": "Отзыв удалён"
        }

    except Exception as ex:
        await db.rollback()

        raise HTTPException(
            status_code=400,
            detail=str(ex),
        )