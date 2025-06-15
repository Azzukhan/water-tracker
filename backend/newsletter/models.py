from django.db import models

class Subscriber(models.Model):
    """A newsletter subscriber"""
    email = models.EmailField(unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.email
