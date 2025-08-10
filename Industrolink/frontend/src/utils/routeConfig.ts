import { lazy } from 'react';
import { UserRole } from '../types/user';
import { Permission } from './permissions';

// Lazy load dashboard components
const StudentDashboard = lazy(() => import('../pages/dashboard/StudentDashboard'));
const LecturerDashboard = lazy(() => import('../pages/dashboard/LecturerDashboard'));
const SupervisorDashboard = lazy(() => import('../pages/dashboard/SupervisorDashboard'));
const AdminDashboard = lazy(() => import('../pages/dashboard/AdminDashboard'));

// Lazy load other components
const Profile = lazy(() => import('../pages/Profile'));
const Submissions = lazy(() => import('../pages/Submissions'));
const Evaluations = lazy(() => import('../pages/Evaluations'));
const Internships = lazy(() => import('../pages/Internships'));
const Users = lazy(() => import('../pages/Users'));
const Reports = lazy(() => import('../pages/Reports'));

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
    path: '/',
    component: lazy(() => import('../pages/Home')),
    requireAuth: false,
    title: 'Home',
    description: 'Welcome to Industrolink'
  },
  {
    path: '/auth/login',
    component: lazy(() => import('../pages/auth/Login')),
    requireAuth: false,
    title: 'Login',
    description: 'Sign in to your account'
  },
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
    path: '/submissions',
    component: Submissions,
    requiredPermissions: ['read:submissions'],
    requireAuth: true,
    title: 'Submissions',
    description: 'View and manage submissions',
    icon: 'file-text',
    showInNav: true
  },
  {
    path: '/evaluations',
    component: Evaluations,
    requiredPermissions: ['read:evaluations'],
    requireAuth: true,
    title: 'Evaluations',
    description: 'View and manage evaluations',
    icon: 'clipboard-check',
    showInNav: true
  },
  {
    path: '/internships',
    component: Internships,
    requiredPermissions: ['read:internships'],
    requireAuth: true,
    title: 'Internships',
    description: 'Manage internship programs',
    icon: 'briefcase',
    showInNav: true
  },
  {
    path: '/users',
    component: Users,
    requiredPermissions: ['read:users'],
    requireAuth: true,
    title: 'Users',
    description: 'Manage user accounts',
    icon: 'users',
    showInNav: true
  },
  {
    path: '/reports',
    component: Reports,
    allowedRoles: ['student'],
    requireAuth: true,
    requiredPermissions: ['read:reports'],
    title: 'Reports',
    icon: 'file-text',
    showInNav: true
  },
  {
    path: '/feedback',
    component: Evaluations, // or your Feedback page
    allowedRoles: ['student'],
    requireAuth: true,
    requiredPermissions: ['read:evaluations'],
    title: 'Feedback',
    icon: 'clipboard-check',
    showInNav: true
  },
  {
    path: '/settings',
    component: Profile, // or a dedicated Settings page if you have one
    allowedRoles: ['student'],
    requireAuth: true,
    requiredPermissions: ['read:profile'],
    title: 'Settings',
    icon: 'settings',
    showInNav: true
  },
  {
    path: '/unauthorized',
    component: lazy(() => import('../pages/Unauthorized')),
    requireAuth: false,
    title: 'Unauthorized',
    description: 'Access denied'
  },
  {
    path: '/not-found',
    component: lazy(() => import('../pages/NotFound')),
    requireAuth: false,
    title: 'Not Found',
    description: 'Page not found'
  }
];

export const getRoutesForRole = (role: UserRole): RouteConfig[] => {
  return ROUTE_CONFIGS.filter(route => {
    if (!route.requireAuth) return true;
    if (route.allowedRoles && !route.allowedRoles.includes(role)) return false;
    return true;
  });
};

export const getNavRoutesForRole = (role: UserRole): RouteConfig[] => {
  return getRoutesForRole(role).filter(route => route.showInNav);
};

export const findRouteByPath = (path: string): RouteConfig | undefined => {
  return ROUTE_CONFIGS.find(route => route.path === path);
};

export const getRouteTitle = (path: string): string => {
  const route = findRouteByPath(path);
  return route?.title || 'Unknown Page';
}; 