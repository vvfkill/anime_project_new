const ANIME_API_URL = "https://localhost:7241/api/anime";
const USERS_API_URL = "https://localhost:7241/api/users";
const BOOKMARKS_API_URL = "https://localhost:7241/api/bookmarks";
const REVIEWS_API_URL = "https://localhost:7241/api/reviews";

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

function getAnimeIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id");
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

    if (!user) return null;

    return user.userId || user.user_id || user.id;
}

function requireAuth() {
    const user = getCurrentUser();

    if (!user) {
        alert("Сначала войдите в аккаунт");
        window.location.href = "login.html";
        return false;
    }

    return true;
}

function getPosterUrl(posterUrl) {
    const fallbackPoster = "../images/no-poster.jpg";

    if (!posterUrl || posterUrl.trim() === "") return fallbackPoster;
    if (posterUrl.startsWith("http")) return posterUrl;
    if (posterUrl.startsWith("../")) return posterUrl;
    if (posterUrl.startsWith("/")) return `https://localhost:7241${posterUrl}`;
    if (posterUrl.startsWith("images/")) return `../${posterUrl}`;

    return posterUrl;
}

function getCharacterImageUrl(imageUrl) {
    const fallbackImage = "../images/no-poster.jpg";

    if (!imageUrl || String(imageUrl).trim() === "") {
        return fallbackImage;
    }

    if (imageUrl.startsWith("http")) {
        return imageUrl;
    }

    if (imageUrl.startsWith("../")) {
        return imageUrl;
    }

    if (imageUrl.startsWith("/")) {
        return `https://localhost:7241${imageUrl}`;
    }

    if (imageUrl.startsWith("images/")) {
        return `../${imageUrl}`;
    }

    return imageUrl;
}

function getAnimeTitle(anime) {
    return anime.titleRu || anime.titleOriginal || anime.title || "Без названия";
}

function getAnimeGenres(anime) {
    if (Array.isArray(anime.genres)) return anime.genres;
    if (typeof anime.genres === "string") {
        return anime.genres.split(",").map(item => item.trim());
    }
    if (typeof anime.genre === "string") return [anime.genre];

    return [];
}

async function fetchAnimeById(animeId) {
    const response = await fetch(`${ANIME_API_URL}/${animeId}`);

    if (!response.ok) {
        throw new Error("Не удалось загрузить аниме");
    }

    return await response.json();
}

function renderReviews(reviews) {
    if (!reviewsContainer) return;

    if (!reviews || reviews.length === 0) {
        reviewsContainer.innerHTML = `
            <div class="empty-tab-state">
                <p>Отзывов пока нет. Станьте первым, кто оставит мнение об этом аниме.</p>
            </div>
        `;
        return;
    }

    reviewsContainer.innerHTML = reviews.map(review => {
        const author = review.userNickname || review.nickname || review.userName || "Пользователь";
        const score = review.score ?? review.rating ?? "—";
        const text = review.text || review.comment || "Текст отзыва отсутствует.";
        const date = review.createdAt
            ? new Date(review.createdAt).toLocaleDateString("ru-RU")
            : "—";

        return `
            <article class="anime-review-card">
                <div class="anime-review-avatar">
                    ${author[0]?.toUpperCase() || "A"}
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
    }).join("");
}

function renderAnimeDetails(anime) {
    if (!animeDetails) return;

    const fallbackPoster = "../images/no-poster.jpg";
    const poster = getPosterUrl(anime.posterUrl);
    const title = getAnimeTitle(anime);
    const genres = getAnimeGenres(anime);
    const rating = anime.averageRating ?? "—";

    animeDetails.innerHTML = `
        <div class="anime-hero-layout">
            <div class="anime-poster-area">
                <img
                    class="anime-main-poster"
                    src="${poster}"
                    alt="${title}"
                    onerror="this.onerror=null; this.src='${fallbackPoster}';"
                >

                <button type="button" class="trailer-btn">
                    ▶ Смотреть трейлер
                </button>
            </div>

            <div class="anime-info-area">
                <div class="breadcrumbs">
                    <a href="index.html">Главная</a>
                    <span>/</span>
                    <a href="catalog.html">Каталог</a>
                    <span>/</span>
                    <span>${title}</span>
                </div>

                <div class="anime-title-row">
                    <h1>${title}</h1>
                    <button type="button" class="small-favorite-btn">★</button>
                </div>

                <p class="anime-original-name">${anime.titleOriginal || ""}</p>

                <div class="anime-tags-row">
                    <span>${anime.type || "—"}</span>
                    <span>${anime.releaseYear || "—"}</span>
                    <span>${anime.status || "Завершён"}</span>
                    <span class="age-tag">18+</span>
                </div>

                <p class="anime-short-description">
                    ${anime.description || "Описание пока не добавлено."}
                </p>

                <div class="anime-genres-row">
                    ${genres.length
                        ? genres.map(genre => `<span>${genre}</span>`).join("")
                        : `<span>Жанры не указаны</span>`
                    }
                </div>

                <div class="anime-action-row">
                    <div class="custom-list-dropdown" id="listDropdown">
                        <button type="button" class="list-dropdown-main" id="listDropdownBtn">
                            <span class="list-plus">+</span>
                            <span id="listDropdownText">Добавить в мой список</span>
                            <span class="list-arrow">›</span>
                        </button>

                        <div class="list-dropdown-menu">
                            <button type="button" data-status="Просмотрено">Просмотрено</button>
                            <button type="button" data-status="Смотрю">Смотрю</button>
                            <button type="button" data-status="Запланировано">Запланировано</button>
                            <button type="button" data-status="Брошено">Брошено</button>
                            <button type="button" data-status="Отложено">Отложено</button>
                            <button type="button" data-status="Пересматриваю">Пересматриваю</button>
                        </div>
                    </div>

                    <button type="button" class="outline-action-btn" id="bookmarkBtn">
                        В избранное
                    </button>

                    <button type="button" class="outline-action-btn" id ="rateAnimeBtn">
                        Оценить
                    </button>
                </div>
            </div>

            <aside class="anime-side-info">
                <div class="info-line">
                    <span>Студия:</span>
                    <strong>${anime.studio || "—"}</strong>
                </div>

                <div class="info-line">
                    <span>Режиссёр:</span>
                    <strong>${anime.director || "—"}</strong>
                </div>

                <div class="info-line">
                    <span>Автор оригинала:</span>
                    <strong>${anime.author || "—"}</strong>
                </div>

                <div class="info-line">
                    <span>Эпизоды:</span>
                    <strong>${anime.episodesTotal || "—"}</strong>
                </div>

                <div class="info-line">
                    <span>Длительность:</span>
                    <strong>${anime.duration || "24 мин."}</strong>
                </div>

                <div class="info-line">
                    <span>Статус:</span>
                    <strong>${anime.status || "Завершён"}</strong>
                </div>

                <div class="info-line">
                    <span>Жанр:</span>
                    <strong>${genres.length ? genres.join(", ") : "—"}</strong>
                </div>
            </aside>
        </div>
    `;

    setupAnimeActions(anime);
}

function updateRateButtonState(score) {
    const rateBtn = document.getElementById("rateAnimeBtn");

    if (!rateBtn) return;

    if (score) {
        rateBtn.classList.add("active");
        rateBtn.textContent = `★ ${score}/10`;
    } else {
        rateBtn.classList.remove("active");
        rateBtn.textContent = "☆ Оценить";
    }
}

function closeRatingPopup() {
    const popup = document.getElementById("ratingPopup");

    if (popup) {
        popup.remove();
    }
}

async function saveAnimeScore(animeId, score) {
    if (!requireAuth()) return false;

    const userId = getCurrentUserId();

    const allowedStatuses = [
        "Просмотрено",
        "Смотрю",
        "Запланировано",
        "Брошено",
        "Отложено",
        "Пересматриваю"
    ];

    try {
        let existingItem = null;

        const listResponse = await fetch(`${USERS_API_URL}/${userId}/list`);

        if (listResponse.ok) {
            const list = await listResponse.json();

            existingItem = list.find(item =>
                Number(item.animeId || item.anime_id) === Number(animeId)
            );
        }

        let statusToSave =
            existingItem?.status ||
            currentListStatus ||
            "Смотрю";

        statusToSave = String(statusToSave).trim();

        if (!allowedStatuses.includes(statusToSave)) {
            statusToSave = "Смотрю";
        }

        let response;

        if (existingItem) {
            response = await fetch(`${USERS_API_URL}/${userId}/list/${animeId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    status: statusToSave,
                    score: Number(score)
                })
            });
        } else {
            response = await fetch(`${USERS_API_URL}/${userId}/list`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    animeId: Number(animeId),
                    status: statusToSave,
                    score: Number(score)
                })
            });
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.message || "Не удалось сохранить оценку");
        }

        currentListStatus = statusToSave;
        currentUserScore = Number(score);

        const dropdownText = document.getElementById("listDropdownText");

        if (dropdownText) {
            dropdownText.textContent = statusToSave;
        }

        updateRateButtonState(currentUserScore);

        return true;
    } catch (error) {
        alert(error.message);
        return false;
    }
}

function setupRatingButton(anime) {
    const rateBtn = document.getElementById("rateAnimeBtn");

    if (!rateBtn) return;

    rateBtn.addEventListener("click", () => {
        if (!requireAuth()) return;

        closeRatingPopup();

        const popup = document.createElement("div");
        popup.id = "ratingPopup";
        popup.className = "rating-popup";

        popup.innerHTML = `
            <h3>Оценить аниме</h3>
            <p>Выберите оценку от 1 до 10</p>

            <div class="rating-options">
                ${[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map(score => `
                    <button type="button" data-score="${score}" class="${Number(currentUserScore) === score ? "active" : ""}">
                        ${score}
                    </button>
                `).join("")}
            </div>

            <button type="button" class="rating-popup-close" id="closeRatingPopup">
                Отмена
            </button>
        `;

        rateBtn.insertAdjacentElement("afterend", popup);

        popup.querySelectorAll(".rating-options button").forEach(button => {
            button.addEventListener("click", async () => {
                const score = button.dataset.score;

                const saved = await saveAnimeScore(anime.animeId, score);

                if (!saved) return;

                closeRatingPopup();

                currentAnime = await fetchAnimeById(anime.animeId);
                renderRating(currentAnime);
            });
        });

        const closeBtn = document.getElementById("closeRatingPopup");

        if (closeBtn) {
            closeBtn.addEventListener("click", closeRatingPopup);
        }
    });
}

function setupAnimeActions(anime) {
    const bookmarkBtn = document.getElementById("bookmarkBtn");
    const dropdown = document.getElementById("listDropdown");
    const dropdownBtn = document.getElementById("listDropdownBtn");
    const dropdownText = document.getElementById("listDropdownText");

    if (dropdownBtn && dropdown) {
        dropdownBtn.addEventListener("click", () => {
            dropdown.classList.toggle("open");
        });
    }

    document.querySelectorAll(".list-dropdown-menu button").forEach(button => {
    button.addEventListener("click", async () => {
        const status = button.dataset.status;

        const saved = await addAnimeToList(anime.animeId, status);

        if (!saved) {
            return;
        }

        if (dropdownText) {
            dropdownText.textContent = status;
        }

        document.querySelectorAll(".list-dropdown-menu button").forEach(item => {
            item.classList.remove("active");
        });

        button.classList.add("active");

        if (dropdown) {
            dropdown.classList.remove("open");
        }
    });
});

    if (bookmarkBtn) {
        bookmarkBtn.addEventListener("click", async () => {
            await toggleBookmark(anime.animeId);
        });
    }

    document.addEventListener("click", event => {
        if (!dropdown) return;

        if (!dropdown.contains(event.target)) {
            dropdown.classList.remove("open");
        }
    });

    loadCurrentAnimeListStatus(anime.animeId);
    loadCurrentBookmarkStatus(anime.animeId);
    setupRatingButton(anime);
}

async function addAnimeToList(animeId, status) {
    if (!requireAuth()) return false;

    const userId = getCurrentUserId();

    const payload = {
        animeId: Number(animeId),
        status: status,
        score: null
    };

    try {
        const postResponse = await fetch(`${USERS_API_URL}/${userId}/list`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        if (postResponse.ok) {
            return true;
        }

        if (postResponse.status === 409) {
            const putResponse = await fetch(`${USERS_API_URL}/${userId}/list/${animeId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    status: status,
                    score: null
                })
            });

            if (!putResponse.ok) {
                const errorData = await putResponse.json().catch(() => null);
                throw new Error(errorData?.message || "Не удалось обновить статус аниме");
            }

            return true;
        }

        const errorData = await postResponse.json().catch(() => null);
        throw new Error(errorData?.message || "Не удалось добавить аниме в список");
    } catch (error) {
        alert(error.message);
        return false;
    }
}

async function loadCurrentBookmarkStatus(animeId) {
    const userId = getCurrentUserId();

    if (!userId) return;

    try {
        const response = await fetch(`${BOOKMARKS_API_URL}/user/${userId}`);

        if (!response.ok) return;

        const bookmarks = await response.json();

        const currentBookmark = bookmarks.find(item =>
            Number(item.animeId || item.anime_id) === Number(animeId)
        );

        if (!currentBookmark) return;

        setBookmarkButtonState(true);
    } catch {
        // Не мешаем загрузке страницы, если закладки не удалось получить.
    }
}

function setBookmarkButtonState(isBookmarked) {
    const bookmarkBtn = document.getElementById("bookmarkBtn");

    if (!bookmarkBtn) return;

    bookmarkBtn.dataset.bookmarked = isBookmarked ? "true" : "false";
    bookmarkBtn.innerHTML = isBookmarked ? "В избранном" : "В избранное";
    bookmarkBtn.classList.toggle("active", isBookmarked);
}

async function toggleBookmark(animeId) {
    if (!requireAuth()) return false;

    const userId = getCurrentUserId();
    const bookmarkBtn = document.getElementById("bookmarkBtn");
    const isBookmarked = bookmarkBtn?.dataset.bookmarked === "true";

    try {
        if (isBookmarked) {
            const response = await fetch(`${BOOKMARKS_API_URL}?userId=${userId}&animeId=${animeId}`, {
                method: "DELETE"
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.message || "Не удалось удалить аниме из избранного");
            }

            setBookmarkButtonState(false);
            return true;
        }

        const response = await fetch(BOOKMARKS_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                userId: Number(userId),
                animeId: Number(animeId)
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.message || "Не удалось добавить аниме в избранное");
        }

        setBookmarkButtonState(true);
        return true;
    } catch (error) {
        alert(error.message);
        return false;
    }
}

function renderReviews(reviews) {
    if (!reviewsContainer) return;

    if (!reviews || reviews.length === 0) {
        reviewsContainer.innerHTML = `<p>Отзывов пока нет.</p>`;
        return;
    }

    reviewsContainer.innerHTML = reviews.map(review => `
        <article class="review-card">
            <div class="review-user">
                ${review.nickname || review.userName || "Пользователь"}
            </div>

            <div class="review-score">
                Оценка: ★ ${review.score ?? review.rating ?? "—"}
            </div>

            <p class="review-text">
                ${review.text || review.comment || "Текст отзыва отсутствует."}
            </p>
        </article>
    `).join("");
}

function renderRating(anime) {
    if (ratingValue) {
        ratingValue.textContent = anime.averageRating ?? "—";
    }

    if (ratingSubtext) {
        ratingSubtext.textContent = "Средняя оценка";
    }
}

function setupAnimeTabs() {
    const tabButtons = document.querySelectorAll(".tab-btn");
    const tabContents = document.querySelectorAll(".tab-content");

    tabButtons.forEach(button => {
        button.addEventListener("click", () => {
            const tabName = button.dataset.tab;

            tabButtons.forEach(item => {
                item.classList.remove("active");
            });

            tabContents.forEach(content => {
                content.classList.remove("active");
            });

            button.classList.add("active");

            const targetTab = document.getElementById(`${tabName}Tab`);

            if (targetTab) {
                targetTab.classList.add("active");
            }
        });
    });
}

function renderDescription(anime) {
    if (!descriptionContainer) return;

    const fullDescription =
        anime.fullDescription ||
        anime.full_description ||
        anime.description ||
        "Описание пока не добавлено.";

    descriptionContainer.innerHTML = `
        <div class="anime-description-block">
            <p>${fullDescription}</p>
        </div>
    `;
}
function renderCharacters(characters) {
    if (!charactersContainer) return;

    if (!characters || characters.length === 0) {
        charactersContainer.innerHTML = `
            <div class="empty-tab-state">
                <p>Информация о персонажах пока не добавлена.</p>
            </div>
        `;
        return;
    }

    charactersContainer.innerHTML = characters.map(character => {
        const image = getCharacterImageUrl(character.imageUrl || character.image_url);
        const name = character.name || "Без имени";
        const originalName = character.nameOriginal || character.name_original || "";
        const roleType = character.roleType || character.role_type || "Персонаж";
        const description = character.description || "Описание персонажа пока не добавлено.";
        const seiyus = character.seiyus || [];

        return `
            <article class="character-card">
                <img
                    src="${image}"
                    alt="${name}"
                    onerror="this.onerror=null; this.src='../images/no-poster.jpg';"
                >

                <div class="character-card-body">
                    <div class="character-card-head">
                        <div>
                            <h3>${name}</h3>
                            <p>${originalName}</p>
                        </div>

                        <span>${roleType}</span>
                    </div>

                    <p class="character-description">
                        ${description}
                    </p>

                    <div class="character-seiyu">
                        <strong>Сэйю:</strong>
                        <span>
                            ${
                                seiyus.length
                                    ? seiyus.map(seiyu => seiyu.name).join(", ")
                                    : "Не указан"
                            }
                        </span>
                    </div>
                </div>
            </article>
        `;
    }).join("");
}

async function createReview(animeId, score, text) {
    if (!requireAuth()) return false;

    const userId = getCurrentUserId();

    try {
        const response = await fetch(REVIEWS_API_URL, {
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
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.message || "Не удалось опубликовать отзыв");
        }

        return true;
    } catch (error) {
        alert(error.message);
        return false;
    }
}

function renderSimilarAnime(items) {
    if (!similarAnimeContainer) return;

    if (!items || items.length === 0) {
        similarAnimeContainer.innerHTML = `
            <div class="empty-tab-state">
                <p>Похожие аниме пока не найдены.</p>
            </div>
        `;
        return;
    }

    similarAnimeContainer.innerHTML = items.map(anime => {
        const fallbackPoster = "../images/no-poster.jpg";
        const poster = getPosterUrl(anime.posterUrl || anime.poster_url);
        const title = anime.titleRu || anime.titleOriginal || anime.title || "Без названия";
        const originalTitle = anime.titleOriginal || anime.title_original || "";
        const rating = anime.averageRating ?? anime.average_rating ?? "—";
        const animeId = anime.animeId || anime.anime_id;

        return `
            <a class="similar-anime-card" href="anime.html?id=${animeId}">
                <img
                    src="${poster}"
                    alt="${title}"
                    onerror="this.onerror=null; this.src='${fallbackPoster}';"
                >

                <div>
                    <h3>${title}</h3>
                    <p>${originalTitle}</p>
                    <span>★ ${rating}</span>
                </div>
            </a>
        `;
    }).join("");
}

function setupWriteReviewButton() {
    if (!writeReviewBtn || !currentAnime) return;

    writeReviewBtn.addEventListener("click", () => {
        const user = getCurrentUser();

        if (!user) {
            alert("Сначала войдите в аккаунт");
            window.location.href = "login.html";
            return;
        }

        const existingForm = document.getElementById("reviewForm");

        if (existingForm) {
            existingForm.remove();
            return;
        }

        const form = document.createElement("form");
        form.id = "reviewForm";
        form.className = "review-form";

        form.innerHTML = `
            <div class="review-form-row">
                <label>
                    Оценка
                    <select id="reviewScore" required>
                        <option value="">Выберите оценку</option>
                        <option value="10">10 — отлично</option>
                        <option value="9">9 — очень хорошо</option>
                        <option value="8">8 — хорошо</option>
                        <option value="7">7 — нормально</option>
                        <option value="6">6 — средне</option>
                        <option value="5">5 — спорно</option>
                        <option value="4">4 — слабо</option>
                        <option value="3">3 — плохо</option>
                        <option value="2">2 — очень плохо</option>
                        <option value="1">1 — ужасно</option>
                    </select>
                </label>
            </div>

            <label>
                Текст отзыва
                <textarea id="reviewText" rows="5" placeholder="Напишите своё мнение..." required></textarea>
            </label>

            <div class="review-form-actions">
                <button type="submit" class="primary-btn">Опубликовать</button>
                <button type="button" class="outline-action-btn" id="cancelReviewBtn">Отмена</button>
            </div>
        `;

        const reviewsTab = document.getElementById("reviewsTab");
        const reviewsHeader = reviewsTab?.querySelector(".reviews-header");

        if (reviewsHeader) {
            reviewsHeader.insertAdjacentElement("afterend", form);
        }

        const cancelBtn = document.getElementById("cancelReviewBtn");

        if (cancelBtn) {
            cancelBtn.addEventListener("click", () => {
                form.remove();
            });
        }

        form.addEventListener("submit", async event => {
            event.preventDefault();

            const score = document.getElementById("reviewScore")?.value;
            const text = document.getElementById("reviewText")?.value.trim();

            if (!score || !text) {
                alert("Заполните оценку и текст отзыва");
                return;
            }

            const saved = await createReview(currentAnime.animeId, score, text);

            if (!saved) return;

            form.remove();

            const reviews = await fetchReviewsByAnime(currentAnime.animeId);
            renderReviews(reviews);
        });
    });
}

async function loadCurrentAnimeListStatus(animeId) {
    const userId = getCurrentUserId();

    if (!userId) return;

    try {
        const response = await fetch(`${USERS_API_URL}/${userId}/list`);

        if (!response.ok) return;

        const list = await response.json();

        const currentItem = list.find(item =>
            Number(item.animeId || item.anime_id) === Number(animeId)
        );

        if (!currentItem) return;

        const status = currentItem.status;
        currentListStatus = status;
        currentUserScore = currentItem.score ?? currentItem.personalScore ?? currentItem.personal_score ?? null;

        if (!status) return;

        const dropdownText = document.getElementById("listDropdownText");

        if (dropdownText) {
            dropdownText.textContent = status;
        }

        document.querySelectorAll(".list-dropdown-menu button").forEach(button => {
            button.classList.toggle("active", button.dataset.status === status);

        });

        updateRateButtonState(currentUserScore);
    } catch {

    }
}

async function fetchReviewsByAnime(animeId) {
    try {
        const response = await fetch(`${ANIME_API_URL}/${animeId}/reviews`);

        if (!response.ok) {
            return [];
        }

        return await response.json();
    } catch {
        return [];
    }
}

async function loadAnimePage() {
    const animeId = getAnimeIdFromUrl();

    if (!animeId) {
        if (animeDetails) {
            animeDetails.innerHTML = `<p>Аниме не найдено.</p>`;
        }
        return;
    }

    try {
        currentAnime = await fetchAnimeById(animeId);

        renderAnimeDetails(currentAnime);
        renderDescription(currentAnime);
        renderSimilarAnime(currentAnime.similarAnime || currentAnime.similar_anime);
        renderCharacters(currentAnime.characters);
        renderRating(currentAnime);

        const reviews = await fetchReviewsByAnime(animeId);
        renderReviews(reviews);

        setupWriteReviewButton();
    } catch (error) {
        if (animeDetails) {
            animeDetails.innerHTML = `
                <div class="empty-state glass">
                    <h2>Ошибка</h2>
                    <p>${error.message}</p>
                </div>
            `;
        }

        if (reviewsContainer) {
            reviewsContainer.innerHTML = "";
        }
    }
}

setupAnimeTabs();
loadAnimePage();