export interface Task {
  id: string
  title: string
  description: string
  dueDate: string
  status: 'pending' | 'submitted' | 'reviewed'
  studentId: string
}

export interface TaskSubmission {
  id: string
  taskId: string
  content: string
  submittedAt: string
  status: 'submitted' | 'reviewed'
}