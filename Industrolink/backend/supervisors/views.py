# supervisors/views.py
from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework import status
from .models import Supervisor, Company
from .serializers import SupervisorProfileSerializer, CompanySerializer


class CompanyListView(generics.ListAPIView):
    queryset = Company.objects.all()
    serializer_class = CompanySerializer
    permission_classes = [permissions.IsAuthenticated]


class SupervisorProfileCreateView(generics.CreateAPIView):
    serializer_class = SupervisorProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def create(self, request, *args, **kwargs):
        if request.user.role != 'supervisor':
            return Response({
                'error': 'Only supervisors can create supervisor profiles'
            }, status=status.HTTP_403_FORBIDDEN)
        
        if hasattr(request.user, 'supervisor_profile'):
            return Response({
                'error': 'Supervisor profile already exists'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        return super().create(request, *args, **kwargs)


class SupervisorProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = SupervisorProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user.supervisor_profile
