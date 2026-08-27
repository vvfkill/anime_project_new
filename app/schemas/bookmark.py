from datetime import datetime

from pydantic import BaseModel


class BookmarkSchema(BaseModel):

    bookmarkId: int

    userId: int

    animeId: int

    titleRu: str | None = None

    titleOriginal: str | None = None

    posterUrl: str | None = None

    createdAt: datetime | None = None


class AddBookmarkSchema(BaseModel):

    userId: int

    animeId: int