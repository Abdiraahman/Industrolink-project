import { DailyTask, DailyTaskSubmission, DailyTaskFormData } from '@/types/task';

// Base API configuration - replace with your actual API base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

class DailyTasksAPI {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  /**
   * Submit a new daily task
   */
  async submitDailyTask(taskData: DailyTaskFormData): Promise<DailyTask> {
    const response = await fetch(`${API_BASE_URL}/daily-tasks/`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(taskData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Get daily tasks for a student
   */
  async getDailyTasks(
    studentId?: string,
    params?: {
      limit?: number;
      offset?: number;
      date_from?: string;
      date_to?: string;
      approved?: boolean;
      task_category?: string;
    }
  ): Promise<{ results: DailyTask[]; count: number }> {
    const queryParams = new URLSearchParams();
    
    if (studentId) queryParams.append('student', studentId);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());
    if (params?.date_from) queryParams.append('date_from', params.date_from);
    if (params?.date_to) queryParams.append('date_to', params.date_to);
    if (params?.approved !== undefined) queryParams.append('approved', params.approved.toString());
    if (params?.task_category) queryParams.append('task_category', params.task_category);

    const response = await fetch(`${API_BASE_URL}/daily-tasks/?${queryParams}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Get a specific daily task by ID
   */
  async getDailyTask(taskId: string): Promise<DailyTask> {
    const response = await fetch(`${API_BASE_URL}/daily-tasks/${taskId}/`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Update a daily task
   */
  async updateDailyTask(taskId: string, taskData: Partial<DailyTaskFormData>): Promise<DailyTask> {
    const response = await fetch(`${API_BASE_URL}/daily-tasks/${taskId}/`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(taskData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Delete a daily task
   */
  async deleteDailyTask(taskId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/daily-tasks/${taskId}/`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  }

  /**
   * Get weekly summary of tasks
   */
  async getWeeklySummary(
    studentId?: string,
    weekNumber?: number,
    year?: number
  ): Promise<{
    total_hours: number;
    total_tasks: number;
    approved_tasks: number;
    categories: { [key: string]: number };
    week_number: number;
    iso_year: number;
  }> {
    const queryParams = new URLSearchParams();
    
    if (studentId) queryParams.append('student', studentId);
    if (weekNumber) queryParams.append('week_number', weekNumber.toString());
    if (year) queryParams.append('iso_year', year.toString());

    const response = await fetch(`${API_BASE_URL}/daily-tasks/weekly-summary/?${queryParams}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Get monthly summary of tasks
   */
  async getMonthlySummary(
    studentId?: string,
    month?: number,
    year?: number
  ): Promise<{
    total_hours: number;
    total_tasks: number;
    approved_tasks: number;
    categories: { [key: string]: number };
    month: number;
    year: number;
  }> {
    const queryParams = new URLSearchParams();
    
    if (studentId) queryParams.append('student', studentId);
    if (month) queryParams.append('month', month.toString());
    if (year) queryParams.append('year', year.toString());

    const response = await fetch(`${API_BASE_URL}/daily-tasks/monthly-summary/?${queryParams}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Approve a daily task (for supervisors/lecturers)
   */
  async approveDailyTask(taskId: string): Promise<DailyTask> {
    const response = await fetch(`${API_BASE_URL}/daily-tasks/${taskId}/approve/`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Reject a daily task (for supervisors/lecturers)
   */
  async rejectDailyTask(taskId: string, reason?: string): Promise<DailyTask> {
    const response = await fetch(`${API_BASE_URL}/daily-tasks/${taskId}/reject/`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ reason }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }
}

// Export a singleton instance
export const dailyTasksAPI = new DailyTasksAPI();
export default dailyTasksAPI;