from sqlalchemy import Column, ForeignKey, Table

from app.database import Base


anime_genre = Table(
    "anime_genre",
    Base.metadata,
    Column(
        "anime_id",
        ForeignKey("anime.anime_id"),
        primary_key=True,
    ),
    Column(
        "genre_id",
        ForeignKey("genre.genre_id"),
        primary_key=True,
    ),
)


anime_tag = Table(
    "anime_tag",
    Base.metadata,
    Column(
        "anime_id",
        ForeignKey("anime.anime_id"),
        primary_key=True,
    ),
    Column(
        "tag_id",
        ForeignKey("tag.tag_id"),
        primary_key=True,
    ),
)


anime_studio = Table(
    "anime_studio",
    Base.metadata,
    Column(
        "anime_id",
        ForeignKey("anime.anime_id"),
        primary_key=True,
    ),
    Column(
        "studio_id",
        ForeignKey("studio.studio_id"),
        primary_key=True,
    ),
)


anime_category = Table(
    "anime_category",
    Base.metadata,
    Column(
        "anime_id",
        ForeignKey("anime.anime_id"),
        primary_key=True,
    ),
    Column(
        "category_id",
        ForeignKey("category.category_id"),
        primary_key=True,
    ),
)


character_seiyu = Table(
    "character_seiyu",
    Base.metadata,
    Column(
        "character_id",
        ForeignKey("anime_character.character_id"),
        primary_key=True,
    ),
    Column(
        "seiyu_id",
        ForeignKey("seiyu.seiyu_id"),
        primary_key=True,
    ),
)


user_genre = Table(
    "user_genre",
    Base.metadata,
    Column(
        "user_id",
        ForeignKey("users.user_id"),
        primary_key=True,
    ),
    Column(
        "genre_id",
        ForeignKey("genre.genre_id"),
        primary_key=True,
    ),
)


user_tag = Table(
    "user_tag",
    Base.metadata,
    Column(
        "user_id",
        ForeignKey("users.user_id"),
        primary_key=True,
    ),
    Column(
        "tag_id",
        ForeignKey("tag.tag_id"),
        primary_key=True,
    ),
)


subscription = Table(
    "subscription",
    Base.metadata,
    Column(
        "subscriber_id",
        ForeignKey("users.user_id"),
        primary_key=True,
    ),
    Column(
        "target_user_id",
        ForeignKey("users.user_id"),
        primary_key=True,
    ),
)


similar_anime = Table(
    "similar_anime",
    Base.metadata,
    Column(
        "anime_id",
        ForeignKey("anime.anime_id"),
        primary_key=True,
    ),
    Column(
        "related_anime_id",
        ForeignKey("anime.anime_id"),
        primary_key=True,
    ),
)