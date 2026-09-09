const API_URL = "http://127.0.0.1:8000/api";

const ANIME_API_URL = `${API_URL}/anime`;
const USERS_API_URL = `${API_URL}/users`;
const BOOKMARKS_API_URL = `${API_URL}/bookmarks`;
const REVIEWS_API_URL = `${API_URL}/reviews`;

const animeDetails = document.getElementById("animeDetails");
const reviewsContainer = document.getElementById("reviewsContainer");
const ratingValue = document.getElementById("ratingValue");
const ratingSubtext = document.getElementById("ratingSubtext");
const descriptionContainer = document.getElementById("descriptionContainer");
const writeReviewBtn = document.getElementById("writeReviewBtn");
const charactersContainer = document.getElementById("charactersContainer");
const similarAnimeContainer = document.getElementById("similarAnimeContainer");

let currentAnime = null;
let currentListStatus = null;
let currentUserScore = null;


/* =========================
   ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
========================= */

function getAnimeIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    if (!id || id === "undefined" || id === "null") {
        return null;
    }

    return id;
}

function getAnimeId(anime) {
    if (!anime) {
        return null;
    }

    return (
        anime.animeId ??
        anime.anime_id
    );
}

function getCurrentUser() {
    try {
        const user = localStorage.getItem("authUser");
        return user ? JSON.parse(user) : null;
    } catch {
        return null;
    }
}

function getCurrentUserId() {
    const user = getCurrentUser();

    if (!user) {
        return null;
    }

    return (
        user.userId ??
        user.user_id ??
        user.id ??
        user.Id
    );
}

function requireAuth() {
    if (getCurrentUser()) {
        return true;
    }

    alert("Сначала войдите в аккаунт");
    window.location.href = "login.html";

    return false;
}

function getValue(object, ...keys) {
    if (!object) {
        return null;
    }

    for (const key of keys) {
        if (
            object[key] !== undefined &&
            object[key] !== null &&
            object[key] !== ""
        ) {
            return object[key];
        }
    }

    return null;
}

function getNamedList(object, ...keys) {
    const value = getValue(object, ...keys);

    if (Array.isArray(value)) {
        return value
            .map(item => {
                if (typeof item === "string") {
                    return item;
                }

                return (
                    getValue(
                        item,
                        "name",
                        "Name",
                        "title",
                        "Title"
                    ) || ""
                );
            })
            .filter(Boolean);
    }

    if (typeof value === "string") {
        return value
            .split(",")
            .map(item => item.trim())
            .filter(Boolean);
    }

    return [];
}


/* =========================
   ИЗОБРАЖЕНИЯ
========================= */

function getImageUrl(value) {
    const fallback = "../images/no-poster.jpg";

    if (!value) {
        return fallback;
    }

    const url = String(value).trim();

    if (!url) {
        return fallback;
    }

    if (url.startsWith("http://") || url.startsWith("https://")) {
        return url;
    }

    if (url.startsWith("../")) {
        return url;
    }

    if (url.startsWith("/")) {
        return `http://127.0.0.1:8000${url}`;
    }

    if (url.startsWith("images/")) {
        return `../${url}`;
    }

    return url;
}

function getPosterUrl(anime) {
    return getImageUrl(
        getValue(
            anime,
            "posterUrl",
            "poster_url",
            "poster"
        )
    );
}

function getCharacterImageUrl(character) {
    return getImageUrl(
        getValue(
            character,
            "imageUrl",
            "image_url",
            "photoUrl",
            "photo_url"
        )
    );
}


/* =========================
   ДАННЫЕ АНИМЕ
========================= */

function getAnimeTitle(anime) {
    return (
        getValue(
            anime,
            "titleRu",
            "title_ru",
            "title"
        ) ||
        getValue(
            anime,
            "titleOriginal",
            "title_original"
        ) ||
        "Без названия"
    );
}

function getAnimeOriginalTitle(anime) {
    return (
        getValue(
            anime,
            "titleOriginal",
            "title_original"
        ) || ""
    );
}

function getAnimeDescription(anime) {
    return (
        getValue(
            anime,
            "description",
            "fullDescription",
            "full_description"
        ) ||
        "Описание пока не добавлено."
    );
}

function getAnimeFullDescription(anime) {
    return (
        getValue(
            anime,
            "fullDescription",
            "full_description",
            "description"
        ) ||
        "Описание пока не добавлено."
    );
}

function getAnimeGenres(anime) {
    return getNamedList(
        anime,
        "genres",
        "Genres",
        "genre",
        "Genre"
    );
}

function getAnimeTags(anime) {
    return getNamedList(
        anime,
        "tags",
        "Tags",
        "tag",
        "Tag"
    );
}

function getAnimeStudio(anime) {
    const studios = getValue(
        anime,
        "studios",
        "Studios"
    );

    if (Array.isArray(studios)) {
        return studios
            .map(studio => {
                if (typeof studio === "string") {
                    return studio;
                }

                return (
                    getValue(
                        studio,
                        "name",
                        "Name"
                    ) || ""
                );
            })
            .filter(Boolean)
            .join(", ");
    }

    if (typeof studios === "string") {
        return studios;
    }

    return (
        getValue(
            anime,
            "studio",
            "Studio"
        ) || "—"
    );
}

function getAnimeRating(anime) {
    const value = getValue(
        anime,
        "averageRating",
        "average_rating"
    );

    if (value === null) {
        return null;
    }

    const rating = Number(value);

    return Number.isFinite(rating)
        ? rating
        : null;
}

function getAnimeYear(anime) {
    return (
        getValue(
            anime,
            "releaseYear",
            "release_year",
            "year"
        ) ?? "—"
    );
}

function getAnimeEpisodes(anime) {
    return (
        getValue(
            anime,
            "episodesTotal",
            "episodes_total",
            "episodes"
        ) ?? "—"
    );
}

function getAnimeType(anime) {
    return (
        getValue(
            anime,
            "type",
            "Type"
        ) || "—"
    );
}

function getAnimeStatus(anime) {
    return (
        getValue(
            anime,
            "status",
            "Status"
        ) || "—"
    );
}

function getAnimeAgeRating(anime) {
    return (
        getValue(
            anime,
            "ageRating",
            "age_rating",
            "ageRestriction",
            "age_restriction"
        ) || "—"
    );
}


/* =========================
   ЗАПРОС АНИМЕ
========================= */

async function fetchAnimeById(animeId) {
    if (!animeId) {
        throw new Error("Не указан идентификатор аниме");
    }

    const response = await fetch(
        `${ANIME_API_URL}/${encodeURIComponent(animeId)}`
    );

    if (!response.ok) {
        if (response.status === 404) {
            throw new Error("Аниме не найдено");
        }

        throw new Error(
            `Не удалось загрузить аниме (${response.status})`
        );
    }

    return await response.json();
}


/* =========================
   ОТРИСОВКА ОСНОВНОЙ ИНФОРМАЦИИ
========================= */

function renderAnimeDetails(anime) {
    if (!animeDetails) {
        return;
    }

    const title = getAnimeTitle(anime);
    const originalTitle = getAnimeOriginalTitle(anime);
    const poster = getPosterUrl(anime);
    const genres = getAnimeGenres(anime);
    const tags = getAnimeTags(anime);
    const studio = getAnimeStudio(anime);
    const rating = getAnimeRating(anime);
    const year = getAnimeYear(anime);
    const episodes = getAnimeEpisodes(anime);
    const type = getAnimeType(anime);
    const status = getAnimeStatus(anime);
    const ageRating = getAnimeAgeRating(anime);
    const description = getAnimeDescription(anime);

    animeDetails.innerHTML = `
        <div class="anime-main">

            <div class="anime-poster">
                <img
                    src="${poster}"
                    alt="${title}"
                    onerror="
                        this.onerror = null;
                        this.src = '../images/no-poster.jpg';
                    "
                >
            </div>

            <div class="anime-info">

                <h1>${title}</h1>

                ${
                    originalTitle
                        ? `
                            <div class="anime-original-title">
                                ${originalTitle}
                            </div>
                        `
                        : ""
                }

                <div class="anime-rating-line">

                    <span class="anime-rating">
                        ★ ${rating !== null ? rating.toFixed(1) : "—"}
                    </span>

                    ${
                        rating !== null
                            ? `<span>Средняя оценка</span>`
                            : ""
                    }

                    <span class="anime-divider">|</span>

                    <span>${type}</span>

                    <span class="anime-divider">|</span>

                    <span>${year}</span>

                    <span class="anime-divider">|</span>

                    <span>
                        ${episodes}
                        ${
                            episodes !== "—"
                                ? " эпизодов"
                                : ""
                        }
                    </span>

                </div>

                <div class="anime-tags">
                    ${
                        genres.length
                            ? genres
                                .map(
                                    genre => `
                                        <span>${genre}</span>
                                    `
                                )
                                .join("")
                            : `
                                <span>Жанры не указаны</span>
                            `
                    }
                </div>

                <p class="anime-description-short">
                    ${description}
                </p>

                <button
                    type="button"
                    class="anime-bookmark-button"
                    id="bookmarkBtn"
                >
                    В закладки
                </button>

            </div>

            <div class="anime-details">

                <div class="anime-detail-row">
                    <span>Статус</span>
                    <strong>${status}</strong>
                </div>

                <div class="anime-detail-row">
                    <span>Тип</span>
                    <strong>${type}</strong>
                </div>

                <div class="anime-detail-row">
                    <span>Год выхода</span>
                    <strong>${year}</strong>
                </div>

                <div class="anime-detail-row">
                    <span>Студия</span>
                    <strong>${studio}</strong>
                </div>

                <div class="anime-detail-row">
                    <span>Жанры</span>
                    <strong>
                        ${genres.length ? genres.join(", ") : "—"}
                    </strong>
                </div>

                <div class="anime-detail-row">
                    <span>Теги</span>
                    <strong>
                        ${tags.length ? tags.join(", ") : "—"}
                    </strong>
                </div>

                <div class="anime-detail-row">
                    <span>Возрастной рейтинг</span>
                    <strong>${ageRating}</strong>
                </div>

                <div class="anime-detail-row">
                    <span>Оригинальное название</span>
                    <strong>
                        ${originalTitle || "—"}
                    </strong>
                </div>

            </div>

        </div>
    `;

    setupAnimeActions(anime);
}


/* =========================
   ОПИСАНИЕ
========================= */

function renderDescription(anime) {
    if (!descriptionContainer) {
        return;
    }

    const description = getAnimeFullDescription(anime)
        .split(/\n\s*\n/)
        .map(paragraph => paragraph.trim())
        .filter(Boolean);

    descriptionContainer.innerHTML = `
        <div class="anime-about">
            ${
                description
                    .map(paragraph => `
                        <p>
                            ${paragraph.replace(/\n/g, "<br>")}
                        </p>
                    `)
                    .join("")
            }
        </div>
    `;
}


/* =========================
   ПЕРСОНАЖИ
========================= */

function getCharacters(anime) {
    const characters = anime?.characters;

    return Array.isArray(characters)
        ? characters
        : [];
}

function renderCharacters(characters) {
    if (!charactersContainer) {
        return;
    }

    if (!Array.isArray(characters) || characters.length === 0) {
        charactersContainer.innerHTML = `
            <div class="empty-tab-state">
                <p>
                    Информация о персонажах пока не добавлена.
                </p>
            </div>
        `;
        return;
    }

    charactersContainer.innerHTML = `
        <div class="characters-grid">
            ${characters
                .map(character => {

                    const image = getCharacterImageUrl(character);

                    const name =
                        getValue(
                            character,
                            "name",
                            "Name"
                        ) || "Без имени";

                    const originalName =
                        getValue(
                            character,
                            "nameOriginal",
                            "name_original",
                            "originalName",
                            "original_name"
                        ) || "";

                    const roleType =
                        getValue(
                            character,
                            "roleType",
                            "role_type",
                            "role"
                        ) || "Персонаж";

                    const seiyus = getValue(
                        character,
                        "seiyus",
                        "Seiyus"
                    );

                    const seiyuList = Array.isArray(seiyus)
                        ? seiyus
                        : [];

                    const seiyuNames = seiyuList
                        .map(seiyu =>
                            getValue(
                                seiyu,
                                "name",
                                "Name"
                            ) || ""
                        )
                        .filter(Boolean);

                    return `
                        <article class="character-card">

                            <img
                                src="${image}"
                                alt="${name}"
                                onerror="
                                    this.onerror = null;
                                    this.src = '../images/no-poster.jpg';
                                "
                            >

                            <strong>
                                ${name}
                            </strong>

                            ${
                                originalName
                                    ? `
                                        <span>
                                            ${originalName}
                                        </span>
                                    `
                                    : ""
                            }

                            <span>
                                ${roleType}
                            </span>

                            ${
                                seiyuNames.length
                                    ? `
                                        <span>
                                            Сэйю: ${seiyuNames.join(", ")}
                                        </span>
                                    `
                                    : ""
                            }

                        </article>
                    `;
                })
                .join("")}
        </div>
    `;
}


/* =========================
   ПОХОЖИЕ АНИМЕ
========================= */

function getSimilarAnime(anime) {
    const similar = anime?.similarAnime;

    if (!Array.isArray(similar)) {
        return [];
    }

    return similar.filter(item => {
        if (!item || typeof item !== "object") {
            return false;
        }

        const id = item.animeId;

        if (id === undefined || id === null) {
            return false;
        }

        return true;
    });
}

function renderSimilarAnime(items) {
    if (!similarAnimeContainer) {
        return;
    }

    if (!Array.isArray(items) || items.length === 0) {
        similarAnimeContainer.innerHTML = `
            <div class="empty-tab-state">
                <p>
                    Похожие аниме пока не найдены.
                </p>
            </div>
        `;
        return;
    }

    similarAnimeContainer.innerHTML = `
        <div class="similar-grid">
            ${items
                .map(anime => {

                    const animeId = anime.animeId;

                    const title = getAnimeTitle(anime);

                    const originalTitle = getAnimeOriginalTitle(anime);

                    const poster = getPosterUrl(anime);

                    const rating = getAnimeRating(anime);

                    const year = getAnimeYear(anime);

                    const type = getAnimeType(anime);

                    const genres = getAnimeGenres(anime);

                    return `
                        <a
                            class="similar-card"
                            href="anime.html?id=${encodeURIComponent(animeId)}"
                        >

                            <img
                                src="${poster}"
                                alt="${title}"
                                onerror="
                                    this.onerror = null;
                                    this.src = '../images/no-poster.jpg';
                                "
                            >

                            <strong>
                                ${title}
                            </strong>

                            ${
                                originalTitle
                                    ? `
                                        <span>
                                            ${originalTitle}
                                        </span>
                                    `
                                    : ""
                            }

                            <span>
                                ${type} · ${year}
                            </span>

                            ${
                                rating !== null
                                    ? `
                                        <span>
                                            ★ ${rating.toFixed(1)}
                                        </span>
                                    `
                                    : ""
                            }

                            ${
                                genres.length
                                    ? `
                                        <span>
                                            ${genres.join(" · ")}
                                        </span>
                                    `
                                    : ""
                            }

                        </a>
                    `;
                })
                .join("")}
        </div>
    `;
}


/* =========================
   РЕЙТИНГ
========================= */

function renderRating(anime) {
    const rating = getAnimeRating(anime);

    if (ratingValue) {
        ratingValue.textContent =
            rating !== null
                ? rating.toFixed(1)
                : "—";
    }

    if (ratingSubtext) {
        ratingSubtext.textContent = "Средняя оценка";
    }
}


/* =========================
   ОТЗЫВЫ
========================= */

function getReviewsFromResponse(data) {
    if (Array.isArray(data)) {
        return data;
    }

    if (Array.isArray(data?.items)) {
        return data.items;
    }

    if (Array.isArray(data?.reviews)) {
        return data.reviews;
    }

    return [];
}

async function fetchReviewsByAnime(animeId) {
    const urls = [
        `${ANIME_API_URL}/${encodeURIComponent(animeId)}/reviews`,
        `${REVIEWS_API_URL}/anime/${encodeURIComponent(animeId)}`
    ];

    for (const url of urls) {
        try {
            const response = await fetch(url);

            if (!response.ok) {
                continue;
            }

            const data = await response.json();
            const reviews = getReviewsFromResponse(data);

            return reviews;
        } catch {
            continue;
        }
    }

    return [];
}

function getReviewAuthor(review) {
    return (
        getValue(
            review,
            "userNickname",
            "user_nickname",
            "nickname",
            "userName",
            "user_name"
        ) || "Пользователь"
    );
}

function getReviewScore(review) {
    return (
        getValue(
            review,
            "score",
            "rating"
        ) ?? "—"
    );
}

function getReviewText(review) {
    return (
        getValue(
            review,
            "text",
            "comment",
            "content"
        ) || "Текст отзыва отсутствует."
    );
}

function getReviewDate(review) {
    const value = getValue(
        review,
        "createdAt",
        "created_at",
        "date"
    );

    if (!value) {
        return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    return date.toLocaleDateString("ru-RU");
}

function updateReviewsCount(count) {
    document
        .querySelectorAll(".anime-tab, .tab-btn")
        .forEach(tab => {

            const text = tab.textContent
                .trim()
                .toLowerCase();

            if (!text.includes("отзывы")) {
                return;
            }

            const badge = tab.querySelector("span");

            if (badge) {
                badge.textContent = count;
            }
        });

    const reviewsCount = document.getElementById("reviewsCount");

    if (reviewsCount) {
        reviewsCount.textContent = count;
    }
}

function renderReviews(reviews) {
    if (!reviewsContainer) {
        return;
    }

    const reviewList = Array.isArray(reviews)
        ? reviews
        : [];

    updateReviewsCount(reviewList.length);

    if (reviewList.length === 0) {
        reviewsContainer.innerHTML = `
            <div class="empty-tab-state">
                <p>Отзывов пока нет.</p>
            </div>
        `;
        return;
    }

    reviewsContainer.innerHTML = reviewList
        .map(review => {

            const author = getReviewAuthor(review);
            const score = getReviewScore(review);
            const text = getReviewText(review);
            const date = getReviewDate(review);

            return `
                <article class="anime-review-card">

                    <div class="anime-review-avatar">
                        ${author.charAt(0).toUpperCase()}
                    </div>

                    <div class="anime-review-body">

                        <div class="anime-review-top">

                            <div>
                                <h3>${author}</h3>
                                <p>${date}</p>
                            </div>

                            <div class="anime-review-score">
                                ★ ${score}
                            </div>

                        </div>

                        <p class="anime-review-text">
                            ${text}
                        </p>

                    </div>

                </article>
            `;
        })
        .join("");
}


/* =========================
   СПИСОК ПОЛЬЗОВАТЕЛЯ
========================= */

async function loadCurrentAnimeListStatus(animeId) {
    const userId = getCurrentUserId();

    if (!userId) {
        return;
    }

    try {
        const response = await fetch(
            `${USERS_API_URL}/${userId}/list`
        );

        if (!response.ok) {
            return;
        }

        const data = await response.json();

        const list = Array.isArray(data)
            ? data
            : data.items || [];

        const item = list.find(entry =>
            Number(
                getValue(
                    entry,
                    "animeId",
                    "anime_id"
                )
            ) === Number(animeId)
        );

        if (!item) {
            return;
        }

        currentListStatus = getValue(
            item,
            "status",
            "Status"
        );

        currentUserScore = getValue(
            item,
            "score",
            "personalScore",
            "personal_score"
        );

        const dropdownText =
            document.getElementById("listDropdownText");

        if (dropdownText && currentListStatus) {
            dropdownText.textContent =
                currentListStatus;
        }

        document
            .querySelectorAll(".list-dropdown-menu button")
            .forEach(button => {
                button.classList.toggle(
                    "active",
                    button.dataset.status === currentListStatus
                );
            });

        updateRateButtonState(currentUserScore);

    } catch {
        // Состояние пользователя не должно ломать страницу.
    }
}

async function addAnimeToList(animeId, status) {
    if (!requireAuth()) {
        return false;
    }

    const userId = getCurrentUserId();

    if (!userId) {
        return false;
    }

    try {
        const response = await fetch(
            `${USERS_API_URL}/${userId}/list`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    animeId: Number(animeId),
                    status: status,
                    score: currentUserScore
                })
            }
        );

        if (response.ok) {
            currentListStatus = status;
            return true;
        }

        if (response.status === 409) {
            const updateResponse = await fetch(
                `${USERS_API_URL}/${userId}/list/${animeId}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        status: status,
                        score: currentUserScore
                    })
                }
            );

            if (!updateResponse.ok) {
                throw new Error(
                    "Не удалось обновить статус аниме"
                );
            }

            currentListStatus = status;
            return true;
        }

        throw new Error(
            "Не удалось добавить аниме в список"
        );

    } catch (error) {
        alert(error.message);
        return false;
    }
}


/* =========================
   ОЦЕНКА
========================= */

function updateRateButtonState(score) {
    const button =
        document.getElementById("rateAnimeBtn");

    if (!button) {
        return;
    }

    if (score !== null && score !== undefined) {
        button.classList.add("active");
        button.textContent = `★ ${score}/10`;
    } else {
        button.classList.remove("active");
        button.textContent = "☆ Оценить";
    }
}

function closeRatingPopup() {
    const popup =
        document.getElementById("ratingPopup");

    if (popup) {
        popup.remove();
    }
}

async function saveAnimeScore(animeId, score) {
    if (!requireAuth()) {
        return false;
    }

    const userId = getCurrentUserId();

    if (!userId) {
        return false;
    }

    try {
        const response = await fetch(
            `${USERS_API_URL}/${userId}/list/${animeId}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    status:
                        currentListStatus || "Смотрю",
                    score: Number(score)
                })
            }
        );

        if (!response.ok) {
            throw new Error(
                "Не удалось сохранить оценку"
            );
        }

        currentUserScore = Number(score);

        updateRateButtonState(
            currentUserScore
        );

        return true;

    } catch (error) {
        alert(error.message);
        return false;
    }
}

function setupRatingButton(anime) {
    const button =
        document.getElementById("rateAnimeBtn");

    if (!button) {
        return;
    }

    button.addEventListener("click", () => {

        if (!requireAuth()) {
            return;
        }

        closeRatingPopup();

        const popup =
            document.createElement("div");

        popup.id = "ratingPopup";
        popup.className = "rating-popup";

        popup.innerHTML = `
            <h3>Оценить аниме</h3>

            <p>
                Выберите оценку от 1 до 10
            </p>

            <div class="rating-options">

                ${Array.from(
                    { length: 10 },
                    (_, index) => 10 - index
                )
                    .map(score => `
                        <button
                            type="button"
                            data-score="${score}"
                            class="${
                                Number(currentUserScore) === score
                                    ? "active"
                                    : ""
                            }"
                        >
                            ${score}
                        </button>
                    `)
                    .join("")}

            </div>

            <button
                type="button"
                class="rating-popup-close"
                id="closeRatingPopup"
            >
                Отмена
            </button>
        `;

        button.insertAdjacentElement(
            "afterend",
            popup
        );

        popup
            .querySelectorAll(".rating-options button")
            .forEach(scoreButton => {

                scoreButton.addEventListener(
                    "click",
                    async () => {

                        const score =
                            Number(
                                scoreButton.dataset.score
                            );

                        const saved =
                            await saveAnimeScore(
                                getAnimeId(anime),
                                score
                            );

                        if (!saved) {
                            return;
                        }

                        closeRatingPopup();
                    }
                );
            });

        document
            .getElementById("closeRatingPopup")
            ?.addEventListener(
                "click",
                closeRatingPopup
            );
    });
}


/* =========================
   ЗАКЛАДКИ
========================= */

function setBookmarkButtonState(isBookmarked) {
    const button =
        document.getElementById("bookmarkBtn");

    if (!button) {
        return;
    }

    button.dataset.bookmarked =
        isBookmarked ? "true" : "false";

    button.textContent =
        isBookmarked
            ? "В избранном"
            : "В закладки";

    button.classList.toggle(
        "active",
        isBookmarked
    );
}

async function loadCurrentBookmarkStatus(animeId) {
    const userId = getCurrentUserId();

    if (!userId) {
        return;
    }

    try {
        const response = await fetch(
            `${BOOKMARKS_API_URL}/user/${userId}`
        );

        if (!response.ok) {
            return;
        }

        const data = await response.json();

        const bookmarks = Array.isArray(data)
            ? data
            : data.items || [];

        const bookmark = bookmarks.find(item =>
            Number(
                getValue(
                    item,
                    "animeId",
                    "anime_id"
                )
            ) === Number(animeId)
        );

        setBookmarkButtonState(
            Boolean(bookmark)
        );

    } catch {
        // Закладки не должны ломать страницу.
    }
}

async function toggleBookmark(animeId) {
    if (!requireAuth()) {
        return false;
    }

    const userId = getCurrentUserId();

    const button =
        document.getElementById("bookmarkBtn");

    const isBookmarked =
        button?.dataset.bookmarked === "true";

    try {

        if (isBookmarked) {

            const response = await fetch(
                `${BOOKMARKS_API_URL}?userId=${userId}&animeId=${animeId}`,
                {
                    method: "DELETE"
                }
            );

            if (!response.ok) {
                throw new Error(
                    "Не удалось удалить аниме из закладок"
                );
            }

            setBookmarkButtonState(false);

            return true;
        }

        const response = await fetch(
            BOOKMARKS_API_URL,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    userId: Number(userId),
                    animeId: Number(animeId)
                })
            }
        );

        if (!response.ok) {
            throw new Error(
                "Не удалось добавить аниме в закладки"
            );
        }

        setBookmarkButtonState(true);

        return true;

    } catch (error) {
        alert(error.message);
        return false;
    }
}


/* =========================
   ДЕЙСТВИЯ
========================= */

function setupAnimeActions(anime) {
    const animeId = getAnimeId(anime);

    if (!animeId) {
        return;
    }

    const bookmarkButton =
        document.getElementById("bookmarkBtn");

    if (bookmarkButton) {
        bookmarkButton.addEventListener(
            "click",
            () => toggleBookmark(animeId)
        );
    }

    const dropdown =
        document.getElementById("listDropdown");

    const dropdownButton =
        document.getElementById("listDropdownBtn");

    const dropdownText =
        document.getElementById("listDropdownText");

    if (dropdownButton && dropdown) {
        dropdownButton.addEventListener(
            "click",
            event => {
                event.stopPropagation();

                dropdown.classList.toggle("open");
            }
        );
    }

    document
        .querySelectorAll(".list-dropdown-menu button")
        .forEach(button => {

            button.addEventListener(
                "click",
                async event => {

                    event.stopPropagation();

                    const status =
                        button.dataset.status;

                    const saved =
                        await addAnimeToList(
                            animeId,
                            status
                        );

                    if (!saved) {
                        return;
                    }

                    if (dropdownText) {
                        dropdownText.textContent =
                            status;
                    }

                    document
                        .querySelectorAll(
                            ".list-dropdown-menu button"
                        )
                        .forEach(item => {
                            item.classList.toggle(
                                "active",
                                item === button
                            );
                        });

                    dropdown?.classList.remove(
                        "open"
                    );
                }
            );
        });

    document.addEventListener(
        "click",
        event => {

            if (
                dropdown &&
                !dropdown.contains(event.target)
            ) {
                dropdown.classList.remove(
                    "open"
                );
            }

        }
    );

    loadCurrentAnimeListStatus(animeId);
    loadCurrentBookmarkStatus(animeId);
    setupRatingButton(anime);
}


/* =========================
   СОЗДАНИЕ ОТЗЫВА
========================= */

async function createReview(
    animeId,
    score,
    text
) {
    if (!requireAuth()) {
        return false;
    }

    const userId = getCurrentUserId();

    if (!userId) {
        return false;
    }

    try {
        const response = await fetch(
            REVIEWS_API_URL,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    userId: Number(userId),
                    animeId: Number(animeId),
                    score: Number(score),
                    text: text
                })
            }
        );

        if (!response.ok) {
            throw new Error(
                "Не удалось опубликовать отзыв"
            );
        }

        return true;

    } catch (error) {
        alert(error.message);
        return false;
    }
}

function setupWriteReviewButton() {
    if (!writeReviewBtn || !currentAnime) {
        return;
    }

    writeReviewBtn.addEventListener(
        "click",
        () => {

            if (!requireAuth()) {
                return;
            }

            const existingForm =
                document.getElementById(
                    "reviewForm"
                );

            if (existingForm) {
                existingForm.remove();
                return;
            }

            const form =
                document.createElement("form");

            form.id = "reviewForm";
            form.className = "review-form";

            form.innerHTML = `
                <div class="review-form-row">

                    <label>
                        Оценка

                        <select
                            id="reviewScore"
                            required
                        >
                            <option value="">
                                Выберите оценку
                            </option>

                            ${Array.from(
                                { length: 10 },
                                (_, index) => 10 - index
                            )
                                .map(
                                    score => `
                                        <option value="${score}">
                                            ${score}
                                        </option>
                                    `
                                )
                                .join("")}

                        </select>
                    </label>

                </div>

                <label>
                    Текст отзыва

                    <textarea
                        id="reviewText"
                        rows="5"
                        placeholder="Напишите своё мнение..."
                        required
                    ></textarea>
                </label>

                <div class="review-form-actions">

                    <button
                        type="submit"
                        class="primary-btn"
                    >
                        Опубликовать
                    </button>

                    <button
                        type="button"
                        class="outline-action-btn"
                        id="cancelReviewBtn"
                    >
                        Отмена
                    </button>

                </div>
            `;

            const reviewsTab =
                document.getElementById(
                    "reviewsTab"
                );

            const reviewsHeader =
                reviewsTab?.querySelector(
                    ".reviews-header"
                );

            if (reviewsHeader) {
                reviewsHeader.insertAdjacentElement(
                    "afterend",
                    form
                );
            } else if (reviewsContainer) {
                reviewsContainer.before(form);
            }

            document
                .getElementById("cancelReviewBtn")
                ?.addEventListener(
                    "click",
                    () => form.remove()
                );

            form.addEventListener(
                "submit",
                async event => {

                    event.preventDefault();

                    const score =
                        document.getElementById(
                            "reviewScore"
                        )?.value;

                    const text =
                        document.getElementById(
                            "reviewText"
                        )?.value.trim();

                    if (!score || !text) {
                        alert(
                            "Заполните оценку и текст отзыва"
                        );
                        return;
                    }

                    const animeId =
                        getAnimeId(currentAnime);

                    const saved =
                        await createReview(
                            animeId,
                            score,
                            text
                        );

                    if (!saved) {
                        return;
                    }

                    form.remove();

                    const reviews =
                        await fetchReviewsByAnime(
                            animeId
                        );

                    renderReviews(reviews);
                }
            );
        }
    );
}


/* =========================
   ВКЛАДКИ
========================= */

function setupAnimeTabs() {
    const buttons =
        document.querySelectorAll(
            ".tab-btn, .anime-tab"
        );

    const contents =
        document.querySelectorAll(
            ".tab-content"
        );

    buttons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const tabName =
                    button.dataset.tab;

                if (!tabName) {
                    return;
                }

                buttons.forEach(item => {
                    item.classList.remove(
                        "active"
                    );
                });

                contents.forEach(content => {
                    content.classList.remove(
                        "active"
                    );
                    content.hidden = true;
                });

                button.classList.add(
                    "active"
                );

                const target =
                    document.getElementById(
                        `${tabName}Tab`
                    );

                if (target) {
                    target.hidden = false;
                    target.classList.add(
                        "active"
                    );
                }
            }
        );
    });
}


/* =========================
   ЗАГРУЗКА СТРАНИЦЫ
========================= */

async function loadAnimePage() {
    const animeId =
        getAnimeIdFromUrl();

    if (!animeId) {
        if (animeDetails) {
            animeDetails.innerHTML = `
                <div class="empty-state">

                    <h2>
                        Аниме не найдено
                    </h2>

                    <p>
                        В адресе страницы отсутствует ID аниме.
                    </p>

                </div>
            `;
        }

        return;
    }

    try {
        currentAnime =
            await fetchAnimeById(
                animeId
            );

        if (!currentAnime) {
            throw new Error(
                "Аниме не найдено"
            );
        }

        renderAnimeDetails(
            currentAnime
        );

        renderDescription(
            currentAnime
        );

        renderRating(
            currentAnime
        );

        renderCharacters(
            getCharacters(currentAnime)
        );

        renderSimilarAnime(
            getSimilarAnime(currentAnime)
        );

        const reviews =
            await fetchReviewsByAnime(
                animeId
            );

        renderReviews(
            reviews
        );

        setupWriteReviewButton();

    } catch (error) {

        console.error(
            "Ошибка загрузки страницы аниме:",
            error
        );

        if (animeDetails) {
            animeDetails.innerHTML = `
                <div class="empty-state">

                    <h2>
                        Ошибка загрузки
                    </h2>

                    <p>
                        ${error.message}
                    </p>

                </div>
            `;
        }

        if (reviewsContainer) {
            reviewsContainer.innerHTML = "";
        }
    }
}


/* =========================
   ЗАПУСК
========================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {
        setupAnimeTabs();
        loadAnimePage();
    }
);
