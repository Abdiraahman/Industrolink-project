import { apiRequest } from './base';
import { Student } from '../../types/student';

export interface Company {
  company_id: string;
  name: string;
  address: string;
  phone_number: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface SupervisorProfile {
  supervisor_id: string;
  company: Company;
  phone_number: string;
  position: string;
  created_at: string;
  updated_at: string;
}

export interface LecturerAssignment {
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

export const supervisorsApi = {
  // Get supervisor profile
  getProfile: async (): Promise<SupervisorProfile> => {
    const response = await apiRequest('/supervisors/profile/');
    return response;
  },

  // Create supervisor profile
  createProfile: async (data: Partial<SupervisorProfile>): Promise<SupervisorProfile> => {
    const response = await apiRequest('/supervisors/profile/create/', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return response;
  },

  // Update supervisor profile
  updateProfile: async (data: Partial<SupervisorProfile>): Promise<SupervisorProfile> => {
    const response = await apiRequest('/supervisors/profile/', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    return response;
  },

  // Get students under supervisor's company
  getCompanyStudents: async (): Promise<Student[]> => {
    const response = await apiRequest('/supervisors/students/');
    return response;
  },

  // Get lecturer assignments made by supervisor
  getLecturerAssignments: async (): Promise<LecturerAssignment[]> => {
    const response = await apiRequest('/supervisors/lecturer-assignments/');
    return response;
  },

  // Get companies
  getCompanies: async (): Promise<Company[]> => {
    const response = await apiRequest('/supervisors/companies/');
    return response;
  },

  // Create company
  createCompany: async (data: Partial<Company>): Promise<Company> => {
    const response = await apiRequest('/supervisors/companies/create/', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return response;
  }
};
