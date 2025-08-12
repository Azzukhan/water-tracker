from rest_framework import viewsets, filters, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
import feedparser
import json
import os
from django_filters.rest_framework import DjangoFilterBackend
from .models import BlogCategory, BlogPost, Comment, CommunityStory
from .serializers import BlogCategorySerializer, BlogPostSerializer, BlogPostDetailSerializer, CommentSerializer, CommunityStorySerializer

class BlogCategoryViewSet(viewsets.ModelViewSet):
    queryset = BlogCategory.objects.all()
    serializer_class = BlogCategorySerializer
    lookup_field = 'slug'

class BlogPostViewSet(viewsets.ModelViewSet):
    queryset = BlogPost.objects.all()
    serializer_class = BlogPostSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['category', 'featured', 'author']
    search_fields = ['title', 'excerpt', 'content', 'tags']
    lookup_field = 'slug'
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return BlogPostDetailSerializer
        return BlogPostSerializer
    
    def perform_create(self, serializer):
        serializer.save(author=self.request.user)
    
    @action(detail=True, methods=['post'])
    def add_comment(self, request, slug=None):
        post = self.get_object()
        
        # Check if this is a reply to another comment
        parent_id = request.data.get('parent')
        parent = None
        if parent_id:
            try:
                parent = Comment.objects.get(id=parent_id, post=post)
            except Comment.DoesNotExist:
                return Response({"detail": "Parent comment not found."}, status=400)
        
        comment = Comment.objects.create(
            post=post,
            author=request.user,
            content=request.data.get('content'),
            parent=parent
        )
        
        serializer = CommentSerializer(comment)
        return Response(serializer.data)

class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['post', 'author']

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)


class ExternalBlogAPIView(APIView):
    """Aggregate external blog posts from public RSS feeds"""

    FEEDS = {
        "water-conservation": "https://www.wateraid.org/uk/blog/rss.xml",
        "industry-insights": "https://www.circleofblue.org/feed/",
        "innovation-tech": "https://iwa-network.org/news/feed/",
        "global-water-awareness": "https://water.org/news-press/blogs/feed/",
        "ea-announcements": "https://www.gov.uk/government/announcements.atom?departments%5B%5D=environment-agency",
        "drought-tips": "https://www.americanrivers.org/blog/feed/",
        "sustainability": "https://www.unwater.org/rss.xml",
    }

    CATEGORY_NAMES = {
        "water-conservation": "Water Conservation",
        "industry-insights": "Industry Insights",
        "innovation-tech": "Innovation & Tech",
        "global-water-awareness": "Global Awareness",
        "ea-announcements": "EA Announcements",
        "drought-tips": "Emergency Preparedness",
        "sustainability": "Sustainability",
    }

    def get(self, request):
        posts = []
        for category, url in self.FEEDS.items():
            try:
                feed = feedparser.parse(url)
            except Exception:
                continue

            for entry in getattr(feed, "entries", []):
                posts.append(
                    {
                        "title": entry.get("title", ""),
                        "summary": entry.get("summary", ""),
                        "link": entry.get("link"),
                        "published": entry.get("published", entry.get("updated")),
                        "category": self.CATEGORY_NAMES.get(category, category),
                    }
                )

        if not posts:
            sample_path = os.path.join(os.path.dirname(__file__), "sample_posts.json")
            try:
                with open(sample_path, "r", encoding="utf-8") as fh:
                    data = json.load(fh)
                    posts = data.get("posts", [])
            except Exception:
                posts = []

        posts.sort(key=lambda x: x.get("published", ""), reverse=True)
        return Response({"posts": posts})


class LocalBlogAPIView(APIView):
    """Return blog posts from the bundled JSON file."""

    def get(self, request):
        sample_path = os.path.join(os.path.dirname(__file__), "sample_posts.json")
        try:
            with open(sample_path, "r", encoding="utf-8") as fh:
                data = json.load(fh)
                posts = data.get("posts", [])
        except Exception:
            posts = []

        posts.sort(key=lambda x: x.get("published", ""), reverse=True)
        return Response({"posts": posts})



class CommunityStoryViewSet(viewsets.ModelViewSet):
    queryset = CommunityStory.objects.all()
    serializer_class = CommunityStorySerializer
    permission_classes = [permissions.AllowAny]
    http_method_names = ['get', 'post']