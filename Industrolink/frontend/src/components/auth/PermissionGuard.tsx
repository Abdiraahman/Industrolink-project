// PermissionGuard is a reusable component for permission-based UI protection.
// It conditionally renders its children based on the user's permissions.
// Supports single or multiple permissions, fallback content, and flexible logic (ANY/ALL).

import React from 'react';
import { useAuthContext } from '../../context/AuthContext';
import { Permission, hasPermission, hasAnyPermission, hasAllPermissions } from '../../utils/permissions';

// Props for PermissionGuard:
// - permission: a single permission to check
// - permissions: an array of permissions to check (use with requireAll)
// - requireAll: if true, user must have ALL permissions; if false, ANY permission suffices
// - fallback: content to show if user lacks permission
// - showFallback: whether to show fallback or render nothing
interface PermissionGuardProps {
  children: React.ReactNode;
  permission?: Permission;
  permissions?: Permission[];
  requireAll?: boolean; // If true, user must have ALL permissions; if false, ANY permission
  fallback?: React.ReactNode;
  showFallback?: boolean;
}

const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  permission,
  permissions = [],
  requireAll = false,
  fallback = null,
  showFallback = true
}) => {
  const { user } = useAuthContext();

  // If not authenticated, show fallback or nothing
  if (!user) {
    return showFallback ? <>{fallback}</> : null;
  }

  let hasAccess = false;

  // Check single permission
  if (permission) {
    hasAccess = hasPermission(user.role, permission);
  } else if (permissions.length > 0) {
    // Check multiple permissions (ALL or ANY)
    hasAccess = requireAll 
      ? hasAllPermissions(user.role, permissions)
      : hasAnyPermission(user.role, permissions);
  }

  // If user lacks required permission(s), show fallback or nothing
  if (!hasAccess) {
    return showFallback ? <>{fallback}</> : null;
  }

  // User has permission(s), render children
  return <>{children}</>;
};

export default PermissionGuard; 