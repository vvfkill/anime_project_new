const USERS_URL =
    "http://127.0.0.1:8000/api/users";


document.addEventListener(
    "DOMContentLoaded",
    () => {

        setupPasswordToggles();

        setupLoginForm();

        setupRegisterForm();

    }
);


/* =========================
   ПОКАЗ / СКРЫТИЕ ПАРОЛЯ
========================= */

function setupPasswordToggles() {

    const passwordButtons =
        document.querySelectorAll(
            ".password-toggle"
        );


    passwordButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    const input =
                        button.parentElement
                            .querySelector(
                                "input"
                            );


                    if (
                        input.type ===
                        "password"
                    ) {

                        input.type =
                            "text";

                    } else {

                        input.type =
                            "password";

                    }

                }
            );

        }
    );

}


/* =========================
   ВХОД
========================= */

function setupLoginForm() {

    const loginForm =
        document.getElementById(
            "loginForm"
        );


    if (!loginForm) {

        return;

    }


    loginForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            const formData =
                new FormData(
                    loginForm
                );


            const email =
                String(
                    formData.get("email")
                    || ""
                ).trim();


            const password =
                String(
                    formData.get("password")
                    || ""
                );


            if (
                !email ||
                !password
            ) {

                alert(
                    "Введите email и пароль"
                );

                return;

            }


            try {

                const response =
                    await fetch(
                        `${USERS_URL}/login`,
                        {

                            method:
                                "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify(
                                    {
                                        email,
                                        password
                                    }
                                )

                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        data.detail ||
                        "Не удалось войти"
                    );

                }


                /* Сохраняем пользователя */

                localStorage.setItem(
                    "authUser",
                    JSON.stringify(
                        data
                    )
                );


                alert(
                    "Вход выполнен успешно"
                );


                window.location.href =
                    "index.html";


            } catch (error) {

                alert(
                    error.message
                );

            }

        }
    );

}


/* =========================
   РЕГИСТРАЦИЯ
========================= */

function setupRegisterForm() {

    const registerForm =
        document.getElementById(
            "registerForm"
        );


    if (!registerForm) {

        return;

    }


    registerForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            const formData =
                new FormData(
                    registerForm
                );


            const nickname =
                String(
                    formData.get("nickname")
                    || ""
                ).trim();


            const email =
                String(
                    formData.get("email")
                    || ""
                ).trim();


            const phone =
                String(
                    formData.get("phone")
                    || ""
                ).trim();


            const password =
                String(
                    formData.get("password")
                    || ""
                );


            if (
                !nickname ||
                !email ||
                !phone ||
                !password
            ) {

                alert(
                    "Заполните все поля"
                );

                return;

            }


            try {

                const response =
                    await fetch(
                        USERS_URL,
                        {

                            method:
                                "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify(
                                    {
                                        nickname,
                                        email,
                                        phone,
                                        password
                                    }
                                )

                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        data.detail ||
                        "Не удалось зарегистрироваться"
                    );

                }


                alert(
                    "Регистрация выполнена успешно"
                );


                window.location.href =
                    "login.html";


            } catch (error) {

                alert(
                    error.message
                );

            }

        }
    );

}