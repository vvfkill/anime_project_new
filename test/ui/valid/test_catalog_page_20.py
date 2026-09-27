from playwright.sync_api import expect

base_url = "http://127.0.0.1:8000/pages/"
catalog_url = base_url + "catalog.html"

def test_catalog_page_20(page):
    page.goto(catalog_url)

    page.locator('button[id=nextPage]').click()

    cards = page.locator(".anime-card-link")
    expect(cards).to_have_count(10)

    for i in range(cards.count()):
        card = cards.nth(i)
        href = card.get_attribute("href") #href - относительный адрес, anime.html?=6

        assert href is not None
        url = base_url + href
        card.click()

        expect(page).to_have_url(url)
        page.go_back()
        if i < cards.count() - 1:
            page.locator('button[id=nextPage]').click()
