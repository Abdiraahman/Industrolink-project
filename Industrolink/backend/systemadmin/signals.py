from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.utils import timezone
from .models import AdminInvite, AdminAction
from users.models import User

@receiver(post_save, sender=User)
def admin_user_created(sender, instance, created, **kwargs):
    """Log when a new admin user is created"""
    if created and instance.role == 'admin':
        AdminAction.objects.create(
            admin=instance,
            action_type='admin_registered',
            description=f'New admin user created: {instance.email}',
            metadata={'user_id': str(instance.user_id)}
        )

@receiver(pre_save, sender=AdminInvite)
def admin_invite_pre_save(sender, instance, **kwargs):
    """Set expiration time for new invitations"""
    if not instance.pk:  # New invitation
        instance.expires_at = timezone.now() + timezone.timedelta(hours=24)

@receiver(post_save, sender=AdminInvite)
def admin_invite_post_save(sender, instance, created, **kwargs):
    """Log invitation creation and usage"""
    if created:
        # Log invitation creation
        AdminAction.objects.create(
            admin=instance.created_by,
            action_type='admin_invite_sent',
            description=f'Admin invitation sent to {instance.email}',
            metadata={'invite_id': str(instance.id)}
        )
    elif instance.used and not getattr(instance, '_invite_usage_logged', False):
        # Log invitation usage
        AdminAction.objects.create(
            admin=instance.used_by,
            action_type='admin_registered',
            description=f'Admin registered via invitation: {instance.email}',
            metadata={'invite_id': str(instance.id)}
        )
        # Mark as logged to prevent duplicate logging
        instance._invite_usage_logged = True
