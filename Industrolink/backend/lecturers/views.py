# lecturers/views.py
from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.views import APIView
from django.db.models import Q
from .models import Lecturer, LecturerStudentAssignment
from .serializers import (
    LecturerProfileSerializer, 
    StudentListSerializer,
    LecturerStudentAssignmentSerializer,
    LecturerStudentAssignmentCreateSerializer
)
from students.models import Student, DailyTask
from users.models import User


class LecturerProfileCreateView(generics.CreateAPIView):
    serializer_class = LecturerProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def create(self, request, *args, **kwargs):
        if request.user.role != 'lecturer':
            return Response({
                'error': 'Only lecturers can create lecturer profiles'
            }, status=status.HTTP_403_FORBIDDEN)
        
        if hasattr(request.user, 'lecturer_profile'):
            return Response({
                'error': 'Lecturer profile already exists'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        return super().create(request, *args, **kwargs)


class LecturerProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = LecturerProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        # Check if user has a lecturer profile
        if not hasattr(self.request.user, 'lecturer_profile'):
            from rest_framework.exceptions import NotFound
            raise NotFound("Lecturer profile not found")
        return self.request.user.lecturer_profile


class LecturerStudentsView(generics.ListAPIView):
    """
    View for lecturers to see their assigned students
    """
    serializer_class = StudentListSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.role != 'lecturer':
            return Student.objects.none()
        
        try:
            # Get students assigned to this lecturer using the new lecturer field
            return Student.objects.filter(lecturer=self.request.user).select_related('user', 'company')
        except Exception as e:
            return Student.objects.none()
    
    def list(self, request, *args, **kwargs):
        try:
            return super().list(request, *args, **kwargs)
        except Exception as e:
            return Response({'error': 'Failed to fetch students'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class LecturerStudentAssignmentListView(generics.ListAPIView):
    """
    View for lecturers to see their student assignments
    """
    serializer_class = LecturerStudentAssignmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.role != 'lecturer':
            return LecturerStudentAssignment.objects.none()
        
        if not hasattr(self.request.user, 'lecturer_profile'):
            return LecturerStudentAssignment.objects.none()
        
        return LecturerStudentAssignment.objects.filter(
            lecturer=self.request.user.lecturer_profile,
            is_active=True
        )


class LecturerStudentDetailsView(APIView):
    """
    View for lecturers to get detailed information about a specific student
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, student_id):
        if request.user.role != 'lecturer':
            return Response({'error': 'Only lecturers can access this view'}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            # Get the student and verify they are assigned to this lecturer
            student = Student.objects.get(student_id=student_id, lecturer=request.user)
        except Student.DoesNotExist:
            return Response({'error': 'Student not found or not assigned to you'}, status=status.HTTP_404_NOT_FOUND)
        
        # Get student details
        student_data = {
            'user_id': student.user.user_id,
            'email': student.user.email,
            'first_name': student.user.first_name,
            'last_name': student.user.last_name,
            'registration_no': student.registration_no,
            'academic_year': student.academic_year,
            'course': student.course,
            'year_of_study': student.year_of_study,
            'company_name': student.company.name if student.company else None,
            'duration_in_weeks': student.duration_in_weeks,
            'start_date': student.start_date,
            'completion_date': student.completion_date,
            'created_at': student.created_at
        }
        
        # Get recent tasks
        recent_tasks = DailyTask.objects.filter(student=student).order_by('-created_at')[:10]
        tasks_data = []
        for task in recent_tasks:
            tasks_data.append({
                'id': str(task.id),
                'description': task.description,
                'date': task.date,
                'hours_spent': task.hours_spent,
                'approved': task.approved,
                'created_at': task.created_at,
                'task_category': task.task_category.name if task.task_category else None,
                'tools_used': task.tools_used,
                'skills_applied': task.skills_applied
            })
        
        student_data['recent_tasks'] = tasks_data
        
        return Response(student_data)


class LecturerTaskManagementView(APIView):
    """
    View for lecturers to manage and view tasks from their assigned students
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        if request.user.role != 'lecturer':
            return Response({'error': 'Only lecturers can access this view'}, status=status.HTTP_403_FORBIDDEN)
        
        # Get query parameters
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        student_id = request.query_params.get('student_id')
        approved = request.query_params.get('approved')
        
        # Get assigned students
        assigned_students = Student.objects.filter(lecturer=request.user)
        
        # Build query for tasks
        tasks_query = DailyTask.objects.filter(student__in=assigned_students)
        
        # Apply filters
        if start_date:
            tasks_query = tasks_query.filter(date__gte=start_date)
        if end_date:
            tasks_query = tasks_query.filter(date__lte=end_date)
        if student_id:
            tasks_query = tasks_query.filter(student__student_id=student_id)
        if approved is not None:
            tasks_query = tasks_query.filter(approved=approved.lower() == 'true')
        
        # Order by date (most recent first)
        tasks = tasks_query.order_by('-date', '-created_at')
        
        # Serialize tasks
        tasks_data = []
        for task in tasks:
            tasks_data.append({
                'id': str(task.id),
                'student': {
                    'user_id': task.student.user.user_id,
                    'name': f"{task.student.user.first_name} {task.student.user.last_name}",
                    'email': task.student.user.email,
                    'registration_no': task.student.registration_no
                },
                'description': task.description,
                'date': task.date,
                'hours_spent': task.hours_spent,
                'approved': task.approved,
                'created_at': task.created_at,
                'task_category': task.task_category.name if task.task_category else None,
                'tools_used': task.tools_used,
                'skills_applied': task.skills_applied,
                'supervisor_comments': task.supervisor_comments
            })
        
        return Response({
            'tasks': tasks_data,
            'total_count': len(tasks_data)
        })
    
    # Task approval is now handled by supervisors only
    # Lecturers can only view tasks
