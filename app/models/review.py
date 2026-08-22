from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Review(Base):
    __tablename__ = "review"

    review_id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey("user.user_id"),
        nullable=False,
    )

    anime_id: Mapped[int] = mapped_column(
        ForeignKey("anime.anime_id"),
        nullable=False,
    )

    text: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    score: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
    )