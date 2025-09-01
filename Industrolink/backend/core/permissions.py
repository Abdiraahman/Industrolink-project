from rest_framework import permissions


class IsAdminUser(permissions.BasePermission):
    """
    Custom permission to only allow admin users.
    """
    
    def has_permission(self, request, view):
        # Check if user is authenticated and is staff
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.is_staff
        )
    
    def has_object_permission(self, request, view, obj):
        # Admin users have full access to all objects
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.is_staff
        )
