from sqlalchemy import Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column
from app.models.relationships import anime_category
from sqlalchemy.orm import relationship

from app.database import Base


class Category(Base):
    __tablename__ = "category"

    category_id: Mapped[int] = mapped_column(
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
        secondary=anime_category,
        back_populates="categories",
    )