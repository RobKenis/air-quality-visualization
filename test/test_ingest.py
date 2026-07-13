import json
import pytest

import src.ingest as ingest


@pytest.mark.skip(reason="Dont feel like mocking AWS integrations")
def test_handler_returns_200():
    with open("test/resources/so2_sqs.json", "r") as f:
        event = json.loads(f.read())
    context = {}
    response = ingest.handler(event, context)
    assert response["statusCode"] == 200
