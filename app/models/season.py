from datetime import date

from sqlalchemy import Date, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.orm import relationship

from app.database import Base


class Season(Base):
    __tablename__ = "season"

    season_id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
    )

    anime_id: Mapped[int] = mapped_column(
        ForeignKey("anime.anime_id"),
        nullable=False,
    )

    season_number: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    title: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    release_date: Mapped[date | None] = mapped_column(
        Date,
        nullable=True,
    )

    episodes_count: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    anime = relationship(
        "Anime",
        back_populates="seasons",
    )

    episodes = relationship(
        "Episode",
        back_populates="season",
    )