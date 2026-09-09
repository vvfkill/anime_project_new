from playwright.sync_api import sync_playwright
from playwright.sync_api import expect

def test_index_catalog():
    with sync_playwright() as p:

        browser = p.chromium.launch(headless=False, slow_mo=1000)
        page = browser.new_page()


        page.goto("http://127.0.0.1:8000/pages/index.html")
        page.get_by_text("ПЕРЕЙТИ В КАТАЛОГ").click()

        expect(page).to_have_url("http://127.0.0.1:8000/pages/catalog.html")
        expect(page.locator("h1")).to_have_text("КАТАЛОГ")

        browser.close()


