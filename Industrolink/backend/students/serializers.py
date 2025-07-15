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

