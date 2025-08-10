import React, { useState } from 'react';
import { FileText, Plus, Eye, Edit, Trash2 } from 'lucide-react';
import PermissionGuard from '../auth/PermissionGuard';
import { useAuthExtended } from '../../hooks/useAuthExtended';
import { useActivityTracker } from '../../hooks/useActivityTracker';

interface Submission {
  id: string;
  title: string;
  status: 'draft' | 'submitted' | 'reviewed' | 'approved';
  submittedAt: string;
  grade?: number;
}

const StudentSubmissions: React.FC = () => {
  const { checkPermission, isRole } = useAuthExtended();
  const { trackActivity, trackResourceAccess, trackDataModification } = useActivityTracker();
  const [submissions, setSubmissions] = useState<Submission[]>([
    {
      id: '1',
      title: 'Weekly Report #1',
      status: 'submitted',
      submittedAt: '2024-01-15T10:30:00Z'
    },
    {
      id: '2',
      title: 'Project Proposal',
      status: 'draft',
      submittedAt: '2024-01-10T14:20:00Z'
    }
  ]);

  const handleSubmissionView = (submissionId: string) => {
    trackResourceAccess('submission', submissionId);
    // Navigate to submission detail view
  };

  const handleCreateSubmission = () => {
    trackActivity('create_submission');
    // Open submission creation form
  };

  const handleEditSubmission = (submissionId: string) => {
    trackDataModification('edit_submission', 'submission', submissionId);
    // Open submission edit form
  };

  const handleDeleteSubmission = (submissionId: string) => {
    trackDataModification('delete_submission', 'submission', submissionId);
    setSubmissions(prev => prev.filter(s => s.id !== submissionId));
  };

  const getStatusColor = (status: Submission['status']) => {
    switch (status) {
      case 'draft': return 'text-yellow-500 bg-yellow-500/10';
      case 'submitted': return 'text-blue-500 bg-blue-500/10';
      case 'reviewed': return 'text-purple-500 bg-purple-500/10';
      case 'approved': return 'text-green-500 bg-green-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Your Submissions</h2>
          <p className="text-slate-400">Manage your internship submissions</p>
        </div>
        
        <PermissionGuard 
          permission="write:submissions"
          fallback={
            <div className="text-slate-400 text-sm">
              You cannot create new submissions
            </div>
          }
        >
          <button
            onClick={handleCreateSubmission}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Submission</span>
          </button>
        </PermissionGuard>
      </div>

      <PermissionGuard permission="read:submissions">
        <div className="bg-slate-800 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Grade
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {submissions.map((submission) => (
                  <tr key={submission.id} className="hover:bg-slate-700/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FileText className="w-4 h-4 text-slate-400 mr-2" />
                        <span className="text-white">{submission.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(submission.status)}`}>
                        {submission.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-300">
                      {new Date(submission.submittedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-300">
                      {submission.grade ? `${submission.grade}/100` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleSubmissionView(submission.id)}
                          className="text-blue-400 hover:text-blue-300 transition-colors"
                          title="View submission"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        
                        <PermissionGuard 
                          permission="write:submissions"
                          showFallback={false}
                        >
                          <button
                            onClick={() => handleEditSubmission(submission.id)}
                            className="text-yellow-400 hover:text-yellow-300 transition-colors"
                            title="Edit submission"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </PermissionGuard>
                        
                        <PermissionGuard 
                          permission="write:submissions"
                          showFallback={false}
                        >
                          <button
                            onClick={() => handleDeleteSubmission(submission.id)}
                            className="text-red-400 hover:text-red-300 transition-colors"
                            title="Delete submission"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </PermissionGuard>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </PermissionGuard>

      {submissions.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-300 mb-2">No submissions yet</h3>
          <p className="text-slate-400 mb-4">
            {isRole('student') 
              ? 'Start by creating your first submission'
              : 'No submissions found for this student'
            }
          </p>
          <PermissionGuard permission="write:submissions">
            <button
              onClick={handleCreateSubmission}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create First Submission
            </button>
          </PermissionGuard>
        </div>
      )}
    </div>
  );
};

export default StudentSubmissions; 