from sqlalchemy import Integer
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Season(Base):
    __tablename__ = "season"

    season_id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
    )

    anime_id: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    season_number: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )