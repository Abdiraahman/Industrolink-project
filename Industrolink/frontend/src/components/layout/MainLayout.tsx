// import React, { useState } from 'react';
// import { Outlet, useNavigate, useLocation } from 'react-router-dom';
// import { 
//   Home, 
//   User, 
//   FileText, 
//   ClipboardCheck, 
//   Briefcase, 
//   Users, 
//   BarChart3, 
//   Settings, 
//   LogOut,
//   Menu,
//   X
// } from 'lucide-react';
// import { useAuthExtended } from '../../hooks/useAuthExtended';
// import { useSession } from '../../hooks/useSession';
// import { useActivityTracker } from '../../hooks/useActivityTracker';
// import SessionWarning from '../auth/SessionWarning';
// import { getNavRoutesForRole } from '../../utils/routeConfig';
// import PermissionGuard from '../auth/PermissionGuard';

// const MainLayout: React.FC = () => {
//   const { user, logout } = useAuthExtended();
//   const { trackPageView } = useActivityTracker();
//   const navigate = useNavigate();
//   const location = useLocation();
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [showSessionWarning, setShowSessionWarning] = useState(false);
//   const [warningTime, setWarningTime] = useState(0);

//   // Session management
//   useSession({
//     timeout: 30, // 30 minutes
//     warningTime: 5, // 5 minutes before timeout
//     onWarning: (time) => {
//       setWarningTime(time);
//       setShowSessionWarning(true);
//     },
//     onTimeout: () => {
//       trackPageView('session_timeout');
//       logout();
//     }
//   });

//   // Track page views
//   React.useEffect(() => {
//     trackPageView(location.pathname);
//   }, [location.pathname, trackPageView]);

//   const handleLogout = () => {
//     trackPageView('logout');
//     logout();
//     navigate('/auth/login');
//   };

//   const handleExtendSession = () => {
//     setShowSessionWarning(false);
//     // The session hook will automatically reset the timer
//   };

//   const handleSessionLogout = () => {
//     setShowSessionWarning(false);
//     handleLogout();
//   };

//   const navRoutes = user ? getNavRoutesForRole(user.role) : [];

//   const getIcon = (iconName?: string) => {
//     switch (iconName) {
//       case 'home': return <Home className="w-5 h-5" />;
//       case 'user': return <User className="w-5 h-5" />;
//       case 'file-text': return <FileText className="w-5 h-5" />;
//       case 'clipboard-check': return <ClipboardCheck className="w-5 h-5" />;
//       case 'briefcase': return <Briefcase className="w-5 h-5" />;
//       case 'users': return <Users className="w-5 h-5" />;
//       case 'bar-chart': return <BarChart3 className="w-5 h-5" />;
//       case 'settings': return <Settings className="w-5 h-5" />;
//       default: return <Home className="w-5 h-5" />;
//     }
//   };

//   if (!user) {
//     return <Outlet />;
//   }

//   return (
//     <div className="min-h-screen bg-slate-900">
//       {/* Mobile sidebar overlay */}
//       {sidebarOpen && (
//         <div 
//           className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
//           onClick={() => setSidebarOpen(false)}
//         />
//       )}

//       {/* Sidebar */}
//       <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-800 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
//         sidebarOpen ? 'translate-x-0' : '-translate-x-full'
//       }`}>
//         <div className="flex items-center justify-between h-16 px-6 border-b border-slate-700">
//           <h1 className="text-xl font-bold text-white">Industrolink</h1>
//           <button
//             onClick={() => setSidebarOpen(false)}
//             className="lg:hidden text-slate-400 hover:text-white"
//           >
//             <X className="w-6 h-6" />
//           </button>
//         </div>

//         <nav className="mt-6 px-3">
//           <div className="space-y-1">
//             {navRoutes.map((route) => (
//               <PermissionGuard
//                 key={route.path}
//                 permissions={route.requiredPermissions}
//                 showFallback={false}
//               >
//                 <button
//                   onClick={() => {
//                     navigate(route.path);
//                     setSidebarOpen(false);
//                   }}
//                   className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
//                     location.pathname === route.path
//                       ? 'bg-blue-600 text-white'
//                       : 'text-slate-300 hover:bg-slate-700 hover:text-white'
//                   }`}
//                 >
//                   {getIcon(route.icon)}
//                   <span className="ml-3">{route.title}</span>
//                 </button>
//               </PermissionGuard>
//             ))}
//           </div>
//         </nav>

//         {/* User section */}
//         <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center space-x-3">
//               <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
//                 <span className="text-white text-sm font-medium">
//                   {user.name.charAt(0).toUpperCase()}
//                 </span>
//               </div>
//               <div>
//                 <p className="text-sm font-medium text-white">{user.name}</p>
//                 <p className="text-xs text-slate-400 capitalize">{user.role}</p>
//               </div>
//             </div>
//             <button
//               onClick={handleLogout}
//               className="text-slate-400 hover:text-white transition-colors"
//               title="Logout"
//             >
//               <LogOut className="w-5 h-5" />
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Main content */}
//       <div className="lg:pl-64">
//         {/* Top bar */}
//         <div className="h-16 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-6">
//           <button
//             onClick={() => setSidebarOpen(true)}
//             className="lg:hidden text-slate-400 hover:text-white"
//           >
//             <Menu className="w-6 h-6" />
//           </button>
          
//           <div className="flex items-center space-x-4">
//             <h2 className="text-lg font-medium text-white">
//               {navRoutes.find(r => r.path === location.pathname)?.title || 'Dashboard'}
//             </h2>
//           </div>

//           <div className="flex items-center space-x-4">
//             <PermissionGuard permission="read:profile">
//               <button
//                 onClick={() => navigate('/profile')}
//                 className="text-slate-400 hover:text-white transition-colors"
//                 title="Profile"
//               >
//                 <User className="w-5 h-5" />
//               </button>
//             </PermissionGuard>
//           </div>
//         </div>

//         {/* Page content */}
//         <main className="p-6">
//           <Outlet />
//         </main>
//       </div>

//       {/* Session warning modal */}
//       {showSessionWarning && (
//         <SessionWarning
//           remainingTime={warningTime}
//           onExtend={handleExtendSession}
//           onLogout={handleSessionLogout}
//         />
//       )}
//     </div>
//   );
// };

// export default MainLayout;








import React, { useState } from 'react';
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
import { User, UserRole } from '../../types/user'; // Import the actual User and UserRole types

type TabType = 'dashboard' | 'daily-report' | 'task-management' | 'weekly-review' | 'feedback-management' | 'profile-edit' | 'user-management';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  user: User;
  onLogout: () => void;
}

interface MenuItem {
  id: TabType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  permission?: Permission;
  permissions?: Permission[];
  roles?: UserRole[]; // Use the actual UserRole type
}

const MainLayout: React.FC<LayoutProps> = ({ 
  children, 
  activeTab, 
  setActiveTab, 
  user, 
  onLogout 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { checkPermission, isRole, isAnyRole } = useAuthExtended();

  // Debug: Log the user object to see its structure
  console.log('User object in MainLayout:', user);
  console.log('User properties:', Object.keys(user));

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

  // Define menu items with their permissions
  const menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
      permission: 'read:profile'
    },
    {
      id: 'daily-report',
      label: 'Daily Report',
      icon: FileText,
      permission: 'write:submissions',
      roles: ['student']
    },
    {
      id: 'task-management',
      label: 'Task Management',
      icon: ClipboardCheck,
      permission: 'read:submissions',
      roles: ['supervisor', 'lecturer', 'admin']
    },
    {
      id: 'weekly-review',
      label: 'Weekly Review',
      icon: MessageSquare,
      permission: 'read:evaluations',
      roles: ['student']
    },
    {
      id: 'feedback-management',
      label: 'Feedback Management',
      icon: BarChart3,
      permission: 'write:evaluations',
      roles: ['supervisor', 'lecturer', 'admin']
    },
    {
      id: 'user-management',
      label: 'User Management',
      icon: Users,
      permission: 'read:users',
      roles: ['admin']
    },
    {
      id: 'profile-edit',
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

  const handleMenuClick = (itemId: TabType) => {
    setActiveTab(itemId);
    setIsOpen(false); // Close mobile menu
  };

  const getPageTitle = () => {
    const currentItem = menuItems.find(item => item.id === activeTab);
    if (activeTab === 'dashboard') {
      return `${user.role.charAt(0).toUpperCase() + user.role.slice(1)} Dashboard`;
    }
    return currentItem?.label || 'Dashboard';
  };

  const getWelcomeMessage = () => {
    if (activeTab === 'dashboard') {
      const displayName = getUserDisplayName();
      const firstName = displayName.split(' ')[0];
      return `Welcome, ${firstName}!`;
    }
    return null;
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
              return (
                <li key={item.id}>
                  <button
                    onClick={() => handleMenuClick(item.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      activeTab === item.id
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
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;