// Admin user interface based on existing User model
export interface AdminUser {
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'admin';
  is_active: boolean;
  created_at: string;
}

// Admin invitation interface
export interface AdminInvite {
  id: string;
  email: string;
  token: string;
  created_by: string;
  created_by_name: string;
  created_at: string;
  expires_at: string;
  used: boolean;
  used_at?: string;
  used_by?: string;
  status: 'active' | 'used' | 'expired';
}

// Admin action interface
export interface AdminAction {
  id: string;
  admin: string;
  admin_name: string;
  action_type: string;
  action_type_display: string;
  target_user?: string;
  target_user_name?: string;
  description: string;
  metadata: Record<string, any>;
  created_at: string;
}

// Admin settings interface
export interface AdminSettings {
  id: string;
  key: string;
  value: string;
  description: string;
  created_at: string;
  updated_at: string;
}

// User management data interface
export interface UserManagementData {
  action: 'activate' | 'deactivate' | 'delete' | 'approve';
  user_id: string;
  reason?: string;
}

// Student assignment data interface
export interface StudentAssignmentData {
  student_id: string;
  lecturer_id: string;
  action: 'assign' | 'unassign';
}

// User list filters interface
export interface UserListFilters {
  role?: 'student' | 'lecturer' | 'supervisor';
  status?: 'active' | 'inactive' | 'pending';
  search?: string;
  page?: number;
  page_size?: number;
}

// User data interface based on existing User model
export interface UserData {
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'student' | 'lecturer' | 'supervisor' | 'admin';
  is_active: boolean;
  created_at: string;
  profile_completed: boolean;
  email_verified: boolean;
}

// User list response interface
export interface UserListResponse {
  users: UserData[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// Dashboard statistics interface
export interface DashboardStats {
  total_students: number;
  total_lecturers: number;
  total_supervisors: number;
  total_admins: number;
  pending_approvals: number;
  recent_actions: AdminAction[];
}

// Admin login data interface
export interface AdminLoginData {
  email: string;
  password: string;
}

// Admin registration data interface
export interface AdminRegisterData {
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  confirm_password: string;
}

// Admin invite data interface
export interface AdminInviteData {
  email: string;
}
