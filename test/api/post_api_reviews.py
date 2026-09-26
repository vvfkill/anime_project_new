from playwright.sync_api import sync_playwright

post_url = "http://127.0.0.1:8000/api/reviews/"

def test_post_api_reviews():
    with sync_playwright() as p:

        request = p.request.new_context()
        post_response = request.post(
            post_url,
            data = {
                "userId": 1,
                "animeId": 3, 
                "text": "testtest",
                "scope": 6
             }
            )

        post_data = post_response.json()
        assert post_response.status == 200

        assert isinstance(post_data, dict)
        assert isinstance (post_data["message"], str) 
        assert isinstance (post_data["reviewId"], int)

        reviews_id = post_data["reviewId"]

        get_url = "http://127.0.0.1:8000/api/reviews/anime/11"
        get_response = request.get(get_url)

        get_data = get_response.json()
        assert get_response == 200

        assert get_data["reviewsId"] == reviews_id

        request.dispose()


