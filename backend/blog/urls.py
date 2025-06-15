from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BlogCategoryViewSet, BlogPostViewSet, CommentViewSet, ExternalBlogAPIView

router = DefaultRouter()
router.register(r'categories', BlogCategoryViewSet)
router.register(r'posts', BlogPostViewSet)
router.register(r'comments', CommentViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('external/', ExternalBlogAPIView.as_view(), name='external-blog'),
]
