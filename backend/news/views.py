from rest_framework import viewsets, filters
from rest_framework.views import APIView
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import NewsArticle
from .serializers import NewsArticleSerializer
import requests

class NewsArticleViewSet(viewsets.ModelViewSet):
    queryset = NewsArticle.objects.all()
    serializer_class = NewsArticleSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['category', 'severity', 'urgent', 'location']
    search_fields = ['title', 'summary', 'content', 'author', 'tags']


class WaterNewsAPIView(APIView):
    """Fetch water industry news from NewsAPI.org"""

    def get(self, request):
        api_key = "f89107ecafb44975be3b720dd2dfa023"
        query = "water OR flood OR weather OR 'water company'"
        url = (
            f"https://newsapi.org/v2/everything?q={query}&language=en&apiKey={api_key}"
        )

        try:
            resp = requests.get(url, timeout=10)
            data = resp.json()
        except Exception:
            return Response({"news": []}, status=500)

        articles = [
            {
                "title": article.get("title"),
                "description": article.get("description"),
                "url": article.get("url"),
                "publishedAt": article.get("publishedAt"),
            }
            for article in data.get("articles", [])
        ]
        return Response({"news": articles})
