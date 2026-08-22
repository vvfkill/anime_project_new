from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Episode(Base):
    __tablename__ = "episode"

    episode_id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
    )

    season_id: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    episode_number: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    title: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )