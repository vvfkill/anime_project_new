from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from passlib.context import CryptContext
from datetime import datetime

from app.models.user import User
from app.models.user_list import UserList
from app.models.anime import Anime
from app.schemas.user import (
    UserDto,
    CreateUserDto,
    LoginDto,
    UserListDto,
    AddToUserListDto,
    UpdateUserListDto,
)


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class UserService:

    @staticmethod
    async def get_all(db: AsyncSession) -> list[UserDto]:
        result = await db.execute(
            select(User)
        )

        users = result.scalars().all()

        return [
            UserDto(
                user_id=user.user_id,
                nickname=user.nickname,
                email=user.email,
                avatar_url=user.avatar_url,
                registration_date=user.registration_date,
                status=user.status,
            )
            for user in users
        ]

    @staticmethod
    async def get_by_id(
        db: AsyncSession,
        user_id: int,
    ) -> UserDto | None:

        result = await db.execute(
            select(User)
            .where(User.user_id == user_id)
        )

        user = result.scalar_one_or_none()

        if user is None:
            return None

        return UserDto(
            user_id=user.user_id,
            nickname=user.nickname,
            email=user.email,
            avatar_url=user.avatar_url,
            registration_date=user.registration_date,
            status=user.status,
        )

    @staticmethod
    async def create(
        db: AsyncSession,
        dto: CreateUserDto,
    ) -> int:

        result = await db.execute(
            select(User).where(
                User.email == dto.email
            )
        )

        existing_user = result.scalar_one_or_none()

        if existing_user is not None:
            raise ValueError(
                "Пользователь с таким email уже существует"
            )

        result = await db.execute(
            select(User).where(
                User.phone == dto.phone
            )
        )

        existing_phone = result.scalar_one_or_none()

        if existing_phone is not None:
            raise ValueError(
                "Пользователь с таким телефоном уже существует"
            )

        password_hash = pwd_context.hash(
            dto.password
        )

        user = User(
            nickname=dto.nickname,
            email=dto.email,
            phone=dto.phone,
            password_hash=password_hash,
            registration_date=datetime.now(),
            status="active",
        )

        db.add(user)

        await db.commit()
        await db.refresh(user)

        return user.user_id

    @staticmethod
    async def login(
        db: AsyncSession,
        dto: LoginDto,
    ):

        result = await db.execute(
            select(User)
            .where(User.email == dto.email)
        )

        user = result.scalar_one_or_none()

        if user is None:
            return None

        if not pwd_context.verify(
            dto.password,
            user.password_hash,
        ):
            return None

        return {
            "message": "Вход успешен",
            "userId": user.user_id,
            "nickname": user.nickname,
            "email": user.email,
        }

    @staticmethod
    async def get_user_list(
        db: AsyncSession,
        user_id: int,
    ) -> list[UserListDto]:

        result = await db.execute(
            select(UserList)
            .where(UserList.user_id == user_id)
            .options(
                selectinload(UserList.anime)
                .selectinload(Anime.genres)
            )
        )

        user_lists = result.scalars().all()

        return [
            UserListDto(
                anime_id=item.anime_id,
                title=(
                    item.anime.title_ru
                    or item.anime.title_original
                ),
                title_ru=item.anime.title_ru,
                title_original=item.anime.title_original,
                release_year=item.anime.release_year,
                type=item.anime.type,
                episodes_total=item.anime.episodes_total,
                poster_url=item.anime.poster_url,
                average_rating=item.anime.average_rating,
                status=item.status,
                score=item.personal_score,
                updated_at=item.updated_at,
                genres=[
                    genre.name
                    for genre in item.anime.genres
                ],
            )
            for item in user_lists
        ]

    @staticmethod
    async def add_to_list(
        db: AsyncSession,
        user_id: int,
        dto: AddToUserListDto,
    ) -> None:

        result = await db.execute(
            select(UserList)
            .where(
                UserList.user_id == user_id,
                UserList.anime_id == dto.anime_id,
            )
        )

        existing = result.scalar_one_or_none()

        if existing is not None:
            raise ValueError(
                "Запись уже существует в списке пользователя"
            )

        user_list = UserList(
            user_id=user_id,
            anime_id=dto.anime_id,
            status=dto.status,
            personal_score=dto.score,
            updated_at=datetime.utcnow(),
        )

        db.add(user_list)

        await db.commit()

        await UserService.recalculate_anime_rating(
            db,
            dto.anime_id,
        )

    @staticmethod
    async def update_user_list(
        db: AsyncSession,
        user_id: int,
        anime_id: int,
        dto: UpdateUserListDto,
    ) -> None:

        result = await db.execute(
            select(UserList)
            .where(
                UserList.user_id == user_id,
                UserList.anime_id == anime_id,
            )
        )

        user_list = result.scalar_one_or_none()

        if user_list is None:
            raise ValueError(
                "Запись списка не найдена"
            )

        if dto.status is not None:
            user_list.status = dto.status

        if dto.score is not None:
            user_list.personal_score = dto.score

        await db.commit()

        await UserService.recalculate_anime_rating(
            db,
            anime_id,
        )

    @staticmethod
    async def delete_from_user_list(
        db: AsyncSession,
        user_id: int,
        anime_id: int,
    ) -> None:

        result = await db.execute(
            select(UserList)
            .where(
                UserList.user_id == user_id,
                UserList.anime_id == anime_id,
            )
        )

        user_list = result.scalar_one_or_none()

        if user_list is None:
            raise ValueError(
                "Запись списка не найдена"
            )

        await db.delete(user_list)

        await db.commit()

        await UserService.recalculate_anime_rating(
            db,
            anime_id,
        )

    @staticmethod
    async def recalculate_anime_rating(
        db: AsyncSession,
        anime_id: int,
    ) -> None:

        result = await db.execute(
            select(UserList.personal_score)
            .where(
                UserList.anime_id == anime_id,
                UserList.personal_score.is_not(None),
            )
        )

        scores = [
            score
            for score in result.scalars().all()
            if score is not None
        ]

        anime = await db.get(
            Anime,
            anime_id,
        )

        if anime is None:
            return

        if scores:
            anime.average_rating = sum(scores) / len(scores)
        else:
            anime.average_rating = None

        await db.commit()