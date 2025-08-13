from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework import status
from rest_framework.pagination import PageNumberPagination
from .models import Supervisor, Company
from .serializers import SupervisorProfileSerializer, CompanySerializer, CompanyRegistrationSerializer


class CompanyListView(generics.ListAPIView):
    serializer_class = CompanySerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = PageNumberPagination
    
    def get_queryset(self):
        queryset = Company.objects.all()
        print(f"CompanyListView: Found {queryset.count()} companies")
        for company in queryset:
            print(f"Company: {company.company_id} - {company.name}")
        return queryset


class CompanyCreateView(generics.CreateAPIView):
    serializer_class = CompanyRegistrationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def create(self, request, *args, **kwargs):
        # Allow students and supervisors to create companies
        if request.user.role not in ['student', 'supervisor']:
            return Response({
                'error': 'Only students and supervisors can create companies'
            }, status=status.HTTP_403_FORBIDDEN)
        
        print(f"CompanyCreateView: Creating company with data: {request.data}")
        response = super().create(request, *args, **kwargs)
        print(f"CompanyCreateView: Created company: {response.data}")
        return response


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
        # Check if user has a supervisor profile
        if not hasattr(self.request.user, 'supervisor_profile'):
            from rest_framework.exceptions import NotFound
            raise NotFound("Supervisor profile not found")
        return self.request.user.supervisor_profile
