# students/views.py
from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework import status
from .models import Student
from .serializers import StudentProfileSerializer


class StudentProfileCreateView(generics.CreateAPIView):
    serializer_class = StudentProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def create(self, request, *args, **kwargs):
        # Check if user role is student
        if request.user.role != 'student':
            return Response({
                'error': 'Only students can create student profiles'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Check if profile already exists
        if hasattr(request.user, 'student_profile'):
            return Response({
                'error': 'Student profile already exists'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        return super().create(request, *args, **kwargs)


class StudentProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = StudentProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user.student_profile
