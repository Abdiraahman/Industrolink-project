// useAuthExtended is a custom hook that extends the base auth context with RBAC utilities.
// It provides helpers for permission and role checks, making it easy to use RBAC in components.

import { useAuthContext } from '../context/AuthContext';
import { Permission, hasPermission, hasAnyPermission, hasAllPermissions } from '../utils/permissions';
import { UserRole } from '../types/user';

export const useAuthExtended = () => {
  const auth = useAuthContext();

  /**
   * Checks if the current user has a specific permission.
   * @param permission - The permission to check
   * @returns true if user has the permission
   */
  const checkPermission = (permission: Permission): boolean => {
    return auth.user ? hasPermission(auth.user.role, permission) : false;
  };

  /**
   * Checks if the current user has ANY of the given permissions.
   * @param permissions - Array of permissions
   * @returns true if user has at least one
   */
  const checkAnyPermission = (permissions: Permission[]): boolean => {
    return auth.user ? hasAnyPermission(auth.user.role, permissions) : false;
  };

  /**
   * Checks if the current user has ALL of the given permissions.
   * @param permissions - Array of permissions
   * @returns true if user has all
   */
  const checkAllPermissions = (permissions: Permission[]): boolean => {
    return auth.user ? hasAllPermissions(auth.user.role, permissions) : false;
  };

  /**
   * Checks if the current user has a specific role.
   * @param role - The role to check
   * @returns true if user has the role
   */
  const isRole = (role: UserRole): boolean => {
    return auth.user?.role === role;
  };

  /**
   * Checks if the current user has ANY of the given roles.
   * @param roles - Array of roles
   * @returns true if user has at least one
   */
  const isAnyRole = (roles: UserRole[]): boolean => {
    return auth.user ? roles.includes(auth.user.role) : false;
  };

  /**
   * Flexible access check for single or multiple permissions.
   * @param permission - Single permission
   * @param permissions - Array of permissions
   * @param requireAll - If true, require all; else, any
   * @returns true if user has required access
   */
  const canAccess = (permission?: Permission, permissions?: Permission[], requireAll = false): boolean => {
    if (!auth.user) return false;
    
    if (permission) {
      return checkPermission(permission);
    }
    
    if (permissions && permissions.length > 0) {
      return requireAll ? checkAllPermissions(permissions) : checkAnyPermission(permissions);
    }
    
    return true;
  };

  // Return all auth context values plus RBAC helpers
  return {
    ...auth,
    checkPermission,
    checkAnyPermission,
    checkAllPermissions,
    isRole,
    isAnyRole,
    canAccess,
  };
}; 