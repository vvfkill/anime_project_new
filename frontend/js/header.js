const HEADER_ANIME_API_URL = "https://localhost:7241/api/anime";

function getHeaderCurrentUser() {
    try {
        const user = localStorage.getItem("authUser");
        return user ? JSON.parse(user) : null;
    } catch {
        return null;
    }
}

function getActivePage() {
    const page = window.location.pathname.split("/").pop();

    if (!page || page === "index.html") {
        return "index.html";
    }

    return page;
}

function renderSiteHeader() {
    const headerRoot = document.getElementById("siteHeader");

    if (!headerRoot) return;

    const activePage = getActivePage();

    headerRoot.innerHTML = `
        <header class="header glass">
            <a href="index.html" class="logo">Anime<span>Track</span></a>

            <nav class="nav">
                <a href="index.html" class="${activePage === "index.html" ? "active" : ""}">Главная</a>
                <a href="catalog.html" class="${activePage === "catalog.html" ? "active" : ""}">Каталог</a>
                <a href="list.html" class="${activePage === "list.html" ? "active" : ""}">Список</a>
                <a href="bookmarks.html" class="${activePage === "bookmarks.html" ? "active" : ""}">Закладки</a>
                <a href="reviews.html" class="${activePage === "reviews.html" ? "active" : ""}">Отзывы</a>
            </nav>

            <div class="header-search-wrap">
                <form class="header-search" id="headerSearchForm">
                    <input id="headerSearchInput" type="text" placeholder="Поиск аниме...">
                    <button type="submit">⌕</button>
                </form>

                <div id="headerSearchResults" class="header-search-results"></div>
            </div>

            <a href="profile.html" class="profile-btn glass" id="profileLink">
                <span class="profile-icon">◉</span>
                <span>Профиль</span>
            </a>
        </header>
    `;
}

function getHeaderPosterUrl(posterUrl) {
    const fallbackPoster = "../images/no-poster.jpg";

    if (!posterUrl || String(posterUrl).trim() === "") {
        return fallbackPoster;
    }

    if (posterUrl.startsWith("http")) {
        return posterUrl;
    }

    if (posterUrl.startsWith("../")) {
        return posterUrl;
    }

    if (posterUrl.startsWith("/")) {
        return `https://localhost:7241${posterUrl}`;
    }

    if (posterUrl.startsWith("images/")) {
        return `../${posterUrl}`;
    }

    return posterUrl;
}

function getHeaderAnimeTitle(anime) {
    return anime.titleRu || anime.titleOriginal || anime.title || "Без названия";
}

function getHeaderItemsFromResponse(data) {
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.items)) return data.items;
    if (data && Array.isArray(data.data)) return data.data;
    if (data && Array.isArray(data.result)) return data.result;

    return [];
}

async function searchHeaderAnime(query) {
    const params = new URLSearchParams();

    params.set("search", query);
    params.set("page", "1");
    params.set("pageSize", "5");

    const response = await fetch(`${HEADER_ANIME_API_URL}?${params.toString()}`);

    if (!response.ok) {
        throw new Error("Не удалось выполнить поиск");
    }

    const data = await response.json();
    return getHeaderItemsFromResponse(data);
}

function renderHeaderSearchResults(items, query) {
    const results = document.getElementById("headerSearchResults");

    if (!results) return;

    if (!items || items.length === 0) {
        results.classList.add("active");
        results.innerHTML = `
            <p class="header-search-empty">По запросу «${query}» ничего не найдено</p>
        `;
        return;
    }

    results.classList.add("active");
    results.innerHTML = `
        ${items.map(anime => {
            const animeId = anime.animeId || anime.id;
            const title = getHeaderAnimeTitle(anime);
            const poster = getHeaderPosterUrl(anime.posterUrl);

            return `
                <a class="header-search-item" href="anime.html?id=${animeId}">
                    <img
                        src="${poster}"
                        alt="${title}"
                        onerror="this.onerror=null; this.src='../images/no-poster.jpg';"
                    >

                    <div>
                        <h4>${title}</h4>
                        <p>${anime.titleOriginal || ""}</p>
                    </div>

                    <span>★ ${anime.averageRating ?? "—"}</span>
                </a>
            `;
        }).join("")}

        <a class="header-search-all" href="catalog.html?search=${encodeURIComponent(query)}">
            Смотреть все результаты
        </a>
    `;
}

function closeHeaderSearchResults() {
    const results = document.getElementById("headerSearchResults");

    if (!results) return;

    results.classList.remove("active");
    results.innerHTML = "";
}

function setupHeaderSearch() {
    const form = document.getElementById("headerSearchForm");
    const input = document.getElementById("headerSearchInput");
    const results = document.getElementById("headerSearchResults");
    const searchWrap = document.querySelector(".header-search-wrap");

    if (!form || !input || !results) return;

    form.addEventListener("submit", async event => {
        event.preventDefault();

        const query = input.value.trim();

        if (!query) {
            closeHeaderSearchResults();
            return;
        }

        results.classList.add("active");
        results.innerHTML = `<p class="header-search-empty">Поиск...</p>`;

        try {
            const items = await searchHeaderAnime(query);
            renderHeaderSearchResults(items, query);
        } catch (error) {
            results.classList.add("active");
            results.innerHTML = `<p class="header-search-empty">${error.message}</p>`;
        }
    });

    input.addEventListener("input", () => {
        if (!input.value.trim()) {
            closeHeaderSearchResults();
        }
    });

    document.addEventListener("click", event => {
        if (!searchWrap) return;

        if (!searchWrap.contains(event.target)) {
            closeHeaderSearchResults();
        }
    });
}

function setupHeaderProfile() {
    const profileLink = document.getElementById("profileLink");

    if (!profileLink) return;

    profileLink.addEventListener("click", event => {
        const user = getHeaderCurrentUser();

        if (!user) {
            event.preventDefault();
            window.location.href = "login.html";
        }
    });
}

renderSiteHeader();
setupHeaderSearch();
setupHeaderProfile();