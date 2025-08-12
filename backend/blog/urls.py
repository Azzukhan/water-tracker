from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    BlogCategoryViewSet,
    BlogPostViewSet,
    CommentViewSet,
    ExternalBlogAPIView,
    LocalBlogAPIView,
    CommunityStoryViewSet,
    SubscriberViewSet,
)

router = DefaultRouter()
router.register(r'categories', BlogCategoryViewSet)
router.register(r'posts', BlogPostViewSet)
router.register(r'comments', CommentViewSet)
router.register(r'stories', CommunityStoryViewSet)
router.register(r'subscribers', SubscriberViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('external/', ExternalBlogAPIView.as_view(), name='external-blog'),
    # Allow access with and without a trailing slash
    path('sample/', LocalBlogAPIView.as_view(), name='sample-blog'),
    path('sample', LocalBlogAPIView.as_view()),
]
