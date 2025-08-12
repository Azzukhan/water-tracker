from rest_framework import serializers
from .models import BlogCategory, BlogPost, Comment, CommunityStory, Subscriber
from users.serializers import UserSerializer

class BlogCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = BlogCategory
        fields = '__all__'

class CommentSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    replies = serializers.SerializerMethodField()
    
    class Meta:
        model = Comment
        fields = ['id', 'post', 'author', 'content', 'parent', 'replies', 'created_at', 'updated_at']
    
    def get_replies(self, obj):
        if obj.replies.exists():
            return CommentSerializer(obj.replies.all(), many=True).data
        return []

class BlogPostSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    category = BlogCategorySerializer(read_only=True)
    category_id = serializers.IntegerField(write_only=True)
    comments_count = serializers.SerializerMethodField()
    
    class Meta:
        model = BlogPost
        fields = ['id', 'title', 'slug', 'excerpt', 'content', 'author', 'category', 
                  'category_id', 'tags', 'featured', 'image', 'read_time', 
                  'published_at', 'created_at', 'updated_at', 'comments_count']
    
    def get_comments_count(self, obj):
        return obj.comments.count()

class BlogPostDetailSerializer(BlogPostSerializer):
    comments = serializers.SerializerMethodField()
    
    class Meta(BlogPostSerializer.Meta):
        fields = BlogPostSerializer.Meta.fields + ['comments']
    
    def get_comments(self, obj):
        # Only get top-level comments (no parent)
        comments = obj.comments.filter(parent=None)
        return CommentSerializer(comments, many=True).data


class CommunityStorySerializer(serializers.ModelSerializer):
    class Meta:
        model = CommunityStory
        fields = ['id', 'name', 'email', 'text', 'created_at']


class SubscriberSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subscriber
        fields = ['id', 'email', 'created_at']