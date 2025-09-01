# lecturers/views.py
from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from django.db.models import Q
from .models import Lecturer, LecturerStudentAssignment
from .serializers import (
    LecturerProfileSerializer, 
    StudentListSerializer,
    LecturerStudentAssignmentSerializer,
    LecturerStudentAssignmentCreateSerializer
)
from students.models import Student


class LecturerProfileCreateView(generics.CreateAPIView):
    serializer_class = LecturerProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def create(self, request, *args, **kwargs):
        if request.user.role != 'lecturer':
            return Response({
                'error': 'Only lecturers can create lecturer profiles'
            }, status=status.HTTP_403_FORBIDDEN)
        
        if hasattr(request.user, 'lecturer_profile'):
            return Response({
                'error': 'Lecturer profile already exists'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        return super().create(request, *args, **kwargs)


class LecturerProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = LecturerProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        # Check if user has a lecturer profile
        if not hasattr(self.request.user, 'lecturer_profile'):
            from rest_framework.exceptions import NotFound
            raise NotFound("Lecturer profile not found")
        return self.request.user.lecturer_profile


class LecturerStudentsView(generics.ListAPIView):
    """
    View for lecturers to see their assigned students
    """
    serializer_class = StudentListSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.role != 'lecturer':
            return Student.objects.none()
        
        if not hasattr(self.request.user, 'lecturer_profile'):
            return Student.objects.none()
        
        # Get students assigned to this lecturer
        assignments = LecturerStudentAssignment.objects.filter(
            lecturer=self.request.user.lecturer_profile,
            is_active=True
        )
        student_ids = assignments.values_list('student_id', flat=True)
        return Student.objects.filter(student_id__in=student_ids)


class LecturerStudentAssignmentListView(generics.ListAPIView):
    """
    View for lecturers to see their student assignments
    """
    serializer_class = LecturerStudentAssignmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.role != 'lecturer':
            return LecturerStudentAssignment.objects.none()
        
        if not hasattr(self.request.user, 'lecturer_profile'):
            return LecturerStudentAssignment.objects.none()
        
        return LecturerStudentAssignment.objects.filter(
            lecturer=self.request.user.lecturer_profile,
            is_active=True
        )
