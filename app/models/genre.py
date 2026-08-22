from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.orm import relationship
from app.models.relationships import anime_genre, user_genre

from app.database import Base


class Genre(Base):
    __tablename__ = "genre"

    genre_id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
    )

    name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    animes = relationship(
        "Anime",
        secondary=anime_genre,
        back_populates="genres",
    )

    users = relationship(
        "User",
        secondary=user_genre,
        back_populates="genres",
    )