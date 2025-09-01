from rest_framework import serializers
from django.contrib.auth import authenticate
from django.conf import settings
from .models import AdminInvite, AdminAction, AdminSettings
from users.models import User

class AdminUserSerializer(serializers.ModelSerializer):
    """Serializer for admin user data"""
    class Meta:
        model = User
        fields = ['user_id', 'email', 'first_name', 'last_name', 'role', 'is_active', 'created_at']
        read_only_fields = ['user_id', 'created_at']

class AdminUserLoginSerializer(serializers.Serializer):
    """Serializer for admin login"""
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    
    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')
        
        print(f"Validating admin login for email: {email}")
        
        if email and password:
            user = authenticate(email=email, password=password)
            print(f"Authentication result: user={user}")
            
            if not user:
                print("Authentication failed - invalid credentials")
                raise serializers.ValidationError('Invalid credentials')
            
            print(f"User found: {user.email}, role: {user.role}, is_active: {user.is_active}")
            
            if not user.is_active:
                print("User account is deactivated")
                raise serializers.ValidationError('Account is deactivated')
            
            if user.role != 'admin':
                print(f"User role '{user.role}' is not admin")
                raise serializers.ValidationError('Access denied. Admin role required.')
            
            print("Admin validation successful")
            attrs['user'] = user
        else:
            print("Missing email or password")
            raise serializers.ValidationError('Must include email and password')
        
        return attrs

class AdminInviteSerializer(serializers.ModelSerializer):
    """Serializer for admin invitations"""
    created_by_name = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()
    
    class Meta:
        model = AdminInvite
        fields = ['id', 'email', 'token', 'created_by', 'created_by_name', 'created_at', 'expires_at', 'used', 'used_at', 'used_by', 'status']
        read_only_fields = ['id', 'token', 'created_by', 'created_at', 'used', 'used_at', 'used_by']
    
    def get_created_by_name(self, obj):
        try:
            if obj.created_by:
                return obj.created_by.get_full_name() or f"{obj.created_by.first_name or ''} {obj.created_by.last_name or ''}".strip() or obj.created_by.email
            return 'Unknown'
        except:
            return 'Unknown'
    
    def get_status(self, obj):
        try:
            if obj.used:
                return 'used'
            elif hasattr(obj, 'is_expired') and obj.is_expired:
                return 'expired'
            else:
                return 'active'
        except:
            return 'unknown'

class AdminInviteCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating admin invitations"""
    class Meta:
        model = AdminInvite
        fields = ['email']
    
    def validate_email(self, value):
        # Check if user already exists
        if User.objects.filter(email=value).exists():
            user = User.objects.get(email=value)
            if user.role == 'admin':
                raise serializers.ValidationError('User is already an admin')
        return value

class AdminRegisterSerializer(serializers.Serializer):
    """Serializer for admin registration via invitation"""
    email = serializers.EmailField()
    first_name = serializers.CharField(max_length=20)
    last_name = serializers.CharField(max_length=20)
    password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True)
    
    def validate(self, attrs):
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError('Passwords do not match')
        return attrs
    
    def create(self, validated_data):
        # Create user with admin role
        user = User.objects.create_user(
            email=validated_data['email'],
            username=validated_data['email'],  # Use email as username
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            password=validated_data['password'],
            role='admin'
        )
        return user

class AdminActionSerializer(serializers.ModelSerializer):
    """Serializer for admin actions"""
    admin_name = serializers.SerializerMethodField()
    target_user_name = serializers.SerializerMethodField()
    action_type_display = serializers.SerializerMethodField()
    
    def get_action_type_display(self, obj):
        try:
            if hasattr(obj, 'get_action_type_display'):
                return obj.get_action_type_display()
            elif obj.action_type:
                return obj.action_type.replace('_', ' ').title()
            else:
                return 'Unknown Action'
        except:
            if obj.action_type:
                return obj.action_type.replace('_', ' ').title()
            return 'Unknown Action'
    
    def get_admin_name(self, obj):
        try:
            if obj.admin:
                return obj.admin.get_full_name() or f"{obj.admin.first_name or ''} {obj.admin.last_name or ''}".strip() or obj.admin.email
            return 'Unknown'
        except:
            return 'Unknown'
    
    def get_target_user_name(self, obj):
        try:
            if obj.target_user:
                return obj.target_user.get_full_name() or f"{obj.target_user.first_name or ''} {obj.target_user.last_name or ''}".strip() or obj.target_user.email
            return None
        except:
            return None
    
    class Meta:
        model = AdminAction
        fields = ['id', 'admin', 'admin_name', 'action_type', 'action_type_display', 'target_user', 'target_user_name', 'description', 'metadata', 'created_at']
        read_only_fields = ['id', 'admin', 'created_at']
    
    def to_representation(self, instance):
        try:
            return super().to_representation(instance)
        except Exception as e:
            print(f"Error serializing AdminAction {instance.id}: {str(e)}")
            # Return a safe fallback representation
            return {
                'id': str(instance.id),
                'admin': str(instance.admin.id) if instance.admin else None,
                'admin_name': 'Unknown',
                'action_type': instance.action_type,
                'action_type_display': instance.action_type.replace('_', ' ').title(),
                'target_user': str(instance.target_user.id) if instance.target_user else None,
                'target_user_name': 'Unknown',
                'description': instance.description,
                'metadata': instance.metadata or {},
                'created_at': instance.created_at.isoformat() if instance.created_at else None
            }

class AdminSettingsSerializer(serializers.ModelSerializer):
    """Serializer for admin settings"""
    class Meta:
        model = AdminSettings
        fields = ['id', 'key', 'value', 'description', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

class UserManagementSerializer(serializers.Serializer):
    """Serializer for user management operations"""
    action = serializers.ChoiceField(choices=['activate', 'deactivate', 'delete', 'approve'])
    user_id = serializers.UUIDField()
    reason = serializers.CharField(required=False, allow_blank=True)

class StudentAssignmentSerializer(serializers.Serializer):
    """Serializer for student assignment operations"""
    student_id = serializers.UUIDField()
    lecturer_id = serializers.UUIDField()
    action = serializers.ChoiceField(choices=['assign', 'unassign'])

class UserListSerializer(serializers.ModelSerializer):
    """Serializer for user listing in admin panel"""
    class Meta:
        model = User
        fields = ['user_id', 'email', 'first_name', 'last_name', 'role', 'is_active', 'created_at', 'profile_completed', 'email_verified']

class DashboardStatsSerializer(serializers.Serializer):
    """Serializer for dashboard statistics"""
    total_students = serializers.IntegerField()
    total_lecturers = serializers.IntegerField()
    total_supervisors = serializers.IntegerField()
    total_admins = serializers.IntegerField()
    pending_approvals = serializers.IntegerField()
    recent_actions = AdminActionSerializer(many=True)
