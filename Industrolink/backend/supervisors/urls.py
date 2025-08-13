# supervisors/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('companies/', views.CompanyListView.as_view(), name='company-list'),
    path('companies/create/', views.CompanyCreateView.as_view(), name='company-create'),
    path('profile/create/', views.SupervisorProfileCreateView.as_view(), name='supervisor-profile-create'),
    path('profile/', views.SupervisorProfileView.as_view(), name='supervisor-profile'),
]