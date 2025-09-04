from django.test import TestCase
from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status
from django.utils import timezone
from datetime import timedelta
import uuid

from .models import AdminInvite, AdminAction, AdminSettings
from users.models import User

User = get_user_model()

class AdminModelsTest(TestCase):
    """Test admin models"""
    
    def setUp(self):
        # Create a test admin user
        self.admin_user = User.objects.create_user(
            email='admin@test.com',
            username='admin@test.com',
            password='testpass123',
            first_name='Admin',
            last_name='User',
            role='admin'
        )
        
        # Create a test regular user
        self.regular_user = User.objects.create_user(
            email='user@test.com',
            username='user@test.com',
            password='testpass123',
            first_name='Regular',
            last_name='User',
            role='student'
        )
    
    def test_admin_invite_creation(self):
        """Test admin invitation creation"""
        invite = AdminInvite.objects.create(
            email='newadmin@test.com',
            token='test-token-123',
            created_by=self.admin_user,
            expires_at=timezone.now() + timedelta(hours=24)
        )
        
        self.assertEqual(invite.email, 'newadmin@test.com')
        self.assertEqual(invite.token, 'test-token-123')
        self.assertEqual(invite.created_by, self.admin_user)
        self.assertFalse(invite.used)
        self.assertFalse(invite.is_expired)
        self.assertTrue(invite.is_valid)
    
    def test_admin_invite_expiration(self):
        """Test admin invitation expiration"""
        invite = AdminInvite.objects.create(
            email='expired@test.com',
            token='expired-token',
            created_by=self.admin_user,
            expires_at=timezone.now() - timedelta(hours=1)
        )
        
        self.assertTrue(invite.is_expired)
        self.assertFalse(invite.is_valid)
    
    def test_admin_action_creation(self):
        """Test admin action creation"""
        action = AdminAction.objects.create(
            admin=self.admin_user,
            action_type='user_approval',
            target_user=self.regular_user,
            description='Test action'
        )
        
        self.assertEqual(action.admin, self.admin_user)
        self.assertEqual(action.action_type, 'user_approval')
        self.assertEqual(action.target_user, self.regular_user)
        self.assertEqual(action.description, 'Test action')
    
    def test_admin_settings_creation(self):
        """Test admin settings creation"""
        setting = AdminSettings.objects.create(
            key='test_setting',
            value='test_value',
            description='Test setting'
        )
        
        self.assertEqual(setting.key, 'test_setting')
        self.assertEqual(setting.value, 'test_value')
        self.assertEqual(setting.description, 'Test setting')

class AdminAPITest(APITestCase):
    """Test admin API endpoints"""
    
    def setUp(self):
        # Create a test admin user
        self.admin_user = User.objects.create_user(
            email='admin@test.com',
            username='admin@test.com',
            password='testpass123',
            first_name='Admin',
            last_name='User',
            role='admin'
        )
        
        # Create a test regular user
        self.regular_user = User.objects.create_user(
            email='user@test.com',
            username='user@test.com',
            password='testpass123',
            first_name='Regular',
            last_name='User',
            role='student'
        )
    
    def test_admin_login_success(self):
        """Test successful admin login"""
        url = reverse('systemadmin:admin-login')
        data = {
            'email': 'admin@test.com',
            'password': 'testpass123'
        }
        
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('message', response.data)
        self.assertIn('user', response.data)
    
    def test_admin_login_invalid_role(self):
        """Test admin login with non-admin user"""
        url = reverse('systemadmin:admin-login')
        data = {
            'email': 'user@test.com',
            'password': 'testpass123'
        }
        
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_admin_dashboard_access(self):
        """Test admin dashboard access"""
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('systemadmin:admin-dashboard')
        
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('total_students', response.data)
        self.assertIn('total_lecturers', response.data)
        self.assertIn('total_supervisors', response.data)
    
    def test_user_management_activate(self):
        """Test user activation"""
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('systemadmin:admin-user-management')
        
        # Deactivate user first
        self.regular_user.is_active = False
        self.regular_user.save()
        
        data = {
            'action': 'activate',
            'user_id': str(self.regular_user.user_id),
            'reason': 'Test activation'
        }
        
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Check if user is activated
        self.regular_user.refresh_from_db()
        self.assertTrue(self.regular_user.is_active)
    
    def test_admin_invite_creation(self):
        """Test admin invitation creation"""
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('systemadmin:admin-invite-create')
        data = {
            'email': 'newadmin@test.com'
        }
        
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('invite', response.data)
        self.assertIn('invite_url', response.data)
        
        # Check if invitation was created
        invite = AdminInvite.objects.get(email='newadmin@test.com')
        self.assertEqual(invite.created_by, self.admin_user)
        self.assertFalse(invite.used)

class AdminPermissionsTest(APITestCase):
    """Test admin permissions"""
    
    def setUp(self):
        # Create a test admin user
        self.admin_user = User.objects.create_user(
            email='admin@test.com',
            username='admin@test.com',
            password='testpass123',
            first_name='Admin',
            last_name='User',
            role='admin'
        )
        
        # Create a test regular user
        self.regular_user = User.objects.create_user(
            email='user@test.com',
            username='user@test.com',
            password='testpass123',
            first_name='Regular',
            last_name='User',
            role='student'
        )
    
    def test_unauthorized_access_to_dashboard(self):
        """Test unauthorized access to admin dashboard"""
        self.client.force_authenticate(user=self.regular_user)
        url = reverse('systemadmin:admin-dashboard')
        
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_unauthorized_access_to_user_management(self):
        """Test unauthorized access to user management"""
        self.client.force_authenticate(user=self.regular_user)
        url = reverse('systemadmin:admin-user-management')
        
        response = self.client.post(url, {})
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_unauthenticated_access(self):
        """Test unauthenticated access to admin endpoints"""
        url = reverse('systemadmin:admin-dashboard')
        
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
