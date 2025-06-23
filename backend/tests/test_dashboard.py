import pytest
from dashboard.models import DashboardStat, AnalyticsData

@pytest.mark.django_db
def test_dashboard_stats(api_client):
    DashboardStat.objects.create(name='n', value=1, category='c')
    resp = api_client.get('/api/dashboard/stats/')
    assert resp.status_code == 200

@pytest.mark.django_db
def test_dashboard_analytics(api_client):
    AnalyticsData.objects.create(metric='m', value=1, category='c')
    resp = api_client.get('/api/dashboard/analytics/')
    assert resp.status_code == 200
