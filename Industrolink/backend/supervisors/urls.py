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
    
    # Task management
    path('tasks/', views.SupervisorTaskManagementView.as_view(), name='supervisor-task-management'),
    path('tasks/<uuid:pk>/approve/', views.SupervisorTaskApprovalView.as_view(), name='supervisor-task-approval'),
    path('tasks/bulk-approve/', views.SupervisorBulkTaskApprovalView.as_view(), name='supervisor-bulk-task-approval'),
    path('tasks/student/<uuid:student_id>/weekly/', views.SupervisorWeeklyTasksView.as_view(), name='supervisor-weekly-tasks'),
]