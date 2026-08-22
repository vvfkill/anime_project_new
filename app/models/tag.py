from sqlalchemy import Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.orm import relationship
from app.models.relationships import anime_tag, user_tag

from app.database import Base


class Tag(Base):
    __tablename__ = "tag"

    tag_id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
    )

    name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        unique=True,
    )

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    animes = relationship(
        "Anime",
        secondary=anime_tag,
        back_populates="tags",
    )

    users = relationship(
        "User",
        secondary=user_tag,
        back_populates="tags",
    )