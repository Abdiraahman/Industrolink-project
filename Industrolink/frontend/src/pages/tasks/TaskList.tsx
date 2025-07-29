import { useTasks } from '../../hooks/tasks/useTasks'
import { TaskCard } from '../../components/features/students/TaskCard'

const TaskList = () => {
  const { tasks, loading, submitTask } = useTasks()

  if (loading) {
    return <div>Loading tasks...</div>
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">My Tasks</h1>
      <div className="space-y-4">
        {tasks.map(task => (
          <TaskCard key={task.id} task={task} onSubmit={submitTask} />
        ))}
      </div>
    </div>
  )
}

export default TaskList