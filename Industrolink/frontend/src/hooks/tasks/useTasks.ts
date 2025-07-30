import { useState, useEffect } from 'react'
import { taskService } from '../../services/api/tasks'
//import { Task } from '../../types/task'
import type { Task } from '../../types/task'


export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const data = await taskService.getTasks()
        setTasks(data)
      } catch (error) {
        console.error('Failed to fetch tasks:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTasks()
  }, [])

  const submitTask = async (taskId: string, content: string) => {
    try {
      await taskService.submitTask(taskId, content)
      setTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, status: 'submitted' as const } : task
      ))
    } catch (error) {
      console.error('Failed to submit task:', error)
    }
  }

  return { tasks, loading, submitTask }
}