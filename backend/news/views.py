from rest_framework import viewsets, filters
from rest_framework.views import APIView
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import NewsArticle
from .serializers import NewsArticleSerializer
import requests
import feedparser

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

        def categorize(title: str, desc: str) -> str:
            text = f"{title} {desc}".lower()
            if "water level" in text:
                return "Water Level"
            if "water quality" in text:
                return "Water Quality"
            if any(k in text for k in ["flood", "thunderstorm", "storm"]):
                return "Storm"
            return "General"

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
                    "category": categorize(title, description),
                }
            )

        return Response({"news": articles})


class AlertScraperAPIView(APIView):
    """Scrape RSS feeds for flood and storm related news"""

    FEEDS = [
        "http://feeds.bbci.co.uk/news/rss.xml",
        "https://www.theguardian.com/environment/rss",
    ]

    KEYWORDS = [
        "flood",
        "water level",
        "water quality",
        "storm",
    ]

    def get(self, request):
        def categorize(title: str, desc: str) -> str:
            text = f"{title} {desc}".lower()
            if "water level" in text:
                return "Water Level"
            if "water quality" in text:
                return "Water Quality"
            if any(k in text for k in ["flood", "thunderstorm", "storm"]):
                return "Storm"
            return "General"

        articles = []
        for feed_url in self.FEEDS:
            try:
                feed = feedparser.parse(feed_url)
            except Exception:
                continue

            for entry in feed.entries:
                title = entry.get("title", "")
                summary = entry.get("summary", "")
                text = f"{title} {summary}".lower()
                if not any(k in text for k in self.KEYWORDS):
                    continue
                articles.append(
                    {
                        "title": title,
                        "description": summary,
                        "url": entry.get("link"),
                        "publishedAt": entry.get("published", entry.get("updated")),
                        "category": categorize(title, summary),
                    }
                )

        # Remove duplicates by URL
        seen = set()
        unique = []
        for art in articles:
            if art["url"] not in seen:
                seen.add(art["url"])
                unique.append(art)

        unique.sort(key=lambda x: x.get("publishedAt", ""), reverse=True)
        return Response({"news": unique})


class FloodMonitoringAPIView(APIView):
    """Fetch flood alerts from various UK public sources"""

    EA_URL = "https://environment.data.gov.uk/flood-monitoring/id/floods"
    WATER_MAG_RSS = "https://www.watermagazine.co.uk/feed/"
    BGS_RSS = "https://www.bgs.ac.uk/news/feed/"

    def _fetch_json(self, url: str):
        try:
            resp = requests.get(url, timeout=10)
            return resp.json()
        except Exception:
            return None

    def _fetch_feed(self, url: str):
        try:
            return feedparser.parse(url)
        except Exception:
            return None

    def get(self, request):
        def categorize(title: str, desc: str) -> str:
            text = f"{title} {desc}".lower()
            if "water level" in text:
                return "Water Level"
            if "water quality" in text:
                return "Water Quality"
            if any(k in text for k in ["flood", "thunderstorm", "storm"]):
                return "Storm"
            return "General"

        articles = []

        data = self._fetch_json(self.EA_URL)
        if data:
            for item in data.get("items", []):
                articles.append(
                    {
                        "title": item.get("description", "Environment Agency Alert"),
                        "description": item.get("message", ""),
                        "url": item.get("@id"),
                        "publishedAt": item.get("timeMessageChanged"),
                        "severity": item.get("severity", "").lower() if item.get("severity") else None,
                        "category": categorize(item.get("description", ""), item.get("message", "")),
                    }
                )

        for feed_url in [self.WATER_MAG_RSS, self.BGS_RSS]:
            feed = self._fetch_feed(feed_url)
            if not feed:
                continue
            for entry in feed.entries:
                articles.append(
                    {
                        "title": entry.get("title", ""),
                        "description": entry.get("summary", ""),
                        "url": entry.get("link"),
                        "publishedAt": entry.get("published", entry.get("updated")),
                        "severity": "medium",
                        "category": categorize(entry.get("title", ""), entry.get("summary", "")),
                    }
                )

        seen = set()
        unique = []
        for art in articles:
            if art["url"] not in seen:
                seen.add(art["url"])
                unique.append(art)

        unique.sort(key=lambda x: x.get("publishedAt", ""), reverse=True)
        return Response({"news": unique})


class GDELTNewsAPIView(APIView):
    """Fetch global water related news using the GDELT Project"""

    DEFAULT_QUERY = (
        "water OR flood OR drought OR \"water quality\""
    )

    def get(self, request):
        query = request.query_params.get("q", self.DEFAULT_QUERY)
        encoded_query = requests.utils.quote(query)
        url = (
            "https://api.gdeltproject.org/api/v2/doc/doc"
            f"?query={encoded_query}&format=json&maxrecords=50&mode=ArtList&sort=HybridRel"
        )

        try:
            resp = requests.get(url, timeout=10)
            data = resp.json()
        except Exception:
            return Response({"news": []}, status=500)

        articles = []
        for item in data.get("articles", []):
            title = item.get("title", "")
            desc = item.get("seendate", "")
            articles.append(
                {
                    "title": title,
                    "description": item.get("trans", desc) or desc,
                    "url": item.get("url"),
                    "publishedAt": item.get("seendate"),
                }
            )

        return Response({"news": articles})
