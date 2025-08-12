from django.contrib import admin
from .models import (
    BlogPost,
    BlogCategory,
    Comment,
    CommunityStory,
)


@admin.register(CommunityStory)
class CommunityStoryAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "email",
        "text",
        "created_at",
    )


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = (
        "post",
        "author",
        "content",
        "created_at",
    )
    list_filter = ("post", "author")


@admin.register(BlogPost)
class BlogPostAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "author",
        "category",
        "published_at",
    ) 
    list_filter = ("category", "author")


@admin.register(BlogCategory)
class BlogCategoryAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "slug",
    )