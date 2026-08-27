const REVIEWS_API_URL = "https://localhost:7241/api/reviews";

const reviewsList = document.getElementById("reviewsList");
const reviewsCount = document.getElementById("reviewsCount");
const reviewsSortSelect = document.getElementById("reviewsSortSelect");
const applyReviewFiltersBtn = document.getElementById("applyReviewFiltersBtn");
const resetReviewFiltersBtn = document.getElementById("resetReviewFiltersBtn");
const reviewYearFromInput = document.getElementById("reviewYearFromInput");
const reviewYearToInput = document.getElementById("reviewYearToInput");

let reviews = [];

let currentRating = "all";
let currentSort = "date";
let currentYearFrom = 1950;
let currentYearTo = 2026;

let currentPage = 1;
const pageSize = 5;
let totalPages = 1;

function getPosterUrl(posterUrl) {
    const fallbackPoster = "../images/no-poster.jpg";

    if (!posterUrl || String(posterUrl).trim() === "") return fallbackPoster;
    if (posterUrl.startsWith("http")) return posterUrl;
    if (posterUrl.startsWith("../")) return posterUrl;
    if (posterUrl.startsWith("/")) return `https://localhost:7241${posterUrl}`;
    if (posterUrl.startsWith("images/")) return `../${posterUrl}`;

    return posterUrl;
}

function getSelectedValues(name) {
    return [...document.querySelectorAll(`input[name="${name}"]:checked`)]
        .map(input => input.value);
}

function getReviewAnimeTitle(review) {
    return (
        review.animeTitleRu ||
        review.animeTitle ||
        review.titleRu ||
        review.title ||
        review.titleOriginal ||
        "Без названия"
    );
}

function getReviewAnimeOriginalTitle(review) {
    return review.animeTitleOriginal || review.titleOriginal || "";
}

function getReviewAnimeId(review) {
    return review.animeId || review.anime_id;
}

function getReviewScore(review) {
    return Number(review.score ?? review.rating ?? 0);
}

function getReviewText(review) {
    return review.text || review.comment || review.content || "Текст отзыва отсутствует.";
}

function getReviewAuthor(review) {
    return review.userNickname || review.nickname || review.userName || "Пользователь";
}

function getReviewGenres(review) {
    const rawGenres = review.genres || review.Genres || review.genre || review.Genre;

    if (Array.isArray(rawGenres)) {
        return rawGenres.map(genre => {
            if (typeof genre === "string") return genre;
            return genre.name || genre.Name || genre.genreName || "";
        }).filter(Boolean);
    }

    if (typeof rawGenres === "string") {
        return rawGenres.split(",").map(genre => genre.trim()).filter(Boolean);
    }

    return [];
}

function getReviewDate(review) {
    const rawDate = review.createdAt || review.created_at || review.date;

    if (!rawDate) return "—";

    return new Date(rawDate).toLocaleDateString("ru-RU");
}

async function loadReviews() {
    try {
        if (reviewsList) {
            reviewsList.innerHTML = `<p>Загрузка отзывов...</p>`;
        }

        const response = await fetch(REVIEWS_API_URL);

        if (!response.ok) {
            throw new Error("Не удалось загрузить отзывы");
        }

        reviews = await response.json();

        applyReviewsView(true);
    } catch (error) {
        if (reviewsList) {
            reviewsList.innerHTML = `
                <div class="empty-state glass">
                    <h2>Ошибка загрузки</h2>
                    <p>${error.message}</p>
                </div>
            `;
        }

        if (reviewsCount) {
            reviewsCount.textContent = "Ошибка загрузки данных";
        }
    }
}

function getFilteredReviews() {
    const selectedTypes = getSelectedValues("reviewType");
    const selectedGenres = getSelectedValues("reviewGenre");

    return reviews.filter(review => {
        const type = String(review.type || review.animeType || "").toLowerCase();
        const genres = getReviewGenres(review).map(genre => genre.toLowerCase());
        const year = Number(review.releaseYear || review.animeReleaseYear || 0);
        const score = getReviewScore(review);

        const typeMatches =
            selectedTypes.length === 0 ||
            selectedTypes.some(selected => type === selected.toLowerCase());

        const genreMatches =
            selectedGenres.length === 0 ||
            selectedGenres.some(selected => genres.includes(selected.toLowerCase()));

        const yearMatches = year >= currentYearFrom && year <= currentYearTo;

        const ratingMatches =
            currentRating === "all" ||
            score >= Number(currentRating);

        return typeMatches && genreMatches && yearMatches && ratingMatches;
    });
}

function getSortedReviews(list) {
    const sorted = [...list];

    if (currentSort === "date") {
        sorted.sort((a, b) => {
            const dateA = new Date(a.createdAt || a.created_at || a.date || 0);
            const dateB = new Date(b.createdAt || b.created_at || b.date || 0);

            return dateB - dateA;
        });
    }

    if (currentSort === "score") {
        sorted.sort((a, b) => getReviewScore(b) - getReviewScore(a));
    }

    if (currentSort === "title") {
        sorted.sort((a, b) => {
            return getReviewAnimeTitle(a).localeCompare(getReviewAnimeTitle(b), "ru");
        });
    }

    return sorted;
}

function getCurrentPageItems(list) {
    totalPages = Math.max(1, Math.ceil(list.length / pageSize));

    if (currentPage > totalPages) {
        currentPage = totalPages;
    }

    const start = (currentPage - 1) * pageSize;
    return list.slice(start, start + pageSize);
}

function renderReviewsPagination(listLength) {
    const oldPagination = document.getElementById("reviewsPagination");

    if (oldPagination) {
        oldPagination.remove();
    }

    if (!reviewsList || listLength === 0) return;

    totalPages = Math.max(1, Math.ceil(listLength / pageSize));

    const pagination = document.createElement("div");
    pagination.id = "reviewsPagination";
    pagination.className = "reviews-pagination";

    pagination.innerHTML = `
        <button type="button" id="prevReviewsPageBtn" class="secondary-btn" ${currentPage <= 1 ? "disabled" : ""}>
            Назад
        </button>

        <span>Страница ${currentPage} из ${totalPages}</span>

        <button type="button" id="nextReviewsPageBtn" class="secondary-btn" ${currentPage >= totalPages ? "disabled" : ""}>
            Вперёд
        </button>
    `;

    reviewsList.insertAdjacentElement("afterend", pagination);

    const prevBtn = document.getElementById("prevReviewsPageBtn");
    const nextBtn = document.getElementById("nextReviewsPageBtn");

    if (prevBtn) {
        prevBtn.addEventListener("click", () => {
            if (currentPage <= 1) return;
            currentPage--;
            applyReviewsView(false);
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener("click", () => {
            if (currentPage >= totalPages) return;
            currentPage++;
            applyReviewsView(false);
        });
    }
}

function applyReviewsView(resetPage = false) {
    if (resetPage) {
        currentPage = 1;
    }

    const filtered = getFilteredReviews();
    const sorted = getSortedReviews(filtered);

    renderReviews(sorted);
}

function renderReviews(list) {
    if (!reviewsList) return;

    if (!reviews || reviews.length === 0) {
        if (reviewsCount) {
            reviewsCount.textContent = "Отзывов пока нет";
        }

        reviewsList.innerHTML = `
            <div class="empty-state glass">
                <h2>Отзывов пока нет</h2>
                <p>Откройте страницу аниме и оставьте первый отзыв.</p>
                <a class="primary-btn" href="catalog.html">Перейти в каталог</a>
            </div>
        `;

        renderReviewsPagination(0);
        return;
    }

    if (!list || list.length === 0) {
        if (reviewsCount) {
            reviewsCount.textContent = "По выбранным фильтрам ничего не найдено";
        }

        reviewsList.innerHTML = `
            <div class="empty-state glass">
                <h2>Ничего не найдено</h2>
                <p>Попробуйте изменить фильтры.</p>
            </div>
        `;

        renderReviewsPagination(0);
        return;
    }

    if (reviewsCount) {
        reviewsCount.textContent = `Найдено: ${list.length}`;
    }

    const pageItems = getCurrentPageItems(list);

    reviewsList.innerHTML = pageItems.map(review => {
        const fallbackPoster = "../images/no-poster.jpg";
        const poster = getPosterUrl(review.posterUrl || review.animePosterUrl || review.poster_url);
        const title = getReviewAnimeTitle(review);
        const originalTitle = getReviewAnimeOriginalTitle(review);
        const animeId = getReviewAnimeId(review);
        const score = getReviewScore(review) || "—";
        const author = getReviewAuthor(review);
        const date = getReviewDate(review);
        const text = getReviewText(review);
        const year = review.releaseYear || review.animeReleaseYear || "—";
        const type = review.type || review.animeType || "—";

        return `
            <article class="review-feed-card glass" onclick="openAnime(${animeId})">
                <img
                    src="${poster}"
                    alt="${title}"
                    onerror="this.onerror=null; this.src='${fallbackPoster}';"
                >

                <div class="review-feed-body">
                    <div class="review-feed-top">
                        <div>
                            <h3>${title}</h3>
                            <p>${originalTitle}</p>
                        </div>

                        <div class="review-feed-score">
                            ★ ${score}
                        </div>
                    </div>

                    <div class="review-feed-meta">
                        <span>${author}</span>
                        <span>•</span>
                        <span>${date}</span>
                        <span>•</span>
                        <span>${year}</span>
                        <span>•</span>
                        <span>${type}</span>
                    </div>

                    <p class="review-feed-text">
                        ${text}
                    </p>
                </div>
            </article>
        `;
    }).join("");

    renderReviewsPagination(list.length);
}

function openAnime(animeId) {
    if (!animeId) return;
    window.location.href = `anime.html?id=${animeId}`;
}

function setupReviewFilters() {
    document.querySelectorAll(".filter-chip").forEach(button => {
        button.addEventListener("click", () => {
            const isActive = button.classList.contains("active");

            document.querySelectorAll(".filter-chip").forEach(item => {
                item.classList.remove("active");
            });

            if (isActive) {
                currentRating = "all";
                return;
            }

            button.classList.add("active");
            currentRating = button.dataset.rating;
        });
    });

    if (reviewsSortSelect) {
        reviewsSortSelect.addEventListener("change", () => {
            currentSort = reviewsSortSelect.value;
            applyReviewsView(true);
        });
    }

    if (applyReviewFiltersBtn) {
        applyReviewFiltersBtn.addEventListener("click", () => {
            currentYearFrom = Number(reviewYearFromInput?.value || 1950);
            currentYearTo = Number(reviewYearToInput?.value || 2026);

            if (currentYearFrom > currentYearTo) {
                const temp = currentYearFrom;
                currentYearFrom = currentYearTo;
                currentYearTo = temp;

                if (reviewYearFromInput) reviewYearFromInput.value = String(currentYearFrom);
                if (reviewYearToInput) reviewYearToInput.value = String(currentYearTo);
            }

            applyReviewsView(true);
        });
    }

    if (resetReviewFiltersBtn) {
        resetReviewFiltersBtn.addEventListener("click", () => {
            currentRating = "all";
            currentSort = "date";
            currentYearFrom = 1950;
            currentYearTo = 2026;

            if (reviewYearFromInput) reviewYearFromInput.value = "1950";
            if (reviewYearToInput) reviewYearToInput.value = "2026";
            if (reviewsSortSelect) reviewsSortSelect.value = "date";

            document.querySelectorAll('input[name="reviewType"]').forEach(input => {
                input.checked = input.value === "TV Сериал";
            });

            document.querySelectorAll('input[name="reviewGenre"]').forEach(input => {
                input.checked = false;
            });

            document.querySelectorAll(".filter-chip").forEach(item => {
                item.classList.remove("active");
            });

            applyReviewsView(true);
        });
    }
}

setupReviewFilters();
loadReviews();