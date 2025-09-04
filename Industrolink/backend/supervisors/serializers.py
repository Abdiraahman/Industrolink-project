from rest_framework import serializers
from students.models import Student
from lecturers.models import Lecturer
from supervisors.models import Supervisor, Company

class CompanyRegistrationSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source='company_id', read_only=True)
    
    class Meta:
        model = Company
        fields = ['id', 'name', 'address', 'phone_number', 'email']
        read_only_fields = ['id']

    def create(self, data):
        company = Company.objects.create(**data)
        company.save()
        # Return the company with all fields including id
        return company


# supervisors/serializers.py
class CompanySerializer(serializers.ModelSerializer):
    id = serializers.CharField(source='company_id', read_only=True)
    
    class Meta:
        model = Company
        fields = ['id', 'name', 'address', 'phone_number', 'email']
        read_only_fields = ['id']


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


class SupervisorUpdateSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(write_only=True, required=False)
    
    class Meta:
        model = Supervisor
        fields = ['phone_number', 'position', 'company_name']
    
    def update(self, instance, validated_data):
        # Handle company update by name
        company_name = validated_data.pop('company_name', None)
        if company_name:
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
