import allure
import pytest

url = "http://127.0.0.1:8000/api/anime/"
@allure.title("получение списка отзывов")
@allure.description("получени списка отзывов при различных(валидных) anime_id")
@allure.severity(allure.severity_level.NORMAL)
@pytest.mark.parametrize("anime_id", [3, 8, 11])
def test_get_api_anime_animeid_reviews(api_request, anime_id):
    with allure.step("отправить GET запрос"):
        response = api_request.get(f"{url}{anime_id}/reviews")
    with allure.step("проверка статус кода 200"):
        assert response.status == 200
    with allure.step("получение json"):
        data = response.json()
    with allure.step("проверка тела ответа"):
        assert isinstance(data, list)

        for anime in data:
            assert isinstance (anime["reviewId"], int)
            assert isinstance (anime["userId"], int)

            assert isinstance (anime["animeId"], int)
            assert anime["animeId"] == anime_id

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

            assert isinstance (anime["genres"], list)
            for genre in anime["genres"]:
                assert isinstance (genre, str)
