import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Activity, Calendar, User, Info } from 'lucide-react';
import { adminApi } from '../../services/adminApi';
import { AdminAction } from '../../types/admin';

const ActivityLog: React.FC = () => {
  const [actions, setActions] = useState<AdminAction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchActions();
  }, []);

  const fetchActions = async () => {
    try {
      setIsLoading(true);
      const data = await adminApi.getAdminActions();
      setActions(data);
    } catch (error: any) {
      if (error.status === 401) {
        toast.error('Session expired. Please login again.');
        // Clear admin session and redirect to login
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        window.location.href = '/login';
        return;
      }
      toast.error('Failed to fetch activity log');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'admin_login':
      case 'admin_logout':
        return <User className="w-4 h-4 text-blue-500" />;
      case 'user_approval':
      case 'account_activation':
      case 'account_deactivation':
        return <Info className="w-4 h-4 text-green-500" />;
      case 'user_deletion':
        return <Info className="w-4 h-4 text-red-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getActionColor = (actionType: string) => {
    switch (actionType) {
      case 'admin_login':
      case 'user_approval':
      case 'account_activation':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'admin_logout':
      case 'account_deactivation':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'user_deletion':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Activity Log</h1>
        <p className="text-gray-600">Monitor all administrative actions and system events</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Recent Activities ({actions.length})
          </h3>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {actions.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <Activity className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No activities yet</h3>
                <p className="mt-1 text-sm text-gray-500">Administrative actions will appear here.</p>
              </div>
            ) : (
              actions.map((action) => (
                <div key={action.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      {getActionIcon(action.action_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-900">
                            {action.admin_name}
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getActionColor(action.action_type)}`}>
                            {action.action_type_display || action.action_type.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="w-4 h-4 mr-1" />
                          {formatDate(action.created_at)}
                        </div>
                      </div>
                      <p className="mt-1 text-sm text-gray-600">{action.description}</p>
                      {action.target_user_name && (
                        <p className="mt-1 text-sm text-gray-500">
                          Target: {action.target_user_name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityLog;
