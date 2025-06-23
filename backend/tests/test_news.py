import pytest
from news.models import NewsArticle
import requests
import feedparser
from news.views import FloodMonitoringAPIView

@pytest.mark.django_db
def test_news_articles(api_client):
    NewsArticle.objects.create(title='T', summary='S', content='C', category='Alert', severity='low', author='a', location='l')
    resp = api_client.get('/api/news/articles/')
    assert resp.status_code == 200

@pytest.mark.django_db
def test_water_news(api_client, monkeypatch):
    class FakeResp:
        status_code = 200
        def json(self):
            return {'articles':[{'title':'t','description':'d','url':'u','publishedAt':'2024'}]}
    monkeypatch.setattr(requests, 'get', lambda *a, **k: FakeResp())
    resp = api_client.get('/api/news/water/')
    assert resp.status_code == 200
    assert 'news' in resp.json()

@pytest.mark.django_db
def test_alert_scraper(api_client, monkeypatch):
    class FakeFeed: entries = [{'title':'flood','summary':'s','link':'u','published':'2024'}]
    monkeypatch.setattr(feedparser, 'parse', lambda url: FakeFeed())
    resp = api_client.get('/api/news/alerts/')
    assert resp.status_code == 200
    assert 'news' in resp.json()

@pytest.mark.django_db
def test_flood_monitoring(api_client, monkeypatch):
    monkeypatch.setattr(FloodMonitoringAPIView, '_fetch_json', lambda *a, **k: {'items':[]})
    class FakeFeed: entries = [{'title':'flood','summary':'s','link':'u','published':'2024'}]
    monkeypatch.setattr(FloodMonitoringAPIView, '_fetch_feed', lambda *a, **k: FakeFeed())
    resp = api_client.get('/api/news/floods/')
    assert resp.status_code == 200
    assert 'news' in resp.json()

@pytest.mark.django_db
def test_gdelt_news(api_client, monkeypatch):
    class FakeResp:
        status_code = 200
        def raise_for_status(self):
            pass
        def json(self):
            return {'articles':[{'title':'t','seendate':'2024','url':'u'}]}
    monkeypatch.setattr(requests, 'get', lambda *a, **k: FakeResp())
    resp = api_client.get('/api/news/gdelt/')
    assert resp.status_code == 200
    assert 'news' in resp.json()
