from sqlalchemy import ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.models.relationships import character_seiyu


class Character(Base):
    __tablename__ = "anime_character"

    character_id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
    )

    anime_id: Mapped[int] = mapped_column(
        ForeignKey("anime.anime_id"),
        nullable=False,
    )

    name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    name_original: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    gender: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )

    role_type: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )

    image_url: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    anime = relationship(
        "Anime",
        back_populates="characters",
    )

    seiyus = relationship(
        "Seiyu",
        secondary=character_seiyu,
        back_populates="characters",
    )