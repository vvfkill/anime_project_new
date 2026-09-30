import allure
import pytest

url = "http://127.0.0.1:8000/api/anime/"

@allure.title("получение списка аниме")
@allure.description("получение списка аниме, проверка структуры ответа")
@allure.severity(allure.severity_level.CRITICAL)
@pytest.mark.parametrize("page,page_size", [(1, 10),(2, 10), (3,10)])
def test_get_api_anime(api_request, page, page_size):
    with allure.step("отправить GET запрос"):
        response = api_request.get(
            url,
            params = {"page": page, "page_size": page_size})

    with allure.step("проверить успешный статус код 200"):
        assert response.status == 200
    with allure.step("получить json и проверить структуры ответа"):
        data = response.json()
        assert "page" in data
        assert "pageSize" in data
        assert "totalCount" in data
        assert "totalPages" in data
        assert "items" in data

        assert data["page"] == page
        assert data["pageSize"] == page_size

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

    allure.attach(
            response.text(),
            name="ответ API",
            attachment_type=allure.attachment_type.JSON
        )
