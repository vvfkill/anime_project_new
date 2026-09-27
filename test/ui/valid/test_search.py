from playwright.sync_api import sync_playwright
from playwright.sync_api import expect

base_url = "http://127.0.0.1:8000/pages/"
catalog_url = base_url + "catalog.html"
search_text = "Б"

def test_search():
    with sync_playwright() as p:

        browser = p.chromium.launch(headless=False, slow_mo=1000)
        page = browser.new_page()

        page.goto(catalog_url)
        page.locator('input[id=searchInput]').fill(search_text)

        cards = page.locator(".anime-card-link") 

        for i in range(cards.count()):
            card = cards.nth(i)

            card.click()

            received_text = page.locator("h1").inner_text() #получим текст заголовка
            assert search_text.lower() in received_text.lower()

            page.go_back()
            
            expect(page).to_have_url(catalog_url)
            page.locator('input[id=searchInput]').fill(search_text)

        browser.close()
        


