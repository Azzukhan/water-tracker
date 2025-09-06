from django.db import models

class SupportRequest(models.Model):
    """Model to store support requests from users."""
    name = models.CharField(max_length=255)
    email = models.EmailField()
    phone = models.CharField(max_length=50, blank=True)
    subject = models.CharField(max_length=255)
    category = models.CharField(max_length=50, blank=True)
    message = models.TextField()
    urgent = models.BooleanField(default=False)
    newsletter = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.subject}"

class Question(models.Model):
    """Model to store user questions."""
    email = models.EmailField()
    question = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.question[:50]


class IssueReport(models.Model):
    """Model to store reported issues."""
    issue_type = models.CharField(max_length=50)
    severity = models.CharField(max_length=20)
    location = models.CharField(max_length=255)
    postcode = models.CharField(max_length=20)
    description = models.TextField()
    contact_name = models.CharField(max_length=255, blank=True)
    contact_phone = models.CharField(max_length=50, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.issue_type} - {self.postcode}"
