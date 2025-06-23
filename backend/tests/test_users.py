import pytest
from users.models import CustomUser

@pytest.mark.django_db
def test_user_create_and_list(api_client):
    resp = api_client.post('/api/users/', {
        'username': 'newuser',
        'email': 'u@example.com',
        'password': 'pass1234',
        'password_confirm': 'pass1234',
        'first_name': 'A',
        'last_name': 'B'
    })
    assert resp.status_code == 201
    admin = CustomUser.objects.create_superuser('admin','a@a.com','adminpass')
    api_client.force_authenticate(admin)
    resp = api_client.get('/api/users/')
    assert resp.status_code == 200
