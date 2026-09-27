post_url = "http://127.0.0.1:8000/api/anime/"

def test_post_api_anime(api_request):
    post_response = api_request.post(
        post_url,
        data = {
            "titleOriginal": "test",
            "titleRu": "test",
            "description": "test",
            "releaseYear": 2020,
            "episodesTotal": 20,
            "durationMinutes": 23,
            "posterUrl": "test"
        }
    )

    post_data = post_response.json()
    assert post_response.status == 200

    assert isinstance (post_data, dict)
    assert isinstance (post_data["message"], str)
    assert isinstance (post_data["animeId"], int)

##################################################################

    anime_id = post_data["animeId"]

    get_url = f"http://127.0.0.1:8000/api/anime/{anime_id}"
    get_response = api_request.get(get_url)

    get_data = get_response.json()
    assert get_response.status == 200

    assert isinstance(get_data["animeId"], int)
    assert get_data["animeId"] == anime_id
