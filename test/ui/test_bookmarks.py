from playwright.sync_api import sync_playwright

base_url = "http://127.0.0.1:8000/pages/"
bookmarks_url = base_url + "bookmarks.html"

def test_catalog():
    with sync_playwright() as p:

        browser = p.chromium.launch(headless=False, slow_mo=1000)
        page = browser.new_page()

        page.goto(bookmarks_url)
        page.locator('button[data-status="all"]').click() 
        page.locator('button[data-status="watching"]').click() 
        page.locator('button[data-status="planned"]').click() 
        page.locator('button[data-status="completed"]').click() 
        page.locator('button[data-status="postponed"]').click() 

        bookmarks_sort = page.locator('#bookmarkSort')
        bookmarks_sort.click()

        bookmarks_search = page.locator('#bookmarkSearch')
        bookmarks_search.fill('И')
        
        browser.close()

