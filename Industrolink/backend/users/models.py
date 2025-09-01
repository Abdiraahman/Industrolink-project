import uuid
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.validators import EmailValidator
from django.utils import timezone


class User(AbstractUser):
    ROLE_CHOICES = [
        ('student', 'Student'),
        ('lecturer', 'Lecturer'),
        ('supervisor', 'Supervisor'),
        ('admin', 'Admin'),
    ]
    
    user_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    first_name = models.CharField(max_length=20)
    middle_name = models.CharField(max_length=20, blank=True, null=True)
    last_name = models.CharField(max_length=20)
    username = models.CharField(max_length=150, unique=True)
    email = models.EmailField(validators=[EmailValidator()], unique=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    profile_completed = models.BooleanField(default=False)
    
    # Email verification fields
    email_verified = models.BooleanField(default=False)
    email_verification_token = models.CharField(max_length=100, blank=True, null=True)
    email_verification_sent_at = models.DateTimeField(blank=True, null=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name', 'role']
    
    def __str__(self):
        try:
            first = self.first_name or ''
            last = self.last_name or ''
            role = self.role or 'unknown'
            return f"{first} {last} ({role})"
        except:
            return self.email or 'Unknown User'
    
    def get_full_name(self):
        """Override get_full_name to handle None values safely"""
        try:
            first = self.first_name or ''
            last = self.last_name or ''
            full_name = f"{first} {last}".strip()
            return full_name if full_name else self.email
        except:
            return self.email or 'Unknown User'
    
    class Meta:
        db_table = 'users'

