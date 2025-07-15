# students/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('profile/create/', views.StudentProfileCreateView.as_view(), name='student-profile-create'),
    path('profile/', views.StudentProfileView.as_view(), name='student-profile'),
]
