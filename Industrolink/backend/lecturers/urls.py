# lecturers/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('profile/create/', views.LecturerProfileCreateView.as_view(), name='lecturer-profile-create'),
    path('profile/', views.LecturerProfileView.as_view(), name='lecturer-profile'),
]