# supervisors/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('profile/create/', views.SupervisorProfileCreateView.as_view(), name='supervisor-profile-create'),
    path('profile/', views.SupervisorProfileView.as_view(), name='supervisor-profile'),
    
    # Company management
    path('companies/', views.CompanyListView.as_view(), name='company-list'),
    path('companies/create/', views.CompanyCreateView.as_view(), name='company-create'),
    
    # Student management
    path('students/', views.SupervisorStudentsView.as_view(), name='supervisor-students'),
    path('lecturer-assignments/', views.SupervisorLecturerAssignmentsView.as_view(), name='supervisor-lecturer-assignments'),
]