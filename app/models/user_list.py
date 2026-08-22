from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.orm import relationship

from app.database import Base


class UserList(Base):
    __tablename__ = "user_list"

    list_id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.user_id"),
        nullable=False,
    )

    anime_id: Mapped[int] = mapped_column(
        ForeignKey("anime.anime_id"),
        nullable=False,
    )

    status: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )

    personal_score: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    episodes_watched: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
        default=0,
    )

    note: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
    )

    user = relationship(
        "User",
        back_populates="user_lists",
    )

    anime = relationship(
        "Anime",
        back_populates="user_lists",
    )