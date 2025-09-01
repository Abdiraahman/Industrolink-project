import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Plus, Mail, Trash2, Clock, CheckCircle, XCircle } from 'lucide-react';
import { adminApi } from '../../services/adminApi';
import { AdminInvite } from '../../types/admin';

const AdminInvitation: React.FC = () => {
  const [invites, setInvites] = useState<AdminInvite[]>([]);
  const [loading, setLoading] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchInvites();
  }, []);

  const fetchInvites = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getInvites();
      setInvites(response || []);
    } catch (error: any) {
      if (error.status === 401) {
        toast.error('Session expired. Please login again.');
        // Clear admin session and redirect to login
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        window.location.href = '/login';
        return;
      }
      toast.error('Failed to fetch invitations');
      console.error('Error fetching invites:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) {
      toast.error('Please enter an email address');
      return;
    }

    try {
      setSending(true);
      await adminApi.createInvite({ email: newEmail.trim() });
      toast.success('Invitation sent successfully');
      setNewEmail('');
      fetchInvites(); // Refresh the list
    } catch (error) {
      toast.error('Failed to send invitation');
      console.error('Error sending invite:', error);
    } finally {
      setSending(false);
    }
  };

  const deleteInvite = async (inviteId: string) => {
    if (!confirm('Are you sure you want to delete this invitation?')) {
      return;
    }

    try {
      await adminApi.deleteInvite(inviteId);
      toast.success('Invitation deleted');
      fetchInvites(); // Refresh the list
    } catch (error) {
      toast.error('Failed to delete invitation');
      console.error('Error deleting invite:', error);
    }
  };

  const getStatusIcon = (invite: AdminInvite) => {
    if (invite.used) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
    if (invite.status === 'expired') {
      return <XCircle className="w-4 h-4 text-red-500" />;
    }
    return <Clock className="w-4 h-4 text-yellow-500" />;
  };

  const getStatusText = (invite: AdminInvite) => {
    if (invite.used) {
      return 'Used';
    }
    if (invite.status === 'expired') {
      return 'Expired';
    }
    return 'Pending';
  };

  const getStatusColor = (invite: AdminInvite) => {
    if (invite.used) {
      return 'text-green-600 bg-green-50';
    }
    if (invite.status === 'expired') {
      return 'text-red-600 bg-red-50';
    }
    return 'text-yellow-600 bg-yellow-50';
  };

  const copyInviteLink = (token: string) => {
    const inviteUrl = `${window.location.origin}/system-admin/register/${token}`;
    navigator.clipboard.writeText(inviteUrl);
    toast.success('Invitation link copied to clipboard');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Invitations</h1>
          <p className="text-gray-600">Manage invitations for new admin users</p>
        </div>
      </div>

      {/* Send New Invitation */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Send New Invitation</h2>
        <form onSubmit={sendInvitation} className="flex gap-4">
          <div className="flex-1">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="Enter email address"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={sending}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Mail className="w-4 h-4" />
              {sending ? 'Sending...' : 'Send Invitation'}
            </button>
          </div>
        </form>
      </div>

      {/* Invitations List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Invitations</h2>
        </div>
        
        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading invitations...</p>
          </div>
        ) : invites.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <Mail className="w-12 h-12 mx-auto text-gray-300 mb-2" />
            <p>No invitations sent yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sent By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sent Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expires
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {invites.map((invite) => (
                  <tr key={invite.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{invite.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(invite)}
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(invite)}`}>
                          {getStatusText(invite)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {invite.created_by_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(invite.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(invite.expires_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        {!invite.used && invite.status !== 'expired' && (
                          <button
                            onClick={() => copyInviteLink(invite.token)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Copy Link
                          </button>
                        )}
                        <button
                          onClick={() => deleteInvite(invite.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminInvitation;
