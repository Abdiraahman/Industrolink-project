import React from 'react';

const AdminDashboard: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">User Management</h2>
          <p className="text-gray-600">Manage system users and permissions</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">System Reports</h2>
          <p className="text-gray-600">View system-wide analytics and reports</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">System Settings</h2>
          <p className="text-gray-600">Configure system-wide settings</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
