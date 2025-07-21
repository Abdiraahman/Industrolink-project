from rest_framework import serializers
from students.models import Student
from lecturers.models import Lecturer
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



