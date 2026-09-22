from playwright.sync_api import sync_playwright

url = "http://127.0.0.1:8000/api/reviews/"

def test_get_api_reviews():
    with sync_playwright() as p:

        request = p.request.new_context()
        response = request.get(url)

        data = response.json()
        assert response.status == 200
        assert isinstance(data, list)

        for review in data:
            assert isinstance(review, dict)

            assert isinstance (review["reviewId"], int)
            assert isinstance (review["userId"], int)
            assert isinstance (review["animeId"], int)
            assert isinstance (review["userNickname"], (str, type(None)))
            assert isinstance (review["animeTitleRu"], (str, type(None)))
            assert isinstance (review["animeTitleOriginal"], (str, type(None)))
            assert isinstance (review["posterUrl"], (str, type(None)))
            assert isinstance (review["releaseYear"], (int, type(None)))
            assert isinstance (review["type"], (str, type(None)))
            assert isinstance (review["averageRating"], (int, float, type(None)))
            assert isinstance (review["text"], str)
            assert isinstance (review["score"], int)
            assert isinstance (review["createdAt"], (str, type(None)))

            for genre in review["genres"]:
                assert isinstance (genre, str)

        print(data)
        
