base_url = "http://127.0.0.1:8000/pages/"
reviews_url = base_url + "reviews.html"

def test_reviews(page):
    page.goto(reviews_url)
    page.locator('button[data-filter="all"]').click()
    page.locator('button[data-filter="positive"]').click()
    page.locator('button[data-filter="negative"]').click()
    page.locator('button[data-filter="my"]').click()

    reviews_sort = page.locator("#sortFilter")
    reviews_sort.click()

    reviews_search = page.locator("#searchInput")
    reviews_search.fill("И")
