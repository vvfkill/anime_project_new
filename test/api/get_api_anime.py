from playwright.sync_api import sync_playwright

url = "http://127.0.0.1:8000/api/anime/?page=1&page_size=10"

def test_get_api_anime():
    with sync_playwright() as p:

        request = p.request.new_context() #создаю APIRequestContext

        response = request.get(url)

        data = response.json() #метод

        assert response.status == 200

        assert "page" in data
        assert "pageSize" in data
        assert "totalCount" in data
        assert "totalPages" in data
        assert "items" in data

        assert isinstance(data["page"], int)
        assert isinstance(data["pageSize"], int)
        assert isinstance(data["totalCount"], int)
        assert isinstance(data["totalPages"], int)
        assert isinstance(data["items"], list)

        for anime in data["items"]:

            assert isinstance(anime, dict)

            assert isinstance(anime["animeId"], int)
            assert isinstance(anime["titleRu"], (str, type(None)))
            assert isinstance(anime["titleOriginal"], str)
            assert isinstance(anime["releaseYear"], (int, type(None)))
            assert isinstance(anime["type"], (str, type(None)))
            assert isinstance(anime["averageRating"], (float, int, type(None)))
            assert isinstance(anime["posterUrl"], (str, type(None)))
          
            for genre in anime["genres"]:
                assert isinstance(genre, str)

        request.dispose()