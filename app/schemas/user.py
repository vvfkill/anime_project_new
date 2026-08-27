from datetime import datetime

from pydantic import BaseModel


class UserDto(BaseModel):
    user_id: int
    nickname: str | None = None
    email: str
    avatar_url: str | None = None
    registration_date: datetime | None = None
    status: str | None = None


class CreateUserDto(BaseModel):
    nickname: str
    email: str
    phone: str
    password: str


class LoginDto(BaseModel):
    email: str
    password: str


class UserListDto(BaseModel):
    anime_id: int
    title: str | None = None
    title_ru: str | None = None
    title_original: str | None = None
    release_year: int | None = None
    type: str | None = None
    episodes_total: int | None = None
    poster_url: str | None = None
    average_rating: float | None = None
    status: str | None = None
    score: int | None = None
    updated_at: datetime | None = None
    genres: list[str] = []


class AddToUserListDto(BaseModel):
    anime_id: int
    status: str
    score: int | None = None


class UpdateUserListDto(BaseModel):
    status: str | None = None
    score: int | None = None