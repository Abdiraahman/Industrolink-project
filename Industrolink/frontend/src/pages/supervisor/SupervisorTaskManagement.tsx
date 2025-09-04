import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { 
  Search, 
  Filter, 
  Calendar, 
  User, 
  CheckCircle, 
  Clock, 
  ClipboardCheck,
  MessageSquare,
  ArrowLeft
} from 'lucide-react'
import { supervisorsApi, Task, WeeklyTasksResponse } from '../../services/api/supervisors'
import { Student } from '../../types/student'

const SupervisorTaskManagement: React.FC = () => {
  const [searchParams] = useSearchParams()
  const [tasks, setTasks] = useState<Task[]>([])
  const [weeklyTasks, setWeeklyTasks] = useState<WeeklyTasksResponse | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedStudent, setSelectedStudent] = useState<string>('')

  const [showWeeklyView, setShowWeeklyView] = useState<boolean>(false)
  
  // Filters
  const [filters, setFilters] = useState({
    student: '',
    approved: undefined as boolean | undefined,
    date_from: '',
    date_to: '',
    week: undefined as number | undefined
  })

  const selectedStudentId = searchParams.get('student')

  useEffect(() => {
    if (selectedStudentId) {
      setSelectedStudent(selectedStudentId)
      setFilters(prev => ({ ...prev, student: selectedStudentId }))
      fetchWeeklyTasks(selectedStudentId)
    } else {
      setShowWeeklyView(false)
      fetchTasks()
    }
    fetchStudents()
  }, [selectedStudentId])

  const fetchTasks = async () => {
    try {
      setLoading(true)
      const data = await supervisorsApi.getTasks(filters)
      setTasks(data)
      setError(null)
    } catch (err) {
      setError('Failed to fetch tasks')
      console.error('Error fetching tasks:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchStudents = async () => {
    try {
      const data = await supervisorsApi.getCompanyStudents()
      setStudents(data)
    } catch (err) {
      console.error('Error fetching students:', err)
    }
  }

  const fetchWeeklyTasks = async (studentId: string) => {
    try {
      setLoading(true)
      const data = await supervisorsApi.getWeeklyTasks(studentId)
      setWeeklyTasks(data)
      setError(null)
    } catch (err) {
      setError('Failed to fetch weekly tasks')
      console.error('Error fetching weekly tasks:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key: string, value: string | boolean | number | undefined) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    if (!showWeeklyView) {
      fetchTasks()
    }
  }

  const handleTaskApproval = async (taskId: string, comments?: string) => {
    try {
      await supervisorsApi.approveTask(taskId, comments)
      // Refresh tasks
      if (showWeeklyView && selectedStudent) {
        fetchWeeklyTasks(selectedStudent)
      } else {
        fetchTasks()
      }
    } catch (err) {
      console.error('Error approving task:', err)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-8">
        <p>{error}</p>
        <button 
          onClick={() => selectedStudent ? fetchWeeklyTasks(selectedStudent) : fetchTasks()}
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center space-x-4">
          {selectedStudentId && (
            <button
              onClick={() => {
                setSelectedStudent('')
                setShowWeeklyView(false)
                setFilters(prev => ({ ...prev, student: '' }))
                fetchTasks()
              }}
              className="text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100"
            >
              <ArrowLeft size={20} />
            </button>
          )}
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {showWeeklyView ? 'Weekly Task Approval' : 'Task Management'}
            </h2>
            <p className="text-gray-600 mt-1">
              {showWeeklyView 
                ? 'Review and approve tasks by week' 
                : 'Manage and approve student tasks'
              }
            </p>
          </div>
        </div>
        
        <div className="mt-4 sm:mt-0 flex space-x-3">
          {selectedStudent && (
            <button
              onClick={() => setShowWeeklyView(!showWeeklyView)}
              className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
                showWeeklyView 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              <Calendar size={20} />
              <span>{showWeeklyView ? 'List View' : 'Weekly View'}</span>
            </button>
          )}
        </div>
      </div>

             

       {/* Filters */}
       <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                     {/* Student Filter */}
           <div>
             <label className="block text-sm font-medium text-gray-700 mb-2">Student</label>
             <select
               value={filters.student}
               onChange={(e) => handleFilterChange('student', e.target.value)}
               className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
             >
               <option value="">All Students</option>
               {students.map(student => (
                 <option key={student.student_id || student.id} value={student.student_id || student.id}>
                   {student.user_name || `${student.first_name} ${student.last_name}`}
                 </option>
               ))}
             </select>
             
           </div>

          {/* Approval Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filters.approved === undefined ? '' : filters.approved.toString()}
              onChange={(e) => handleFilterChange('approved', e.target.value === '' ? undefined : e.target.value === 'true')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All</option>
              <option value="false">Pending</option>
              <option value="true">Approved</option>
            </select>
          </div>

          {/* Date From Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
            <input
              type="date"
              value={filters.date_from}
              onChange={(e) => handleFilterChange('date_from', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Date To Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
            <input
              type="date"
              value={filters.date_to}
              onChange={(e) => handleFilterChange('date_to', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Week Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Week</label>
            <input
              type="number"
              placeholder="Week #"
              value={filters.week || ''}
              onChange={(e) => handleFilterChange('week', e.target.value ? parseInt(e.target.value) : undefined)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

                    

      {/* Tasks Display */}
      {showWeeklyView && weeklyTasks ? (
        <div className="space-y-6">
                                
           
           {Object.entries(weeklyTasks.weekly_tasks).map(([week, weekTasks]) => (
             <div key={week} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
               <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                 <h3 className="text-lg font-semibold text-gray-900">{week}</h3>
                 <p className="text-sm text-gray-600">{weekTasks.length} task(s)</p>
               </div>
                              {/* Weekly View Table Header */}
               <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                 <div className="grid grid-cols-6 gap-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                   <div>Student</div>
                   <div>Date</div>
                   <div>Task</div>
                   <div>Hours</div>
                   <div>Status</div>
                   <div>Actions</div>
                 </div>
               </div>
               <div className="divide-y divide-gray-200">
                                    {weekTasks.map((task) => (
                     <TaskRow
                       key={task.id}
                       task={task}
                       onApprove={handleTaskApproval}
                     />
                   ))}
               </div>
             </div>
           ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                             <thead className="bg-gray-50">
                 <tr>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                     Student
                   </th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                     Date
                   </th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                     Task
                   </th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                     Hours
                   </th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                     Status
                   </th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                     Actions
                   </th>
                 </tr>
               </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                                 {tasks.length === 0 ? (
                   <tr>
                     <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                       No tasks found
                     </td>
                   </tr>
                 ) : (
                   tasks.map((task) => (
                     <TaskRow
                       key={task.id}
                       task={task}
                       onApprove={handleTaskApproval}
                     />
                   ))
                 )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

interface TaskRowProps {
  task: Task
  onApprove: (taskId: string, comments?: string) => void
}

const TaskRow: React.FC<TaskRowProps> = ({ 
  task, 
  onApprove
}) => {
  const [showCommentInput, setShowCommentInput] = useState(false)
  const [comments, setComments] = useState('')

  const handleApprove = () => {
    if (showCommentInput && comments.trim()) {
      onApprove(task.id, comments.trim())
      setComments('')
      setShowCommentInput(false)
    } else {
      onApprove(task.id)
    }
  }

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
         <div>
           <div className="text-sm font-medium text-gray-900">
             {task.student.user.first_name} {task.student.user.last_name}
           </div>
           <div className="text-sm text-gray-500">{task.student.user.email}</div>
         </div>
       </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">
          {new Date(task.date).toLocaleDateString()}
        </div>
        <div className="text-xs text-gray-500">Week {task.week_number}</div>
      </td>
      <td className="px-6 py-4">
        <div>
          <div className="text-sm font-medium text-gray-900">{task.task_category_name}</div>
          <div className="text-sm text-gray-600 line-clamp-2">{task.description}</div>
          {task.tools_used.length > 0 && (
            <div className="text-xs text-gray-500 mt-1">
              Tools: {task.tools_used.join(', ')}
            </div>
          )}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{task.hours_spent}h</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          task.approved 
            ? 'bg-green-100 text-green-800' 
            : 'bg-yellow-100 text-yellow-800'
        }`}>
          {task.approved ? (
            <span className="flex items-center space-x-1">
              <CheckCircle size={12} />
              <span>Approved</span>
            </span>
          ) : (
            <span className="flex items-center space-x-1">
              <Clock size={12} />
              <span>Pending</span>
            </span>
          )}
        </span>
      </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
         {!task.approved && (
           <div className="flex items-center space-x-2">
             {showCommentInput ? (
               <div className="flex items-center space-x-2">
                 <input
                   type="text"
                   placeholder="Add comments..."
                   value={comments}
                   onChange={(e) => setComments(e.target.value)}
                   className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                 />
                 <button
                   onClick={handleApprove}
                   className="text-green-600 hover:text-green-900 p-1 rounded"
                   title="Approve with comments"
                 >
                   <CheckCircle size={16} />
                 </button>
                 <button
                   onClick={() => setShowCommentInput(false)}
                   className="text-gray-600 hover:text-gray-900 p-1 rounded"
                   title="Cancel"
                 >
                   ×
                 </button>
               </div>
             ) : (
               <>
                 <button
                   onClick={() => setShowCommentInput(true)}
                   className="text-blue-600 hover:text-blue-900 p-1 rounded"
                   title="Approve with comments"
                 >
                   <MessageSquare size={16} />
                 </button>
                 <button
                   onClick={handleApprove}
                   className="text-green-600 hover:text-green-900 p-1 rounded"
                   title="Approve task"
                 >
                   <CheckCircle size={16} />
                 </button>
               </>
             )}
           </div>
         )}
         {task.approved && task.supervisor_comments && (
           <div className="text-xs text-gray-600">
             "{task.supervisor_comments}"
           </div>
         )}
       </td>
    </tr>
  )
}

export default SupervisorTaskManagement
