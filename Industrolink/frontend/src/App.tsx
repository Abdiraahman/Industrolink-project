// import React from 'react';
// import { Routes, Route, Navigate } from 'react-router-dom';
// import { useAuthContext } from './context/AuthContext';
// import { UserRole } from './types/user';
// import EnhancedProtectedRoute from './components/auth/EnhancedProtectedRoute';
// import PermissionGuard from './components/auth/PermissionGuard';

// // Auth Pages
// import Login from './pages/auth/Login';
// import Register from './pages/auth/Register';

// // Dashboard Pages
// import StudentDashboard from './pages/dashboard/StudentDashboard';
// import SupervisorDashboard from './pages/dashboard/SupervisorDashboard';
// import AdminDashboard from './pages/dashboard/AdminDashboard';

// // Task Pages
// import DailyReport from './pages/tasks/DailyReport';
// import TaskManagement from './pages/tasks/TaskManagement';

// // Feedback Pages
// import WeeklyReview from './pages/feedback/WeeklyReview';
// import FeedbackManagement from './pages/feedback/FeedbackManagement';

// // Profile Pages
// import ProfileEdit from './pages/profile/ProfileEdit';
// import UserManagement from './pages/profile/UserManagement';

// // System Pages
// import Unauthorized from './pages/system/Unauthorized';
// import NotFound from './pages/system/NotFound';

// // Loading Component
// const LoadingSpinner = () => (
//   <div className="min-h-screen bg-slate-900 flex items-center justify-center">
//     <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
//   </div>
// );

// const App: React.FC = () => {
//   const { isAuthenticated, user, loading } = useAuthContext();

//   // Show loading spinner while auth state is being determined
//   if (loading) {
//     return <LoadingSpinner />;
//   }

//   return (
//     <Routes>
//       {/* Public Routes */}
//       <Route path="/auth/login" element={
//         isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
//       } />
//       <Route path="/auth/register" element={
//         isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />
//       } />

//       {/* System Routes */}
//       <Route path="/unauthorized" element={<Unauthorized />} />
//       <Route path="/404" element={<NotFound />} />

//       {/* Protected Routes - Dashboard */}
//       <Route path="/dashboard" element={
//         <EnhancedProtectedRoute requireAuth={true}>
//           <PermissionGuard permission="read:profile">
//             {user?.role === 'student' && <StudentDashboard />}
//             {user?.role === 'supervisor' && <SupervisorDashboard />}
//             {user?.role === 'admin' && <AdminDashboard />}
//           </PermissionGuard>
//         </EnhancedProtectedRoute>
//       } />

//       {/* Protected Routes - Tasks */}
//       <Route path="/tasks/daily-report" element={
//         <EnhancedProtectedRoute 
//           requireAuth={true}
//           allowedRoles={['student']}
//           requiredPermission="write:submissions"
//         >
//           <DailyReport />
//         </EnhancedProtectedRoute>
//       } />

//       <Route path="/tasks/management" element={
//         <EnhancedProtectedRoute 
//           requireAuth={true}
//           allowedRoles={['supervisor', 'admin']}
//           requiredPermission="read:submissions"
//         >
//           <TaskManagement />
//         </EnhancedProtectedRoute>
//       } />

//       {/* Protected Routes - Feedback */}
//       <Route path="/feedback/weekly-review" element={
//         <EnhancedProtectedRoute 
//           requireAuth={true}
//           allowedRoles={['student']}
//           requiredPermission="read:evaluations"
//         >
//           <WeeklyReview />
//         </EnhancedProtectedRoute>
//       } />

//       <Route path="/feedback/management" element={
//         <EnhancedProtectedRoute 
//           requireAuth={true}
//           allowedRoles={['supervisor', 'admin']}
//           requiredPermission="write:evaluations"
//         >
//           <FeedbackManagement />
//         </EnhancedProtectedRoute>
//       } />

//       {/* Protected Routes - Profile */}
//       <Route path="/profile/edit" element={
//         <EnhancedProtectedRoute requireAuth={true}>
//           <ProfileEdit />
//         </EnhancedProtectedRoute>
//       } />

//       <Route path="/users/management" element={
//         <EnhancedProtectedRoute 
//           requireAuth={true}
//           allowedRoles={['admin']}
//           requiredPermission="read:users"
//         >
//           <UserManagement />
//         </EnhancedProtectedRoute>
//       } />

//       {/* Default Routes */}
//       <Route path="/" element={
//         isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/auth/login" replace />
//       } />
      
//       <Route path="*" element={<Navigate to="/404" replace />} />
//     </Routes>
//   );
// };

// export default App;







// import React, { useState } from 'react';
// import { useAuthExtended } from './hooks/useAuthExtended';
// import { useSession } from './hooks/useSession';
// import { useActivityTracker } from './hooks/useActivityTracker';
// import SessionWarning from './components/auth/SessionWarning';
// import PermissionGuard from './components/auth/PermissionGuard';
// import MainLayout from './components/layout/MainLayout';
// import Login from './pages/auth/Login';
// import Register from './pages/auth/Register';

// // Dashboard Pages
// import StudentDashboard from './pages/dashboard/StudentDashboard';
// import SupervisorDashboard from './pages/dashboard/SupervisorDashboard';
// import AdminDashboard from './pages/dashboard/AdminDashboard';

// // Task Pages
// import DailyReport from './pages/tasks/DailyReport';
// import TaskManagement from './pages/tasks/TaskManagement';

// // Feedback Pages
// import WeeklyReview from './pages/feedback/WeeklyReview';
// import FeedbackManagement from './pages/feedback/FeedbackManagement';

// // Profile Pages
// import ProfileEdit from './pages/profile/ProfileEdit';
// import UserManagement from './pages/profile/UserManagement';

// //import './App.css';

// type TabType = 'dashboard' | 'daily-report' | 'task-management' | 'weekly-review' | 'feedback-management' | 'profile-edit' | 'user-management';

// const LoadingSpinner = () => (
//   <div className="min-h-screen bg-slate-900 flex items-center justify-center">
//     <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
//   </div>
// );

// function App(): React.ReactElement {
//   const { user, logout, isAuthenticated, loading } = useAuthExtended();
//   const { trackActivity } = useActivityTracker();
//   const [activeTab, setActiveTab] = useState<TabType>('dashboard');
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
//       trackActivity('session_timeout');
//       logout();
//     }
//   });

//   const handleExtendSession = () => {
//     setShowSessionWarning(false);
//   };

//   const handleSessionLogout = () => {
//     setShowSessionWarning(false);
//     logout();
//   };

//   const handleTabChange = (tab: TabType) => {
//     setActiveTab(tab);
//     trackActivity('navigate', tab);
//   };

//   // Show loading spinner while auth state is being determined
//   if (loading) {
//     return <LoadingSpinner />;
//   }

//   // Show login if not authenticated - NO ROUTER WRAPPER HERE
//   if (!isAuthenticated || !user) {
//     return <Login />;
//   }

//   const renderContent = (): React.ReactElement => {
//     switch (activeTab) {
//       case 'dashboard':
//         return (
//           <PermissionGuard permission="read:profile">
//             {user.role === 'student' && <StudentDashboard />}
//             {user.role === 'supervisor' && <SupervisorDashboard />}
//             {user.role === 'admin' && <AdminDashboard />}
//           </PermissionGuard>
//         );
      
//       case 'daily-report':
//         return (
//           <PermissionGuard 
//             permission="write:submissions"
//             fallback={<div className="text-center text-gray-500">You don't have permission to access daily reports.</div>}
//           >
//             <DailyReport />
//           </PermissionGuard>
//         );
      
//       case 'task-management':
//         return (
//           <PermissionGuard 
//             permission="read:submissions"
//             fallback={<div className="text-center text-gray-500">You don't have permission to access task management.</div>}
//           >
//             <TaskManagement />
//           </PermissionGuard>
//         );
      
//       case 'weekly-review':
//         return (
//           <PermissionGuard 
//             permission="read:evaluations"
//             fallback={<div className="text-center text-gray-500">You don't have permission to access weekly reviews.</div>}
//           >
//             <WeeklyReview />
//           </PermissionGuard>
//         );
      
//       case 'feedback-management':
//         return (
//           <PermissionGuard 
//             permission="write:evaluations"
//             fallback={<div className="text-center text-gray-500">You don't have permission to access feedback management.</div>}
//           >
//             <FeedbackManagement />
//           </PermissionGuard>
//         );
      
//       case 'profile-edit':
//         return (
//           <PermissionGuard permission="read:profile">
//             <ProfileEdit />
//           </PermissionGuard>
//         );
      
//       case 'user-management':
//         return (
//           <PermissionGuard 
//             permission="read:users"
//             fallback={<div className="text-center text-gray-500">You don't have permission to access user management.</div>}
//           >
//             <UserManagement />
//           </PermissionGuard>
//         );
      
//       default:
//         return (
//           <PermissionGuard permission="read:profile">
//             {user.role === 'student' && <StudentDashboard />}
//             {user.role === 'supervisor' && <SupervisorDashboard />}
//             {user.role === 'admin' && <AdminDashboard />}
//           </PermissionGuard>
//         );
//     }
//   };

//   return (
//     <>
//       <MainLayout 
//         activeTab={activeTab} 
//         setActiveTab={handleTabChange}
//         user={user}
//         onLogout={logout}
//       >
//         {renderContent()}
//       </MainLayout>

//       {/* Session warning modal */}
//       {showSessionWarning && (
//         <SessionWarning
//           remainingTime={warningTime}
//           onExtend={handleExtendSession}
//           onLogout={handleSessionLogout}
//         />
//       )}
//     </>
//   );
// }

// export default App;





import React, { useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuthExtended } from './hooks/useAuthExtended';
import { useSession } from './hooks/useSession';
import { useActivityTracker } from './hooks/useActivityTracker';
import SessionWarning from './components/auth/SessionWarning';
import PermissionGuard from './components/auth/PermissionGuard';
import MainLayout from './components/layout/MainLayout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Dashboard Pages
import StudentDashboard from './pages/dashboard/StudentDashboard';
import SupervisorDashboard from './pages/dashboard/SupervisorDashboard';
import AdminDashboard from './pages/dashboard/AdminDashboard';

// Task Pages
import DailyReport from './pages/tasks/DailyReport';
import TaskManagement from './pages/tasks/TaskManagement';

// Feedback Pages
import WeeklyReview from './pages/feedback/WeeklyReview';
import FeedbackManagement from './pages/feedback/FeedbackManagement';

// Profile Pages
import ProfileEdit from './pages/profile/ProfileEdit';
import UserManagement from './pages/profile/UserManagement';

//import './App.css';

type TabType = 'dashboard' | 'daily-report' | 'task-management' | 'weekly-review' | 'feedback-management' | 'profile-edit' | 'user-management';

const LoadingSpinner = () => (
  <div className="min-h-screen bg-slate-900 flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
  </div>
);

function App(): React.ReactElement {
  const { user, logout, isAuthenticated, loading } = useAuthExtended();
  const { trackActivity } = useActivityTracker();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [showSessionWarning, setShowSessionWarning] = useState(false);
  const [warningTime, setWarningTime] = useState(0);
  const location = useLocation();

  // Session management
  useSession({
    timeout: 30, // 30 minutes
    warningTime: 5, // 5 minutes before timeout
    onWarning: (time) => {
      setWarningTime(time);
      setShowSessionWarning(true);
    },
    onTimeout: () => {
      trackActivity('session_timeout');
      logout();
    }
  });

  const handleExtendSession = () => {
    setShowSessionWarning(false);
  };

  const handleSessionLogout = () => {
    setShowSessionWarning(false);
    logout();
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    trackActivity('navigate', tab);
  };

  // Show loading spinner while auth state is being determined
  if (loading) {
    return <LoadingSpinner />;
  }

  // Check if current route is an auth route
  const isAuthRoute = location.pathname === '/login' || location.pathname === '/register';

  // If authenticated and trying to access auth routes, redirect to dashboard
  if (isAuthenticated && user && isAuthRoute) {
    return <Navigate to="/dashboard" replace />;
  }

  // If not authenticated and not on auth routes, redirect to login
  if (!isAuthenticated && !isAuthRoute) {
    return <Navigate to="/login" replace />;
  }

  const renderContent = (): React.ReactElement => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <PermissionGuard permission="read:profile">
            {user?.role === 'student' && <StudentDashboard />}
            {user?.role === 'supervisor' && <SupervisorDashboard />}
            {user?.role === 'admin' && <AdminDashboard />}
          </PermissionGuard>
        );
      
      case 'daily-report':
        return (
          <PermissionGuard 
            permission="write:submissions"
            fallback={<div className="text-center text-gray-500">You don't have permission to access daily reports.</div>}
          >
            <DailyReport />
          </PermissionGuard>
        );
      
      case 'task-management':
        return (
          <PermissionGuard 
            permission="read:submissions"
            fallback={<div className="text-center text-gray-500">You don't have permission to access task management.</div>}
          >
            <TaskManagement />
          </PermissionGuard>
        );
      
      case 'weekly-review':
        return (
          <PermissionGuard 
            permission="read:evaluations"
            fallback={<div className="text-center text-gray-500">You don't have permission to access weekly reviews.</div>}
          >
            <WeeklyReview />
          </PermissionGuard>
        );
      
      case 'feedback-management':
        return (
          <PermissionGuard 
            permission="write:evaluations"
            fallback={<div className="text-center text-gray-500">You don't have permission to access feedback management.</div>}
          >
            <FeedbackManagement />
          </PermissionGuard>
        );
      
      case 'profile-edit':
        return (
          <PermissionGuard permission="read:profile">
            <ProfileEdit />
          </PermissionGuard>
        );
      
      case 'user-management':
        return (
          <PermissionGuard 
            permission="read:users"
            fallback={<div className="text-center text-gray-500">You don't have permission to access user management.</div>}
          >
            <UserManagement />
          </PermissionGuard>
        );
      
      default:
        return (
          <PermissionGuard permission="read:profile">
            {user?.role === 'student' && <StudentDashboard />}
            {user?.role === 'supervisor' && <SupervisorDashboard />}
            {user?.role === 'admin' && <AdminDashboard />}
          </PermissionGuard>
        );
    }
  };

  return (
    <>
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected Routes */}
        <Route path="/dashboard" element={
          isAuthenticated && user ? (
            <MainLayout 
              activeTab={activeTab} 
              setActiveTab={handleTabChange}
              user={user}
              onLogout={logout}
            >
              {renderContent()}
            </MainLayout>
          ) : (
            <Navigate to="/login" replace />
          )
        } />
        
        {/* Default Routes */}
        <Route path="/" element={
          isAuthenticated && user ? 
            <Navigate to="/dashboard" replace /> : 
            <Navigate to="/login" replace />
        } />
        
        <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
      </Routes>

      {/* Session warning modal */}
      {showSessionWarning && (
        <SessionWarning
          remainingTime={warningTime}
          onExtend={handleExtendSession}
          onLogout={handleSessionLogout}
        />
      )}
    </>
  );
}

export default App;