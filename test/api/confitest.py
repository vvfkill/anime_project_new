import pytest
from playwright.sync_api import sync_playwright


@pytest.fixture(scope="function")
def api_request():
    with sync_playwright() as p:
        api_request = p.request.new_context() #создаю APIRequestContext

        yield api_request

        api_request.dispose()
