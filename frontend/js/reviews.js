const REVIEWS_API_URL =
    "/api/reviews/";


const reviewsContainer =
    document.getElementById(
        "reviewsContainer"
    );


const searchInput =
    document.getElementById(
        "searchInput"
    );


const sortFilter =
    document.getElementById(
        "sortFilter"
    );


const filterButtons =
    document.querySelectorAll(
        ".review-filter"
    );


const prevPageButton =
    document.getElementById(
        "prevPage"
    );


const nextPageButton =
    document.getElementById(
        "nextPage"
    );


const paginationPages =
    document.getElementById(
        "paginationPages"
    );


let reviews = [];

let currentFilter = "all";

let currentPage = 1;

const pageSize = 5;


async function loadReviews() {

    try {

        const response =
            await fetch(
                REVIEWS_API_URL
            );


        if (!response.ok) {

            throw new Error(
                "Не удалось загрузить отзывы"
            );

        }


        reviews =
            await response.json();


        renderReviews();

    } catch (error) {

        console.error(
            "Ошибка загрузки отзывов:",
            error
        );


        if (reviewsContainer) {

            reviewsContainer.innerHTML = `
                <p class="empty-text">
                    Не удалось загрузить отзывы.
                </p>
            `;

        }

    }

}


function getReviewTitle(review) {

    return (
        review.anime_title_ru ||
        review.animeTitleRu ||
        review.anime_title ||
        review.animeTitle ||
        review.title_ru ||
        review.title ||
        "Без названия"
    );

}


function getReviewPoster(review) {

    const poster =
        review.poster_url ||
        review.posterUrl ||
        review.animePosterUrl;


    if (!poster) {

        return "../images/no-poster.jpg";

    }


    if (
        poster.startsWith(
            "http"
        )
    ) {

        return poster;

    }


    if (
        poster.startsWith(
            "../"
        )
    ) {

        return poster;

    }


    if (
        poster.startsWith(
            "images/"
        )
    ) {

        return `../${poster}`;

    }


    return poster;

}


function getReviewText(review) {

    return (
        review.text ||
        review.comment ||
        review.content ||
        "Текст отзыва отсутствует."
    );

}


function getReviewScore(review) {

    return (
        review.score ||
        review.rating ||
        "—"
    );

}


function getReviewAuthor(review) {

    return (
        review.nickname ||
        review.user_nickname ||
        review.userNickname ||
        "Пользователь"
    );

}


function getReviewDate(review) {

    const date =
        review.created_at ||
        review.createdAt ||
        review.date;


    if (!date) {

        return "Дата не указана";

    }


    return new Date(
        date
    ).toLocaleDateString(
        "ru-RU"
    );

}


function getReviewAnimeId(review) {

    return (
        review.anime_id ||
        review.animeId
    );

}


function getFilteredReviews() {

    let result =
        [...reviews];


    /* Фильтр по поиску */

    const searchValue =
        searchInput
            ? searchInput.value
                .trim()
                .toLowerCase()
            : "";


    if (searchValue) {

        result =
            result.filter(
                review => {

                    const title =
                        getReviewTitle(
                            review
                        )
                            .toLowerCase();


                    const text =
                        getReviewText(
                            review
                        )
                            .toLowerCase();


                    return (
                        title.includes(
                            searchValue
                        ) ||
                        text.includes(
                            searchValue
                        )
                    );

                }
            );

    }


    /* Фильтр по оценке */

    if (
        currentFilter ===
        "positive"
    ) {

        result =
            result.filter(
                review =>
                    Number(
                        getReviewScore(
                            review
                        )
                    ) >= 7
            );

    }


    if (
        currentFilter ===
        "negative"
    ) {

        result =
            result.filter(
                review =>
                    Number(
                        getReviewScore(
                            review
                        )
                    ) <= 4
            );

    }


    /* С МОИМИ ОЦЕНКАМИ */

    if (
        currentFilter ===
        "my"
    ) {

        /*
            Пока авторизация
            не подключена,
            этот фильтр
            ничего не выводит.

            Позже сюда можно
            добавить проверку
            текущего пользователя.
        */

        result = [];

    }


    /* Сортировка */

    if (sortFilter) {

        if (
            sortFilter.value ===
            "old"
        ) {

            result.sort(
                (a, b) => {

                    const dateA =
                        new Date(
                            a.created_at ||
                            a.createdAt ||
                            a.date ||
                            0
                        );


                    const dateB =
                        new Date(
                            b.created_at ||
                            b.createdAt ||
                            b.date ||
                            0
                        );


                    return (
                        dateA -
                        dateB
                    );

                }
            );

        }


        if (
            sortFilter.value ===
            "rating"
        ) {

            result.sort(
                (a, b) => {

                    return (
                        Number(
                            getReviewScore(
                                b
                            )
                        ) -
                        Number(
                            getReviewScore(
                                a
                            )
                        )
                    );

                }
            );

        }


        if (
            sortFilter.value ===
            "new"
        ) {

            result.sort(
                (a, b) => {

                    const dateA =
                        new Date(
                            a.created_at ||
                            a.createdAt ||
                            a.date ||
                            0
                        );


                    const dateB =
                        new Date(
                            b.created_at ||
                            b.createdAt ||
                            b.date ||
                            0
                        );


                    return (
                        dateB -
                        dateA
                    );

                }
            );

        }

    }


    return result;

}


function renderReviews() {

    if (!reviewsContainer) {

        console.error(
            "Не найден reviewsContainer"
        );

        return;

    }


    const filteredReviews =
        getFilteredReviews();


    if (
        filteredReviews.length ===
        0
    ) {

        reviewsContainer.innerHTML = `
            <p class="empty-text">
                Отзывы не найдены.
            </p>
        `;


        renderPagination(
            0
        );

        return;

    }


    const totalPages =
        Math.ceil(
            filteredReviews.length /
            pageSize
        );


    if (
        currentPage >
        totalPages
    ) {

        currentPage =
            totalPages;

    }


    const startIndex =
        (
            currentPage -
            1
        ) *
        pageSize;


    const pageReviews =
        filteredReviews.slice(
            startIndex,
            startIndex +
            pageSize
        );


    reviewsContainer.innerHTML =
        pageReviews
            .map(
                review => {

                    const title =
                        getReviewTitle(
                            review
                        );


                    const poster =
                        getReviewPoster(
                            review
                        );


                    const text =
                        getReviewText(
                            review
                        );


                    const score =
                        getReviewScore(
                            review
                        );


                    const author =
                        getReviewAuthor(
                            review
                        );


                    const date =
                        getReviewDate(
                            review
                        );


                    const animeId =
                        getReviewAnimeId(
                            review
                        );


                    return `
                        <article
                            class="review-card"
                            data-anime-id="${animeId || ""}"
                        >

                            <img
                                class="review-poster"
                                src="${poster}"
                                alt="${title}"
                            >


                            <div
                                class="review-content"
                            >

                                <div
                                    class="review-header"
                                >

                                    <h2>
                                        ${title}
                                    </h2>


                                    <div
                                        class="review-score"
                                    >
                                        ★ ${score}
                                    </div>

                                </div>


                                <div
                                    class="review-meta"
                                >

                                    <span>
                                        ${author}
                                    </span>

                                    <span>
                                        •
                                    </span>

                                    <span>
                                        ${date}
                                    </span>

                                </div>


                                <p
                                    class="review-text"
                                >
                                    ${text}
                                </p>

                            </div>

                        </article>
                    `;

                }
            )
            .join("");


    renderPagination(
        totalPages
    );

}


function renderPagination(
    totalPages
) {

    if (!paginationPages) {

        return;

    }


    paginationPages.innerHTML =
        "";


    if (
        totalPages <=
        1
    ) {

        if (prevPageButton) {

            prevPageButton.disabled =
                true;

        }


        if (nextPageButton) {

            nextPageButton.disabled =
                true;

        }


        return;

    }


    for (
        let page = 1;
        page <= totalPages;
        page++
    ) {

        const button =
            document.createElement(
                "button"
            );


        button.type =
            "button";


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


                renderReviews();

            }
        );


        paginationPages.appendChild(
            button
        );

    }


    if (prevPageButton) {

        prevPageButton.disabled =
            currentPage ===
            1;

    }


    if (nextPageButton) {

        nextPageButton.disabled =
            currentPage ===
            totalPages;

    }

}


/* Фильтры */

filterButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            () => {

                filterButtons.forEach(
                    item => {

                        item.classList.remove(
                            "active"
                        );

                    }
                );


                button.classList.add(
                    "active"
                );


                currentFilter =
                    button.dataset.filter;


                currentPage =
                    1;


                renderReviews();

            }
        );

    }
);


/* Поиск */

if (searchInput) {

    searchInput.addEventListener(
        "input",
        () => {

            currentPage =
                1;


            renderReviews();

        }
    );

}


/* Сортировка */

if (sortFilter) {

    sortFilter.addEventListener(
        "change",
        () => {

            currentPage =
                1;


            renderReviews();

        }
    );

}


/* Предыдущая страница */

if (prevPageButton) {

    prevPageButton.addEventListener(
        "click",
        () => {

            if (
                currentPage >
                1
            ) {

                currentPage--;


                renderReviews();

            }

        }
    );

}


/* Следующая страница */

if (nextPageButton) {

    nextPageButton.addEventListener(
        "click",
        () => {

            const filteredReviews =
                getFilteredReviews();


            const totalPages =
                Math.ceil(
                    filteredReviews.length /
                    pageSize
                );


            if (
                currentPage <
                totalPages
            ) {

                currentPage++;


                renderReviews();

            }

        }
    );


}


/* Загрузка */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadReviews();

    }
);