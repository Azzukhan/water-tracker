import pytest
from blog.models import BlogCategory, BlogPost
from users.models import CustomUser
import feedparser

@pytest.mark.django_db
def test_blog_categories(api_client):
    BlogCategory.objects.create(name='Tips', slug='tips')
    resp = api_client.get('/api/blog/categories/')
    assert resp.status_code == 200

@pytest.mark.django_db
def test_blog_posts(api_client):
    user = CustomUser.objects.create_user(username='u', password='p')
    cat = BlogCategory.objects.create(name='Tips', slug='tips')
    BlogPost.objects.create(title='Post', slug='post', excerpt='ex', content='c', author=user, category=cat)
    resp = api_client.get('/api/blog/posts/')
    assert resp.status_code == 200

@pytest.mark.django_db
def test_local_blog(api_client):
    resp = api_client.get('/api/blog/sample/')
    assert resp.status_code == 200
    assert 'posts' in resp.json()

@pytest.mark.django_db
def test_external_blog(api_client, monkeypatch):
    class FakeFeed:
        entries = [{'title':'A','summary':'B','link':'http://x','published':'2024'}]
    monkeypatch.setattr(feedparser, 'parse', lambda url: FakeFeed())
    resp = api_client.get('/api/blog/external/')
    assert resp.status_code == 200
    assert 'posts' in resp.json()
