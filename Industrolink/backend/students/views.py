from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework import status
from .models import Student
from .serializers import StudentProfileSerializer
from rest_framework.decorators import api_view, permission_classes

from django.db.models import Q, Count, Sum
from django.db import IntegrityError
from datetime import date, timedelta
from .models import DailyTask, TaskCategory
from .serializers import (
    DailyTaskSerializer, 
    DailyTaskCreateSerializer, 
    TaskCategorySerializer
)


class StudentProfileCreateView(generics.CreateAPIView):
    serializer_class = StudentProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def create(self, request, *args, **kwargs):
        # Check if user role is student
        if request.user.role != 'student':
            return Response({
                'error': 'Only students can create student profiles'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Check if profile already exists
        if hasattr(request.user, 'student_profile'):
            return Response({
                'error': 'Student profile already exists'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        return super().create(request, *args, **kwargs)


class StudentProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = StudentProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        # Check if user has a student profile
        if not hasattr(self.request.user, 'student_profile'):
            from rest_framework.exceptions import NotFound
            raise NotFound("Student profile not found")
        return self.request.user.student_profile
















class TaskCategoryListCreateView(generics.ListCreateAPIView):
    """
    List all active task categories or create a new one
    GET: Returns all active categories
    POST: Creates a new category
    """
    serializer_class = TaskCategorySerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return TaskCategory.objects.filter(is_active=True).order_by('name')
    
    def create(self, request, *args, **kwargs):
        # Allow students to create new categories
        if request.user.role != 'student':
            return Response({
                'error': 'Only students can create task categories'
            }, status=status.HTTP_403_FORBIDDEN)
        
        return super().create(request, *args, **kwargs)


class DailyTaskCreateView(generics.CreateAPIView):
    """
    Create a new daily task entry for the authenticated student
    """
    serializer_class = DailyTaskCreateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def create(self, request, *args, **kwargs):
        # Check if user is a student
        if request.user.role != 'student':
            return Response({
                'error': 'Only students can create daily tasks'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Check if student profile exists
        if not hasattr(request.user, 'student_profile'):
            return Response({
                'error': 'Student profile not found. Please complete your profile first.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            return super().create(request, *args, **kwargs)
        except IntegrityError:
            return Response({
                'error': 'You have already created a task entry for today. You can update your existing entry.'
            }, status=status.HTTP_400_BAD_REQUEST)
    
    def perform_create(self, serializer):
        serializer.save()


class DailyTaskListView(generics.ListAPIView):
    """
    List daily tasks for the authenticated student
    Supports filtering by date range, week, approval status
    """
    serializer_class = DailyTaskSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        # Students can only see their own tasks
        if user.role == 'student':
            if not hasattr(user, 'student_profile'):
                return DailyTask.objects.none()
            queryset = DailyTask.objects.filter(student=user.student_profile)
        # Lecturers and supervisors can see tasks of students they supervise
        elif user.role in ['lecturer', 'supervisor']:
            # For now, show all tasks - you can add supervision logic here
            queryset = DailyTask.objects.all()
        else:
            return DailyTask.objects.none()
        
        # Apply filters
        date_from = self.request.query_params.get('date_from')
        date_to = self.request.query_params.get('date_to')
        week = self.request.query_params.get('week')
        year = self.request.query_params.get('year')
        approved = self.request.query_params.get('approved')
        
        if date_from:
            try:
                queryset = queryset.filter(date__gte=date_from)
            except ValueError:
                pass
        
        if date_to:
            try:
                queryset = queryset.filter(date__lte=date_to)
            except ValueError:
                pass
        
        if week and year:
            try:
                queryset = queryset.filter(week_number=int(week), iso_year=int(year))
            except ValueError:
                pass
        
        if approved is not None:
            if approved.lower() in ['true', '1']:
                queryset = queryset.filter(approved=True)
            elif approved.lower() in ['false', '0']:
                queryset = queryset.filter(approved=False)
        
        return queryset


class DailyTaskDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update or delete a specific daily task
    """
    serializer_class = DailyTaskSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        if user.role == 'student':
            if not hasattr(user, 'student_profile'):
                return DailyTask.objects.none()
            return DailyTask.objects.filter(student=user.student_profile)
        elif user.role in ['lecturer', 'supervisor']:
            return DailyTask.objects.all()
        else:
            return DailyTask.objects.none()
    
    def update(self, request, *args, **kwargs):
        task = self.get_object()
        
        # Students can only edit their own unapproved tasks
        if request.user.role == 'student':
            if task.approved:
                return Response({
                    'error': 'Cannot edit approved tasks'
                }, status=status.HTTP_403_FORBIDDEN)
        
        return super().update(request, *args, **kwargs)
    
    def destroy(self, request, *args, **kwargs):
        task = self.get_object()
        
        # Students can only delete their own unapproved tasks
        if request.user.role == 'student':
            if task.approved:
                return Response({
                    'error': 'Cannot delete approved tasks'
                }, status=status.HTTP_403_FORBIDDEN)
        
        return super().destroy(request, *args, **kwargs)


class TodayTaskView(generics.RetrieveAPIView):
    """
    Get today's task for the authenticated student
    """
    serializer_class = DailyTaskSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        user = self.request.user
        
        if user.role != 'student' or not hasattr(user, 'student_profile'):
            return None
        
        try:
            return DailyTask.objects.get(
                student=user.student_profile,
                date=date.today()
            )
        except DailyTask.DoesNotExist:
            return None
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance is None:
            return Response({
                'message': 'No task entry found for today',
                'has_task': False
            }, status=status.HTTP_404_NOT_FOUND)
        
        serializer = self.get_serializer(instance)
        return Response({
            'has_task': True,
            'task': serializer.data
        })


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def approve_task(request, task_id):
    """
    Approve or disapprove a daily task
    Only lecturers and supervisors can approve tasks
    """
    if request.user.role not in ['lecturer', 'supervisor']:
        return Response({
            'error': 'Only lecturers and supervisors can approve tasks'
        }, status=status.HTTP_403_FORBIDDEN)
    
    try:
        task = DailyTask.objects.get(id=task_id)
    except DailyTask.DoesNotExist:
        return Response({
            'error': 'Task not found'
        }, status=status.HTTP_404_NOT_FOUND)
    
    approved = request.data.get('approved', False)
    task.approved = approved
    task.save()
    
    return Response({
        'message': f'Task {"approved" if approved else "disapproved"} successfully',
        'task': DailyTaskSerializer(task).data
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def task_statistics(request):
    """
    Get task statistics for the authenticated student
    """
    user = request.user
    
    if user.role != 'student' or not hasattr(user, 'student_profile'):
        return Response({
            'error': 'Statistics only available for students'
        }, status=status.HTTP_403_FORBIDDEN)
    
    student = user.student_profile
    tasks = DailyTask.objects.filter(student=student)
    
    # Get current week
    today = date.today()
    iso_year, iso_week, _ = today.isocalendar()
    
    # Overall statistics
    total_tasks = tasks.count()
    approved_tasks = tasks.filter(approved=True).count()
    total_hours = tasks.aggregate(Sum('hours_spent'))['hours_spent__sum'] or 0
    
    # Current week statistics
    current_week_tasks = tasks.filter(week_number=iso_week, iso_year=iso_year)
    current_week_count = current_week_tasks.count()
    current_week_hours = current_week_tasks.aggregate(Sum('hours_spent'))['hours_spent__sum'] or 0
    
    # Task categories breakdown
    category_stats = tasks.values('task_category__name').annotate(
        count=Count('id'),
        hours=Sum('hours_spent')
    ).order_by('-count')
    
    # Recent tasks (last 7 days)
    week_ago = today - timedelta(days=7)
    recent_tasks = tasks.filter(date__gte=week_ago).count()
    
    return Response({
        'total_tasks': total_tasks,
        'approved_tasks': approved_tasks,
        'pending_approval': total_tasks - approved_tasks,
        'total_hours': round(total_hours, 2),
        'approval_rate': round((approved_tasks / total_tasks * 100) if total_tasks > 0 else 0, 2),
        'current_week': {
            'week_number': iso_week,
            'year': iso_year,
            'task_count': current_week_count,
            'hours': round(current_week_hours, 2)
        },
        'recent_activity': {
            'tasks_last_7_days': recent_tasks
        },
        'category_breakdown': category_stats,
        'average_hours_per_task': round(total_hours / total_tasks if total_tasks > 0 else 0, 2)
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def weekly_summary(request):
    """
    Get weekly summary of tasks for the authenticated student
    """
    user = request.user
    
    if user.role != 'student' or not hasattr(user, 'student_profile'):
        return Response({
            'error': 'Weekly summary only available for students'
        }, status=status.HTTP_403_FORBIDDEN)
    
    # Get week and year from query params or use current week
    week = request.query_params.get('week')
    year = request.query_params.get('year')
    
    if not week or not year:
        today = date.today()
        year, week, _ = today.isocalendar()
    else:
        try:
            week = int(week)
            year = int(year)
        except ValueError:
            return Response({
                'error': 'Invalid week or year format'
            }, status=status.HTTP_400_BAD_REQUEST)
    
    student = user.student_profile
    weekly_tasks = DailyTask.objects.filter(
        student=student,
        week_number=week,
        iso_year=year
    )
    
    # Calculate week start and end dates
    # ISO week starts on Monday
    jan_1 = date(year, 1, 1)
    week_start = jan_1 + timedelta(days=(week - 1) * 7 - jan_1.weekday())
    week_end = week_start + timedelta(days=6)
    
    # Statistics
    total_tasks = weekly_tasks.count()
    approved_tasks = weekly_tasks.filter(approved=True).count()
    total_hours = weekly_tasks.aggregate(Sum('hours_spent'))['hours_spent__sum'] or 0
    
    # Daily breakdown
    daily_tasks = {}
    for i in range(7):  # Monday to Sunday
        day = week_start + timedelta(days=i)
        day_tasks = weekly_tasks.filter(date=day)
        daily_tasks[day.strftime('%A').lower()] = {
            'date': day,
            'has_task': day_tasks.exists(),
            'task': DailyTaskSerializer(day_tasks.first()).data if day_tasks.exists() else None
        }
    
    return Response({
        'week_number': week,
        'year': year,
        'week_start': week_start,
        'week_end': week_end,
        'summary': {
            'total_tasks': total_tasks,
            'approved_tasks': approved_tasks,
            'pending_tasks': total_tasks - approved_tasks,
            'total_hours': round(total_hours, 2),
            'average_hours_per_day': round(total_hours / 7, 2),
            'completion_rate': round((total_tasks / 5 * 100), 2)  # Assuming 5 working days
        },
        'daily_breakdown': daily_tasks
    })