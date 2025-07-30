import { Task } from '../../../types/task'
import { Card, Button } from '../../ui'

interface TaskCardProps {
  task: Task
  onSubmit: (taskId: string, content: string) => void
}

export const TaskCard = ({ task, onSubmit }: TaskCardProps) => {
  const handleSubmit = () => {
    const content = prompt('Enter your submission:')
    if (content) {
      onSubmit(task.id, content)
    }
  }

  return (
    <Card>
      <h3 className="text-lg font-semibold">{task.title}</h3>
      <p className="text-gray-600 mt-2">{task.description}</p>
      <p className="text-sm text-gray-500 mt-2">Due: {task.dueDate}</p>
      <div className="mt-4 flex justify-between items-center">
        <span className={`px-2 py-1 rounded text-sm ${
          task.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
          task.status === 'submitted' ? 'bg-blue-100 text-blue-800' :
          'bg-green-100 text-green-800'
        }`}>
          {task.status}
        </span>
        {task.status === 'pending' && (
          <Button onClick={handleSubmit}>Submit</Button>
        )}
      </div>
    </Card>
  )
}