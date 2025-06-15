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

        keywords = [
            "water quality",
            "water leakage",
            "water leak",
            "water level increase",
            "water level decrease",
            "thunderstorm",
            "flood alert",
            "flooding",
            "temperature increase",
            "temperature decrease",
            "investment in water",
            "water investment",
        ]
        query = " OR ".join(f'"{k}"' for k in keywords)
        region = (
            "UK OR 'United Kingdom' OR Britain OR England OR Scotland OR Wales OR 'Northern Ireland'"
        )
        full_query = f"({query}) AND ({region})"
        encoded_query = requests.utils.quote(full_query)
        url = (
            f"https://newsapi.org/v2/everything?q={encoded_query}&language=en&sortBy=publishedAt&pageSize=40&apiKey={api_key}"
        )

        try:
            resp = requests.get(url, timeout=10)
            data = resp.json()
        except Exception:
            return Response({"news": []}, status=500)

        def classify(title: str, desc: str) -> str:
            text = f"{title} {desc}".lower()
            if any(k in text for k in ["flood", "thunderstorm", "storm"]):
                return "high"
            if any(
                k in text
                for k in [
                    "leak",
                    "water level",
                    "temperature increase",
                    "temperature decrease",
                    "drought",
                    "water quality",
                ]
            ):
                return "medium"
            return "low"

        articles = []
        for article in data.get("articles", []):
            title = article.get("title", "")
            description = article.get("description", "")
            articles.append(
                {
                    "title": title,
                    "description": description,
                    "url": article.get("url"),
                    "publishedAt": article.get("publishedAt"),
                    "severity": classify(title, description),
                }
            )

        return Response({"news": articles})
