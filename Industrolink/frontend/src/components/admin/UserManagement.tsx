import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Search, Users, UserCheck, UserX, Trash2, Edit, Eye, X, Calendar, BookOpen, MessageSquare, Award, MapPin, GraduationCap, Briefcase } from 'lucide-react';
import adminApi from '../../services/adminApi';

interface User {
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  is_active: boolean;
  profile_completed: boolean;
  created_at: string;
}

interface UserListResponse {
  users: User[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

interface LecturerDetails {
  department: string;
  title: string;
  created_at: string;
}

interface StudentDetails {
  registration_no: string;
  academic_year: string;
  course: string;
  year_of_study: string;
  company_name: string;
  duration_in_weeks: number;
  start_date: string;
  completion_date: string;
  assigned_lecturer?: {
    user_id: string;
    name: string;
    email: string;
  } | null;
  recent_tasks: Array<{
    id: string;
    description: string;
    date: string;
    hours_spent: number;
    approved: boolean;
    created_at: string;
  }>;
}

interface SupervisorDetails {
  company_name: string;
  position: string;
  phone_number: string;
  created_at: string;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  
  // User details state
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userDetails, setUserDetails] = useState<LecturerDetails | StudentDetails | SupervisorDetails | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [showUserDetails, setShowUserDetails] = useState(false);

  // Assign lecturer state
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignTargetStudent, setAssignTargetStudent] = useState<User | null>(null);
  const [lecturers, setLecturers] = useState<User[]>([]);
  const [isLoadingLecturers, setIsLoadingLecturers] = useState(false);
  const [selectedLecturerId, setSelectedLecturerId] = useState('');
  const [isSubmittingAssign, setIsSubmittingAssign] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [currentPage]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await adminApi.getUsers({
        page: currentPage,
        role: selectedRole !== 'all' ? selectedRole : undefined,
        search: searchTerm || undefined,
      });
      
      if (response) {
        setUsers(response.users || []);
        setTotalPages(response.total_pages || 1);
        setTotalUsers(response.total || 0);
      }
    } catch (error: any) {
      if (error.status === 401) {
        // Session expired
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        window.location.href = '/login';
        return;
      }
      toast.error('Failed to fetch users');
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchUsers();
  };

  const handleRoleFilter = (role: string) => {
    setSelectedRole(role);
    setCurrentPage(1);
  };

  const fetchUserDetails = async (user: User) => {
    setSelectedUser(user);
    setIsLoadingDetails(true);
    setShowUserDetails(true);
    
    try {
      // Fetch real user details from the backend
      const response = await adminApi.getUserDetails(user.user_id);
      
      if (response) {
        // Extract role-specific details from the response
        let details: LecturerDetails | StudentDetails | SupervisorDetails | null = null;
        
        if (user.role === 'lecturer' && response.lecturer_details) {
          details = response.lecturer_details as LecturerDetails;
        } else if (user.role === 'student' && response.student_details) {
          details = response.student_details as StudentDetails;
          // Add recent tasks if available
          if (response.recent_tasks) {
            (details as StudentDetails).recent_tasks = response.recent_tasks;
          }
        } else if (user.role === 'supervisor' && response.supervisor_details) {
          details = response.supervisor_details as SupervisorDetails;
        }
        
        setUserDetails(details);
      }
    } catch (error: any) {
      if (error.status === 401) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        window.location.href = '/login';
        return;
      }
      toast.error('Failed to fetch user details');
      console.error('Error fetching user details:', error);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleUserAction = async (userId: string, action: string, reason?: string) => {
    try {
      if (action === 'delete') {
        if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
          return;
        }
        await adminApi.deleteUser(userId, reason || 'No reason provided');
        toast.success('User deleted successfully');
      } else if (action === 'approve') {
        await adminApi.approveUser(userId, reason || 'Profile approved');
        toast.success('User approved successfully');
      } else if (action === 'deactivate') {
        await adminApi.deactivateUser(userId, reason || 'Account deactivated');
        toast.success('User deactivated successfully');
      } else if (action === 'activate') {
        await adminApi.activateUser(userId, reason || 'Account activated');
        toast.success('User activated successfully');
      }
      
      // Refresh the user list
      fetchUsers();
    } catch (error: any) {
      if (error.status === 401) {
        // Session expired
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        window.location.href = '/login';
        return;
      }
      toast.error(`Failed to ${action} user`);
      console.error(`Error ${action}ing user:`, error);
    }
  };

  // Assign lecturer helpers
  const openAssignLecturerModal = async (student: User) => {
    setAssignTargetStudent(student);
    setShowAssignModal(true);
    setIsLoadingLecturers(true);
    setSelectedLecturerId('');
    
    try {
      // First get student details to check current lecturer
      const studentDetails = await adminApi.getUserDetails(student.user_id);
      const currentLecturerId = studentDetails?.student_details?.assigned_lecturer?.user_id || '';
      setSelectedLecturerId(currentLecturerId);
      
      // Then get all lecturers
      const response = await adminApi.getUsers({ role: 'lecturer', page_size: 100 });
      setLecturers(response?.users || []);
    } catch (error: any) {
      if (error.status === 401) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        window.location.href = '/login';
        return;
      }
      toast.error('Failed to load lecturers');
      console.error('Error fetching lecturers:', error);
    } finally {
      setIsLoadingLecturers(false);
    }
  };

  const submitAssignLecturer = async () => {
    if (!assignTargetStudent) {
      toast.error('No student selected');
      return;
    }
    
    setIsSubmittingAssign(true);
    try {
      const action = selectedLecturerId ? 'assign' : 'unassign';
      const lecturerId = selectedLecturerId || 'unassign';
      
      await adminApi.assignStudent({
        student_id: assignTargetStudent.user_id,
        lecturer_id: lecturerId,
        action: action
      });
      
      const message = action === 'assign' ? 'Lecturer assigned successfully' : 'Lecturer unassigned successfully';
      toast.success(message);
      setShowAssignModal(false);
      setAssignTargetStudent(null);
      setSelectedLecturerId('');
      fetchUsers();
    } catch (error: any) {
      if (error.status === 401) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        window.location.href = '/login';
        return;
      }
      toast.error('Failed to update lecturer assignment');
      console.error('Error updating lecturer assignment:', error);
    } finally {
      setIsSubmittingAssign(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'student':
        return <Users className="h-4 w-4 text-blue-500" />;
      case 'lecturer':
        return <UserCheck className="h-4 w-4 text-green-500" />;
      case 'supervisor':
        return <UserCheck className="h-4 w-4 text-purple-500" />;
      case 'admin':
        return <UserCheck className="h-4 w-4 text-red-500" />;
      default:
        return <Users className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (user: User) => {
    if (!user.is_active) {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Inactive</span>;
    }
    if (!user.profile_completed) {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Pending</span>;
    }
    return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Active</span>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">User Management</h1>
        
        {/* Search and Filters */}
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <select
              value={selectedRole}
              onChange={(e) => handleRoleFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">All Roles</option>
              <option value="student">Students</option>
              <option value="lecturer">Lecturers</option>
              <option value="supervisor">Supervisors</option>
            </select>
          </div>

          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
          >
            Apply Filters
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Users ({totalUsers})
          </h3>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.user_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{user.first_name} {user.last_name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getRoleIcon(user.role)}
                        <span className="ml-2 text-sm text-gray-900 capitalize">{user.role}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(user)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(user.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => fetchUserDetails(user)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        
                        {user.role === 'student' && (
                          <button
                            onClick={() => openAssignLecturerModal(user)}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="Assign Lecturer"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        )}
                        
                        {!user.profile_completed && (
                          <button
                            onClick={() => handleUserAction(user.user_id, 'approve')}
                            className="text-green-600 hover:text-green-900"
                            title="Approve Profile"
                          >
                            <UserCheck className="h-4 w-4" />
                          </button>
                        )}
                        
                        {user.is_active ? (
                          <button
                            onClick={() => handleUserAction(user.user_id, 'deactivate')}
                            className="text-yellow-600 hover:text-yellow-900"
                            title="Deactivate User"
                          >
                            <UserX className="h-4 w-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUserAction(user.user_id, 'activate')}
                            className="text-green-600 hover:text-green-900"
                            title="Activate User"
                          >
                            <UserCheck className="h-4 w-4" />
                          </button>
                        )}
                        
                        <button
                          onClick={() => handleUserAction(user.user_id, 'delete')}
                          className="text-red-600 hover:text-red-900"
                          title="Delete User"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing page {currentPage} of {totalPages}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* User Details Modal */}
      {showUserDetails && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                User Details: {selectedUser.first_name} {selectedUser.last_name}
              </h2>
              <button
                onClick={() => {
                  setShowUserDetails(false);
                  setSelectedUser(null);
                  setUserDetails(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6">
              {isLoadingDetails ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Basic User Information */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                      <UserCheck className="h-5 w-5 mr-2" />
                      Basic Information
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Full Name</label>
                        <p className="text-sm text-gray-900">{selectedUser.first_name} {selectedUser.last_name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Email</label>
                        <p className="text-sm text-gray-900">{selectedUser.email}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Role</label>
                        <p className="text-sm text-gray-900 capitalize">{selectedUser.role}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Status</label>
                        <div className="mt-1">{getStatusBadge(selectedUser)}</div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Created</label>
                        <p className="text-sm text-gray-900">{formatDate(selectedUser.created_at)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Role-specific Information */}
                  {userDetails && (
                    <>
                      {selectedUser.role === 'lecturer' && userDetails && 'title' in userDetails && (
                        <div className="bg-blue-50 rounded-lg p-4">
                          <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                            <GraduationCap className="h-5 w-5 mr-2 text-blue-600" />
                            Lecturer Information
                          </h3>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium text-gray-500">Department</label>
                              <p className="text-sm text-gray-900">{(userDetails as LecturerDetails).department}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-500">Title</label>
                              <p className="text-sm text-gray-900">{(userDetails as LecturerDetails).title}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-500">Created</label>
                              <p className="text-sm text-gray-900">{formatDate((userDetails as LecturerDetails).created_at)}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {selectedUser.role === 'student' && userDetails && 'registration_no' in userDetails && (
                        <div className="bg-green-50 rounded-lg p-4">
                          <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                            <BookOpen className="h-5 w-5 mr-2 text-green-600" />
                            Academic Information
                          </h3>
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                              <label className="text-sm font-medium text-gray-500">Registration No</label>
                              <p className="text-sm text-gray-900">{(userDetails as StudentDetails).registration_no}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-500">Academic Year</label>
                              <p className="text-sm text-gray-900">{(userDetails as StudentDetails).academic_year}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-500">Course</label>
                              <p className="text-sm text-gray-900">{(userDetails as StudentDetails).course}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-500">Year of Study</label>
                              <p className="text-sm text-gray-900">{(userDetails as StudentDetails).year_of_study}</p>
                            </div>
                          </div>

                                                     {/* Attachment Details */}
                           <div className="border-t border-green-200 pt-4">
                             <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center">
                               <Briefcase className="h-4 w-4 mr-2" />
                               Attachment Details
                             </h4>
                             <div className="grid grid-cols-2 gap-4">
                               <div>
                                 <label className="text-sm font-medium text-gray-500">Company</label>
                                 <p className="text-sm text-gray-900">{(userDetails as StudentDetails).company_name}</p>
                               </div>
                               <div>
                                 <label className="text-sm font-medium text-gray-500">Duration</label>
                                 <p className="text-sm text-gray-900">{(userDetails as StudentDetails).duration_in_weeks} weeks</p>
                               </div>
                               <div>
                                 <label className="text-sm font-medium text-gray-500">Start Date</label>
                                 <p className="text-sm text-gray-900">{formatDate((userDetails as StudentDetails).start_date)}</p>
                               </div>
                               <div>
                                 <label className="text-sm font-medium text-gray-500">Completion Date</label>
                                 <p className="text-sm text-gray-900">{formatDate((userDetails as StudentDetails).completion_date)}</p>
                               </div>
                               <div className="col-span-2">
                                 <label className="text-sm font-medium text-gray-500">Assigned Lecturer</label>
                                 <p className="text-sm text-gray-900">
                                   {(userDetails as StudentDetails).assigned_lecturer 
                                     ? `${(userDetails as StudentDetails).assigned_lecturer.name} (${(userDetails as StudentDetails).assigned_lecturer.email})`
                                     : 'No lecturer assigned'
                                   }
                                 </p>
                               </div>
                             </div>
                           </div>

                          {/* Recent Tasks */}
                          <div className="border-t border-green-200 pt-4 mt-4">
                            <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center">
                              <Calendar className="h-4 w-4 mr-2" />
                              Recent Daily Tasks
                            </h4>
                            <div className="space-y-2">
                              {(userDetails as StudentDetails).recent_tasks && (userDetails as StudentDetails).recent_tasks.length > 0 ? (
                                (userDetails as StudentDetails).recent_tasks.map((task) => (
                                  <div key={task.id} className="bg-white rounded border p-3">
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <p className="text-sm font-medium text-gray-900">{task.description}</p>
                                        <p className="text-xs text-gray-500">Date: {formatDate(task.date)}</p>
                                        <p className="text-xs text-gray-500">Hours: {task.hours_spent}</p>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                          task.approved 
                                            ? 'bg-green-100 text-green-800' 
                                            : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                          {task.approved ? 'Approved' : 'Pending'}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <p className="text-sm text-gray-500 italic">No recent tasks found</p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {selectedUser.role === 'supervisor' && userDetails && 'company_name' in userDetails && (
                        <div className="bg-purple-50 rounded-lg p-4">
                          <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                            <Briefcase className="h-5 w-5 mr-2 text-purple-600" />
                            Supervisor Information
                          </h3>
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                              <label className="text-sm font-medium text-gray-500">Company</label>
                              <p className="text-sm text-gray-900">{(userDetails as SupervisorDetails).company_name}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-500">Position</label>
                              <p className="text-sm text-gray-900">{(userDetails as SupervisorDetails).position}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-500">Phone Number</label>
                              <p className="text-sm text-gray-900">{(userDetails as SupervisorDetails).phone_number}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-500">Created</label>
                              <p className="text-sm text-gray-900">{formatDate((userDetails as SupervisorDetails).created_at)}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Assign Lecturer Modal */}
      {showAssignModal && assignTargetStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Assign Lecturer</h3>
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setAssignTargetStudent(null);
                  setSelectedLecturerId('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
                         <div className="p-6 space-y-4">
               <p className="text-sm text-gray-700">Student: <span className="font-medium">{assignTargetStudent.first_name} {assignTargetStudent.last_name}</span></p>
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Select Lecturer</label>
                 {isLoadingLecturers ? (
                   <div className="flex items-center h-10">
                     <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                   </div>
                 ) : (
                   <select
                     value={selectedLecturerId}
                     onChange={(e) => setSelectedLecturerId(e.target.value)}
                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                   >
                     <option value="">-- Unassign Lecturer --</option>
                     {lecturers.map((lec) => (
                       <option key={lec.user_id} value={lec.user_id}>
                         {lec.first_name} {lec.last_name} ({lec.email})
                       </option>
                     ))}
                   </select>
                 )}
               </div>
             </div>
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowAssignModal(false)}
                className="px-4 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-50"
              >
                Cancel
              </button>
                             <button
                 onClick={submitAssignLecturer}
                 disabled={isSubmittingAssign}
                 className="px-4 py-2 text-sm rounded-md bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
               >
                 {isSubmittingAssign ? 'Updating...' : (selectedLecturerId ? 'Assign' : 'Unassign') }
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
