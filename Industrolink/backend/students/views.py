from rest_framework import generics, permissions, status
from rest_framework.response import Response
from .models import Student
from .serializers import StudentProfileSerializer
from rest_framework.decorators import api_view, permission_classes

from django.db.models import Q, Count, Sum
from django.db import IntegrityError
from django.shortcuts import get_object_or_404
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
        try:
            # Check if user is properly authenticated
            if not request.user.is_authenticated:
                return Response({
                    'error': 'User not authenticated'
                }, status=status.HTTP_401_UNAUTHORIZED)
            
            # Check if user is a student
            if not hasattr(request.user, 'role') or request.user.role != 'student':
                return Response({
                    'error': 'Only students can create daily tasks'
                }, status=status.HTTP_403_FORBIDDEN)
            
            # Check if student profile exists
            if not hasattr(request.user, 'student_profile'):
                return Response({
                    'error': 'Student profile not found. Please complete your profile first.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Debug logging
            print(f"DEBUG: User object type: {type(request.user)}")
            print(f"DEBUG: User object: {request.user}")
            print(f"DEBUG: User attributes: {dir(request.user)}")
            print(f"DEBUG: Creating daily task for user {getattr(request.user, 'user_id', 'NO_USER_ID')} with role {getattr(request.user, 'role', 'NO_ROLE')}")
            print(f"DEBUG: Student profile: {request.user.student_profile}")
            print(f"DEBUG: Request data: {request.data}")
            
            # Check if a task already exists for today
            today = date.today()
            existing_task = DailyTask.objects.filter(
                student=request.user.student_profile,
                date=today
            ).first()
            
            print(f"DEBUG: Today's date: {today}")
            print(f"DEBUG: Existing task for today: {existing_task}")
            
            if existing_task:
                return Response({
                    'error': f'You already have a task entry for today ({today.strftime("%Y-%m-%d")}). You can update your existing entry or create a new one for a different date.',
                    'existing_task_id': str(existing_task.id),
                    'existing_task_date': existing_task.date.isoformat()
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Create the task
            result = super().create(request, *args, **kwargs)
            print(f"DEBUG: Task created successfully: {result}")
            return result
            
        except Exception as e:
            import traceback
            print(f"DEBUG: Error creating task: {str(e)}")
            print(f"DEBUG: Traceback: {traceback.format_exc()}")
            return Response({
                'error': f'Failed to create daily task: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def perform_create(self, serializer):
        serializer.save()


class DailyTaskListView(generics.ListAPIView):
    """
    List daily tasks for the authenticated student
    Supports filtering by date range, week, approval status
    """
    serializer_class = DailyTaskSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None  # Disable pagination to use our custom response format
    
    def get_queryset(self):
        try:
            user = self.request.user
            print(f"DEBUG: DailyTaskListView - User: {user}, Role: {getattr(user, 'role', 'NO_ROLE')}")
            print(f"DEBUG: Query params: {self.request.query_params}")
            
            # Students can only see their own tasks
            if user.role == 'student':
                if not hasattr(user, 'student_profile'):
                    print(f"DEBUG: No student profile found for user {user}")
                    return DailyTask.objects.none()
                
                # Debug: Check all tasks in database
                all_tasks = DailyTask.objects.all()
                print(f"DEBUG: Total tasks in database: {all_tasks.count()}")
                if all_tasks.exists():
                    print(f"DEBUG: Sample task student: {all_tasks.first().student.student_id if all_tasks.first().student else 'NO_STUDENT'}")
                
                queryset = DailyTask.objects.filter(student=user.student_profile)
                print(f"DEBUG: Initial queryset for student {user.student_profile}: {queryset.count()} tasks")
                print(f"DEBUG: Student profile ID: {user.student_profile.student_id}")
            # Lecturers and supervisors can see tasks of students they supervise
            elif user.role in ['lecturer', 'supervisor']:
                # For now, show all tasks - you can add supervision logic here
                queryset = DailyTask.objects.all()
                print(f"DEBUG: Found {queryset.count()} tasks for {user.role}")
            else:
                print(f"DEBUG: Unknown role: {getattr(user, 'role', 'NO_ROLE')}")
                return DailyTask.objects.none()
        except Exception as e:
            print(f"DEBUG: Error in get_queryset: {e}")
            import traceback
            traceback.print_exc()
            return DailyTask.objects.none()
        
        try:
            # Apply filters
            student_id = self.request.query_params.get('student')
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
            
            # Filter by specific student if provided (for lecturers/supervisors/admins)
            if student_id:
                print(f"DEBUG: Filtering by student_id: {student_id}")
                try:
                    student = get_object_or_404(Student, student_id=student_id)
                    print(f"DEBUG: Found student: {student}")
                    
                    # Students cannot access other students' tasks
                    if user.role == 'student':
                        print(f"DEBUG: Student trying to access another student's tasks - denied")
                        return DailyTask.objects.none()
                    
                    # For lecturers/supervisors/admins, filter by the specified student
                    queryset = queryset.filter(student=student)
                    print(f"DEBUG: After student filter: {queryset.count()} tasks")
                except Exception as e:
                    print(f"DEBUG: Error filtering by student: {e}")
                    return DailyTask.objects.none()
            else:
                print(f"DEBUG: No student_id provided, using authenticated user's tasks")
            
            if approved is not None:
                if approved.lower() in ['true', '1']:
                    queryset = queryset.filter(approved=True)
                elif approved.lower() in ['false', '0']:
                    queryset = queryset.filter(approved=False)
            
            # Order by date (most recent first) and then by creation time
            final_queryset = queryset.order_by('-date', '-created_at')
            print(f"DEBUG: Final queryset count: {final_queryset.count()}")
            
            # Apply limit if specified (after ordering)
            limit = self.request.query_params.get('limit')
            if limit:
                try:
                    limit = int(limit)
                    if limit > 0:
                        final_queryset = final_queryset[:limit]
                        print(f"DEBUG: Applied limit {limit}, final queryset count: {final_queryset.count()}")
                except ValueError:
                    pass
            
            return final_queryset
        except Exception as e:
            print(f"DEBUG: Error in filter processing: {e}")
            import traceback
            traceback.print_exc()
            return DailyTask.objects.none()
    
    def list(self, request, *args, **kwargs):
        """
        Override list method to use custom response format
        """
        try:
            queryset = self.get_queryset()
            serializer = self.get_serializer(queryset, many=True)
            return self.get_paginated_response(serializer.data)
        except Exception as e:
            print(f"DEBUG: Error in list method: {e}")
            import traceback
            traceback.print_exc()
            return Response({
                'error': 'Internal server error occurred while fetching tasks',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def get_paginated_response(self, data):
        """
        Override to return consistent response format
        """
        try:
            print(f"DEBUG: get_paginated_response called with data length: {len(data)}")
            
            # Since pagination is disabled, just return the data in the expected format
            response_data = {
                'count': len(data),
                'next': None,
                'previous': None,
                'results': data
            }
            print(f"DEBUG: Returning non-paginated response: {response_data}")
            return Response(response_data)
        except Exception as e:
            print(f"DEBUG: Error in get_paginated_response: {e}")
            import traceback
            traceback.print_exc()
            return Response({
                'error': 'Internal server error occurred while formatting response',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


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