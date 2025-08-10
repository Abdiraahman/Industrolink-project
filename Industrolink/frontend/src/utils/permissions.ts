// Permission and RBAC utilities for the Industrolink project
// This file defines all available permissions, role-permission mappings, and helper functions for permission checks.

import { UserRole } from '../types/user';

// List of all possible permissions in the system.
// Each permission is a string in the format 'action:resource'.
export type Permission = 
  | 'read:profile' | 'write:profile' // Profile management
  | 'read:students' | 'write:students' // Student data
  | 'read:submissions' | 'write:submissions' | 'grade:submissions' // Submissions
  | 'read:evaluations' | 'write:evaluations' // Evaluations
  | 'read:internships' | 'write:internships' | 'manage:internships' // Internships
  | 'read:users' | 'write:users' | 'delete:users' // User management
  | 'read:reports' | 'generate:reports' // Reports
  | 'system:admin'; // System admin

// Mapping of user roles to their allowed permissions.
// This is the core of the RBAC system: each role is assigned a set of permissions.
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  student: [
    'read:profile', 'write:profile',
    'read:submissions', 'write:submissions',
    'read:evaluations',
    'read:reports' // Added so Reports sidebar link appears
  ],
  lecturer: [
    'read:profile', 'write:profile',
    'read:students', 'read:submissions', 'grade:submissions',
    'read:evaluations', 'write:evaluations',
    'read:reports'
  ],
  supervisor: [
    'read:profile', 'write:profile',
    'read:students', 'read:submissions', 'grade:submissions',
    'read:evaluations', 'write:evaluations',
    'read:internships', 'write:internships',
    'read:reports', 'generate:reports'
  ],
  admin: [
    'read:profile', 'write:profile',
    'read:students', 'write:students',
    'read:submissions', 'write:submissions', 'grade:submissions',
    'read:evaluations', 'write:evaluations',
    'read:internships', 'write:internships', 'manage:internships',
    'read:users', 'write:users', 'delete:users',
    'read:reports', 'generate:reports',
    'system:admin'
  ]
};

/**
 * Checks if a user role has a specific permission.
 * @param userRole - The user's role
 * @param permission - The permission to check
 * @returns true if the role has the permission, false otherwise
 */
export const hasPermission = (userRole: UserRole, permission: Permission): boolean => {
  return ROLE_PERMISSIONS[userRole]?.includes(permission) || false;
};

/**
 * Checks if a user role has ANY of the given permissions.
 * @param userRole - The user's role
 * @param permissions - Array of permissions to check
 * @returns true if the role has at least one of the permissions
 */
export const hasAnyPermission = (userRole: UserRole, permissions: Permission[]): boolean => {
  return permissions.some(permission => hasPermission(userRole, permission));
};

/**
 * Checks if a user role has ALL of the given permissions.
 * @param userRole - The user's role
 * @param permissions - Array of permissions to check
 * @returns true if the role has all of the permissions
 */
export const hasAllPermissions = (userRole: UserRole, permissions: Permission[]): boolean => {
  return permissions.every(permission => hasPermission(userRole, permission));
};

/**
 * Returns all permissions for a given user role.
 * @param userRole - The user's role
 * @returns Array of permissions for the role
 */
export const getRolePermissions = (userRole: UserRole): Permission[] => {
  return ROLE_PERMISSIONS[userRole] || [];
};

/**
 * Returns a human-readable description for a permission.
 * @param permission - The permission string
 * @returns Description of the permission
 */
export const getPermissionDescription = (permission: Permission): string => {
  const descriptions: Record<Permission, string> = {
    'read:profile': 'View user profile information',
    'write:profile': 'Edit user profile information',
    'read:students': 'View student information',
    'write:students': 'Edit student information',
    'read:submissions': 'View submissions',
    'write:submissions': 'Create and edit submissions',
    'grade:submissions': 'Grade student submissions',
    'read:evaluations': 'View evaluations',
    'write:evaluations': 'Create and edit evaluations',
    'read:internships': 'View internship information',
    'write:internships': 'Create and edit internships',
    'manage:internships': 'Manage internship programs',
    'read:users': 'View user accounts',
    'write:users': 'Create and edit user accounts',
    'delete:users': 'Delete user accounts',
    'read:reports': 'View reports',
    'generate:reports': 'Generate new reports',
    'system:admin': 'Full system administration access'
  };
  
  return descriptions[permission] || 'Unknown permission';
}; 