import { DailyTask, DailyTaskSubmission, DailyTaskFormData, TaskCategory } from '@/types/task';

// Base API configuration - replace with your actual API base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

class DailyTasksAPI {
  private getAuthHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
    };
  }

  /**
   * Get all task categories
   */
  async getTaskCategories(): Promise<TaskCategory[]> {
    const response = await fetch(`${API_BASE_URL}/api/students/task-categories/`, {
      headers: this.getAuthHeaders(),
      credentials: 'include', // Use HTTP-only cookies for authentication
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Create a new task category
   */
  async createTaskCategory(categoryData: { name: string; description?: string }): Promise<TaskCategory> {
    const response = await fetch(`${API_BASE_URL}/api/students/task-categories/`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      credentials: 'include', // Use HTTP-only cookies for authentication
      body: JSON.stringify(categoryData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Submit a new daily task
   */
  async submitDailyTask(taskData: DailyTaskFormData): Promise<DailyTask> {
    const response = await fetch(`${API_BASE_URL}/api/students/tasks/create/`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      credentials: 'include', // Use HTTP-only cookies for authentication
      body: JSON.stringify(taskData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Backend validation error:', errorData);
      
      // Extract detailed error messages
      let errorMessage = 'Failed to submit daily task';
      if (errorData.error) {
        errorMessage = errorData.error;
      } else if (errorData.detail) {
        errorMessage = errorData.detail;
      } else if (errorData.message) {
        errorMessage = errorData.message;
      } else if (typeof errorData === 'string') {
        errorMessage = errorData;
      } else if (response.status === 400) {
        errorMessage = 'Invalid data provided. Please check your input.';
      }
      
      throw new Error(errorMessage);
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

    const response = await fetch(`${API_BASE_URL}/api/students/tasks/?${queryParams}`, {
      headers: this.getAuthHeaders(),
      credentials: 'include', // Use HTTP-only cookies for authentication
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
    const response = await fetch(`${API_BASE_URL}/api/students/tasks/${taskId}/`, {
      headers: this.getAuthHeaders(),
      credentials: 'include', // Use HTTP-only cookies for authentication
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Get today's task for the authenticated student
   */
  async getTodayTask(): Promise<DailyTask | null> {
    const response = await fetch(`${API_BASE_URL}/api/students/tasks/today/`, {
      headers: this.getAuthHeaders(),
      credentials: 'include', // Use HTTP-only cookies for authentication
    });

    if (!response.ok) {
      if (response.status === 404) {
        // No task found for today
        return null;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Update a daily task
   */
  async updateDailyTask(taskId: string, taskData: Partial<DailyTaskFormData>): Promise<DailyTask> {
    const response = await fetch(`${API_BASE_URL}/api/students/tasks/${taskId}/`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      credentials: 'include', // Use HTTP-only cookies for authentication
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
    const response = await fetch(`${API_BASE_URL}/api/students/tasks/${taskId}/`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
      credentials: 'include', // Use HTTP-only cookies for authentication
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
    if (weekNumber) queryParams.append('week', weekNumber.toString());
    if (year) queryParams.append('year', year.toString());

    const response = await fetch(`${API_BASE_URL}/api/students/tasks/weekly-summary/?${queryParams}`, {
      headers: this.getAuthHeaders(),
      credentials: 'include', // Use HTTP-only cookies for authentication
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Get task statistics for the authenticated student
   */
  async getTaskStatistics(): Promise<{
    total_tasks: number;
    approved_tasks: number;
    pending_approval: number;
    total_hours: number;
    approval_rate: number;
    current_week: {
      week_number: number;
      year: number;
      task_count: number;
      hours: number;
    };
    recent_activity: {
      tasks_last_7_days: number;
    };
    category_breakdown: Array<{
      category: string;
      count: number;
      hours: number;
    }>;
    average_hours_per_task: number;
  }> {
    const response = await fetch(`${API_BASE_URL}/api/students/tasks/statistics/`, {
      headers: this.getAuthHeaders(),
      credentials: 'include', // Use HTTP-only cookies for authentication
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
    const response = await fetch(`${API_BASE_URL}/api/students/tasks/${taskId}/approve/`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      credentials: 'include', // Use HTTP-only cookies for authentication
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