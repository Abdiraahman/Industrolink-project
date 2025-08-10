import React, { useState } from 'react';
import { Search, Filter, Plus, Eye, Edit, Download } from 'lucide-react';
import { type Evaluation, type EvaluationFilters } from '../../types/evaluation';
import { type Status } from '../../types/common';

const Evaluations: React.FC = () => {
  const [filters, setFilters] = useState<EvaluationFilters>({
    searchTerm: '',
    filterStatus: 'all'
  });

  const evaluations: Evaluation[] = [
    {
      id: 1,
      studentName: 'John Doe',
      evaluationType: 'Mid-term Assessment',
      dueDate: '2024-07-30',
      submittedDate: '2024-07-28',
      status: 'completed',
      score: 85,
      feedback: 'Excellent performance in technical skills'
    },
    {
      id: 2,
      studentName: 'Jane Smith',
      evaluationType: 'Final Assessment',
      dueDate: '2024-08-15',
      submittedDate: null,
      status: 'pending',
      score: null,
      feedback: null
    },
    {
      id: 3,
      studentName: 'Mike Johnson',
      evaluationType: 'Weekly Progress',
      dueDate: '2024-07-25',
      submittedDate: '2024-07-26',
      status: 'overdue',
      score: 72,
      feedback: 'Good progress, needs improvement in communication'
    },
    {
      id: 4,
      studentName: 'Sarah Wilson',
      evaluationType: 'Mid-term Assessment',
      dueDate: '2024-08-01',
      submittedDate: '2024-07-30',
      status: 'under_review',
      score: null,
      feedback: null
    },
    {
      id: 5,
      studentName: 'David Brown',
      evaluationType: 'Final Assessment',
      dueDate: '2024-08-20',
      submittedDate: null,
      status: 'draft',
      score: null,
      feedback: null
    }
  ];

  const getStatusColor = (status: Status): string => {
    const colors: Record<Status, string> = {
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      overdue: 'bg-red-100 text-red-800',
      under_review: 'bg-blue-100 text-blue-800',
      draft: 'bg-gray-100 text-gray-800',
      active: 'bg-blue-100 text-blue-800',
      inactive: 'bg-gray-100 text-gray-800'
    };
    return colors[status];
  };

  const getScoreColor = (score: number | null): string => {
    if (!score) return 'text-gray-400';
    if (score >= 80) return 'text-green-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const filteredEvaluations = evaluations.filter(evaluation => {
    const matchesSearch = evaluation.studentName.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                         evaluation.evaluationType.toLowerCase().includes(filters.searchTerm.toLowerCase());
    const matchesFilter = filters.filterStatus === 'all' || evaluation.status === filters.filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleSearchChange = (value: string) => {
    setFilters(prev => ({ ...prev, searchTerm: value }));
  };

  const handleFilterChange = (value: Status | 'all') => {
    setFilters(prev => ({ ...prev, filterStatus: value }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Evaluations</h2>
          <p className="text-gray-600 mt-1">Manage student assessments and feedback</p>
        </div>
        <button className="mt-4 sm:mt-0 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
          <Plus size={20} />
          <span>New Evaluation</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search evaluations..."
              value={filters.searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter size={20} className="text-gray-400" />
              <select
                value={filters.filterStatus}
                onChange={(e) => handleFilterChange(e.target.value as Status | 'all')}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="overdue">Overdue</option>
                <option value="under_review">Under Review</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Evaluations Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student & Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submitted
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Score
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
              {filteredEvaluations.map((evaluation) => (
                <tr key={evaluation.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{evaluation.studentName}</div>
                      <div className="text-sm text-gray-500">{evaluation.evaluationType}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(evaluation.dueDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {evaluation.submittedDate 
                        ? new Date(evaluation.submittedDate).toLocaleDateString()
                        : '-'
                      }
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-medium ${getScoreColor(evaluation.score)}`}>
                      {evaluation.score ? `${evaluation.score}%` : '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(evaluation.status)}`}>
                      {evaluation.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button className="text-blue-600 hover:text-blue-900 p-1 rounded">
                        <Eye size={16} />
                      </button>
                      <button className="text-green-600 hover:text-green-900 p-1 rounded">
                        <Edit size={16} />
                      </button>
                      <button className="text-purple-600 hover:text-purple-900 p-1 rounded">
                        <Download size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-gray-900">{evaluations.length}</div>
          <div className="text-sm text-gray-600">Total Evaluations</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-green-600">
            {evaluations.filter(e => e.status === 'completed').length}
          </div>
          <div className="text-sm text-gray-600">Completed</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-yellow-600">
            {evaluations.filter(e => e.status === 'pending').length}
          </div>
          <div className="text-sm text-gray-600">Pending</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-red-600">
            {evaluations.filter(e => e.status === 'overdue').length}
          </div>
          <div className="text-sm text-gray-600">Overdue</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-blue-600">
            {evaluations.filter(e => e.status === 'under_review').length}
          </div>
          <div className="text-sm text-gray-600">Under Review</div>
        </div>
      </div>
    </div>
  );
};

export default Evaluations;