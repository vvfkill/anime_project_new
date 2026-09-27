from playwright.sync_api import sync_playwright

base_url = "http://127.0.0.1:8000/pages/"
reviews_url = base_url + "reviews.html"

def test_reviews():
    with sync_playwright() as p:

        browser = p.chromium.launch(headless=False, slow_mo=1000)
        page = browser.new_page()

        page.goto(reviews_url)
        page.locator('button[data-filter="all"]').click()
        page.locator('button[data-filter="positive"]').click()
        page.locator('button[data-filter="negative"]').click()
        page.locator('button[data-filter="my"]').click()

        reviews_sort = page.locator("#sortFilter")
        reviews_sort.click()

        reviews_search = page.locator("#searchInput")
        reviews_search.fill("И")

        browser.close()