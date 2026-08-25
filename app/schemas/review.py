from datetime import datetime

from pydantic import BaseModel


class ReviewSchema(BaseModel):
    reviewId: int
    userId: int
    animeId: int
    userNickname: str | None = None
    animeTitleRu: str | None = None
    animeTitleOriginal: str | None = None
    posterUrl: str | None = None
    releaseYear: int | None = None
    type: str | None = None
    averageRating: float | None = None
    text: str
    score: int
    createdAt: datetime | None = None
    genres: list[str] = []


class CreateReviewSchema(BaseModel):
    userId: int
    animeId: int
    text: str
    score: int