import React from 'react';
import { Users, ClipboardList, MessageSquare, TrendingUp } from 'lucide-react';
import { type StatCard } from '../../types/common';

interface Activity {
  id: number;
  student: string;
  action: string;
  time: string;
  status: 'pending' | 'completed' | 'active' | 'reviewed';
}

const SupervisorDashboard: React.FC = () => {
  const stats: StatCard[] = [
    {
      title: 'Total Students',
      value: '24',
      change: '+12%',
      changeType: 'positive',
      icon: Users,
      color: 'bg-blue-500'
    },
    {
      title: 'Pending Evaluations',
      value: '8',
      change: '-5%',
      changeType: 'negative',
      icon: ClipboardList,
      color: 'bg-yellow-500'
    },
    {
      title: 'New Messages',
      value: '12',
      change: '+8%',
      changeType: 'positive',
      icon: MessageSquare,
      color: 'bg-green-500'
    },
    {
      title: 'Completion Rate',
      value: '87%',
      change: '+3%',
      changeType: 'positive',
      icon: TrendingUp,
      color: 'bg-purple-500'
    }
  ];

  const recentActivities: Activity[] = [
    {
      id: 1,
      student: 'John Doe',
      action: 'Submitted evaluation form',
      time: '2 hours ago',
      status: 'pending'
    },
    {
      id: 2,
      student: 'Jane Smith',
      action: 'Completed attachment period',
      time: '4 hours ago',
      status: 'completed'
    },
    {
      id: 3,
      student: 'Mike Johnson',
      action: 'Started new attachment',
      time: '1 day ago',
      status: 'active'
    },
    {
      id: 4,
      student: 'Sarah Wilson',
      action: 'Submitted progress report',
      time: '2 days ago',
      status: 'reviewed'
    }
  ];

  const getStatusColor = (status: Activity['status']): string => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      active: 'bg-blue-100 text-blue-800',
      reviewed: 'bg-purple-100 text-purple-800'
    };
    return colors[status];
  };

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  <p className={`text-sm mt-2 ${
                    stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.change} from last month
                  </p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="text-white" size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activities</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.student}</p>
                  <p className="text-sm text-gray-600">{activity.action}</p>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(activity.status)}`}>
                  {activity.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions and Other Sections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h4>
          <div className="space-y-3">
            <button className="w-full text-left px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
              <p className="font-medium text-blue-900">Add New Student</p>
              <p className="text-sm text-blue-600">Register a new student for attachment</p>
            </button>
            <button className="w-full text-left px-4 py-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
              <p className="font-medium text-green-900">Create Evaluation</p>
              <p className="text-sm text-green-600">Start a new evaluation form</p>
            </button>
            <button className="w-full text-left px-4 py-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
              <p className="font-medium text-purple-900">Send Message</p>
              <p className="text-sm text-purple-600">Communicate with students</p>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Deadlines</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Mid-term Evaluations</p>
                <p className="text-xs text-gray-500">Due in 3 days</p>
              </div>
              <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                Urgent
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Progress Reports</p>
                <p className="text-xs text-gray-500">Due in 1 week</p>
              </div>
              <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                Soon
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Final Assessments</p>
                <p className="text-xs text-gray-500">Due in 2 weeks</p>
              </div>
              <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                On Track
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">System Status</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Database</span>
              <span className="flex items-center text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Online
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Email Service</span>
              <span className="flex items-center text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Active
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Backup</span>
              <span className="flex items-center text-yellow-600">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                Running
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupervisorDashboard;