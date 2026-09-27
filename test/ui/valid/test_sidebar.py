from playwright.sync_api import sync_playwright
from playwright.sync_api import expect

def test_sidebar():
    with sync_playwright() as p:

        browser = p.chromium.launch(headless=False, slow_mo=1000)
        page = browser.new_page()

        page.goto("http://127.0.0.1:8000/pages/login.html")
        page.locator('input[name="email"]').fill("me34on22@mail.ru")
        page.locator('input[name="password"]').fill("H44008*25532e")
        page.locator('button[class="auth-submit-button"]').click()

        expect(page).to_have_url("http://127.0.0.1:8000/pages/index.html")

        #index = page.locator('a[href="index.html"].sidebar-link')
        catalog = page.locator('a[href="catalog.html"].sidebar-link')
        expect(catalog).to_have_text("02")
        catalog.click()

        list = page.locator('a[href="list.html"].sidebar-link')
        expect(list).to_have_text("03")
        list.click()

        bookmarks = page.locator('a[href="bookmarks.html"].sidebar-link')
        expect(bookmarks).to_have_text("04")
        bookmarks.click()
        
        reviews = page.locator('a[href="reviews.html"].sidebar-link')
        expect(reviews).to_have_text("05")
        reviews.click()




        
