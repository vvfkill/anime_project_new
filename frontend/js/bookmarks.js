document.addEventListener(
    "DOMContentLoaded",
    async () => {

        const container =
            document.getElementById(
                "bookmarksGrid"
            );


        const searchInput =
            document.getElementById(
                "bookmarkSearch"
            );


        const filterButtons =
            document.querySelectorAll(
                ".bookmark-filter"
            );


        let animeList = [];

        let currentStatus =
            "all";


        try {

            const response =
                await fetch(
                    "http://127.0.0.1:8000/api/anime/"
                );


            if (!response.ok) {

                throw new Error(
                    "Не удалось загрузить аниме"
                );

            }


            const data =
                await response.json();


            animeList =
                data.items || [];


            renderBookmarks(
                animeList,
                container
            );


        } catch (error) {

            console.error(
                error
            );


            container.innerHTML =
                `
                <p class="empty-text">
                    Не удалось загрузить закладки.
                </p>
                `;

        }


        /* =========================
           ПОИСК
        ========================= */

        searchInput.addEventListener(
            "input",
            () => {

                updateBookmarks();

            }
        );


        /* =========================
           ФИЛЬТРЫ
        ========================= */

        filterButtons.forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        filterButtons.forEach(
                            item =>
                                item.classList.remove(
                                    "active"
                                )
                        );


                        button.classList.add(
                            "active"
                        );


                        currentStatus =
                            button.dataset.status;


                        updateBookmarks();

                    }
                );

            }
        );


        function updateBookmarks() {

            const searchValue =
                searchInput.value
                    .toLowerCase()
                    .trim();


            let filteredList =
                [...animeList];


            if (searchValue) {

                filteredList =
                    filteredList.filter(
                        anime => {

                            const title =
                                (
                                    anime.titleRu ||
                                    anime.titleOriginal ||
                                    ""
                                )
                                    .toLowerCase();


                            return title.includes(
                                searchValue
                            );

                        }
                    );

            }


            /*
             Пока статусы демонстрационные.
             Позже заменим на реальные
             данные из API закладок.
            */

            if (
                currentStatus !== "all"
            ) {

                filteredList =
                    filteredList.filter(
                        (anime, index) => {

                            const statuses = [
                                "watching",
                                "completed",
                                "planned",
                                "postponed"
                            ];


                            return
                                statuses[
                                    index % statuses.length
                                ] === currentStatus;

                        }
                    );

            }


            renderBookmarks(
                filteredList,
                container
            );

        }

    }
);


/* =========================
   ОТРИСОВКА
========================= */

function renderBookmarks(
    animeList,
    container
) {

    if (
        !animeList ||
        animeList.length === 0
    ) {

        container.innerHTML =
            `
            <p class="empty-text">
                Закладки не найдены.
            </p>
            `;

        return;

    }


    container.innerHTML =
        animeList
            .map(
                (anime, index) =>
                    createBookmarkCard(
                        anime,
                        index
                    )
            )
            .join("");

}


/* =========================
   КАРТОЧКА
========================= */

function createBookmarkCard(
    anime,
    index
) {

    const title =
        anime.titleRu ||
        anime.titleOriginal ||
        "Без названия";


    const year =
        anime.releaseYear ||
        "";


    const statuses = [
        {
            key: "watching",
            title: "СМОТРЮ",
            className: "status-watching",
            progress: 65
        },
        {
            key: "completed",
            title: "ПРОСМОТРЕНО",
            className: "status-completed",
            progress: 100
        },
        {
            key: "planned",
            title: "ЗАПЛАНИРОВАНО",
            className: "status-planned",
            progress: 0
        },
        {
            key: "postponed",
            title: "ОТЛОЖЕНО",
            className: "status-postponed",
            progress: 40
        }
    ];


    const status =
        statuses[
            index % statuses.length
        ];


    let imageUrl =
        anime.posterUrl ||
        "";


    if (
        imageUrl &&
        !imageUrl.startsWith("http") &&
        !imageUrl.startsWith("/")
    ) {

        imageUrl =
            "/" + imageUrl;

    }


    return `
        <article
            class="bookmark-card"
        >

            <div
                class="bookmark-poster"
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


                <button
                    class="bookmark-icon"
                    type="button"
                >
                    🔖
                </button>

            </div>


            <div
                class="bookmark-content"
            >

                <h3
                    class="bookmark-title"
                >
                    ${title}
                </h3>


                <p
                    class="bookmark-meta"
                >
                    ${year}
                </p>


                <div
                    class="bookmark-status"
                >

                    <span
                        class="
                            status-dot
                            ${status.className}
                        "
                    ></span>

                    ${status.title}

                </div>


                <div
                    class="bookmark-progress-text"
                >
                    Прогресс
                </div>


                <div
                    class="bookmark-progress-bar"
                >

                    <div
                        class="bookmark-progress"
                        style="
                            width:
                            ${status.progress}%
                        "
                    ></div>

                </div>

            </div>

        </article>
    `;

}