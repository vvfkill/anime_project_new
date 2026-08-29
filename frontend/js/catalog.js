document.addEventListener(
    "DOMContentLoaded",
    () => {

        const catalogContainer =
            document.getElementById(
                "catalogAnime"
            );

        const searchInput =
            document.getElementById(
                "searchInput"
            );

        const sortFilter =
            document.getElementById(
                "sortFilter"
            );

        const genreFilter =
            document.getElementById(
                "genreFilter"
            );

        const yearFilter =
            document.getElementById(
                "yearFilter"
            );

        const typeFilter =
            document.getElementById(
                "typeFilter"
            );

        const prevButton =
            document.getElementById(
                "prevPage"
            );

        const nextButton =
            document.getElementById(
                "nextPage"
            );

        const paginationPages =
            document.getElementById(
                "paginationPages"
            );


        let currentPage = 1;

        let totalPages = 1;


        /* =========================
           ЗАГРУЗКА АНИМЕ
        ========================= */

        async function loadAnime() {

            if (!catalogContainer) {
                return;
            }


            catalogContainer.innerHTML =
                `
                <p class="empty-text">
                    Загрузка...
                </p>
                `;


            try {

                const search =
                    searchInput
                        ? searchInput.value.trim()
                        : "";


                let url =
                    "http://127.0.0.1:8000/api/anime/";

                const params =
                    new URLSearchParams();


                params.append(
                    "page",
                    currentPage
                );


                params.append(
                    "page_size",
                    10
                );


                if (search) {

                    params.append(
                        "search",
                        search
                    );

                }


                if (
                    yearFilter &&
                    yearFilter.value
                ) {

                    params.append(
                        "year",
                        yearFilter.value
                    );

                }


                url +=
                    "?" +
                    params.toString();


                const response =
                    await fetch(url);


                if (!response.ok) {

                    throw new Error(
                        "Не удалось загрузить аниме"
                    );

                }


                const data =
                    await response.json();


                const animeList =
                    data.items || [];


                totalPages =
                    data.totalPages || 1;


                let sortedAnime =
                    [...animeList];


                /* =========================
                   СОРТИРОВКА
                ========================= */

                if (
                    sortFilter
                ) {

                    if (
                        sortFilter.value ===
                        "rating"
                    ) {

                        sortedAnime.sort(
                            (a, b) =>
                                (Number(
                                    b.averageRating
                                ) || 0)
                                -
                                (Number(
                                    a.averageRating
                                ) || 0)
                        );

                    }


                    if (
                        sortFilter.value ===
                        "year"
                    ) {

                        sortedAnime.sort(
                            (a, b) =>
                                (Number(
                                    b.releaseYear
                                ) || 0)
                                -
                                (Number(
                                    a.releaseYear
                                ) || 0)
                        );

                    }


                    if (
                        sortFilter.value ===
                        "title"
                    ) {

                        sortedAnime.sort(
                            (a, b) => {

                                const titleA =
                                    a.titleRu ||
                                    a.titleOriginal ||
                                    "";

                                const titleB =
                                    b.titleRu ||
                                    b.titleOriginal ||
                                    "";


                                return titleA.localeCompare(
                                    titleB,
                                    "ru"
                                );

                            }
                        );

                    }

                }


                renderAnime(
                    sortedAnime
                );


                renderPagination();

            }

            catch (error) {

                console.error(
                    error
                );


                catalogContainer.innerHTML =
                    `
                    <div class="catalog-error">

                        <h2>
                            Ошибка загрузки
                        </h2>

                        <p>
                            Не удалось загрузить аниме.
                        </p>

                    </div>
                    `;

            }

        }


        /* =========================
           ОТРИСОВКА КАРТОЧЕК
        ========================= */

        function renderAnime(
            animeList
        ) {

            if (
                !animeList ||
                animeList.length === 0
            ) {

                catalogContainer.innerHTML =
                    `
                    <p class="empty-text">
                        Аниме не найдено.
                    </p>
                    `;

                return;

            }


            catalogContainer.innerHTML =
                animeList
                    .map(
                        anime =>
                            createAnimeCard(
                                anime
                            )
                    )
                    .join("");

        }


        /* =========================
           КАРТОЧКА АНИМЕ
        ========================= */

        function createAnimeCard(
            anime
        ) {

            const title =
                anime.titleRu ||
                anime.titleOriginal ||
                "Без названия";


            const year =
                anime.releaseYear ||
                "—";


            const rating =
                anime.averageRating ??
                "—";


            const genres =
                anime.genres &&
                anime.genres.length > 0
                    ? anime.genres.join(
                        " · "
                    )
                    : "";


            let imageUrl =
                anime.posterUrl ||
                "";


            if (
                imageUrl &&
                !imageUrl.startsWith(
                    "http"
                ) &&
                !imageUrl.startsWith(
                    "/"
                )
            ) {

                imageUrl =
                    "/" +
                    imageUrl;

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
                                class="anime-genres"
                            >
                                ${genres}
                            </p>


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


        /* =========================
           ПАГИНАЦИЯ
        ========================= */

        function renderPagination() {

            if (
                !paginationPages
            ) {
                return;
            }


            paginationPages.innerHTML =
                "";


            const maxVisiblePages =
                Math.min(
                    totalPages,
                    5
                );


            let startPage =
                Math.max(
                    1,
                    currentPage - 2
                );


            let endPage =
                startPage +
                maxVisiblePages -
                1;


            if (
                endPage >
                totalPages
            ) {

                endPage =
                    totalPages;

                startPage =
                    Math.max(
                        1,
                        endPage -
                        maxVisiblePages +
                        1
                    );

            }


            for (
                let page =
                    startPage;

                page <= endPage;

                page++
            ) {

                const button =
                    document.createElement(
                        "button"
                    );


                button.textContent =
                    page;


                if (
                    page ===
                    currentPage
                ) {

                    button.classList.add(
                        "active"
                    );

                }


                button.addEventListener(
                    "click",
                    () => {

                        currentPage =
                            page;


                        loadAnime();

                    }
                );


                paginationPages.appendChild(
                    button
                );

            }


            if (
                prevButton
            ) {

                prevButton.disabled =
                    currentPage === 1;

            }


            if (
                nextButton
            ) {

                nextButton.disabled =
                    currentPage ===
                    totalPages;

            }

        }


        /* =========================
           КНОПКА НАЗАД
        ========================= */

        if (
            prevButton
        ) {

            prevButton.addEventListener(
                "click",
                () => {

                    if (
                        currentPage > 1
                    ) {

                        currentPage--;


                        loadAnime();

                    }

                }
            );

        }


        /* =========================
           КНОПКА ВПЕРЁД
        ========================= */

        if (
            nextButton
        ) {

            nextButton.addEventListener(
                "click",
                () => {

                    if (
                        currentPage <
                        totalPages
                    ) {

                        currentPage++;


                        loadAnime();

                    }

                }
            );

        }


        /* =========================
           ПОИСК
        ========================= */

        if (
            searchInput
        ) {

            searchInput.addEventListener(
                "input",
                () => {

                    currentPage =
                        1;


                    clearTimeout(
                        window.searchTimeout
                    );


                    window.searchTimeout =
                        setTimeout(
                            () => {

                                loadAnime();

                            },
                            500
                        );

                }
            );

        }


        /* =========================
           ГОД
        ========================= */

        if (
            yearFilter
        ) {

            yearFilter.addEventListener(
                "change",
                () => {

                    currentPage =
                        1;


                    loadAnime();

                }
            );

        }


        /* =========================
           СОРТИРОВКА
        ========================= */

        if (
            sortFilter
        ) {

            sortFilter.addEventListener(
                "change",
                () => {

                    loadAnime();

                }
            );

        }


        /* =========================
           ПЕРВАЯ ЗАГРУЗКА
        ========================= */

        loadAnime();

    }
);