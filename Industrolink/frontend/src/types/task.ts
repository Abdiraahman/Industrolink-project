export interface TaskCategory {
  id: string;
  name: string;
  description?: string;
  color?: string;
  is_user_created?: boolean;
  created_by?: string;
  created_at?: string;
}

export interface DailyTask {
  id: string;
  student: string; // Student ID
  date: string; // ISO date string
  description: string;
  task_category: TaskCategory;
  tools_used: string[];
  skills_applied: string[];
  hours_spent: number;
  approved: boolean;
  created_at: string; // ISO datetime string
  updated_at: string; // ISO datetime string
  week_number: number;
  iso_year: number;
}

export interface DailyTaskFormData {
  description: string;
  task_category: string; // Category ID
  tools_used: string[];
  skills_applied: string[];
  hours_spent: number;
}

export interface DailyTaskSubmission {
  description: string;
  task_category: string;
  tools_used: string[];
  skills_applied: string[];
  hours_spent: number;
}

// Common tools and skills for suggestions
export const COMMON_TOOLS = [
  'Visual Studio Code',
  'Git',
  'GitHub',
  'Docker',
  'Postman',
  'Figma',
  'Adobe Photoshop',
  'Microsoft Office',
  'Slack',
  'Jira',
  'Trello',
  'Notion',
  'Chrome DevTools',
  'Terminal/Command Line',
  'Database Management Tools',
  'Testing Frameworks',
  'IDE/Text Editors',
  'Version Control Systems',
  'Cloud Platforms',
  'Design Software'
];

export const COMMON_SKILLS = [
  'Problem Solving',
  'Communication',
  'Teamwork',
  'Time Management',
  'Critical Thinking',
  'Research',
  'Documentation',
  'Testing',
  'Debugging',
  'Code Review',
  'Project Management',
  'Client Interaction',
  'Presentation',
  'Data Analysis',
  'UI/UX Design',
  'Database Design',
  'API Development',
  'Frontend Development',
  'Backend Development',
  'System Architecture'
];

// Remove hardcoded categories since we'll fetch from backend
// export const TASK_CATEGORIES: TaskCategory[] = [...];