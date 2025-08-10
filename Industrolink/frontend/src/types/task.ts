export interface TaskCategory {
  id: string;
  name: string;
  description?: string;
  color?: string;
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

export const TASK_CATEGORIES: TaskCategory[] = [
  { id: '1', name: 'Development', description: 'Software development tasks', color: '#3B82F6' },
  { id: '2', name: 'Design', description: 'UI/UX design tasks', color: '#EF4444' },
  { id: '3', name: 'Testing', description: 'Quality assurance and testing', color: '#10B981' },
  { id: '4', name: 'Research', description: 'Research and analysis tasks', color: '#F59E0B' },
  { id: '5', name: 'Documentation', description: 'Documentation and writing', color: '#8B5CF6' },
  { id: '6', name: 'Meeting', description: 'Meetings and discussions', color: '#06B6D4' },
  { id: '7', name: 'Training', description: 'Learning and training activities', color: '#84CC16' },
  { id: '8', name: 'Administration', description: 'Administrative tasks', color: '#6B7280' },
];