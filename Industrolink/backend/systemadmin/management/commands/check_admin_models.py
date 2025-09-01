from django.core.management.base import BaseCommand
from django.db import connection
from systemadmin.models import AdminAction, AdminInvite, AdminSettings
from users.models import User

class Command(BaseCommand):
    help = 'Check admin models for any invalid data'

    def handle(self, *args, **options):
        self.stdout.write('Checking admin models...')
        
        # Check AdminAction model
        try:
            action_count = AdminAction.objects.count()
            self.stdout.write(f'AdminAction count: {action_count}')
            
            if action_count > 0:
                # Check each action
                for action in AdminAction.objects.all()[:5]:  # Check first 5
                    try:
                        self.stdout.write(f'Action {action.id}: {action.action_type} - {action.description}')
                        # Try to access related fields
                        if action.admin:
                            self.stdout.write(f'  Admin: {action.admin.email}')
                        if action.target_user:
                            self.stdout.write(f'  Target: {action.target_user.email}')
                    except Exception as e:
                        self.stdout.write(f'  Error with action {action.id}: {str(e)}')
        except Exception as e:
            self.stdout.write(f'Error checking AdminAction: {str(e)}')
        
        # Check AdminInvite model
        try:
            invite_count = AdminInvite.objects.count()
            self.stdout.write(f'AdminInvite count: {invite_count}')
        except Exception as e:
            self.stdout.write(f'Error checking AdminInvite: {str(e)}')
        
        # Check AdminSettings model
        try:
            settings_count = AdminSettings.objects.count()
            self.stdout.write(f'AdminSettings count: {settings_count}')
        except Exception as e:
            self.stdout.write(f'Error checking AdminSettings: {str(e)}')
        
        # Check User model for admin users
        try:
            admin_count = User.objects.filter(role='admin').count()
            self.stdout.write(f'Admin users count: {admin_count}')
            
            if admin_count > 0:
                for admin in User.objects.filter(role='admin')[:3]:
                    self.stdout.write(f'Admin: {admin.email} - {admin.first_name} {admin.last_name}')
        except Exception as e:
            self.stdout.write(f'Error checking User model: {str(e)}')
        
        self.stdout.write('Check complete!')
