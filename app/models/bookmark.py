from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Bookmark(Base):
    __tablename__ = "bookmark"

    bookmark_id: Mapped[int] = mapped_column(
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

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
    )