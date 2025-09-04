from rest_framework import serializers
from django.utils import timezone
from .models import Student, DailyTask, TaskCategory

class StudentProfileSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source='company.name', read_only=True)
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    user_email = serializers.EmailField(source='user.email', read_only=True)
    
    class Meta:
        model = Student
        fields = [
            'student_id', 'registration_no', 'academic_year', 'course',
            'year_of_study', 'company_name', 'duration_in_weeks', 'start_date', 'completion_date',
            'user_name', 'user_email'
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


class StudentUpdateSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(write_only=True, required=False)
    
    class Meta:
        model = Student
        fields = [
            'registration_no', 'academic_year', 'course', 'year_of_study',
            'duration_in_weeks', 'start_date', 'completion_date', 'company_name'
        ]
    
    def update(self, instance, validated_data):
        # Handle company update by name
        company_name = validated_data.pop('company_name', None)
        if company_name:
            from supervisors.models import Company
            try:
                company = Company.objects.get(name=company_name)
                instance.company = company
            except Company.DoesNotExist:
                raise serializers.ValidationError(f"Company '{company_name}' not found")
        
        # Update other fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        return instance


class TaskCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = TaskCategory
        fields = ['id', 'name', 'description', 'is_active', 'is_user_created', 'created_by', 'created_at']
        read_only_fields = ['id', 'created_at']
    
    def create(self, validated_data):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            validated_data['created_by'] = request.user
            validated_data['is_user_created'] = True
        return super().create(validated_data)


class DailyTaskSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.user.get_full_name', read_only=True)
    task_category_name = serializers.CharField(source='task_category.name', read_only=True)
    task_category_details = TaskCategorySerializer(source='task_category', read_only=True)
    supervisor_name = serializers.SerializerMethodField()
    
    class Meta:
        model = DailyTask
        fields = [
            'id', 'student', 'student_name', 'date', 'description',
            'task_category', 'task_category_name', 'task_category_details',
            'tools_used', 'skills_applied', 'hours_spent', 'approved',
            'supervisor', 'supervisor_name', 'supervisor_comments', 'approved_at',
            'week_number', 'iso_year', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'date', 'week_number', 'iso_year', 'created_at', 'updated_at'
        ]
    
    def get_supervisor_name(self, obj):
        try:
            if hasattr(obj, 'supervisor') and obj.supervisor:
                return obj.supervisor.get_full_name()
            return None
        except:
            return None
    

    
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
            # If no categories exist at all, create a default one
            if TaskCategory.objects.count() == 0:
                default_category = TaskCategory.objects.create(
                    name='General Tasks',
                    description='Default category for daily tasks',
                    is_active=True,
                    is_user_created=False
                )
                attrs['task_category'] = default_category
            else:
                raise serializers.ValidationError("Either task_category or task_category_name must be provided")
        
        if task_category_name:
            # Create or get existing category
            category, created = TaskCategory.objects.get_or_create(
                name__iexact=task_category_name.strip(),
                defaults={
                    'name': task_category_name.strip(),
                    'description': f'User-created category: {task_category_name.strip()}',
                    'is_user_created': True,
                    'created_by': self.context.get('request').user if self.context.get('request') else None
                }
            )
            attrs['task_category'] = category
            attrs.pop('task_category_name', None)
        
        return attrs
    
    def validate_tools_used(self, value):
        if not isinstance(value, list):
            raise serializers.ValidationError("Tools used must be a list")
        # Filter out empty strings and ensure uniqueness
        filtered_tools = list(set([str(item).strip() for item in value if item and str(item).strip()]))
        return filtered_tools
    
    def validate_skills_applied(self, value):
        if not isinstance(value, list):
            raise serializers.ValidationError("Skills applied must be a list")
        # Filter out empty strings and ensure uniqueness
        filtered_skills = list(set([str(item).strip() for item in value if item and str(item).strip()]))
        return filtered_skills
    
    def validate_date(self, value):
        # Date validation removed since it's auto-generated
        pass
    
    def create(self, validated_data):
        request = self.context.get('request')
        if request and hasattr(request.user, 'student_profile'):
            validated_data['student'] = request.user.student_profile
        return super().create(validated_data)


class SupervisorTaskApprovalSerializer(serializers.ModelSerializer):
    """Serializer for supervisors to approve tasks"""
    student_name = serializers.CharField(source='student.user.get_full_name', read_only=True)
    task_category_name = serializers.CharField(source='task_category.name', read_only=True)
    student = serializers.SerializerMethodField()
    
    class Meta:
        model = DailyTask
        fields = [
            'id', 'student', 'student_name', 'date', 'description',
            'task_category_name', 'tools_used', 'skills_applied', 'hours_spent',
            'approved', 'supervisor_comments', 'week_number', 'iso_year', 'created_at'
        ]
        read_only_fields = [
            'id', 'student', 'student_name', 'date', 'description',
            'task_category_name', 'tools_used', 'skills_applied', 'hours_spent',
            'week_number', 'iso_year', 'created_at'
        ]
    
    def get_student(self, obj):
        """Return nested student user details for frontend compatibility"""
        if obj.student and obj.student.user:
            return {
                'student_id': obj.student.student_id,
                'user': {
                    'first_name': obj.student.user.first_name,
                    'last_name': obj.student.user.last_name,
                    'email': obj.student.user.email
                }
            }
        return None
    
    def update(self, instance, validated_data):
        # Set supervisor and approval timestamp
        validated_data['supervisor'] = self.context['request'].user
        validated_data['approved_at'] = timezone.now()
        return super().update(instance, validated_data)
