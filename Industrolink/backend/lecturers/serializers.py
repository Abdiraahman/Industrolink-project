from rest_framework import serializers
from students.models import Student
from lecturers.models import Lecturer, LecturerStudentAssignment
from supervisors.models import Supervisor, Company


# lecturers/serializers.py
class LecturerProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lecturer
        fields = ['lecturer_id', 'department', 'title']
        read_only_fields = ['lecturer_id']
    
    def create(self, validated_data):
        user = self.context['request'].user
        lecturer = Lecturer.objects.create(user=user, **validated_data)
        
        # Mark user profile as completed
        user.profile_completed = True
        user.save()
        
        return lecturer


class StudentListSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()
    user_email = serializers.EmailField(source='user.email', read_only=True)
    company_name = serializers.CharField(source='company.name', read_only=True)
    user_id = serializers.UUIDField(source='user.user_id', read_only=True)
    first_name = serializers.CharField(source='user.first_name', read_only=True)
    last_name = serializers.CharField(source='user.last_name', read_only=True)
    
    class Meta:
        model = Student
        fields = [
            'student_id', 'user_id', 'first_name', 'last_name', 'registration_no', 
            'academic_year', 'course', 'year_of_study', 'company_name', 
            'duration_in_weeks', 'start_date', 'completion_date', 'user_name', 
            'user_email', 'created_at', 'updated_at'
        ]
    
    def get_user_name(self, obj):
        try:
            return obj.user.get_full_name() if obj.user else 'N/A'
        except:
            return f"{obj.user.first_name or ''} {obj.user.last_name or ''}".strip() or 'N/A'


class LecturerStudentAssignmentSerializer(serializers.ModelSerializer):
    student_details = StudentListSerializer(source='student', read_only=True)
    lecturer_name = serializers.CharField(source='lecturer.user.get_full_name', read_only=True)
    assigned_by_name = serializers.CharField(source='assigned_by.user.get_full_name', read_only=True)
    
    class Meta:
        model = LecturerStudentAssignment
        fields = [
            'assignment_id', 'lecturer', 'student', 'student_details',
            'assigned_by', 'assigned_by_name', 'assigned_at', 
            'is_active', 'notes', 'lecturer_name'
        ]
        read_only_fields = ['assignment_id', 'assigned_at']


class LecturerStudentAssignmentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = LecturerStudentAssignment
        fields = ['lecturer', 'student', 'notes']
    
    def validate(self, attrs):
        # Check if assignment already exists
        if LecturerStudentAssignment.objects.filter(
            lecturer=attrs['lecturer'],
            student=attrs['student'],
            is_active=True
        ).exists():
            raise serializers.ValidationError("This student is already assigned to this lecturer")
        return attrs



