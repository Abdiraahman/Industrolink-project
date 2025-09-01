import { 
  AdminUser, 
  AdminInvite, 
  AdminAction, 
  AdminSettings,
  UserManagementData,
  StudentAssignmentData,
  UserListResponse,
  DashboardStats,
  AdminLoginData,
  AdminRegisterData,
  AdminInviteData
} from '../types/admin';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000') + '/api';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('adminToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Helper function to handle API responses
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

export const adminApi = {
  // Admin authentication
  async login(data: AdminLoginData): Promise<{ message: string; user: AdminUser }> {
    const response = await fetch(`${API_BASE_URL}/system-admin/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      credentials: 'include'
    });
    
    const result = await handleResponse(response);
    
    // Store admin token and user info
    if (result.user) {
      localStorage.setItem('adminToken', 'admin-authenticated');
      localStorage.setItem('adminUser', JSON.stringify(result.user));
    }
    
    return result;
  },

  async logout(): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/system-admin/logout/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include'
    });
    
    // Clear admin data
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    
    return handleResponse(response);
  },

  // Admin invitations
  async createInvite(data: AdminInviteData): Promise<{ message: string; invite: AdminInvite; invite_url: string }> {
    const response = await fetch(`${API_BASE_URL}/system-admin/invite/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
      credentials: 'include'
    });
    return handleResponse(response);
  },

  async getInvites(): Promise<AdminInvite[]> {
    const response = await fetch(`${API_BASE_URL}/system-admin/invites/`, {
      headers: getAuthHeaders(),
      credentials: 'include'
    });
    return handleResponse(response);
  },

  async deleteInvite(inviteId: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/system-admin/invites/${inviteId}/`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      credentials: 'include'
    });
    return handleResponse(response);
  },

  async registerViaInvite(token: string, data: AdminRegisterData): Promise<{ message: string; user: AdminUser }> {
    const response = await fetch(`${API_BASE_URL}/system-admin/register/${token}/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      credentials: 'include'
    });
    return handleResponse(response);
  },

  // Admin dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await fetch(`${API_BASE_URL}/system-admin/dashboard/`, {
      headers: getAuthHeaders(),
      credentials: 'include'
    });
    return handleResponse(response);
  },

  // User management
  async manageUser(data: UserManagementData): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/system-admin/users/manage/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
      credentials: 'include'
    });
    return handleResponse(response);
  },

  async assignStudent(data: StudentAssignmentData): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/system-admin/students/assign/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
      credentials: 'include'
    });
    return handleResponse(response);
  },

  async getUsers(filters: {
    role?: string;
    status?: string;
    search?: string;
    page?: number;
    page_size?: number;
  } = {}): Promise<UserListResponse> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== 'all') {
        params.append(key, value.toString());
      }
    });

    const response = await fetch(`${API_BASE_URL}/system-admin/users/?${params}`, {
      headers: getAuthHeaders(),
      credentials: 'include'
    });
    return handleResponse(response);
  },

  async getUserDetails(userId: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/system-admin/users/${userId}/details/`, {
      headers: getAuthHeaders(),
      credentials: 'include'
    });
    return handleResponse(response);
  },

  // User management actions
  async deleteUser(userId: string, reason: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/system-admin/users/manage/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: userId,
        action: 'delete',
        reason: reason
      }),
      credentials: 'include'
    });
    return handleResponse(response);
  },

  async approveUser(userId: string, reason: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/system-admin/users/manage/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: userId,
        action: 'approve',
        reason: reason
      }),
      credentials: 'include'
    });
    return handleResponse(response);
  },

  async deactivateUser(userId: string, reason: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/system-admin/users/manage/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: userId,
        action: 'deactivate',
        reason: reason
      }),
      credentials: 'include'
    });
    return handleResponse(response);
  },

  async activateUser(userId: string, reason: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/system-admin/users/manage/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: userId,
        action: 'activate',
        reason: reason
      }),
      credentials: 'include'
    });
    return handleResponse(response);
  },

  // Admin actions
  async getAdminActions(): Promise<AdminAction[]> {
    const response = await fetch(`${API_BASE_URL}/system-admin/actions/`, {
      headers: getAuthHeaders(),
      credentials: 'include'
    });
    return handleResponse(response);
  },

  // Admin settings
  async getSettings(): Promise<AdminSettings[]> {
    const response = await fetch(`${API_BASE_URL}/system-admin/settings/`, {
      headers: getAuthHeaders(),
      credentials: 'include'
    });
    return handleResponse(response);
  },

  async updateSetting(id: string, data: Partial<AdminSettings>): Promise<AdminSettings> {
    const response = await fetch(`${API_BASE_URL}/system-admin/settings/${id}/`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
      credentials: 'include'
    });
    return handleResponse(response);
  }
};

export default adminApi;
