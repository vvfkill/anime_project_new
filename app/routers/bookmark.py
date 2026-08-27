from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.bookmark import AddBookmarkSchema
from app.services.bookmark_service import BookmarkService


router = APIRouter(
    prefix="/api/bookmarks",
    tags=["Bookmarks"],
)


@router.post("")
async def add_bookmark(
    dto: AddBookmarkSchema,
    db: AsyncSession = Depends(get_db),
):
    try:
        bookmark_id = await BookmarkService.add(
            db,
            dto,
        )

        return {
            "message": "Закладка добавлена",
            "bookmarkId": bookmark_id,
        }

    except ValueError as ex:
        raise HTTPException(
            status_code=400,
            detail=str(ex),
        )


@router.delete("")
async def delete_bookmark(
    user_id: int,
    anime_id: int,
    db: AsyncSession = Depends(get_db),
):
    try:
        await BookmarkService.delete(
            db,
            user_id,
            anime_id,
        )

        return {
            "message": "Аниме удалено из закладок"
        }

    except ValueError as ex:
        raise HTTPException(
            status_code=400,
            detail=str(ex),
        )


@router.get("/user/{user_id}")
async def get_user_bookmarks(
    user_id: int,
    db: AsyncSession = Depends(get_db),
):
    return await BookmarkService.get_by_user_id(
        db,
        user_id,
    )


@router.get("/check")
async def check_bookmark(
    user_id: int,
    anime_id: int,
    db: AsyncSession = Depends(get_db),
):
    result = await BookmarkService.is_bookmarked(
        db,
        user_id,
        anime_id,
    )

    return {
        "isBookmarked": result
    }