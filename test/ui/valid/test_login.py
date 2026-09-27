from playwright.sync_api import sync_playwright
from playwright.sync_api import expect

def handle_dialog(dialog): #(dialog) - объект диалога, который playwright передаст автоматически
    message = dialog.message #получить текст из этого диалога
    assert message == "Вход выполнен успешно"
    dialog.accept()
    
def test_login_auth():

    with sync_playwright() as p:

        browser = p.chromium.launch(headless = False, slow_mo = 1000) #запускаем браузер, где headless - показБ slow_mo - замедлить работу

        page = browser.new_page() #создать новую вклажку

        page.on("dialog", handle_dialog)

        page.goto("http://127.0.0.1:8000/pages/login.html")
        page.locator('input[name="email"]').fill("me34on22@mail.ru")
        page.locator('input[name="password"]').fill("H44008*25532e")
        page.locator('button[class="auth-submit-button"]').click()

        #print(page.url) #pytest -s ("s чтобы показать print")
        #print(page.locator("h1").inner_text()) #посмотреть какой текст в заголовке h1

        expect(page).to_have_url("http://127.0.0.1:8000/pages/index.html")
        expect(page.locator("h1")).to_have_text("АНИМЕ,\nКОТОРОЕ\nВДОХНОВЛЯЕТ")

        browser.close()

