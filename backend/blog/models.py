from django.db import models
from django.utils import timezone
from django.utils.text import slugify
from users.models import CustomUser

class BlogCategory(models.Model):
    """Model representing blog categories"""
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True)
    
    class Meta:
        verbose_name_plural = "Blog Categories"
        ordering = ["name"]
    
    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

class BlogPost(models.Model):
    """Model representing a blog post"""
    title = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    excerpt = models.TextField(help_text="A short summary of the post")
    content = models.TextField()
    author = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='blog_posts')
    category = models.ForeignKey(BlogCategory, on_delete=models.CASCADE, related_name='posts')
    tags = models.JSONField(default=list)
    featured = models.BooleanField(default=False)
    image = models.ImageField(upload_to='blog/', blank=True, null=True)
    read_time = models.PositiveIntegerField(help_text="Estimated read time in minutes", default=5)
    
    published_at = models.DateTimeField(default=timezone.now)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-published_at']
    
    def __str__(self):
        return self.title
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

class Comment(models.Model):
    """Model representing a comment on a blog post"""
    post = models.ForeignKey(BlogPost, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='comments')
    content = models.TextField()
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='replies')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['created_at']
    
    def __str__(self):
        return f"Comment by {self.author.username} on {self.post.title}"


class CommunityStory(models.Model):
    """A user submitted water conservation story."""
    name = models.CharField(max_length=255)
    email = models.EmailField()
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name}: {self.text[:30]}"
