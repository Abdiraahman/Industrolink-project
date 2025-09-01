import { apiRequest } from './base';
import { Student } from '../../types/student';

export interface LecturerProfile {
  lecturer_id: string;
  department: string;
  title: string;
  created_at: string;
  updated_at: string;
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
    return response;
  },

  // Get student assignments
  getStudentAssignments: async (): Promise<StudentAssignment[]> => {
    const response = await apiRequest('/lecturers/assignments/');
    return response;
  }
};

