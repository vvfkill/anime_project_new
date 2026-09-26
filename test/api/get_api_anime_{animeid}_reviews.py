from playwright.sync_api import sync_playwright

url = "http://127.0.0.1:8000/api/anime/1/reviews"

def test_get_api_anime_animeid_reviews():
    with sync_playwright() as p:

        request = p.request.new_context()
        response = request.get(url)

        data = response.json()

        assert response.status == 200
        assert isinstance(data, list)

        for anime in data():
            assert isinstance(anime["reviewsId"], int)
            assert isinstance(anime["userId"], int)
            assert isinstance(anime["animeId"], int)
            assert isinstance (anime["userNickname"], (str, type(None)))
            assert isinstance (anime["animeTitleRu"], (str, type(None)))
            assert isinstance (anime["animeTitleOriginal"], (str, type(None)))
            assert isinstance (anime["posterUrl"], (str, type(None)))
            assert isinstance (anime["releaseYear"], (int, type(None)))
            assert isinstance (anime["type"], (str, type(None)))
            assert isinstance (anime["averageRating"], (int, float, type(None)))
            assert isinstance (anime["text"], str)
            assert isinstance (anime["score"], int)
            assert isinstance (anime["createdAt"], (str, type(None)))

            for genre in anime["genres"]:
                    assert isinstance (genre, str)
        
        print(data)