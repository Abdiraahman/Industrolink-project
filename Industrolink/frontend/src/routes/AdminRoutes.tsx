import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from '../components/admin/AdminLayout';
import AdminDashboard from '../components/admin/AdminDashboard';
import UserManagement from '../components/admin/UserManagement';
import AdminInvitation from '../components/admin/AdminInvitation';
import AdminRegistration from '../components/admin/AdminRegistration';
import ActivityLog from '../components/admin/ActivityLog';
import Settings from '../components/admin/Settings';

// Protected Route Component - No longer needed since protection is handled at App.tsx level
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

const AdminRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public admin routes */}
      <Route path="/register/:token" element={<AdminRegistration />} />
      
      {/* Protected admin routes - all nested under AdminLayout */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        {/* Redirect root to dashboard */}
        <Route index element={<Navigate to="dashboard" replace />} />
        
        {/* Dashboard */}
        <Route path="dashboard" element={<AdminDashboard />} />
        
        {/* User Management */}
        <Route path="users" element={<UserManagement />} />
        
        {/* Invitations */}
        <Route path="invitations" element={<AdminInvitation />} />
        
        {/* Activity Log */}
        <Route path="actions" element={<ActivityLog />} />
        
        {/* Settings */}
        <Route path="settings" element={<Settings />} />
      </Route>
      
      {/* Catch all admin routes - redirect to dashboard */}
      <Route path="*" element={<Navigate to="dashboard" replace />} />
    </Routes>
  );
};

export default AdminRoutes;
