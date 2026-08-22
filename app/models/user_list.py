from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class UserList(Base):
    __tablename__ = "user_list"

    list_id: Mapped[int] = mapped_column(
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

    status: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )

    episodes_watched: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
    )