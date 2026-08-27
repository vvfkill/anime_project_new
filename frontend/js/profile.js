const PROFILE_USERS_URL = "https://localhost:7241/api/users";
const PROFILE_USER_LIST_URL = "https://localhost:7241/api/users";
const PROFILE_BOOKMARKS_URL = "https://localhost:7241/api/bookmarks";
const PROFILE_REVIEWS_URL = "https://localhost:7241/api/reviews";

const profileAvatar = document.getElementById("profileAvatar");
const profileName = document.getElementById("profileName");
const profileEmail = document.getElementById("profileEmail");
const profileDate = document.getElementById("profileDate");
const logoutBtn = document.getElementById("logoutBtn");

const totalListCount = document.getElementById("totalListCount");
const watchingCount = document.getElementById("watchingCount");
const plannedCount = document.getElementById("plannedCount");
const bookmarksCount = document.getElementById("bookmarksCount");
const averageScore = document.getElementById("averageScore");
const reviewsCount = document.getElementById("reviewsCount");

const watchingList = document.getElementById("watchingList");
const profileReviews = document.getElementById("profileReviews");
const profileBookmarks = document.getElementById("profileBookmarks");

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

function getReviewTitle(item) {
    return (
        item.animeTitleRu ||
        item.animeTitleOriginal ||
        item.titleRu ||
        item.titleOriginal ||
        item.title ||
        "Без названия"
    );
}

function getTitle(item) {
    return item.titleRu || item.titleOriginal || item.title || "Без названия";
}

async function safeFetchJson(url, fallback = []) {
    try {
        const response = await fetch(url);

        if (!response.ok) return fallback;

        return await response.json();
    } catch {
        return fallback;
    }
}

function renderProfileUser() {
    const user = getCurrentUser();

    if (!user) return;

    const name = user.nickname || user.email || "Пользователь";
    const email = user.email || "@email";

    if (profileAvatar) profileAvatar.textContent = name[0]?.toUpperCase() || "A";
    if (profileName) profileName.textContent = name;
    if (profileEmail) profileEmail.textContent = email;

    if (profileDate) {
        const createdAt = user.createdAt || user.created_at || user.registrationDate;
        profileDate.textContent = createdAt
            ? `Дата регистрации: ${new Date(createdAt).toLocaleDateString("ru-RU")}`
            : "Дата регистрации: —";
    }
}

function renderStats(list, bookmarks, reviews) {
    const watching = list.filter(item => item.status === "Смотрю").length;
    const planned = list.filter(item => item.status === "Запланировано").length;

    const personalScores = list
        .map(item => Number(item.score || item.personalScore || item.personal_score || 0))
        .filter(score => score > 0);

    const avg = personalScores.length
        ? (personalScores.reduce((sum, score) => sum + score, 0) / personalScores.length).toFixed(1)
        : "—";

    if (totalListCount) totalListCount.textContent = list.length;
    if (watchingCount) watchingCount.textContent = watching;
    if (plannedCount) plannedCount.textContent = planned;
    if (bookmarksCount) bookmarksCount.textContent = bookmarks.length;
    if (averageScore) averageScore.textContent = avg;
    if (reviewsCount) reviewsCount.textContent = reviews.length;
}

function renderWatchingList(list) {
    if (!watchingList) return;

    const items = list
        .filter(item => item.status === "Смотрю")
        .slice(0, 4);

    if (items.length === 0) {
        watchingList.innerHTML = `<p>Сейчас ничего не смотрите.</p>`;
        return;
    }

    watchingList.innerHTML = items.map(item => {
        const fallbackPoster = "../images/no-poster.jpg";
        const poster = getPosterUrl(item.posterUrl);
        const title = getTitle(item);

        return `
            <article class="profile-mini-item" onclick="openAnime(${item.animeId})">
                <img
                    src="${poster}"
                    alt="${title}"
                    onerror="this.onerror=null; this.src='${fallbackPoster}';"
                >

                <div>
                    <h3>${title}</h3>
                    <p>${item.titleOriginal || ""}</p>
                    <div class="profile-progress-line">
                        <span></span>
                    </div>
                </div>
            </article>
        `;
    }).join("");
}

function renderProfileReviews(reviews) {
    if (!profileReviews) return;

    const items = reviews.slice(0, 4);

    if (items.length === 0) {
        profileReviews.innerHTML = `<p>Отзывов пока нет.</p>`;
        return;
    }

    profileReviews.innerHTML = items.map(item => {
        const title = getReviewTitle(item);
        const score = item.score ?? item.rating ?? "—";
        const text = item.text || item.comment || "Текст отзыва отсутствует.";

        return `
            <article class="profile-review-item" onclick="openAnime(${item.animeId})">
                <div>
                    <h3>${title} <span>★ ${score}</span></h3>
                    <p>${text}</p>
                </div>

                <span>${formatDate(item.createdAt)}</span>
            </article>
        `;
    }).join("");
}

function renderProfileBookmarks(bookmarks) {
    if (!profileBookmarks) return;

    const items = bookmarks.slice(0, 6);

    if (items.length === 0) {
        profileBookmarks.innerHTML = `<p>Закладок пока нет.</p>`;
        return;
    }

    profileBookmarks.innerHTML = items.map(item => {
        const fallbackPoster = "../images/no-poster.jpg";
        const poster = getPosterUrl(item.posterUrl);
        const title = getTitle(item);

        return `
            <article class="profile-bookmark-item" onclick="openAnime(${item.animeId})">
                <img
                    src="${poster}"
                    alt="${title}"
                    onerror="this.onerror=null; this.src='${fallbackPoster}';"
                >

                <span>${title}</span>
            </article>
        `;
    }).join("");
}

function formatDate(value) {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "—";

    return date.toLocaleDateString("ru-RU");
}

function openAnime(animeId) {
    if (!animeId) return;
    window.location.href = `anime.html?id=${animeId}`;
}

async function loadProfile() {
    if (!requireAuth()) return;

    const userId = getCurrentUserId();

    renderProfileUser();

    const list = await safeFetchJson(`${PROFILE_USER_LIST_URL}/${userId}/list`);
    const bookmarks = await safeFetchJson(`${PROFILE_BOOKMARKS_URL}/user/${userId}`);
    const allReviews = await safeFetchJson(PROFILE_REVIEWS_URL);
    const reviews = allReviews.filter(review =>
        Number(review.userId || review.user_id) === Number(userId)
    );

    renderStats(list, bookmarks, reviews);
    renderWatchingList(list);
    renderProfileReviews(reviews);
    renderProfileBookmarks(bookmarks);
}

function setupLogout() {
    if (!logoutBtn) return;

    logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("authUser");
        window.location.href = "login.html";
    });
}

setupLogout();
loadProfile();