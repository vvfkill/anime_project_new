const USERS_URL = "https://localhost:7241/api/users";

const tabLogin = document.getElementById("tabLogin");
const tabRegister = document.getElementById("tabRegister");

const authTitle = document.getElementById("authTitle");
const authSubtitle = document.getElementById("authSubtitle");
const authMessage = document.getElementById("authMessage");

const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");

const loginTogglePassword = document.getElementById("loginTogglePassword");
const registerTogglePassword = document.getElementById("registerTogglePassword");

const loginPassword = document.getElementById("loginPassword");
const registerPassword = document.getElementById("registerPassword");

function showMessage(text, type = "error") {
    if (!authMessage) return;

    authMessage.textContent = text;
    authMessage.className = `auth-message ${type}`;
    authMessage.style.display = "block";
}

function hideMessage() {
    if (!authMessage) return;

    authMessage.textContent = "";
    authMessage.className = "auth-message";
    authMessage.style.display = "none";
}

function showLoginTab() {
    hideMessage();

    tabLogin?.classList.add("active");
    tabRegister?.classList.remove("active");

    loginForm?.classList.remove("hidden");
    registerForm?.classList.add("hidden");

    if (authTitle) authTitle.textContent = "Вход в аккаунт";
    if (authSubtitle) {
        authSubtitle.textContent = "Добро пожаловать обратно. Продолжите отслеживать любимое аниме.";
    }
}

function showRegisterTab() {
    hideMessage();

    tabRegister?.classList.add("active");
    tabLogin?.classList.remove("active");

    registerForm?.classList.remove("hidden");
    loginForm?.classList.add("hidden");

    if (authTitle) authTitle.textContent = "Создание аккаунта";
    if (authSubtitle) {
        authSubtitle.textContent = "Создайте профиль, чтобы сохранять аниме, отзывы и закладки.";
    }
}

async function loginUser(email, password) {
    const response = await fetch(`${USERS_URL}/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email,
            password
        })
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
        throw new Error(data?.message || "Не удалось войти в аккаунт");
    }

    return data;
}

async function registerUser(payload) {
    const response = await fetch(USERS_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
        throw new Error(data?.message || "Не удалось зарегистрироваться");
    }

    return data;
}

function normalizeUserResponse(data, fallback = {}) {
    if (!data) return fallback;

    if (data.user) {
        return data.user;
    }

    return data;
}

function setupTabs() {
    tabLogin?.addEventListener("click", showLoginTab);
    tabRegister?.addEventListener("click", showRegisterTab);
}

function setupPasswordToggles() {
    if (loginTogglePassword && loginPassword) {
        loginTogglePassword.addEventListener("click", () => {
            loginPassword.type = loginPassword.type === "password" ? "text" : "password";
        });
    }

    if (registerTogglePassword && registerPassword) {
        registerTogglePassword.addEventListener("click", () => {
            registerPassword.type = registerPassword.type === "password" ? "text" : "password";
        });
    }
}

function setupLoginForm() {
    if (!loginForm) return;

    loginForm.addEventListener("submit", async event => {
        event.preventDefault();
        hideMessage();

        const formData = new FormData(loginForm);

        const email = String(formData.get("email") || "").trim();
        const password = String(formData.get("password") || "");

        if (!email || !password) {
            showMessage("Введите email и пароль");
            return;
        }

        try {
            const data = await loginUser(email, password);
            const user = normalizeUserResponse(data, { email });

            localStorage.setItem("authUser", JSON.stringify(user));

            showMessage("Вход выполнен успешно", "success");

            setTimeout(() => {
                window.location.href = "index.html";
            }, 500);
        } catch (error) {
            showMessage(error.message);
        }
    });
}

function setupRegisterForm() {
    if (!registerForm) return;

    registerForm.addEventListener("submit", async event => {
        event.preventDefault();
        hideMessage();

        const formData = new FormData(registerForm);

        const nickname = String(formData.get("nickname") || "").trim();
        const email = String(formData.get("email") || "").trim();
        const phone = String(formData.get("phone") || "").trim();
        const password = String(formData.get("password") || "");

        if (!nickname || !email || !phone || !password) {
            showMessage("Заполните все поля");
            return;
        }

        try {
            await registerUser({
                nickname,
                email,
                phone,
                password
            });

            showMessage("Регистрация успешна. Теперь войдите в аккаунт.", "success");
            registerForm.reset();

            setTimeout(showLoginTab, 700);
        } catch (error) {
            showMessage(error.message);
        }
    });
}

setupTabs();
setupPasswordToggles();
setupLoginForm();
setupRegisterForm();