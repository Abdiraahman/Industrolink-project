import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Settings as SettingsIcon, Save, Edit, X } from 'lucide-react';
import { adminApi } from '../../services/adminApi';
import { AdminSettings } from '../../types/admin';

const Settings: React.FC = () => {
  const [settings, setSettings] = useState<AdminSettings[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const data = await adminApi.getSettings();
      setSettings(data);
    } catch (error: any) {
      if (error.status === 401) {
        toast.error('Session expired. Please login again.');
        // Clear admin session and redirect to login
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        window.location.href = '/login';
        return;
      }
      toast.error('Failed to fetch settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (setting: AdminSettings) => {
    setEditingId(setting.id);
    setEditValue(setting.value);
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditValue('');
  };

  const handleSave = async (settingId: string) => {
    try {
      await adminApi.updateSetting(settingId, { value: editValue });
      toast.success('Setting updated successfully');
      setEditingId(null);
      setEditValue('');
      fetchSettings(); // Refresh the list
    } catch (error) {
      toast.error('Failed to update setting');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">System Settings</h1>
        <p className="text-gray-600">Manage application configuration and preferences</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Configuration ({settings.length})
          </h3>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {settings.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <SettingsIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No settings configured</h3>
                <p className="mt-1 text-sm text-gray-500">System settings will appear here.</p>
              </div>
            ) : (
              settings.map((setting) => (
                <div key={setting.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-medium text-gray-900">{setting.key}</h4>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {setting.description}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">
                        Last updated: {formatDate(setting.updated_at)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {editingId === setting.id ? (
                        <>
                          <input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          />
                          <button
                            onClick={() => handleSave(setting.id)}
                            className="p-1 text-green-600 hover:text-green-900"
                            title="Save"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                          <button
                            onClick={handleCancel}
                            className="p-1 text-gray-600 hover:text-gray-900"
                            title="Cancel"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <span className="text-sm text-gray-900 font-mono bg-gray-50 px-2 py-1 rounded">
                            {setting.value}
                          </span>
                          <button
                            onClick={() => handleEdit(setting)}
                            className="p-1 text-indigo-600 hover:text-indigo-900"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </>
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

export default Settings;
