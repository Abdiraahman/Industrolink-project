export interface Student {
  id: string;
  name: string;
  email: string;
  registration: string;
  course: string;
  university: string;
  year: string;
  yearOfStudy: string;
  phoneNumber: string;
  profileComplete: boolean;
  createdAt: Date;
  updatedAt: Date;
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