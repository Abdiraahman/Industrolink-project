export interface StudentAttachment {
  institution: string;
  duration: string;
  period: string;
  supervisor: string;
  course: string;
  university: string;
}

export interface StudentProgress {
  percentage: number;
  startDate: Date;
  endDate: Date;
  status: 'not_started' | 'in_progress' | 'completed';
}

export interface StudentDashboardData {
  attachment: StudentAttachment;
  progress: StudentProgress;
  stats: DashboardStats;
}