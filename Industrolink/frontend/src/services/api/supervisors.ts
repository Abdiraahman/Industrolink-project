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

export interface SupervisorUpdateData {
  phone_number: string;
  position: string;
  company_name?: string;
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

export interface Task {
  id: string;
  student: {
    student_id: string;
    user: {
      first_name: string;
      last_name: string;
      email: string;
    };
  };
  date: string;
  description: string;
  task_category_name: string;
  tools_used: string[];
  skills_applied: string[];
  hours_spent: number;
  approved: boolean;
  supervisor_comments?: string;
  approved_at?: string;
  week_number: number;
  iso_year: number;
  created_at: string;
}

export interface WeeklyTasksResponse {
  weekly_tasks: { [week: string]: Task[] };
  total_tasks: number;
  total_weeks: number;
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

  // Get available companies
  getCompanies: async (): Promise<Company[]> => {
    const response = await apiRequest('/supervisors/companies/');
    return response.results || response;
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



  // Create company
  createCompany: async (data: Partial<Company>): Promise<Company> => {
    const response = await apiRequest('/supervisors/companies/create/', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return response;
  },

  // Task management methods
  getTasks: async (filters?: {
    student?: string;
    approved?: boolean;
    date_from?: string;
    date_to?: string;
    week?: number;
  }): Promise<Task[]> => {
    const params = new URLSearchParams();
    if (filters?.student) params.append('student', filters.student);
    if (filters?.approved !== undefined) params.append('approved', filters.approved.toString());
    if (filters?.date_from) params.append('date_from', filters.date_from);
    if (filters?.date_to) params.append('date_to', filters.date_to);
    if (filters?.week) params.append('week', filters.week.toString());
    
    const response = await apiRequest(`/supervisors/tasks/?${params.toString()}`);
    return response;
  },

  approveTask: async (taskId: string, comments?: string): Promise<Task> => {
    const response = await apiRequest(`/supervisors/tasks/${taskId}/approve/`, {
      method: 'PUT',
      body: JSON.stringify({
        approved: true,
        supervisor_comments: comments || ''
      })
    });
    return response;
  },

  bulkApproveTasks: async (taskIds: string[], comments?: string): Promise<{ message: string; approved_count: number }> => {
    const response = await apiRequest('/supervisors/tasks/bulk-approve/', {
      method: 'POST',
      body: JSON.stringify({
        task_ids: taskIds,
        comments: comments || ''
      })
    });
    return response;
  },

  getWeeklyTasks: async (studentId: string): Promise<WeeklyTasksResponse> => {
    const response = await apiRequest(`/supervisors/tasks/student/${studentId}/weekly/`);
    return response;
  }
};
