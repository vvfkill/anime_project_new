from pydantic import BaseModel


class AnimeListSchema(BaseModel):
    animeId: int
    titleRu: str | None = None
    titleOriginal: str
    releaseYear: int | None = None
    type: str | None = None
    averageRating: float | None = None
    posterUrl: str | None = None
    genres: list[str] = []


class AnimePagedResultSchema(BaseModel):
    page: int
    pageSize: int
    totalCount: int
    totalPages: int
    items: list[AnimeListSchema] = []


class AnimeSeiyuSchema(BaseModel):
    seiyuId: int
    name: str
    nameOriginal: str | None = None
    country: str | None = None
    photoUrl: str | None = None


class AnimeCharacterSchema(BaseModel):
    characterId: int
    name: str
    nameOriginal: str | None = None
    description: str | None = None
    gender: str | None = None
    roleType: str | None = None
    imageUrl: str | None = None
    seiyus: list[AnimeSeiyuSchema] = []


class AnimeSchema(BaseModel):
    animeId: int
    titleRu: str | None = None
    titleOriginal: str
    description: str | None = None
    fullDescription: str | None = None
    releaseYear: int | None = None
    episodesTotal: int | None = None
    averageRating: float | None = None
    posterUrl: str | None = None
    genres: list[str] = []
    studios: list[str] = []
    tags: list[str] = []
    characters: list[AnimeCharacterSchema] = []
    similarAnime: list[AnimeListSchema] = []


class CreateAnimeSchema(BaseModel):
    titleOriginal: str
    titleRu: str | None = None
    description: str | None = None
    releaseYear: int | None = None
    episodesTotal: int | None = None
    durationMinutes: int | None = None
    posterUrl: str | None = None