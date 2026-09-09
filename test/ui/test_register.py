from playwright.sync_api import sync_playwright
from playwright.sync_api import expect

def handle_dialog(dialog):
    message = dialog.message
    assert message == "Регистрация выполнена успешно"
    dialog.accept()

def test_register():
    with sync_playwright() as p:

        browser = p.chromium.launch(headless=False, slow_mo=1000)
        page = browser.new_page()
        page.on("dialog", handle_dialog)

        page.goto("http://127.0.0.1:8000/pages/register.html")
        page.locator('input[name="nickname"]').fill("VVFKILLL")
        page.locator('input[name="email"]').fill("vkostptskay1aaaaaa@mail.ru")
        page.locator('input[name="phone"]').fill("8910513072")
        page.locator('input[name="password"]').fill("VVFKILL2005)))")
        page.locator('button[class="auth-submit-button"]').click()

        expect(page).to_have_url("http://127.0.0.1:8000/pages/login.html")
        expect(page.locator("h1")).to_have_text("Вход в аккаунт")

        browser.close()
        
        