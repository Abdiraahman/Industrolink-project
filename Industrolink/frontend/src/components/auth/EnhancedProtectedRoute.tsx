// EnhancedProtectedRoute is a route guard for RBAC and permission-based access control.
// It protects routes based on authentication, user role, and required permissions.
// Redirects to login or fallback path if access is denied.

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthContext, UserRole } from '../../context/AuthContext';
import { Permission, hasPermission, hasAnyPermission } from '../../utils/permissions';

// Props for EnhancedProtectedRoute:
// - allowedRoles: restricts access to specific user roles
// - requiredPermission: a single permission required for access
// - requiredPermissions: array of permissions (user needs ANY)
// - requireAuth: if true, user must be authenticated
// - fallbackPath: where to redirect if access is denied
interface EnhancedProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requiredPermission?: Permission;
  requiredPermissions?: Permission[];
  requireAuth?: boolean;
  fallbackPath?: string;
}

const EnhancedProtectedRoute: React.FC<EnhancedProtectedRouteProps> = ({
  children,
  allowedRoles = [],
  requiredPermission,
  requiredPermissions = [],
  requireAuth = true,
  fallbackPath = '/unauthorized'
}) => {
  const { isAuthenticated, user, loading } = useAuthContext();
  const location = useLocation();

  // Show loading spinner while auth state is loading
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  // If authentication is required and user is not authenticated, redirect to login
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // If user object is missing, redirect to login
  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  // Check if user's role is allowed
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to={fallbackPath} replace />;
  }

  // Check if user has the required single permission
  if (requiredPermission && !hasPermission(user.role, requiredPermission)) {
    return <Navigate to={fallbackPath} replace />;
  }

  // Check if user has ANY of the required permissions
  if (requiredPermissions.length > 0 && !hasAnyPermission(user.role, requiredPermissions)) {
    return <Navigate to={fallbackPath} replace />;
  }

  // User is authorized, render the protected children
  return <>{children}</>;
};

export default EnhancedProtectedRoute; 