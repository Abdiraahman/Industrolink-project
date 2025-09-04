from django.db import models
from django.utils import timezone
from django.core.validators import MinLengthValidator
from django.conf import settings
import uuid

class AdminInvite(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    token = models.CharField(max_length=64, unique=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sent_admin_invites')
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    used = models.BooleanField(default=False)
    used_at = models.DateTimeField(null=True, blank=True)
    used_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='received_admin_invites', null=True, blank=True)
    
    class Meta:
        db_table = 'admin_invites'
        verbose_name = 'Admin Invitation'
        verbose_name_plural = 'Admin Invitations'
    
    def __str__(self):
        try:
            if self.email:
                return f"Admin invite for {self.email}"
            return "Admin invite"
        except:
            return "Admin invite"
    
    @property
    def is_expired(self):
        if not self.expires_at:
            return True
        return timezone.now() > self.expires_at
    
    @property
    def is_valid(self):
        try:
            return not self.used and not self.is_expired
        except:
            return False

class AdminAction(models.Model):
    ACTION_TYPES = [
        ('user_approval', 'User Approval'),
        ('user_deactivation', 'User Deactivation'),
        ('user_deletion', 'User Deletion'),
        ('student_assignment', 'Student Assignment'),
        ('account_activation', 'Account Activation'),
        ('account_deactivation', 'Account Deactivation'),
        ('admin_invite_sent', 'Admin Invite Sent'),
        ('admin_registered', 'Admin Registered'),
        ('admin_login', 'Admin Login'),
        ('admin_logout', 'Admin Logout'),
        ('invite_deletion', 'Invite Deletion'),
        ('session_verification', 'Session Verification'),
        ('setting_update', 'Setting Update'),
        ('user_details_viewed', 'User Details Viewed'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    admin = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='admin_actions')
    action_type = models.CharField(max_length=50, choices=ACTION_TYPES)
    target_user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='admin_actions_received', null=True, blank=True)
    description = models.TextField()
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'admin_actions'
        verbose_name = 'Admin Action'
        verbose_name_plural = 'Admin Actions'
        ordering = ['-created_at']
    
    def __str__(self):
        try:
            admin_name = self.admin.get_full_name() if self.admin else 'Unknown'
            return f"{admin_name} - {self.get_action_type_display()}"
        except:
            return f"Admin Action - {self.get_action_type_display()}"
    
    def get_action_type_display(self):
        """Override get_action_type_display to handle invalid action types safely"""
        try:
            if hasattr(super(), 'get_action_type_display'):
                return super().get_action_type_display()
            elif self.action_type:
                return self.action_type.replace('_', ' ').title()
            else:
                return 'Unknown Action'
        except:
            # Fallback for invalid action types
            if self.action_type:
                return self.action_type.replace('_', ' ').title()
            return 'Unknown Action'

class AdminSettings(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    key = models.CharField(max_length=100, unique=True)
    value = models.TextField()
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'admin_settings'
        verbose_name = 'Admin Setting'
        verbose_name_plural = 'Admin Settings'
    
    def __str__(self):
        try:
            if self.key and self.value is not None:
                return f"{self.key}: {self.value}"
            elif self.key:
                return f"{self.key}: (no value)"
            else:
                return "Admin Setting"
        except:
            return "Admin Setting"
