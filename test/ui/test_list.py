from playwright.sync_api import sync_playwright

base_url = "http://127.0.0.1:8000/pages/"
list_url = base_url + "list.html"
login_url = base_url + "login.html"

input_email = "me34on22@mail.ru"
input_password = "H44008*25532e"
search_text = "Б"

def test_list():
    with sync_playwright() as s:
        browser = s.chromium.launch(headless=False, slow_mo=1000)
        page = browser.new_page()

        page.goto(login_url)

        email = page.locator('[name="email"]')
        email.fill(input_email)

        password = page.locator('[name="password"]')
        password.fill(input_password)

        enter = page.locator('[class="auth-submit-button"]')
        enter.click()

        page.goto(list_url)

        sort = page.locator("#listSort")
        sort.click()

        search = page.locator("#listSearch")
        search.fill(search_text)

        browser.close()
