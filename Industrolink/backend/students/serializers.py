# from rest_framework import serializers
# from django.contrib.auth import get_user_model
# # from students.models import Student
# from lecturers.models import Lecturer
# from supervisors.models import Supervisor, Company

# Student = get_user_model()  # Assuming Student is a custom user model

# class StudentProfileSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Student
#         fields = [
#             'student_id', 'registration_no', 'academic_year', 'course',
#             'year_of_study', 'company_name', 'company_address',
#             'duration_in_weeks', 'start_date', 'completion_date'
#         ]
#         read_only_fields = ['student_id']
    
#     def create(self, validated_data):
#         # Get user from request context
#         user = self.context['request'].user
#         student = Student.objects.create(user=user, **validated_data)
        
#         # Mark user profile as completed
#         user.profile_completed = True
#         user.save()
        
#         return student




















# students/serializers.py
from rest_framework import serializers
from .models import Student
from django.utils import timezone
from .models import DailyTask, TaskCategory

class StudentProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = [
            'student_id', 'registration_no', 'academic_year', 'course',
            'year_of_study', 'company_name', 'company_address',
            'duration_in_weeks', 'start_date', 'completion_date'
        ]
        read_only_fields = ['student_id']
    
    def create(self, validated_data):
        # Get user from request context
        user = self.context['request'].user
        student = Student.objects.create(user=user, **validated_data)
        
        # Mark user profile as completed
        user.profile_completed = True
        user.save()
        
        return student








from rest_framework import serializers
from django.utils import timezone
from .models import DailyTask, TaskCategory


class TaskCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = TaskCategory
        fields = ['id', 'name', 'description', 'is_active']
        read_only_fields = ['id']


class DailyTaskSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.user.get_full_name', read_only=True)
    task_category_name = serializers.CharField(source='task_category.name', read_only=True)
    task_category_details = TaskCategorySerializer(source='task_category', read_only=True)
    
    class Meta:
        model = DailyTask
        fields = [
            'id', 'student', 'student_name', 'date', 'description',
            'task_category', 'task_category_name', 'task_category_details',
            'tools_used', 'skills_applied', 'hours_spent', 'approved',
            'week_number', 'iso_year', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'date', 'week_number', 'iso_year', 'created_at', 'updated_at'
        ]
    
    def validate_date(self, value):
        # Date validation removed since it's auto-generated
        pass
    
    def validate_tools_used(self, value):
        if not isinstance(value, list):
            raise serializers.ValidationError("Tools used must be a list")
        return [str(item) for item in value if item]  # Convert to strings and filter empty
    
    def validate_skills_applied(self, value):
        if not isinstance(value, list):
            raise serializers.ValidationError("Skills applied must be a list")
        return [str(item) for item in value if item]  # Convert to strings and filter empty
    
    def create(self, validated_data):
        request = self.context.get('request')
        if request and hasattr(request.user, 'student_profile'):
            validated_data['student'] = request.user.student_profile
        return super().create(validated_data)


class DailyTaskCreateSerializer(serializers.ModelSerializer):
    # Allow creating new category if it doesn't exist
    task_category_name = serializers.CharField(write_only=True, required=False)
    
    class Meta:
        model = DailyTask
        fields = [
            'description', 'task_category', 'task_category_name',
            'tools_used', 'skills_applied', 'hours_spent'
        ]
    
    def validate(self, attrs):
        # Handle category creation/selection
        task_category = attrs.get('task_category')
        task_category_name = attrs.get('task_category_name')
        
        if not task_category and not task_category_name:
            raise serializers.ValidationError("Either task_category or task_category_name must be provided")
        
        if task_category_name:
            # Create or get existing category
            category, created = TaskCategory.objects.get_or_create(
                name__iexact=task_category_name.strip(),
                defaults={'name': task_category_name.strip()}
            )
            attrs['task_category'] = category
            attrs.pop('task_category_name', None)
        
        return attrs
    
    def validate_date(self, value):
        # Date validation removed since it's auto-generated
        pass
    
    def create(self, validated_data):
        request = self.context.get('request')
        if request and hasattr(request.user, 'student_profile'):
            validated_data['student'] = request.user.student_profile
        return super().create(validated_data)
