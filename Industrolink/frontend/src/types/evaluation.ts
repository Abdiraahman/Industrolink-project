import { type BaseEntity, type Status } from './common';

export interface Evaluation extends BaseEntity {
  studentName: string;
  evaluationType: string;
  dueDate: string;
  submittedDate: string | null;
  status: Status;
  score: number | null;
  feedback: string | null;
}

export interface EvaluationFilters {
  searchTerm: string;
  filterStatus: Status | 'all';
}