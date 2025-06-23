import pytest

@pytest.mark.django_db
def test_story_post_and_list(api_client):
    resp = api_client.post('/api/stories/stories/', {'name':'John','email':'j@example.com','text':'Hello'})
    assert resp.status_code == 201
    resp = api_client.get('/api/stories/stories/')
    assert resp.status_code == 200
