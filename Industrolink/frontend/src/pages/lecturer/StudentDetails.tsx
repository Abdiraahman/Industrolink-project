import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Calendar, BookOpen, Briefcase, Clock, CheckCircle, XCircle } from 'lucide-react';
import { lecturersApi, StudentDetails as StudentDetailsType } from '../../services/api/lecturers';

const StudentDetails: React.FC = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();
  const [student, setStudent] = useState<StudentDetailsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (studentId) {
      fetchStudentDetails();
    } else {
      setError('Student ID is missing');
      setLoading(false);
    }
  }, [studentId]);

  const fetchStudentDetails = async () => {
    if (!studentId) return;
    
    try {
      setLoading(true);
      const data = await lecturersApi.getStudentDetails(studentId);
      setStudent(data);
      setError(null);
    } catch (err: any) {
      setError('Failed to fetch student details');
      console.error('Error fetching student details:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (approved: boolean) => {
    return approved 
      ? 'bg-green-100 text-green-800' 
      : 'bg-yellow-100 text-yellow-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="text-center text-red-600 p-8">
        <p>{error || 'Student not found'}</p>
        <button 
          onClick={() => navigate('/lecturer/students')}
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
        >
          Back to Students
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/lecturer/students')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {student.first_name} {student.last_name}
            </h1>
            <p className="text-gray-600">{student.email}</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={() => navigate('/tasks/management')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Calendar className="h-4 w-4" />
            <span>View All Tasks</span>
          </button>
        </div>
      </div>

      {/* Student Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <User className="h-5 w-5 mr-2" />
            Basic Information
          </h3>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-500">Registration Number</label>
              <p className="text-sm text-gray-900">{student.registration_no}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Academic Year</label>
              <p className="text-sm text-gray-900">{student.academic_year}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Course</label>
              <p className="text-sm text-gray-900">{student.course}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Year of Study</label>
              <p className="text-sm text-gray-900">{student.year_of_study}</p>
            </div>
          </div>
        </div>

        {/* Attachment Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Briefcase className="h-5 w-5 mr-2" />
            Attachment Information
          </h3>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-500">Company</label>
              <p className="text-sm text-gray-900">{student.company_name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Duration</label>
              <p className="text-sm text-gray-900">{student.duration_in_weeks} weeks</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Start Date</label>
              <p className="text-sm text-gray-900">{formatDate(student.start_date)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Completion Date</label>
              <p className="text-sm text-gray-900">{formatDate(student.completion_date)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Tasks */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <BookOpen className="h-5 w-5 mr-2" />
          Recent Tasks
        </h3>
        
        {student.recent_tasks && student.recent_tasks.length > 0 ? (
          <div className="space-y-4">
            {student.recent_tasks.map((task) => (
              <div key={task.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 mb-2">{task.description}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDate(task.date)}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {task.hours_spent} hours
                      </div>
                      {task.task_category && (
                        <div className="flex items-center">
                          <BookOpen className="h-3 w-3 mr-1" />
                          {task.task_category}
                        </div>
                      )}
                    </div>
                    {task.tools_used && task.tools_used.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-500 mb-1">Tools Used:</p>
                        <div className="flex flex-wrap gap-1">
                          {task.tools_used.map((tool, index) => (
                            <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                              {tool}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {task.skills_applied && task.skills_applied.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-500 mb-1">Skills Applied:</p>
                        <div className="flex flex-wrap gap-1">
                          {task.skills_applied.map((skill, index) => (
                            <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.approved)}`}>
                      {task.approved ? (
                        <>
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Approved
                        </>
                      ) : (
                        <>
                          <XCircle className="h-3 w-3 mr-1" />
                          Pending
                        </>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No tasks submitted yet</p>
        )}
      </div>
    </div>
  );
};

export default StudentDetails;


