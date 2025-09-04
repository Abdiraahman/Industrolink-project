from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.pagination import PageNumberPagination
from django.db.models import Q
from .models import Supervisor, Company
from .serializers import SupervisorProfileSerializer, CompanySerializer, CompanyRegistrationSerializer
from students.models import Student
from students.serializers import StudentProfileSerializer
from lecturers.models import LecturerStudentAssignment
from lecturers.serializers import LecturerStudentAssignmentSerializer, StudentListSerializer
from students.models import DailyTask
from students.serializers import SupervisorTaskApprovalSerializer
from rest_framework.decorators import action
from django.db.models import Q
from datetime import datetime, timedelta
import calendar
from django.utils import timezone


class CompanyListView(generics.ListAPIView):
    serializer_class = CompanySerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = PageNumberPagination
    
    def get_queryset(self):
        return Company.objects.all()


class CompanyCreateView(generics.CreateAPIView):
    serializer_class = CompanyRegistrationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def create(self, request, *args, **kwargs):
        # Allow students and supervisors to create companies
        if request.user.role not in ['student', 'supervisor']:
            return Response({
                'error': 'Only students and supervisors can create companies'
            }, status=status.HTTP_403_FORBIDDEN)
        
        response = super().create(request, *args, **kwargs)
        return response


class SupervisorProfileCreateView(generics.CreateAPIView):
    serializer_class = SupervisorProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def create(self, request, *args, **kwargs):
        if request.user.role != 'supervisor':
            return Response({
                'error': 'Only supervisors can create supervisor profiles'
            }, status=status.HTTP_403_FORBIDDEN)
        
        if hasattr(request.user, 'supervisor_profile'):
            return Response({
                'error': 'Supervisor profile already exists'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        return super().create(request, *args, **kwargs)


class SupervisorProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        # Check if user has a supervisor profile
        if not hasattr(self.request.user, 'supervisor_profile'):
            from rest_framework.exceptions import NotFound
            raise NotFound("Supervisor profile not found")
        return self.request.user.supervisor_profile
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            from .serializers import SupervisorUpdateSerializer
            return SupervisorUpdateSerializer
        return SupervisorProfileSerializer


class SupervisorStudentsView(generics.ListAPIView):
    """
    View for supervisors to see students under their company
    """
    serializer_class = StudentListSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.role != 'supervisor':
            return Student.objects.none()
        
        if not hasattr(self.request.user, 'supervisor_profile'):
            return Student.objects.none()
        
        # Get students under the same company as the supervisor
        company = self.request.user.supervisor_profile.company
        return Student.objects.filter(company=company)


class SupervisorLecturerAssignmentsView(generics.ListAPIView):
    """
    View for supervisors to see lecturer-student assignments they made
    """
    serializer_class = LecturerStudentAssignmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.role != 'supervisor':
            return LecturerStudentAssignment.objects.none()
        
        if not hasattr(self.request.user, 'supervisor_profile'):
            return LecturerStudentAssignment.objects.none()
        
        return LecturerStudentAssignment.objects.filter(
            assigned_by=self.request.user.supervisor_profile
        )


class SupervisorTaskManagementView(generics.ListAPIView):
    """
    View for supervisors to see and manage tasks from their company students
    """
    serializer_class = SupervisorTaskApprovalSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.role != 'supervisor':
            return DailyTask.objects.none()
        
        if not hasattr(self.request.user, 'supervisor_profile'):
            return DailyTask.objects.none()
        
        # Get students under the same company as the supervisor
        company = self.request.user.supervisor_profile.company
        queryset = DailyTask.objects.filter(
            student__company=company
        ).select_related('student__user', 'task_category')
        
        # Apply filters
        student_id = self.request.query_params.get('student')
        if student_id:
            queryset = queryset.filter(student_id=student_id)
        
        approval_status = self.request.query_params.get('approved')
        if approval_status is not None:
            if approval_status.lower() == 'true':
                queryset = queryset.filter(approved=True)
            elif approval_status.lower() == 'false':
                queryset = queryset.filter(approved=False)
        
        date_from = self.request.query_params.get('date_from')
        if date_from:
            try:
                date_from = datetime.strptime(date_from, '%Y-%m-%d').date()
                queryset = queryset.filter(date__gte=date_from)
            except ValueError:
                pass
        
        date_to = self.request.query_params.get('date_to')
        if date_to:
            try:
                date_to = datetime.strptime(date_to, '%Y-%m-%d').date()
                queryset = queryset.filter(date__lte=date_to)
            except ValueError:
                pass
        
        week_number = self.request.query_params.get('week')
        if week_number:
            try:
                week_number = int(week_number)
                queryset = queryset.filter(week_number=week_number)
            except ValueError:
                pass
        
        return queryset.order_by('-date', '-created_at')

class SupervisorTaskApprovalView(generics.UpdateAPIView):
    """
    View for supervisors to approve individual tasks
    """
    serializer_class = SupervisorTaskApprovalSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = DailyTask.objects.all()
    
    def get_object(self):
        task = super().get_object()
        # Check if user is supervisor of the student's company
        if (self.request.user.role != 'supervisor' or 
            not hasattr(self.request.user, 'supervisor_profile') or
            task.student.company != self.request.user.supervisor_profile.company):
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You can only approve tasks from your company students")
        return task
    
    def update(self, request, *args, **kwargs):
        task = self.get_object()
        # Update with supervisor fields
        task.approved = True
        task.supervisor = request.user
        task.supervisor_comments = request.data.get('supervisor_comments', '')
        task.approved_at = timezone.now()
        task.save()
        return Response({'message': 'Task approved successfully'})

class SupervisorBulkTaskApprovalView(generics.GenericAPIView):
    """
    View for supervisors to approve multiple tasks at once
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        if request.user.role != 'supervisor':
            return Response({'error': 'Only supervisors can approve tasks'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        if not hasattr(request.user, 'supervisor_profile'):
            return Response({'error': 'Supervisor profile not found'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        task_ids = request.data.get('task_ids', [])
        comments = request.data.get('comments', '')
        
        if not task_ids:
            return Response({'error': 'No task IDs provided'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        # Get tasks and verify they belong to supervisor's company
        company = request.user.supervisor_profile.company
        tasks = DailyTask.objects.filter(
            id__in=task_ids,
            student__company=company,
            approved=False
        )
        
        if not tasks.exists():
            return Response({'error': 'No valid tasks found for approval'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        # Approve all tasks
        approved_count = 0
        for task in tasks:
            task.approved = True
            task.supervisor = request.user
            task.supervisor_comments = comments
            task.approved_at = timezone.now()
            task.save()
            approved_count += 1
        
        return Response({
            'message': f'Successfully approved {approved_count} tasks',
            'approved_count': approved_count
        })

class SupervisorWeeklyTasksView(generics.ListAPIView):
    """
    View for supervisors to see tasks grouped by week for a specific student
    """
    serializer_class = SupervisorTaskApprovalSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.role != 'supervisor':
            return DailyTask.objects.none()
        
        if not hasattr(self.request.user, 'supervisor_profile'):
            return DailyTask.objects.none()
        
        student_id = self.kwargs.get('student_id')
        if not student_id:
            return DailyTask.objects.none()
        
        # Get tasks for the specific student from supervisor's company
        company = self.request.user.supervisor_profile.company
        queryset = DailyTask.objects.filter(
            student_id=student_id,
            student__company=company,
            approved=False  # Only show unapproved tasks
        ).select_related('student__user', 'task_category')
        
        return queryset.order_by('week_number', 'date')
    
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        
        # Group tasks by week
        weekly_tasks = {}
        for task in queryset:
            week_key = f"{task.iso_year}-W{task.week_number:02d}"
            if week_key not in weekly_tasks:
                weekly_tasks[week_key] = []
            weekly_tasks[week_key].append(SupervisorTaskApprovalSerializer(task).data)
        
        # Sort weeks chronologically
        sorted_weeks = sorted(weekly_tasks.keys())
        
        return Response({
            'weekly_tasks': {week: weekly_tasks[week] for week in sorted_weeks},
            'total_tasks': queryset.count(),
            'total_weeks': len(weekly_tasks)
        })
