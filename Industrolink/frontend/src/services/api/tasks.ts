// import { apiRequest } from './base'
// import { Task, TaskSubmission } from '../../types/task'

// export const taskService = {
//   getTasks: (): Promise<Task[]> => {
//     // Mock data for testing
//     return Promise.resolve([
//       {
//         id: '1',
//         title: 'Daily Report',
//         description: 'Submit your daily activities',
//         dueDate: '2024-07-25',
//         status: 'pending',
//         studentId: '1'
//       }
//     ])
//   },

//   submitTask: (taskId: string, content: string): Promise<TaskSubmission> => {
//     return Promise.resolve({
//       id: '1',
//       taskId,
//       content,
//       submittedAt: new Date().toISOString(),
//       status: 'submitted'
//     })
//   }
// }