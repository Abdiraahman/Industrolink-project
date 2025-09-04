import { apiRequest } from './base';

export interface UserProfile {
  user_id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  middle_name?: string;
  role: string;
  role_display: string;
  profile_completed: boolean;
  created_at: string;
  is_active: boolean;
}

export interface UserUpdateData {
  first_name: string;
  last_name: string;
  email: string;
  username: string;
}

export interface PasswordChangeData {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export const usersApi = {
  // Get current user profile
  getProfile: async (): Promise<UserProfile> => {
    const response = await apiRequest('/users/profile-view/');
    return response.user || response;
  },

  // Update user profile
  updateProfile: async (data: UserUpdateData): Promise<{ message: string; user: UserProfile }> => {
    const response = await apiRequest('/users/profile/update/', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    return response;
  },

  // Change password
  changePassword: async (data: PasswordChangeData): Promise<{ message: string }> => {
    const response = await apiRequest('/users/password/change/', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return response;
  }
};
