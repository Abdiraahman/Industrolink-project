import { apiRequest } from './base';
import { Student } from '../../types/student';

export interface LecturerProfile {
  lecturer_id: string;
  department: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface LecturerUpdateData {
  department: string;
  title: string;
}

export interface StudentAssignment {
  assignment_id: string;
  lecturer: {
    lecturer_id: string;
    user: {
      first_name: string;
      last_name: string;
      email: string;
    };
    department: string;
    title: string;
  };
  student: Student;
  assigned_by: {
    supervisor_id: string;
    user: {
      first_name: string;
      last_name: string;
    };
  };
  assigned_at: string;
  is_active: boolean;
  notes?: string;
}

export interface StudentDetails {
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  registration_no: string;
  academic_year: string;
  course: string;
  year_of_study: string;
  company_name: string;
  duration_in_weeks: number;
  start_date: string;
  completion_date: string;
  created_at: string;
  recent_tasks: Task[];
}

export interface Task {
  id: string;
  description: string;
  date: string;
  hours_spent: number;
  approved: boolean;
  created_at: string;
  task_category?: string;
  tools_used: string[];
  skills_applied: string[];
  supervisor_comments?: string;
}

export interface TaskWithStudent extends Task {
  student: {
    user_id: string;
    name: string;
    email: string;
    registration_no: string;
  };
}

export const lecturersApi = {
  // Get lecturer profile
  getProfile: async (): Promise<LecturerProfile> => {
    const response = await apiRequest('/lecturers/profile/');
    return response;
  },

  // Create lecturer profile
  createProfile: async (data: Partial<LecturerProfile>): Promise<LecturerProfile> => {
    const response = await apiRequest('/lecturers/profile/create/', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return response;
  },

  // Update lecturer profile
  updateProfile: async (data: Partial<LecturerProfile>): Promise<LecturerProfile> => {
    const response = await apiRequest('/lecturers/profile/', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    return response;
  },

  // Get assigned students
  getAssignedStudents: async (): Promise<Student[]> => {
    const response = await apiRequest('/lecturers/students/');
    // Handle both direct array and paginated response
    return Array.isArray(response) ? response : (response.results || response);
  },

  // Get student assignments
  getStudentAssignments: async (): Promise<StudentAssignment[]> => {
    const response = await apiRequest('/lecturers/assignments/');
    return response;
  },

  // Get detailed student information
  getStudentDetails: async (studentId: string): Promise<StudentDetails> => {
    const response = await apiRequest(`/lecturers/students/${studentId}/`);
    return response;
  },

  // Get tasks with filtering
  getTasks: async (filters?: {
    start_date?: string;
    end_date?: string;
    student_id?: string;
    approved?: boolean;
  }): Promise<{ tasks: TaskWithStudent[]; total_count: number }> => {
    const params = new URLSearchParams();
    if (filters?.start_date) params.append('start_date', filters.start_date);
    if (filters?.end_date) params.append('end_date', filters.end_date);
    if (filters?.student_id) params.append('student_id', filters.student_id);
    if (filters?.approved !== undefined) params.append('approved', filters.approved.toString());
    
    const queryString = params.toString();
    const url = queryString ? `/lecturers/tasks/?${queryString}` : '/lecturers/tasks/';
    const response = await apiRequest(url);
    return response;
  },

  // Task approval is now handled by supervisors only
};

