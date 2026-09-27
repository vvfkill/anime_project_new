from playwright.sync_api import sync_playwright
from playwright.sync_api import expect

base_url = "http://127.0.0.1:8000/pages/"
catalog_url = base_url + "catalog.html"

def test_filter():
    with sync_playwright() as p:

        browser = p.chromium.launch(headless=False, slow_mo=1000)
        page = browser.new_page()

        page.goto(catalog_url)

        #проверка филтра жанры
        genre = page.locator("#genreFilter") #сохраняем ссылку с id в переменную genre

        expect(genre).to_be_visible() #проверка видимости
        expect(genre).to_be_enabled() #проверка отключенности

        genre.click()

        #проверка года
        year = page.locator("#yearFilter")

        expect(year).to_be_visible()
        expect(year).to_be_enabled()

        year.click()

        #проверка статуса
        status = page.locator("#typeFilter")
        
        expect(status).to_be_visible()
        expect(status).to_be_enabled()
        
        status.click()

        #проверка сортировки
        sort = page.locator("#sortFilter")
        
        expect(sort).to_be_visible()
        expect(sort).to_be_enabled()
        
        sort.click()

        browser.close()