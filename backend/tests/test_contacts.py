import pytest

@pytest.mark.django_db
def test_support_requests(api_client):
    resp = api_client.post('/api/contacts/request/', {
        'name': 'A',
        'email': 'a@example.com',
        'subject': 'Help',
        'message': 'Need help'
    })
    assert resp.status_code == 201

@pytest.mark.django_db
def test_support_questions(api_client):
    resp = api_client.post('/api/contacts/question/', {
        'email': 'a@example.com',
        'question': 'Why?'
    })
    assert resp.status_code == 201

@pytest.mark.django_db
def test_support_issues(api_client):
    resp = api_client.post('/api/contacts/issue', {
        'issue_type': 'Leak',
        'severity': 'high',
        'location': 'Loc',
        'postcode': 'AA1',
        'description': 'desc'
    })
    assert resp.status_code == 201
