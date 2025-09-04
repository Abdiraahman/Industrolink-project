import { apiRequest } from './base';
import { Student } from '../../types/student';

export interface StudentUpdateData {
  registration_no: string;
  academic_year: string;
  course: string;
  year_of_study: string;
  duration_in_weeks: number;
  start_date: string;
  completion_date: string;
  company_name?: string;
}

export interface StudentListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Student[];
}

export interface StudentFilters {
  search?: string;
  status?: string;
  company?: string;
  course?: string;
}

export const studentsApi = {
  // Get all students (for admins)
  getAllStudents: async (filters?: StudentFilters): Promise<StudentListResponse> => {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.company) params.append('search', filters.company);
    if (filters?.course) params.append('search', filters.course);
    
    const response = await apiRequest(`/students/?${params.toString()}`);
    return response;
  },

  // Get student by ID
  getStudentById: async (id: string): Promise<Student> => {
    const response = await apiRequest(`/students/${id}/`);
    return response;
  },

  // Get student profile
  getStudentProfile: async (): Promise<Student> => {
    const response = await apiRequest('/students/profile/');
    return response;
  },

  // Create student profile
  createStudentProfile: async (data: Partial<Student>): Promise<Student> => {
    const response = await apiRequest('/students/profile/create/', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return response;
  },

  // Update student profile
  updateStudentProfile: async (data: Partial<Student>): Promise<Student> => {
    const response = await apiRequest('/students/profile/', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    return response;
  },

  // Update student profile (alias for compatibility)
  updateProfile: async (data: Partial<Student>): Promise<Student> => {
    const response = await apiRequest('/students/profile/', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    return response;
  }
};
