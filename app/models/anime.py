from sqlalchemy import Integer, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


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