# lecturers/views.py
from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework import status
from .models import Lecturer
from .serializers import LecturerProfileSerializer


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
        return self.request.user.lecturer_profile
