from playwright.sync_api import expect


def test_index_catalog(page):
    page.goto("http://127.0.0.1:8000/pages/index.html")
    page.get_by_text("ПЕРЕЙТИ В КАТАЛОГ").click()

    expect(page).to_have_url("http://127.0.0.1:8000/pages/catalog.html")
    expect(page.locator("h1")).to_have_text("КАТАЛОГ")
