from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import login, logout, authenticate
from django.utils import timezone
from django.conf import settings
from django.db.models import Q, Count
from datetime import timedelta
import secrets
import string

from .models import AdminInvite, AdminAction, AdminSettings
from .serializers import (
    AdminUserSerializer, AdminUserLoginSerializer, AdminInviteSerializer,
    AdminInviteCreateSerializer, AdminRegisterSerializer, AdminActionSerializer,
    AdminSettingsSerializer, UserManagementSerializer, StudentAssignmentSerializer,
    UserListSerializer, DashboardStatsSerializer
)
from .permissions import IsAdminUser
from users.models import User
from students.models import Student, DailyTask
from lecturers.models import Lecturer
from supervisors.models import Supervisor, Company

class AdminLoginView(APIView):
    """Admin login view"""
    
    def post(self, request):
        try:
            email = request.data.get('email')
            password = request.data.get('password')
            
            # First, let's check if the user exists at all
            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                return Response({'error': 'User not found'}, status=status.HTTP_401_UNAUTHORIZED)
            
            # Now try to authenticate
            authenticated_user = authenticate(email=email, password=password)
            
            if not authenticated_user:
                return Response({'error': 'Invalid password'}, status=status.HTTP_401_UNAUTHORIZED)
            
            if not authenticated_user.is_active:
                return Response({'error': 'Account is deactivated'}, status=status.HTTP_401_UNAUTHORIZED)
            
            if authenticated_user.role != 'admin':
                return Response({'error': 'Access denied. Admin role required'}, status=status.HTTP_401_UNAUTHORIZED)
            
            login(request, authenticated_user)

            # Issue JWT tokens in HTTP-only cookies (same as regular user login)
            refresh = RefreshToken.for_user(authenticated_user)
            access_token = refresh.access_token

            # Log the action
            AdminAction.objects.create(
                admin=authenticated_user,
                action_type='admin_login',
                description=f'Admin {authenticated_user.email} logged in'
            )

            response = Response({
                'message': 'Login successful',
                'user': AdminUserSerializer(authenticated_user).data
            })

            # Set cookies
            response.set_cookie(
                'access_token',
                str(access_token),
                max_age=60 * 15,
                httponly=True,
                secure=False,  # Set True in production (HTTPS)
                samesite='Lax',
                path='/'
            )
            response.set_cookie(
                'refresh_token',
                str(refresh),
                max_age=60 * 60 * 24 * 7,
                httponly=True,
                secure=False,  # Set True in production (HTTPS)
                samesite='Lax',
                path='/'
            )

            return response
            
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class AdminLogoutView(APIView):
    """Admin logout view"""
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def post(self, request):
        # Log the action
        AdminAction.objects.create(
            admin=request.user,
            action_type='admin_logout',
            description=f'Admin {request.user.email} logged out'
        )
        
        logout(request)

        response = Response({'message': 'Logout successful'})
        # Clear cookies
        response.delete_cookie('access_token', path='/')
        response.delete_cookie('refresh_token', path='/')
        return response

class AdminInviteCreateView(APIView):
    """Create admin invitation"""
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def post(self, request):
        serializer = AdminInviteCreateSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            
            # Generate unique token
            token = ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(32))
            
            # Create invitation
            invite = AdminInvite.objects.create(
                email=email,
                token=token,
                created_by=request.user,
                expires_at=timezone.now() + timedelta(hours=24)
            )
            
            # Log the action
            AdminAction.objects.create(
                admin=request.user,
                action_type='admin_invite_sent',
                description=f'Admin invitation sent to {email}',
                metadata={'invite_id': str(invite.id)}
            )
            
            # TODO: Send email with invitation link
            invite_url = f"{request.build_absolute_uri('/').rstrip('/')}/admin/register/{token}"
            
            return Response({
                'message': 'Invitation sent successfully',
                'invite': AdminInviteSerializer(invite).data,
                'invite_url': invite_url
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class AdminRegisterView(APIView):
    """Admin registration via invitation"""
    
    def post(self, request, token):
        # Verify invitation
        try:
            invite = AdminInvite.objects.get(
                token=token,
                used=False,
                expires_at__gt=timezone.now()
            )
        except AdminInvite.DoesNotExist:
            return Response({'error': 'Invalid or expired invitation'}, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = AdminRegisterSerializer(data=request.data)
        if serializer.is_valid():
            # Check if email matches invitation
            if serializer.validated_data['email'] != invite.email:
                return Response({'error': 'Email does not match invitation'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Create admin user
            user = serializer.save()
            
            # Mark invitation as used
            invite.used = True
            invite.used_at = timezone.now()
            invite.used_by = user
            invite.save()
            
            # Log the action
            AdminAction.objects.create(
                admin=user,
                action_type='admin_registered',
                description=f'New admin registered: {user.email}',
                metadata={'invite_id': str(invite.id)}
            )
            
            return Response({
                'message': 'Admin account created successfully',
                'user': AdminUserSerializer(user).data
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class AdminDashboardView(APIView):
    """Admin dashboard with statistics"""
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def get(self, request):
        try:
            # Get statistics
            total_students = User.objects.filter(role='student').count()
            total_lecturers = User.objects.filter(role='lecturer').count()
            total_supervisors = User.objects.filter(role='supervisor').count()
            total_admins = User.objects.filter(role='admin').count()
            
            # Get pending approvals (users with incomplete profiles)
            pending_approvals = User.objects.filter(
                (Q(role__in=['lecturer', 'supervisor']) & Q(profile_completed=False)) | 
                Q(is_active=False)
            ).count()
            
            # Get recent actions with error handling
            try:
                # First, check if AdminAction table exists and has data
                action_count = AdminAction.objects.count()
                
                if action_count > 0:
                    recent_actions = AdminAction.objects.all()[:10]
                    
                    # Serialize actions with individual error handling
                    actions_data = []
                    for action in recent_actions:
                        try:
                            action_data = AdminActionSerializer(action).data
                            actions_data.append(action_data)
                        except Exception as action_error:
                            # Skip problematic actions
                            continue
                    
                    actions_data = actions_data
                else:
                    actions_data = []
                    
            except Exception as actions_error:
                actions_data = []
            
            # Create stats with fallback for actions
            stats = {
                'total_students': total_students,
                'total_lecturers': total_lecturers,
                'total_supervisors': total_supervisors,
                'total_admins': total_admins,
                'pending_approvals': pending_approvals,
                'recent_actions': actions_data if actions_data else []
            }
            
            serializer = DashboardStatsSerializer(stats)
            return Response(serializer.data)
            
        except Exception as e:
            return Response(
                {'error': f'Dashboard error: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class UserManagementView(APIView):
    """User management operations"""
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def post(self, request):
        serializer = UserManagementSerializer(data=request.data)
        if serializer.is_valid():
            action = serializer.validated_data['action']
            user_id = serializer.validated_data['user_id']
            reason = serializer.validated_data.get('reason', '')
            
            try:
                user = User.objects.get(user_id=user_id)
            except User.DoesNotExist:
                return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
            
            if action == 'activate':
                user.is_active = True
                action_type = 'account_activation'
                description = f'Account activated for {user.email}'
            elif action == 'deactivate':
                user.is_active = False
                action_type = 'account_deactivation'
                description = f'Account deactivated for {user.email}'
            elif action == 'delete':
                action_type = 'user_deletion'
                description = f'User {user.email} deleted'
                user.delete()
                
                # Log the action
                AdminAction.objects.create(
                    admin=request.user,
                    action_type=action_type,
                    description=description,
                    metadata={'deleted_user_email': user.email, 'reason': reason}
                )
                
                return Response({'message': 'User deleted successfully'})
            elif action == 'approve':
                user.profile_completed = True
                user.is_active = True
                action_type = 'user_approval'
                description = f'Profile approved for {user.email}'
            else:
                return Response({'error': 'Invalid action'}, status=status.HTTP_400_BAD_REQUEST)
            
            if action != 'delete':
                user.save()
                
                # Log the action
                AdminAction.objects.create(
                    admin=request.user,
                    action_type=action_type,
                    target_user=user,
                    description=description,
                    metadata={'reason': reason}
                )
            
            return Response({'message': f'User {action} successful'})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class StudentAssignmentView(APIView):
    """Student assignment operations"""
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def post(self, request):
        serializer = StudentAssignmentSerializer(data=request.data)
        if serializer.is_valid():
            student_id = serializer.validated_data['student_id']
            lecturer_id = serializer.validated_data['lecturer_id']
            action = serializer.validated_data['action']
            
            try:
                student = Student.objects.get(user_id=student_id)
                lecturer = Lecturer.objects.get(user_id=lecturer_id)
            except (Student.DoesNotExist, Lecturer.DoesNotExist):
                return Response({'error': 'Student or lecturer not found'}, status=status.HTTP_404_NOT_FOUND)
            
            if action == 'assign':
                student.lecturer = lecturer
                description = f'Student {student.user.email} assigned to lecturer {lecturer.user.email}'
            elif action == 'unassign':
                student.lecturer = None
                description = f'Student {student.user.email} unassigned from lecturer {lecturer.user.email}'
            else:
                return Response({'error': 'Invalid action'}, status=status.HTTP_400_BAD_REQUEST)
            
            student.save()
            
            # Log the action
            AdminAction.objects.create(
                admin=request.user,
                action_type='student_assignment',
                target_user=student.user,
                description=description,
                metadata={'lecturer_id': str(lecturer_id), 'action': action}
            )
            
            return Response({'message': f'Student {action} successful'})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserListView(APIView):
    """List users with filters"""
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def get(self, request):
        # Get query parameters
        role = request.query_params.get('role', 'all')
        status_filter = request.query_params.get('status', 'all')
        search = request.query_params.get('search', '')
        page = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 20))
        
        # Build queryset
        queryset = User.objects.all()
        
        # Apply filters
        if role != 'all':
            queryset = queryset.filter(role=role)
        
        if status_filter == 'active':
            queryset = queryset.filter(is_active=True)
        elif status_filter == 'inactive':
            queryset = queryset.filter(is_active=False)
        elif status_filter == 'pending':
            queryset = queryset.filter(profile_completed=False)
        
        if search:
            queryset = queryset.filter(
                Q(email__icontains=search) |
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search)
            )
        
        # Pagination



        
        start = (page - 1) * page_size
        end = start + page_size
        users = queryset[start:end]
        
        # Serialize data
        user_data = UserListSerializer(users, many=True).data
        
        return Response({
            'users': user_data,
            'total': queryset.count(),
            'page': page,
            'page_size': page_size,
            'total_pages': (queryset.count() + page_size - 1) // page_size
        })

class AdminInviteListView(APIView):
    """List admin invitations"""
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def get(self, request):
        invites = AdminInvite.objects.all().order_by('-created_at')
        serializer = AdminInviteSerializer(invites, many=True)
        return Response(serializer.data)

class AdminInviteDeleteView(APIView):
    """Delete admin invitation"""
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def delete(self, request, pk):
        try:
            invite = AdminInvite.objects.get(pk=pk)
        except AdminInvite.DoesNotExist:
            return Response({'error': 'Invitation not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Log the action
        AdminAction.objects.create(
            admin=request.user,
            action_type='invite_deletion',
            description=f'Invitation for {invite.email} deleted',
            metadata={'invite_email': invite.email, 'invite_id': str(invite.id)}
        )
        
        invite.delete()
        return Response({'message': 'Invitation deleted successfully'})

class AdminActionListView(APIView):
    """List admin actions"""
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def get(self, request):
        actions = AdminAction.objects.all().order_by('-created_at')
        serializer = AdminActionSerializer(actions, many=True)
        return Response(serializer.data)

class AdminSettingsListView(APIView):
    """List admin settings"""
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def get(self, request):
        settings = AdminSettings.objects.all().order_by('key')
        serializer = AdminSettingsSerializer(settings, many=True)
        return Response(serializer.data)

class AdminSettingsUpdateView(APIView):
    """Update admin settings"""
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def patch(self, request, pk):
        try:
            setting = AdminSettings.objects.get(pk=pk)
        except AdminSettings.DoesNotExist:
            return Response({'error': 'Setting not found'}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = AdminSettingsSerializer(setting, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            
            # Log the action
            AdminAction.objects.create(
                admin=request.user,
                action_type='setting_update',
                description=f'Setting {setting.key} updated to {serializer.validated_data.get("value", setting.value)}',
                metadata={'setting_key': setting.key, 'old_value': setting.value, 'new_value': serializer.validated_data.get("value", setting.value)}
            )
            
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class AdminSessionVerifyView(APIView):
    """Verify admin session is still valid"""
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def get(self, request):
        try:
            # Check if user is still active and has admin role
            if not request.user.is_active or request.user.role != 'admin':
                return Response({'error': 'Invalid session'}, status=status.HTTP_401_UNAUTHORIZED)
            
            # Log the action
            AdminAction.objects.create(
                admin=request.user,
                action_type='session_verification',
                description=f'Session verified for admin {request.user.email}'
            )
            
            return Response({
                'valid': True,
                'user': AdminUserSerializer(request.user).data
            })
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AdminTestView(APIView):
    """Test endpoint to check admin functionality"""
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def get(self, request):
        try:
            # Test basic functionality
            test_data = {
                'user_info': {
                    'email': request.user.email,
                    'role': request.user.role,
                    'is_active': request.user.is_active
                },
                'admin_actions_count': AdminAction.objects.count(),
                'admin_invites_count': AdminInvite.objects.count(),
                'admin_settings_count': AdminSettings.objects.count()
            }
            
            return Response(test_data)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UserDetailsView(APIView):
    """Get detailed user information for admin panel"""
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def get(self, request, user_id):
        try:
            # Get the user
            try:
                user = User.objects.get(user_id=user_id)
            except User.DoesNotExist:
                return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
            
            # Base user data
            user_data = {
                'user_id': user.user_id,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'role': user.role,
                'is_active': user.is_active,
                'profile_completed': user.profile_completed,
                'created_at': user.created_at,
                'email_verified': user.email_verified
            }
            
            # Role-specific details
            if user.role == 'student':
                try:
                    student_profile = Student.objects.get(user=user)
                    user_data['student_details'] = {
                        'registration_no': student_profile.registration_no,
                        'academic_year': student_profile.academic_year,
                        'course': student_profile.course,
                        'year_of_study': student_profile.year_of_study,
                        'company_name': student_profile.company.name if student_profile.company else None,
                        'duration_in_weeks': student_profile.duration_in_weeks,
                        'start_date': student_profile.start_date,
                        'completion_date': student_profile.completion_date
                    }
                    
                    # Get recent daily tasks
                    recent_tasks = DailyTask.objects.filter(student=student_profile).order_by('-created_at')[:5]
                    user_data['recent_tasks'] = []
                    for task in recent_tasks:
                        user_data['recent_tasks'].append({
                            'id': str(task.id),
                            'description': task.description,
                            'date': task.date,
                            'hours_spent': task.hours_spent,
                            'approved': task.approved,
                            'created_at': task.created_at
                        })
                        
                except Student.DoesNotExist:
                    user_data['student_details'] = None
                    user_data['recent_tasks'] = []
                    
            elif user.role == 'lecturer':
                try:
                    lecturer_profile = Lecturer.objects.get(user=user)
                    user_data['lecturer_details'] = {
                        'department': lecturer_profile.department,
                        'title': lecturer_profile.title,
                        'created_at': lecturer_profile.created_at
                    }
                except Lecturer.DoesNotExist:
                    user_data['lecturer_details'] = None
                    
            elif user.role == 'supervisor':
                try:
                    supervisor_profile = Supervisor.objects.get(user=user)
                    user_data['supervisor_details'] = {
                        'company_name': supervisor_profile.company.name if supervisor_profile.company else None,
                        'position': supervisor_profile.position,
                        'phone_number': supervisor_profile.phone_number,
                        'created_at': supervisor_profile.created_at
                    }
                except Supervisor.DoesNotExist:
                    user_data['supervisor_details'] = None
            
            # Log the action
            AdminAction.objects.create(
                admin=request.user,
                action_type='user_details_viewed',
                target_user=user,
                description=f'Admin viewed details for user {user.email}',
                metadata={'viewed_user_role': user.role}
            )
            
            return Response(user_data)
            
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
