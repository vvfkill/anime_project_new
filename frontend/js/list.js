const USERS_API_URL = "https://localhost:7241/api/users";

const userListGrid = document.getElementById("userListGrid");
const listCount = document.getElementById("listCount");
const listUserName = document.getElementById("listUserName");
const listUserSubtext = document.getElementById("listUserSubtext");
const listAvatar = document.getElementById("listAvatar");

const totalCount = document.getElementById("totalCount");
const watchingCount = document.getElementById("watchingCount");
const plannedCount = document.getElementById("plannedCount");
const completedCount = document.getElementById("completedCount");
const droppedCount = document.getElementById("droppedCount");

const applyListFiltersBtn = document.getElementById("applyListFiltersBtn");
const resetListFiltersBtn = document.getElementById("resetListFiltersBtn");
const listYearFromInput = document.getElementById("listYearFromInput");
const listYearToInput = document.getElementById("listYearToInput");

let userList = [];

let currentStatus = "all";
let currentRating = "all";
let currentYearFrom = 1950;
let currentYearTo = 2026;

let currentPage = 1;
const pageSize = 5;
let totalPages = 1;


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

    if (!posterUrl || String(posterUrl).trim() === "") return fallbackPoster;
    if (posterUrl.startsWith("http")) return posterUrl;
    if (posterUrl.startsWith("../")) return posterUrl;
    if (posterUrl.startsWith("/")) return `https://localhost:7241${posterUrl}`;
    if (posterUrl.startsWith("images/")) return `../${posterUrl}`;

    return posterUrl;
}

function getTitle(item) {
    return item.titleRu || item.titleOriginal || item.title || "Без названия";
}

function getAnimeId(item) {
    return item.animeId || item.anime_id;
}

function getGenres(item) {
    if (Array.isArray(item.genres)) return item.genres;

    if (typeof item.genres === "string") {
        return item.genres.split(",").map(genre => genre.trim());
    }

    if (typeof item.genre === "string") return [item.genre];

    return [];
}

function getSelectedValues(name) {
    return [...document.querySelectorAll(`input[name="${name}"]:checked`)]
        .map(input => input.value);
}

function renderUserInfo() {
    const user = getCurrentUser();

    if (!user) return;

    const name = user.nickname || user.email || "Пользователь";

    if (listUserName) listUserName.textContent = name;
    if (listUserSubtext) listUserSubtext.textContent = "Личный трекер просмотра";
    if (listAvatar) listAvatar.textContent = name[0]?.toUpperCase() || "A";
}

async function loadUserList() {
    if (!requireAuth()) return;

    const userId = getCurrentUserId();

    try {
        if (userListGrid) {
            userListGrid.innerHTML = `<p>Загрузка...</p>`;
        }

        const response = await fetch(`${USERS_API_URL}/${userId}/list`);

        if (!response.ok) {
            throw new Error("Не удалось загрузить список");
        }

        userList = await response.json();

        renderUserInfo();
        updateStats();
        applyCurrentView();
    } catch (error) {
        if (userListGrid) {
            userListGrid.innerHTML = `
                <div class="empty-state glass">
                    <h2>Ошибка загрузки</h2>
                    <p>${error.message}</p>
                </div>
            `;
        }

        if (listCount) {
            listCount.textContent = "Ошибка загрузки данных";
        }
    }
}

function updateStats() {
    const total = userList.length;
    const watching = userList.filter(item => item.status === "Смотрю").length;
    const planned = userList.filter(item => item.status === "Запланировано").length;
    const completed = userList.filter(item => item.status === "Просмотрено").length;
    const dropped = userList.filter(item => item.status === "Брошено").length;

    if (totalCount) totalCount.textContent = total;
    if (watchingCount) watchingCount.textContent = watching;
    if (plannedCount) plannedCount.textContent = planned;
    if (completedCount) completedCount.textContent = completed;
    if (droppedCount) droppedCount.textContent = dropped;
}

function getFilteredList() {
    const selectedTypes = getSelectedValues("listType");
    const selectedGenres = getSelectedValues("listGenre");

    return userList.filter(item => {
        const type = String(item.type || "").toLowerCase();
        const genres = getGenres(item).map(genre => genre.toLowerCase());
        const year = Number(item.releaseYear || 0);
        const rating = Number(item.averageRating || 0);

        const statusMatches =
            currentStatus === "all" ||
            item.status === currentStatus;

        const typeMatches =
            selectedTypes.length === 0 ||
            selectedTypes.some(selected => type === selected.toLowerCase());

        const genreMatches =
            selectedGenres.length === 0 ||
            selectedGenres.some(selected => genres.includes(selected.toLowerCase()));

        const yearMatches = year >= currentYearFrom && year <= currentYearTo;

        const ratingMatches =
            currentRating === "all" ||
            rating >= Number(currentRating);

        return statusMatches && typeMatches && genreMatches && yearMatches && ratingMatches;
    });
}

function getCurrentPageItems(list) {
    totalPages = Math.max(1, Math.ceil(list.length / pageSize));

    if (currentPage > totalPages) {
        currentPage = totalPages;
    }

    const start = (currentPage - 1) * pageSize;
    return list.slice(start, start + pageSize);
}

function renderListPagination(listLength) {
    const oldPagination = document.getElementById("listPagination");

    if (oldPagination) {
        oldPagination.remove();
    }

    if (!userListGrid || listLength === 0) return;

    totalPages = Math.max(1, Math.ceil(listLength / pageSize));

    const pagination = document.createElement("div");
    pagination.id = "listPagination";
    pagination.className = "list-pagination";

    pagination.innerHTML = `
        <button type="button" id="prevListPageBtn" class="secondary-btn" ${currentPage <= 1 ? "disabled" : ""}>
            Назад
        </button>

        <span>Страница ${currentPage} из ${totalPages}</span>

        <button type="button" id="nextListPageBtn" class="secondary-btn" ${currentPage >= totalPages ? "disabled" : ""}>
            Вперёд
        </button>
    `;

    userListGrid.insertAdjacentElement("afterend", pagination);

    const prevBtn = document.getElementById("prevListPageBtn");
    const nextBtn = document.getElementById("nextListPageBtn");

    if (prevBtn) {
        prevBtn.addEventListener("click", () => {
            if (currentPage <= 1) return;
            currentPage--;
            applyCurrentView();
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener("click", () => {
            if (currentPage >= totalPages) return;
            currentPage++;
            applyCurrentView();
        });
    }
}

function applyCurrentView() {
    const filtered = getFilteredList();
    renderList(filtered);
}

function renderList(list) {
    if (!userListGrid) return;

    if (!userList || userList.length === 0) {
        if (listCount) listCount.textContent = "В списке пока нет аниме";

        userListGrid.innerHTML = `
            <div class="empty-state glass">
                <h2>Список пуст</h2>
                <p>Откройте страницу аниме и добавьте его в список.</p>
                <a class="primary-btn" href="catalog.html">Перейти в каталог</a>
            </div>
        `;
        return;
    }

    if (!list || list.length === 0) {
        if (listCount) listCount.textContent = "По выбранным фильтрам ничего не найдено";

        userListGrid.innerHTML = `
            <div class="empty-state glass">
                <h2>Ничего не найдено</h2>
                <p>Попробуйте изменить фильтры.</p>
            </div>
        `;

        renderListPagination(0);
        return;
    }

    if (listCount) {
        listCount.textContent = `Найдено: ${list.length}`;
    }

    const pageItems = getCurrentPageItems(list);

    userListGrid.innerHTML = pageItems.map(item => {
        const fallbackPoster = "../images/no-poster.jpg";
        const poster = getPosterUrl(item.posterUrl);
        const title = getTitle(item);
        const animeId = getAnimeId(item);
        const score = item.score ?? item.personalScore ?? item.personal_score ?? null;

        return `
            <article class="tracking-row glass">
                <div class="tracking-anime-main" onclick="openAnime(${animeId})">
                    <img
                        src="${poster}"
                        alt="${title}"
                        onerror="this.onerror=null; this.src='${fallbackPoster}';"
                    >

                    <div class="tracking-anime-text">
                        <h3>${title}</h3>
                        <p>${item.titleOriginal || ""}</p>

                        <div class="tracking-meta">
                            <span>${item.releaseYear || "—"}</span>
                            <span>•</span>
                            <span>${item.type || "—"}</span>
                            <span>•</span>
                            <span>${item.episodesTotal || "—"} серий</span>
                        </div>
                    </div>
                </div>

                <div class="tracking-row-status">
                    <span class="status-badge ${getStatusClass(item.status)}">
                        ${item.status || "—"}
                    </span>

                    <select class="tracking-status-select" onchange="changeStatus(${animeId}, this.value)">
                        ${renderStatusOptions(item.status)}
                    </select>
                </div>

                <div class="tracking-row-info">
                    <span>Рейтинг</span>
                    <strong>★ ${item.averageRating ?? "—"}</strong>
                </div>

                <div class="tracking-row-info">
                    <span>Моя оценка</span>
                    <strong>${score ? `★ ${score}/10` : "—"}</strong>
                </div>

                <div class="tracking-row-actions">
                    <button type="button" class="remove-list-btn" onclick="removeFromList(${animeId})">
                        Удалить
                    </button>
                </div>
            </article>
        `;
    }).join("");

    renderListPagination(list.length);
}

function renderStatusOptions(current) {
    const statuses = [
        "Смотрю",
        "Запланировано",
        "Просмотрено",
        "Брошено",
        "Отложено",
        "Пересматриваю"
    ];

    return statuses.map(status => `
        <option value="${status}" ${status === current ? "selected" : ""}>
            ${status}
        </option>
    `).join("");
}

function getStatusClass(status) {
    if (status === "Смотрю") return "status-watching";
    if (status === "Запланировано") return "status-planned";
    if (status === "Просмотрено") return "status-completed";
    if (status === "Брошено") return "status-dropped";
    if (status === "Отложено") return "status-paused";
    if (status === "Пересматриваю") return "status-rewatching";

    return "";
}

function openAnime(animeId) {
    window.location.href = `anime.html?id=${animeId}`;
}

async function changeStatus(animeId, status) {
    if (!requireAuth()) return;

    const userId = getCurrentUserId();

    try {
        const currentItem = userList.find(item =>
            Number(getAnimeId(item)) === Number(animeId)
        );

        const score =
            currentItem?.score ??
            currentItem?.personalScore ??
            currentItem?.personal_score ??
            null;

        const response = await fetch(`${USERS_API_URL}/${userId}/list/${animeId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                status,
                score
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.message || "Не удалось изменить статус");
        }

        if (currentItem) {
            currentItem.status = status;
        }

        updateStats();
        applyCurrentView();
    } catch (error) {
        alert(error.message);
        await loadUserList();
    }
}

async function removeFromList(animeId) {
    if (!requireAuth()) return;

    const userId = getCurrentUserId();

    if (!confirm("Удалить аниме из списка?")) return;

    try {
        const response = await fetch(`${USERS_API_URL}/${userId}/list/${animeId}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.message || "Не удалось удалить аниме из списка");
        }

        userList = userList.filter(item =>
            Number(getAnimeId(item)) !== Number(animeId)
        );

        updateStats();
        applyCurrentView();
    } catch (error) {
        alert(error.message);
    }
}

function setupListPage() {
    document.querySelectorAll(".tracking-tab").forEach(button => {
        button.addEventListener("click", () => {
            document.querySelectorAll(".tracking-tab").forEach(item => {
                item.classList.remove("active");
            });

            button.classList.add("active");
            currentStatus = button.dataset.status;
            currentPage = 1;
            applyCurrentView();
        });
    });

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

    if (applyListFiltersBtn) {
        applyListFiltersBtn.addEventListener("click", () => {
            currentYearFrom = Number(listYearFromInput?.value || 1950);
            currentYearTo = Number(listYearToInput?.value || 2026);

            if (currentYearFrom > currentYearTo) {
                const temp = currentYearFrom;
                currentYearFrom = currentYearTo;
                currentYearTo = temp;

                if (listYearFromInput) listYearFromInput.value = String(currentYearFrom);
                if (listYearToInput) listYearToInput.value = String(currentYearTo);
            }

            currentPage = 1;
            applyCurrentView();
        });
    }

    if (resetListFiltersBtn) {
        resetListFiltersBtn.addEventListener("click", () => {
            currentStatus = "all";
            currentRating = "all";
            currentYearFrom = 1950;
            currentYearTo = 2026;

            if (listYearFromInput) listYearFromInput.value = "1950";
            if (listYearToInput) listYearToInput.value = "2026";

            document.querySelectorAll(".filter-chip").forEach(item => {
                item.classList.remove("active");
            });

            document.querySelectorAll(".tracking-tab").forEach(item => {
                item.classList.toggle("active", item.dataset.status === "all");
            });

            document.querySelectorAll('input[name="listType"]').forEach(input => {
                input.checked = input.value === "TV Сериал";
            });

            document.querySelectorAll('input[name="listGenre"]').forEach(input => {
                input.checked = false;
            });

            applyCurrentView();
        });
    }
}

setupListPage();
loadUserList();