from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.user import (
    CreateUserDto,
    LoginDto,
    AddToUserListDto,
    UpdateUserListDto,
)
from app.services.user_service import UserService


router = APIRouter(
    prefix="/api/users",
    tags=["Users"],
)


@router.get("")
async def get_users(
    db: AsyncSession = Depends(get_db),
):
    return await UserService.get_all(db)


@router.get("/{user_id}")
async def get_user(
    user_id: int,
    db: AsyncSession = Depends(get_db),
):
    user = await UserService.get_by_id(
        db,
        user_id,
    )

    if user is None:
        raise HTTPException(
            status_code=404,
            detail="Пользователь не найден",
        )

    return user


@router.post("")
async def create_user(
    dto: CreateUserDto,
    db: AsyncSession = Depends(get_db),
):
    try:
        user_id = await UserService.create(
            db,
            dto,
        )

        return {
            "message": "User created",
            "userId": user_id,
        }

    except ValueError as ex:
        raise HTTPException(
            status_code=400,
            detail=str(ex),
        )


@router.post("/login")
async def login(
    dto: LoginDto,
    db: AsyncSession = Depends(get_db),
):
    result = await UserService.login(
        db,
        dto,
    )

    if result is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password",
        )

    return result


@router.get("/{user_id}/list")
async def get_user_list(
    user_id: int,
    db: AsyncSession = Depends(get_db),
):
    return await UserService.get_user_list(
        db,
        user_id,
    )


@router.post("/{user_id}/list")
async def add_to_list(
    user_id: int,
    dto: AddToUserListDto,
    db: AsyncSession = Depends(get_db),
):
    try:
        await UserService.add_to_list(
            db,
            user_id,
            dto,
        )

        return {
            "message": "Added to list"
        }

    except ValueError as ex:
        raise HTTPException(
            status_code=400,
            detail=str(ex),
        )


@router.put("/{user_id}/list/{anime_id}")
async def update_user_list(
    user_id: int,
    anime_id: int,
    dto: UpdateUserListDto,
    db: AsyncSession = Depends(get_db),
):
    try:
        await UserService.update_user_list(
            db,
            user_id,
            anime_id,
            dto,
        )

        return {
            "message": "Список успешно обновлён"
        }

    except ValueError as ex:
        raise HTTPException(
            status_code=400,
            detail=str(ex),
        )


@router.delete("/{user_id}/list/{anime_id}")
async def delete_from_user_list(
    user_id: int,
    anime_id: int,
    db: AsyncSession = Depends(get_db),
):
    try:
        await UserService.delete_from_user_list(
            db,
            user_id,
            anime_id,
        )

        return {
            "message": "Запись успешно удалена"
        }

    except ValueError as ex:
        raise HTTPException(
            status_code=400,
            detail=str(ex),
        )