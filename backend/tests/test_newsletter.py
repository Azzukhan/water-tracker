import pytest

@pytest.mark.django_db
def test_subscribers(api_client):
    resp = api_client.post('/api/newsletter/subscribers/', {'email':'a@example.com'})
    assert resp.status_code == 201
    resp = api_client.get('/api/newsletter/subscribers/')
    assert resp.status_code == 200
