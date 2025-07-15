from rest_framework import serializers
from django.contrib.auth import get_user_model
from students.models import Student
from lecturers.models import Lecturer
from supervisors.models import Supervisor, Company

User = get_user_model()


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = [
            'first_name', 'middle_name', 'last_name', 'username', 
            'email', 'role', 'password', 'password_confirm'
        ]
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Passwords don't match")
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        return user


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'user_id', 'first_name', 'middle_name', 'last_name', 
            'username', 'email', 'role', 'is_active', 'profile_completed', 
            'created_at'
        ]
        read_only_fields = ['user_id', 'created_at']
