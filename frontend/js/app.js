document.addEventListener("DOMContentLoaded", async () => {

    const popularContainer =
        document.getElementById("popularAnime");

    const newContainer =
        document.getElementById("newAnime");


    try {

        const response = await fetch(
            "/api/anime"
        );


        if (!response.ok) {
            throw new Error(
                "Не удалось загрузить аниме"
            );
        }


        const animeList =
            await response.json();


        /* =========================
           ПОПУЛЯРНОЕ
        ========================= */

        const popularAnime =
            [...animeList]
                .sort(
                    (a, b) =>
                        (Number(b.averageRating) || 0) -
                        (Number(a.averageRating) || 0)
                )
                .slice(0, 6);


        renderAnime(
            popularAnime,
            popularContainer
        );


        /* =========================
           НОВИНКИ
        ========================= */

        const newAnime =
            [...animeList]
                .sort(
                    (a, b) =>
                        (Number(b.releaseYear) || 0) -
                        (Number(a.releaseYear) || 0)
                )
                .slice(0, 6);


        renderAnime(
            newAnime,
            newContainer
        );


    } catch (error) {

        console.error(error);


        if (popularContainer) {

            popularContainer.innerHTML =
                `
                <p class="empty-text">
                    Не удалось загрузить аниме.
                </p>
                `;

        }


        if (newContainer) {

            newContainer.innerHTML =
                `
                <p class="empty-text">
                    Не удалось загрузить аниме.
                </p>
                `;

        }

    }

});


/* =========================
   ОТРИСОВКА КАРТОЧЕК
========================= */

function renderAnime(
    animeList,
    container
) {

    if (!container) {
        return;
    }


    if (
        !animeList ||
        animeList.length === 0
    ) {

        container.innerHTML =
            `
            <p class="empty-text">
                Аниме не найдено.
            </p>
            `;

        return;

    }


    container.innerHTML =
        animeList
            .map(
                anime =>
                    createAnimeCard(anime)
            )
            .join("");

}


/* =========================
   СОЗДАНИЕ КАРТОЧКИ
========================= */

function createAnimeCard(anime) {

    const title =
        anime.title ||
        anime.name ||
        "Без названия";


    const year =
        anime.releaseYear ||
        anime.year ||
        "";


    const rating =
        anime.averageRating ||
        anime.rating ||
        "—";


    let imageUrl =
        anime.posterUrl ||
        anime.poster ||
        anime.imageUrl ||
        anime.image ||
        "";


    /* =========================
       ИСПРАВЛЕНИЕ ПУТИ
       К ИЗОБРАЖЕНИЮ
    ========================= */

    if (
        imageUrl &&
        !imageUrl.startsWith("http") &&
        !imageUrl.startsWith("/")
    ) {

        imageUrl =
            "/" + imageUrl;

    }


    return `
        <a
            href="#"
            class="anime-card-link"
        >

            <article
                class="anime-card"
            >

                <div
                    class="anime-poster"
                >

                    ${
                        imageUrl
                            ? `
                                <img
                                    src="${imageUrl}"
                                    alt="${title}"
                                >
                            `
                            : `
                                <div
                                    class="poster-placeholder"
                                >
                                    Нет изображения
                                </div>
                            `
                    }

                    <span
                        class="anime-rating"
                    >
                        ★ ${rating}
                    </span>

                </div>


                <div
                    class="anime-card-content"
                >

                    <h3>
                        ${title}
                    </h3>

                    <p
                        class="anime-year"
                    >
                        ${year}
                    </p>

                </div>

            </article>

        </a>
    `;

}