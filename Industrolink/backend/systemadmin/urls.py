from django.urls import path
from . import views

app_name = 'systemadmin'

urlpatterns = [
    # Authentication
    path('login/', views.AdminLoginView.as_view(), name='admin-login'),
    path('logout/', views.AdminLogoutView.as_view(), name='admin-logout'),
    path('verify-session/', views.AdminSessionVerifyView.as_view(), name='admin-session-verify'),
    path('test/', views.AdminTestView.as_view(), name='admin-test'),
    
    # Invitation system
    path('invite/', views.AdminInviteCreateView.as_view(), name='admin-invite-create'),
    path('invites/<uuid:pk>/', views.AdminInviteDeleteView.as_view(), name='admin-invite-delete'),
    path('register/<str:token>/', views.AdminRegisterView.as_view(), name='admin-register'),
    
    # Dashboard and management
    path('dashboard/', views.AdminDashboardView.as_view(), name='admin-dashboard'),
    path('users/', views.UserListView.as_view(), name='admin-users'),
    path('users/manage/', views.UserManagementView.as_view(), name='admin-user-management'),
    path('users/<uuid:user_id>/details/', views.UserDetailsView.as_view(), name='admin-user-details'),
    path('students/assign/', views.StudentAssignmentView.as_view(), name='admin-student-assignment'),
    
    # Lists and monitoring
    path('invites/', views.AdminInviteListView.as_view(), name='admin-invites'),
    path('actions/', views.AdminActionListView.as_view(), name='admin-actions'),
    
    # Settings
    path('settings/', views.AdminSettingsListView.as_view(), name='admin-settings'),
    path('settings/<int:pk>/', views.AdminSettingsUpdateView.as_view(), name='admin-settings-update'),
]
