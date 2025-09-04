import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthExtended } from './hooks/useAuthExtended';
import { useSession } from './hooks/useSession';
import { useActivityTracker } from './hooks/useActivityTracker';
import SessionWarning from './components/auth/SessionWarning';
import PermissionGuard from './components/auth/PermissionGuard';
import MainLayout from './components/layout/MainLayout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import EmailVerification from './pages/auth/EmailVerification';
import AdminRoutes from './routes/AdminRoutes';

// Dashboard Pages
import StudentDashboard from './pages/dashboard/StudentDashboard';
import SupervisorDashboard from './pages/dashboard/SupervisorDashboard';
import LecturerDashboard from './pages/dashboard/LecturerDashboard';

// Task Pages
import DailyReport from './pages/tasks/DailyReport';


// Feedback Pages
import WeeklyReview from './pages/feedback/WeeklyReview';
import FeedbackManagement from './pages/feedback/FeedbackManagement';

// Profile Pages
import ProfileEdit from './pages/profile/ProfileEdit';
import ProfileSetup from './pages/profile/ProfileSetup';
import Settings from './pages/profile/Settings';
import UserManagement from './pages/profile/UserManagement';
import SupervisorStudents from './pages/supervisor/SupervisorStudents';
import SupervisorTaskManagement from './pages/supervisor/SupervisorTaskManagement';
import LecturerStudents from './pages/lecturer/LecturerStudents';
import LecturerStudentDetails from './pages/lecturer/StudentDetails';
import LecturerTaskManagement from './pages/lecturer/TaskManagement';

// System Pages
import Unauthorized from './pages/system/Unauthorized';
import NotFound from './pages/system/NotFound';

const LoadingSpinner = () => (
  <div className="min-h-screen bg-slate-900 flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
  </div>
);

function App(): React.ReactElement {
  const { user, logout, isAuthenticated, loading } = useAuthExtended();
  const { trackActivity } = useActivityTracker();
  const [showSessionWarning, setShowSessionWarning] = useState(false);
  const [warningTime, setWarningTime] = useState(0);

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

  // Show loading spinner while auth state is being determined
  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
        } />
        <Route path="/register" element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />
        } />
        <Route path="/verify-email" element={<EmailVerification />} />

        {/* System Routes */}
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/404" element={<NotFound />} />

        {/* Admin Routes */}
        <Route path="/system-admin/*" element={
          !loading && localStorage.getItem('adminToken') === 'admin-authenticated' ? (
            <AdminRoutes />
          ) : !loading ? (
            <Navigate to="/login" replace />
          ) : (
            <LoadingSpinner />
          )
        } />

        {/* Protected Routes - Dashboard */}
        <Route path="/dashboard" element={
          !loading && isAuthenticated && user ? (
            user.profile_completed ? (
              user.role === 'admin' && localStorage.getItem('adminToken') === 'admin-authenticated' ? (
                <Navigate to="/system-admin/dashboard" replace />
              ) : (
                <MainLayout user={user} onLogout={logout} />
              )
            ) : (
              <Navigate to="/profile/setup" replace />
            )
          ) : !loading ? (
            <Navigate to="/login" replace />
          ) : (
            <LoadingSpinner />
          )
        }>
          <Route index element={
            <PermissionGuard permission="read:profile">
              {user?.role === 'student' && <StudentDashboard />}
              {user?.role === 'supervisor' && <SupervisorDashboard />}
              {user?.role === 'lecturer' && <LecturerDashboard />}
            </PermissionGuard>
          } />
        </Route>

        {/* Protected Routes - Supervisor Student Management */}
        <Route path="/supervisor" element={
          isAuthenticated && user ? (
            user.profile_completed ? (
              <MainLayout user={user} onLogout={logout} />
            ) : (
              <Navigate to="/profile/setup" replace />
            )
          ) : (
            <Navigate to="/login" replace />
          )
        }>
          <Route path="students" element={
            <PermissionGuard
              permission="read:students"
              fallback={<div className="text-center text-gray-500">You don't have permission to access company students.</div>}
            >
              {user?.role === 'supervisor' && <SupervisorStudents />}
            </PermissionGuard>
          } />
          <Route path="task-management" element={
            <PermissionGuard
              permission="read:submissions"
              fallback={<div className="text-center text-gray-500">You don't have permission to access task management.</div>}
            >
              {user?.role === 'supervisor' && <SupervisorTaskManagement />}
            </PermissionGuard>
          } />
        </Route>

        {/* Protected Routes - Lecturer Student Management */}
        <Route path="/lecturer" element={
          isAuthenticated && user ? (
            user.profile_completed ? (
              <MainLayout user={user} onLogout={logout} />
            ) : (
              <Navigate to="/login" replace />
            )
          ) : (
            <Navigate to="/login" replace />
          )
        }>
          <Route path="students" element={
            <PermissionGuard
              permission="read:students"
              fallback={<div className="text-center text-gray-500">You don't have permission to access assigned students.</div>}
            >
              {user?.role === 'lecturer' && <LecturerStudents />}
            </PermissionGuard>
          } />
          <Route path="students/:studentId" element={
            <PermissionGuard
              permission="read:students"
              fallback={<div className="text-center text-gray-500">You don't have permission to access student details.</div>}
            >
              {user?.role === 'lecturer' && <LecturerStudentDetails />}
            </PermissionGuard>
          } />
        </Route>

        {/* Protected Routes - Tasks */}
        <Route path="/tasks" element={
          isAuthenticated && user ? (
            <MainLayout user={user} onLogout={logout} />
          ) : (
            <Navigate to="/login" replace />
          )
        }>
          <Route path="daily-report" element={
            <PermissionGuard
              permission="write:submissions"
              fallback={<div className="text-center text-gray-500">You don't have permission to access daily reports.</div>}
            >
              <DailyReport />
            </PermissionGuard>
          } />
          <Route path="management" element={
            <PermissionGuard
              permission="read:submissions"
              fallback={<div className="text-center text-gray-500">You don't have permission to access task management.</div>}
            >
              {user?.role === 'lecturer' && <LecturerTaskManagement />}
            </PermissionGuard>
          } />
        </Route>

        {/* Protected Routes - Feedback */}
        <Route path="/feedback" element={
          isAuthenticated && user ? (
            <MainLayout user={user} onLogout={logout} />
          ) : (
            <Navigate to="/login" replace />
          )
        }>
          <Route path="weekly-review" element={
            <PermissionGuard
              permission="read:evaluations"
              fallback={<div className="text-center text-gray-500">You don't have permission to access weekly reviews.</div>}
            >
              <WeeklyReview />
            </PermissionGuard>
          } />
          <Route path="management" element={
            <PermissionGuard
              permission="write:evaluations"
              fallback={<div className="text-center text-gray-500">You don't have permission to access feedback management.</div>}
            >
              <FeedbackManagement />
            </PermissionGuard>
          } />
        </Route>

        {/* Protected Routes - Profile */}
        <Route path="/profile" element={
          isAuthenticated && user ? (
            <MainLayout user={user} onLogout={logout} />
          ) : (
            <Navigate to="/login" replace />
          )
        }>
          <Route path="edit" element={
            <PermissionGuard permission="read:profile">
              <ProfileEdit />
            </PermissionGuard>
          } />
          <Route path="settings" element={
            <PermissionGuard permission="read:profile">
              <Settings />
            </PermissionGuard>
          } />
          <Route path="setup" element={
            <PermissionGuard permission="read:profile">
              <ProfileSetup />
            </PermissionGuard>
          } />
        </Route>

        {/* Protected Routes - User Management */}
        <Route path="/users" element={
          isAuthenticated && user ? (
            <MainLayout user={user} onLogout={logout} />
          ) : (
            <Navigate to="/login" replace />
          )
        }>
          <Route path="management" element={
            <PermissionGuard
              permission="read:users"
              fallback={<div className="text-center text-gray-500">You don't have permission to access user management.</div>}
            >
              <UserManagement />
            </PermissionGuard>
          } />
        </Route>

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