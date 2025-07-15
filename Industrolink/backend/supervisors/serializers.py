from rest_framework import serializers
from django.contrib.auth import get_user_model
from students.models import Student
from lecturers.models import Lecturer
from supervisors.models import Supervisor, Company

Student = get_user_model()  # Assuming Student is a custom user model




# supervisors/serializers.py
class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = ['company_id', 'name', 'address', 'phone_number', 'email']
        read_only_fields = ['company_id']


class SupervisorProfileSerializer(serializers.ModelSerializer):
    company_details = CompanySerializer(source='company', read_only=True)
    
    class Meta:
        model = Supervisor
        fields = ['supervisor_id', 'company', 'phone_number', 'position', 'company_details']
        read_only_fields = ['supervisor_id']
    
    def create(self, validated_data):
        user = self.context['request'].user
        supervisor = Supervisor.objects.create(user=user, **validated_data)
        
        # Mark user profile as completed
        user.profile_completed = True
        user.save()
        
        return supervisor
