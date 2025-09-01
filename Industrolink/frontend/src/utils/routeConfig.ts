import { lazy } from 'react';
import { UserRole } from '../types/user';
import { Permission } from './permissions';

// Lazy load dashboard components
const StudentDashboard = lazy(() => import('../pages/dashboard/StudentDashboard'));
const LecturerDashboard = lazy(() => import('../pages/dashboard/LecturerDashboard'));
const SupervisorDashboard = lazy(() => import('../pages/dashboard/SupervisorDashboard'));
const AdminDashboard = lazy(() => import('../pages/dashboard/AdminDashboard'));

// Lazy load student management components
const SupervisorStudents = lazy(() => import('../pages/supervisor/SupervisorStudents'));
const LecturerStudents = lazy(() => import('../pages/lecturer/LecturerStudents'));

// Lazy load other components
const Profile = lazy(() => import('../pages/profile/ProfileEdit'));
const Tasks = lazy(() => import('../pages/tasks/TaskManagement'));
const Feedback = lazy(() => import('../pages/feedback/FeedbackManagement'));
const AdminUsers = lazy(() => import('../pages/admin/ManageUsers'));

export interface RouteConfig {
  path: string;
  component: React.LazyExoticComponent<React.ComponentType<any>>;
  allowedRoles?: UserRole[];
  requiredPermissions?: Permission[];
  requireAuth: boolean;
  exact?: boolean;
  title: string;
  description?: string;
  icon?: string;
  showInNav?: boolean;
  children?: RouteConfig[];
}

export const ROUTE_CONFIGS: RouteConfig[] = [
  {
    path: '/dashboard',
    component: StudentDashboard,
    allowedRoles: ['student'],
    requireAuth: true,
    title: 'Dashboard',
    icon: 'home',
    showInNav: true
  },
  {
    path: '/lecturer/dashboard',
    component: LecturerDashboard,
    allowedRoles: ['lecturer'],
    requireAuth: true,
    title: 'Lecturer Dashboard',
    description: 'Manage and review student submissions',
    icon: 'book-open',
    showInNav: true
  },
  {
    path: '/supervisor/dashboard',
    component: SupervisorDashboard,
    allowedRoles: ['supervisor'],
    requireAuth: true,
    title: 'Supervisor Dashboard',
    description: 'Manage internships and evaluations',
    icon: 'briefcase',
    showInNav: true
  },
  {
    path: '/admin/dashboard',
    component: AdminDashboard,
    allowedRoles: ['admin'],
    requireAuth: true,
    title: 'Admin Dashboard',
    description: 'System administration and management',
    icon: 'settings',
    showInNav: true
  },
  {
    path: '/supervisor/students',
    component: SupervisorStudents,
    allowedRoles: ['supervisor'],
    requireAuth: true,
    title: 'Company Students',
    description: 'Manage students under your company',
    icon: 'users',
    showInNav: true
  },
  {
    path: '/lecturer/students',
    component: LecturerStudents,
    allowedRoles: ['lecturer'],
    requireAuth: true,
    title: 'Assigned Students',
    description: 'Students assigned to you by supervisors',
    icon: 'graduation-cap',
    showInNav: true
  },
  {
    path: '/profile',
    component: Profile,
    requiredPermissions: ['read:profile'],
    requireAuth: true,
    title: 'Profile',
    description: 'Manage your profile information',
    icon: 'user',
    showInNav: true
  },
  {
    path: '/tasks',
    component: Tasks,
    requiredPermissions: ['read:submissions'],
    requireAuth: true,
    title: 'Tasks',
    description: 'View and manage tasks',
    icon: 'file-text',
    showInNav: true
  },
  {
    path: '/feedback',
    component: Feedback,
    requiredPermissions: ['read:evaluations'],
    requireAuth: true,
    title: 'Feedback',
    description: 'View and manage feedback',
    icon: 'clipboard-check',
    showInNav: true
  },
  {
    path: '/admin/users',
    component: AdminUsers,
    allowedRoles: ['admin'],
    requireAuth: true,
    title: 'User Management',
    description: 'Manage user accounts',
    icon: 'users',
    showInNav: true
  },
  {
    path: '/unauthorized',
    component: lazy(() => import('../pages/system/Unauthorized')),
    requireAuth: false,
    title: 'Unauthorized',
    description: 'Access denied'
  },
  {
    path: '/not-found',
    component: lazy(() => import('../pages/system/NotFound')),
    requireAuth: false,
    title: 'Not Found',
    description: 'Page not found'
  }
];

export const getRoutesForRole = (role: UserRole): RouteConfig[] =>
  ROUTE_CONFIGS.filter(route => {
    // If route has specific role restrictions, check them
    if (route.allowedRoles && route.allowedRoles.length > 0) {
      return route.allowedRoles.includes(role);
    }
    
    // If route has permission requirements, include it (permissions will be checked at runtime)
    if (route.requiredPermissions && route.requiredPermissions.length > 0) {
      return true;
    }
    
    // If no restrictions, include the route
    return true;
  });

export const getNavRoutesForRole = (role: UserRole): RouteConfig[] => {
  const routes = getRoutesForRole(role);
  return routes.filter(route => route.showInNav);
};

export const findRouteByPath = (path: string): RouteConfig | undefined => {
  return ROUTE_CONFIGS.find(route => route.path === path);
};

export const getRouteTitle = (path: string): string => {
  const route = findRouteByPath(path);
  return route?.title || 'Unknown Page';
}; 