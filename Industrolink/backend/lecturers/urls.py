# lecturers/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('profile/create/', views.LecturerProfileCreateView.as_view(), name='lecturer-profile-create'),
    path('profile/', views.LecturerProfileView.as_view(), name='lecturer-profile'),
    
    # Student management
    path('students/', views.LecturerStudentsView.as_view(), name='lecturer-students'),
    path('students/<uuid:student_id>/', views.LecturerStudentDetailsView.as_view(), name='lecturer-student-details'),
    path('assignments/', views.LecturerStudentAssignmentListView.as_view(), name='lecturer-assignments'),
    
    # Task management (view only - approval handled by supervisors)
    path('tasks/', views.LecturerTaskManagementView.as_view(), name='lecturer-tasks'),
]