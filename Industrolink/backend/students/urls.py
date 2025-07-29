# students/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('profile/create/', views.StudentProfileCreateView.as_view(), name='student-profile-create'),
    path('profile/', views.StudentProfileView.as_view(), name='student-profile'),

    # Task Category URLs
    path('task-categories/', views.TaskCategoryListCreateView.as_view(), name='task-categories'),
    
    # Daily Task URLs
    path('tasks/', views.DailyTaskListView.as_view(), name='daily-tasks-list'),
    path('tasks/create/', views.DailyTaskCreateView.as_view(), name='daily-task-create'),
    path('tasks/today/', views.TodayTaskView.as_view(), name='today-task'),
    path('tasks/<uuid:pk>/', views.DailyTaskDetailView.as_view(), name='daily-task-detail'),
    path('tasks/<uuid:task_id>/approve/', views.approve_task, name='approve-task'),
    
    # Statistics and Reports
    path('tasks/statistics/', views.task_statistics, name='task-statistics'),
    path('tasks/weekly-summary/', views.weekly_summary, name='weekly-summary'),

]
