export interface DashboardStats {
  totalStudents: number;
  activeEvaluations: number;
  pendingMessages: number;
  systemStatus: 'Online' | 'Offline' | 'Maintenance';
}