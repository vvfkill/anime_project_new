from datetime import date

from sqlalchemy import Date, String, Text, Integer
from sqlalchemy.orm import Mapped, mapped_column

from sqlalchemy.orm import relationship

from app.models.relationships import character_seiyu

from app.database import Base


class Seiyu(Base):
    __tablename__ = "seiyu"

    seiyu_id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
    )

    name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    name_original: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    birth_date: Mapped[date | None] = mapped_column(
        Date,
        nullable=True,
    )

    country: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    photo_url: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    characters = relationship(
        "Character",
        secondary=character_seiyu,
        back_populates="seiyus",
    )