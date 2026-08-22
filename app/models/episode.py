from datetime import date

from sqlalchemy import Date, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.orm import relationship

from app.database import Base


class Episode(Base):
    __tablename__ = "episode"

    episode_id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
    )

    season_id: Mapped[int] = mapped_column(
        ForeignKey("season.season_id"),
        nullable=False,
    )

    episode_number: Mapped[int] = mapped_column(
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

    duration_minutes: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    release_date: Mapped[date | None] = mapped_column(
        Date,
        nullable=True,
    )

    video_url: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    season = relationship(
        "Season",
        back_populates="episodes",
    )