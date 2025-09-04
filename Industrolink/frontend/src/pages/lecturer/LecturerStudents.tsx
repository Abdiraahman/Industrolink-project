import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Filter, Eye, Edit, BookOpen, GraduationCap, Calendar } from 'lucide-react'
import { lecturersApi } from '../../services/api/lecturers'
import { Student } from '../../types/student'

interface AssignedStudent extends Student {
  company_name?: string;
  user_name?: string;
  user_email?: string;
  assignment_notes?: string;
  assigned_at?: string;
}

const LecturerStudents = (): React.JSX.Element => {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [students, setStudents] = useState<AssignedStudent[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    try {
      setLoading(true)
      const data = await lecturersApi.getAssignedStudents()
      setStudents(data)
      setError(null)
    } catch (err) {
      setError('Failed to fetch assigned students')
      console.error('Error fetching students:', err)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'inactive':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      (student.user_name || student.name || `${student.first_name || ''} ${student.last_name || ''}`.trim() || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.user_email || student.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.course || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.registration_no || student.registration || '').toLowerCase().includes(searchTerm.toLowerCase())
    
    // Calculate status based on dates
    const now = new Date()
    const startDate = new Date(student.start_date || '')
    const endDate = new Date(student.completion_date || '')
    
    let status = 'pending'
    if (now >= startDate && now <= endDate) {
      status = 'active'
    } else if (now > endDate) {
      status = 'completed'
    }
    
    const matchesFilter = filterStatus === 'all' || status === filterStatus
    return matchesSearch && matchesFilter
  })

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
          onClick={fetchStudents}
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
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Assigned Students</h2>
          <p className="text-gray-600 mt-1">Students assigned to you by supervisors</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button 
            onClick={() => navigate('/tasks/management')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Calendar size={20} />
            <span>Task Management</span>
          </button>
          <button 
            onClick={() => navigate('/feedback/management')}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <GraduationCap size={20} />
            <span>Evaluate Students</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter size={20} className="text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Course
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
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
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    No students assigned to you yet
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => {
                  // Calculate status based on dates
                  const now = new Date()
                  const startDate = new Date(student.start_date || '')
                  const endDate = new Date(student.completion_date || '')
                  
                  let status = 'pending'
                  if (now >= startDate && now <= endDate) {
                    status = 'active'
                  } else if (now > endDate) {
                    status = 'completed'
                  }

                  return (
                    <tr key={student.student_id || student.user_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {student.user_name || student.name || `${student.first_name || ''} ${student.last_name || ''}`.trim() || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {student.user_email || student.email || 'N/A'}
                          </div>
                          <div className="text-xs text-gray-400">
                            Reg: {student.registration_no || student.registration || 'N/A'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{student.course || 'N/A'}</div>
                        <div className="text-xs text-gray-500">
                          Year: {student.year_of_study || student.yearOfStudy || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {student.company_name || 'Company'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {student.start_date && student.completion_date ? (
                            <>
                              {new Date(student.start_date).toLocaleDateString()} - {new Date(student.completion_date).toLocaleDateString()}
                            </>
                          ) : (
                            'N/A'
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          {student.duration_in_weeks || 'N/A'} weeks
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(status)}`}>
                          {status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => navigate(`/lecturer/students/${student.student_id || student.user_id}`)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded" 
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                          <button 
                            onClick={() => navigate('/feedback/management')}
                            className="text-green-600 hover:text-green-900 p-1 rounded" 
                            title="Evaluate"
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            onClick={() => navigate('/tasks/management')}
                            className="text-purple-600 hover:text-purple-900 p-1 rounded" 
                            title="View Tasks"
                          >
                            <BookOpen size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-gray-900">{students.length}</div>
          <div className="text-sm text-gray-600">Total Assigned</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-green-600">
            {students.filter(s => {
              const now = new Date()
              const startDate = new Date(s.start_date || '')
              const endDate = new Date(s.completion_date || '')
              return now >= startDate && now <= endDate
            }).length}
          </div>
          <div className="text-sm text-gray-600">Active</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-blue-600">
            {students.filter(s => {
              const now = new Date()
              const endDate = new Date(s.completion_date || '')
              return now > endDate
            }).length}
          </div>
          <div className="text-sm text-gray-600">Completed</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-yellow-600">
            {students.filter(s => {
              const now = new Date()
              const startDate = new Date(s.start_date || '')
              return now < startDate
            }).length}
          </div>
          <div className="text-sm text-gray-600">Pending</div>
        </div>
      </div>
    </div>
  )
}

export default LecturerStudents
