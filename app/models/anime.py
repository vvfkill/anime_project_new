from sqlalchemy import Integer, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

from app.models.relationships import (
    anime_category,
    anime_genre,
    anime_studio,
    anime_tag,
    similar_anime,
)



class Anime(Base):
    __tablename__ = "anime"

    anime_id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
    )

    title_ru: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    title_original: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    full_description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    release_year: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    episodes_total: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    duration_minutes: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    type: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )

    status: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )

    average_rating: Mapped[float | None] = mapped_column(
        Numeric(3, 2),
        nullable=True,
    )

    poster_url: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    genres = relationship(
        "Genre",
        secondary=anime_genre,
        back_populates="animes",
    )

    tags = relationship(
        "Tag",
        secondary=anime_tag,
        back_populates="animes",
    )

    studios = relationship(
        "Studio",
        secondary=anime_studio,
        back_populates="animes",
    )

    categories = relationship(
        "Category",
        secondary=anime_category,
        back_populates="animes",
    )

    seasons = relationship(
        "Season",
        back_populates="anime",
    )

    reviews = relationship(
        "Review",
        back_populates="anime",
    )

    bookmarks = relationship(
        "Bookmark",
        back_populates="anime",
    )

    user_lists = relationship(
        "UserList",
        back_populates="anime",
    )

    characters = relationship(
        "Character",
        back_populates="anime",
    )