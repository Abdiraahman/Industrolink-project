export interface Student {
  id: string;
  student_id?: string;
  name: string;
  email: string;
  registration: string;
  registration_no?: string;
  course: string;
  university: string;
  year: string;
  yearOfStudy: string;
  year_of_study?: string;
  phoneNumber: string;
  profileComplete: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // Additional properties from backend
  academic_year?: string;
  duration_in_weeks?: number;
  start_date?: string;
  completion_date?: string;
  company_name?: string;
  user_name?: string;
  user_email?: string;
}

export interface InternshipInfo {
  id: string;
  studentId: string;
  institution: string;
  duration: string;
  period: string;
  supervisor: string;
  course: string;
  university: string;
  startDate?: Date;
  endDate?: Date;
  status: 'pending' | 'active' | 'completed';
}

export interface DailyReport {
  id: string;
  studentId: string;
  date: Date;
  workDone: string;
  newSkills: string;
  challenges: string;
  submittedAt: Date;
  status: 'draft' | 'submitted' | 'reviewed';
}

export interface StudentTask {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  priority: 'low' | 'medium' | 'high';
  attachments?: string[];
}

export interface StudentSubmission {
  id: string;
  taskId: string;
  studentId: string;
  content: string;
  attachments: string[];
  submittedAt: Date;
  grade?: number;
  feedback?: string;
  status: 'submitted' | 'graded' | 'needs_revision';
}