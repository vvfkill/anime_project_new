from playwright.sync_api import sync_playwright
from playwright.sync_api import expect 

base_url = "http://127.0.0.1:8000/pages/"
catalog_url = base_url + "catalog.html"

def test_catalog():
    with sync_playwright() as p:

        browser = p.chromium.launch(headless=False, slow_mo=1000)
        page = browser.new_page()

        page.goto(catalog_url)

        cards = page.locator(".anime-card-link") #найди на текущей странице элементы, соответствующие этому CSS-селектору
        expect(cards).to_have_count(10)

        for i in range(cards.count()): #cards - все карточки аниме
            card = cards.nth(i) #из всех карточек берем только одну, i = 0 => card = первая карточка
            href = card.get_attribute("href") #у конкретной карточки мы берем href(<a class="anime-card-link" href="anime.html?id=6">)

            url = base_url + href 
            card.click() #нажимаем на текущую карточку
            expect(page).to_have_url(url) #после клика URL страницы должен быть таким, каким мы его заранее получили из href

            page.go_back() 
            expect(page).to_have_url(catalog_url) 

        browser.close()

