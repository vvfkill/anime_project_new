from playwright.sync_api import sync_playwright

url = "http://127.0.0.1:8000/api/anime/23"

def test_get_anime_anime_id():
    with sync_playwright() as p:

        request = p.request.new_context()
        response = request.get(url)

        data = response.json()

        assert response.status == 200

        assert isinstance (data, dict)

        assert isinstance (data["animeId"], int)
        assert isinstance (data["titleRu"], (str, type(None)))
        assert isinstance (data["titleOriginal"], str)
        assert isinstance (data["fullDescription"], (str, type(None)))
        assert isinstance (data["releaseYear"], (int, type(None)))
        assert isinstance (data["description"], (str, type(None)))
        assert isinstance (data["episodesTotal"], (int, type(None)))
        assert isinstance (data["averageRating"], (float, int, type(None)))
        assert isinstance (data["posterUrl"], (str, type(None)))

        assert isinstance (data["genres"], list)
        for genre in data["genres"]:
            assert isinstance(genre, str)

        assert isinstance (data["studios"], list)
        for studio in data["studios"]:
            assert isinstance(studio, str)

        assert isinstance (data["tags"], list)
        for tag in data["tags"]:
            assert isinstance(tag, str)

        assert isinstance (data["characters"], list)
        for character in data["characters"]:
            assert isinstance (character, dict)
            assert isinstance (character["characterId"], int)
            assert isinstance (character["name"], str)
            assert isinstance (character["nameOriginal"], (str, type(None)))
            assert isinstance (character["description"], (str, type(None)))
            assert isinstance (character["gender"], (str, type(None)))
            assert isinstance (character["roleType"], (str, type(None)))
            assert isinstance (character["imageUrl"], (str, type(None)))

            assert isinstance (character["seiyus"],list)
            for seiyu in character["seiyus"]:
                assert isinstance (seiyu, dict)
                assert isinstance (seiyu["seiyuId"], int)
                assert isinstance (seiyu["name"], str)
                assert isinstance (seiyu["nameOriginal"], (str, type(None)))
                assert isinstance (seiyu["country"], (str, type(None)))
                assert isinstance (seiyu["photoUrl"], (str, type(None)))

        assert isinstance (data["similarAnime"], list)
        for similar in data["similarAnime"]:
            assert isinstance(similar, dict)
            assert isinstance (similar["animeId"], int)
            assert isinstance (similar["titleRu"], (str, type(None)))
            assert isinstance (similar["titleOriginal"], str)
            assert isinstance (similar["releaseYear"], (int, type(None)))
            assert isinstance (similar["type"], (str, type(None)))
            assert isinstance (similar["averageRating"], (float, int, type(None)))
            assert isinstance (similar["posterUrl"], (str, type(None)))

            assert isinstance (similar["genres"], list)
            for genre in similar["genres"]:
                    assert isinstance(genre, str)

        print(data)

        request.dispose()
