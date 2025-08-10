export interface DashboardStats {
  totalStudents: number;
  activeEvaluations: number;
  pendingMessages: number;
  systemStatus: 'Online' | 'Offline' | 'Maintenance';
}


export const BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
  desktop: 1200,
} as const

export type Breakpoint = keyof typeof BREAKPOINTS




// added during admin pages

export interface BaseEntity {
  id: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export type Status = 'active' | 'completed' | 'pending' | 'overdue' | 'under_review' | 'draft' | 'inactive';

export interface StatCard {
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative';
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
}