from datetime import datetime

from sqlalchemy import DateTime, Integer, String
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.orm import relationship

from app.database import Base

from app.models.relationships import (
    subscription,
    user_genre,
    user_tag,
)


class User(Base):
    __tablename__ = "users"

    user_id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
    )

    nickname: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    email: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        unique=True,
    )

    phone: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        unique=True,
    )

    password_hash: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    avatar_url: Mapped[str | None] = mapped_column(
        String,
        nullable=True,
    )

    registration_date: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
    )

    status: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )

    reviews = relationship(
        "Review",
        back_populates="user",
    )

    bookmarks = relationship(
        "Bookmark",
        back_populates="user",
    )

    user_lists = relationship(
        "UserList",
        back_populates="user",
    )

    genres = relationship(
        "Genre",
        secondary=user_genre,
        back_populates="users",
    )

    tags = relationship(
        "Tag",
        secondary=user_tag,
        back_populates="users",
    )