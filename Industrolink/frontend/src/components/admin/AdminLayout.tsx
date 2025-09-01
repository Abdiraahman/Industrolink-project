import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { toast } from 'sonner';
import { 
  Menu, 
  X, 
  Home, 
  Users, 
  Mail, 
  Activity, 
  Settings, 
  LogOut,
  ChevronDown,
  User
} from 'lucide-react';
import adminApi from '../../services/adminApi';

const AdminLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  const currentUser = JSON.parse(localStorage.getItem('adminUser') || '{}');

  // Check session expiration
  useEffect(() => {
    let isMounted = true;
    
    const checkSession = async () => {
      // Don't check if component is unmounted
      if (!isMounted) return;
      
      try {
        // Check if admin token exists
        const adminToken = localStorage.getItem('adminToken');
        if (!adminToken || adminToken !== 'admin-authenticated') {
          if (isMounted) {
            toast.error('Session expired. Please login again.');
            // Clear data and redirect directly
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminUser');
            window.location.href = '/login';
          }
          return;
        }

        // Verify session with backend
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/system-admin/verify-session/`, {
          credentials: 'include',
        });

        if (!response.ok && isMounted) {
          toast.error('Session expired. Please login again.');
          // Clear data and redirect directly
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminUser');
          window.location.href = '/login';
          return;
        }
      } catch (error) {
        if (isMounted) {
          console.error('Session check failed:', error);
          toast.error('Session verification failed. Please login again.');
          // Clear data and redirect directly
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminUser');
          window.location.href = '/login';
        }
      }
    };

    // Check session every 5 minutes
    const sessionCheckInterval = setInterval(checkSession, 5 * 60 * 1000);
    
    // Initial check
    checkSession();

    return () => {
      isMounted = false;
      clearInterval(sessionCheckInterval);
    };
  }, [navigate]);

  const navigation = [
    { name: 'Dashboard', href: 'dashboard', icon: Home },
    { name: 'User Management', href: 'users', icon: Users },
    { name: 'Invitations', href: 'invitations', icon: Mail },
    { name: 'Activity Log', href: 'actions', icon: Activity },
    { name: 'Settings', href: 'settings', icon: Settings },
  ];

  const handleLogout = async () => {
    // Prevent multiple logout calls
    if (localStorage.getItem('adminToken') !== 'admin-authenticated') {
      return;
    }
    
    try {
      // Call admin logout endpoint
      await adminApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
      // Ignore logout errors
    }
    
    // Always clear admin data and redirect, regardless of API call success
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    
    toast.success('Logged out successfully');
    
    // Force redirect to login page
    window.location.href = '/login';
  };

  const isActiveRoute = (href: string) => {
    // Since we're using relative paths, check if the current path ends with the href
    // or if we're at the root admin path and href is dashboard
    if (href === 'dashboard' && location.pathname.endsWith('/system-admin') || location.pathname.endsWith('/system-admin/')) {
      return true;
    }
    return location.pathname.endsWith(href);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white">
          <div className="flex h-16 items-center justify-between px-4">
            <h1 className="text-lg font-semibold text-gray-900">Admin Panel</h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActiveRoute(item.href)
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
          <div className="flex h-16 items-center px-4 border-b border-gray-200">
            <h1 className="text-lg font-semibold text-gray-900">Admin Panel</h1>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActiveRoute(item.href)
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1" />
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              {/* User menu */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-3 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <span className="hidden lg:block text-sm font-medium text-gray-700">
                    {currentUser?.first_name || 'Admin'}
                  </span>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                    <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                      <div className="font-medium">{currentUser?.first_name} {currentUser?.last_name}</div>
                      <div className="text-gray-500">{currentUser?.email}</div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <LogOut className="mr-3 h-4 w-4" />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Click outside to close user menu */}
      {userMenuOpen && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setUserMenuOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminLayout;
