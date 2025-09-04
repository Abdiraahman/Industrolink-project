import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  FileText, 
  ClipboardCheck, 
  MessageSquare, 
  Settings, 
  Users,
  BarChart3,
  LogOut, 
  Menu, 
  X 
} from 'lucide-react';
import { useAuthExtended } from '../../hooks/useAuthExtended';
import PermissionGuard from '../auth/PermissionGuard';
import { Button } from '@/components/ui/button';
import { Permission } from '../../utils/permissions';
import { User, UserRole } from '../../types/user';

interface LayoutProps {
  user: User;
  onLogout: () => void;
}

interface MenuItem {
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  permission?: Permission;
  permissions?: Permission[];
  roles?: UserRole[];
}

const MainLayout: React.FC<LayoutProps> = ({ 
  user, 
  onLogout 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { checkPermission, isRole, isAnyRole } = useAuthExtended();
  const navigate = useNavigate();
  const location = useLocation();

  // Debug: Log the user object to see its structure (removed for production)
  // console.log('User object in MainLayout:', user);
  // console.log('User properties:', Object.keys(user));

  // Helper function to get user display name
  const getUserDisplayName = () => {
    // Check common property names for user's name
    if (user.name) return user.name;
    if (user.username) return user.username;
    if (user.fullName) return user.fullName;
    if (user.firstName) {
      return user.lastName ? `${user.firstName} ${user.lastName}` : user.firstName;
    }
    return user.email ? user.email.split('@')[0] : 'User';
  };

  // Helper function to get user initials
  const getUserInitials = () => {
    const displayName = getUserDisplayName();
    if (displayName && displayName !== 'User') {
      const nameParts = displayName.split(' ');
      if (nameParts.length > 1) {
        return `${nameParts[0].charAt(0)}${nameParts[1].charAt(0)}`.toUpperCase();
      }
      return displayName.charAt(0).toUpperCase();
    }
    return 'U';
  };

  // Define menu items with their paths and permissions
  const menuItems: MenuItem[] = [
    {
      path: '/dashboard',
      label: 'Dashboard',
      icon: Home,
      permission: 'read:profile'
    },
    {
      path: '/supervisor/students',
      label: 'Company Students',
      icon: Users,
      permission: 'read:students',
      roles: ['supervisor']
    },
    {
      path: '/supervisor/task-management',
      label: 'Task Management',
      icon: ClipboardCheck,
      permission: 'read:submissions',
      roles: ['supervisor']
    },
    {
      path: '/lecturer/students',
      label: 'Assigned Students',
      icon: Users,
      permission: 'read:students',
      roles: ['lecturer']
    },
    {
      path: '/tasks/daily-report',
      label: 'Daily Report',
      icon: FileText,
      permission: 'write:submissions',
      roles: ['student']
    },
    {
      path: '/tasks/management',
      label: 'Task Management',
      icon: ClipboardCheck,
      permission: 'read:submissions',
      roles: ['lecturer', 'admin']
    },
    {
      path: '/feedback/weekly-review',
      label: 'Weekly Review',
      icon: MessageSquare,
      permission: 'read:evaluations',
      roles: ['student']
    },
    {
      path: '/feedback/management',
      label: 'Feedback Management',
      icon: BarChart3,
      permission: 'write:evaluations',
      roles: ['supervisor', 'lecturer', 'admin']
    },
    {
      path: '/admin/users',
      label: 'User Management',
      icon: Users,
      permission: 'read:users',
      roles: ['admin']
    },
    {
      path: '/profile/settings',
      label: 'Settings',
      icon: Settings,
      permission: 'read:profile'
    }
  ];

  // Filter menu items based on user permissions and roles
  const visibleMenuItems = menuItems.filter(item => {
    // Check role-based access
    if (item.roles && !isAnyRole(item.roles)) {
      return false;
    }

    // Check permission-based access - now properly typed
    if (item.permission && !checkPermission(item.permission)) {
      return false;
    }

    if (item.permissions && !item.permissions.some(permission => checkPermission(permission))) {
      return false;
    }

    return true;
  });

  const toggleSidebar = () => setIsOpen(!isOpen);

  const handleMenuClick = (path: string) => {
    navigate(path);
    setIsOpen(false); // Close mobile menu
  };

  const getPageTitle = () => {
    // Safely handle location.pathname
    if (!location || !location.pathname) {
      return 'Dashboard';
    }
    
    const currentItem = menuItems.find(item => item.path === location.pathname);
    if (location.pathname === '/dashboard') {
      return `${user.role.charAt(0).toUpperCase() + user.role.slice(1)} Dashboard`;
    }
    return currentItem?.label || 'Dashboard';
  };

  const getWelcomeMessage = () => {
    // Safely handle location.pathname
    if (!location || !location.pathname) {
      return null;
    }
    
    if (location.pathname === '/dashboard') {
      const displayName = getUserDisplayName();
      const firstName = displayName.split(' ')[0];
      return `Welcome, ${firstName}!`;
    }
    return null;
  };

  const isActiveRoute = (path: string) => {
    // Safely handle location.pathname
    if (!location || !location.pathname) {
      return false;
    }
    
    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex h-screen dashboard-bg">
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden bg-white shadow-md"
        onClick={toggleSidebar}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full w-64 bg-navy-900 text-white transform transition-transform duration-300 ease-in-out z-50 md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:relative md:z-auto`}
      >
        {/* Header */}
        <div className="p-6 border-b border-navy-700">
          <h1 className="text-xl font-bold text-white">Industrolink</h1>
        </div>

        {/* User Profile Section */}
        <div className="p-6 border-b border-navy-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-navy-700 rounded-full flex items-center justify-center">
              <span className="text-sm font-semibold">
                {getUserInitials()}
              </span>
            </div>
            <div>
              <h3 className="font-semibold">{getUserDisplayName()}</h3>
              <p className="text-sm text-gray-300 capitalize">{user.role}</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {visibleMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = isActiveRoute(item.path);
              return (
                <li key={item.path}>
                  <button
                    onClick={() => handleMenuClick(item.path)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-navy-700 text-white'
                        : 'text-gray-300 hover:bg-navy-800 hover:text-white'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-navy-700">
          <button
            onClick={onLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-navy-800 hover:text-white transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span>Log Out</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:ml-0">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-200/50 p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div className="md:ml-0 ml-12">
              <h1 className="text-2xl font-bold text-navy-900">
                {getPageTitle()}
              </h1>
              {getWelcomeMessage() && (
                <p className="text-navy-600 mt-1">{getWelcomeMessage()}</p>
              )}
            </div>
            
            {/* Optional: Add user actions in header */}
            <div className="flex items-center space-x-4">
              <div className="hidden md:block">
                <span className="text-sm text-navy-600">
                  Logged in as <span className="font-medium">{getUserDisplayName()}</span>
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-4 md:p-6">
          {/* <Outlet /> */}
          {/* The children prop was removed, so we'll render the Outlet directly */}
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;