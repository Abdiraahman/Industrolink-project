import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Tag, Wrench, Award, CheckCircle, XCircle, Eye } from 'lucide-react';
import { DailyTask, TASK_CATEGORIES } from '@/types/task';

interface DailyTaskHistoryProps {
  studentId?: string;
  limit?: number;
}

const DailyTaskHistory: React.FC<DailyTaskHistoryProps> = ({ studentId, limit = 10 }) => {
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<DailyTask | null>(null);

  // Mock data - replace with actual API call
  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data
      const mockTasks: DailyTask[] = [
        {
          id: '1',
          student: 'student-123',
          date: '2024-01-15',
          description: 'Worked on implementing user authentication system using JWT tokens. Fixed several bugs related to token expiration and refresh logic.',
          task_category: TASK_CATEGORIES[0], // Development
          tools_used: ['Visual Studio Code', 'Git', 'Postman', 'Chrome DevTools'],
          skills_applied: ['Problem Solving', 'Backend Development', 'API Development', 'Debugging'],
          hours_spent: 8.5,
          approved: true,
          created_at: '2024-01-15T09:00:00Z',
          updated_at: '2024-01-15T17:30:00Z',
          week_number: 3,
          iso_year: 2024
        },
        {
          id: '2',
          student: 'student-123',
          date: '2024-01-14',
          description: 'Designed wireframes for the new dashboard interface. Created prototypes in Figma and conducted user research.',
          task_category: TASK_CATEGORIES[1], // Design
          tools_used: ['Figma', 'Adobe Photoshop', 'Notion'],
          skills_applied: ['UI/UX Design', 'Research', 'Communication', 'Critical Thinking'],
          hours_spent: 7.0,
          approved: true,
          created_at: '2024-01-14T09:00:00Z',
          updated_at: '2024-01-14T16:00:00Z',
          week_number: 3,
          iso_year: 2024
        },
        {
          id: '3',
          student: 'student-123',
          date: '2024-01-13',
          description: 'Attended team meeting and sprint planning session. Reviewed code for the payment integration module.',
          task_category: TASK_CATEGORIES[5], // Meeting
          tools_used: ['Slack', 'Jira', 'GitHub'],
          skills_applied: ['Teamwork', 'Code Review', 'Project Management'],
          hours_spent: 4.5,
          approved: false,
          created_at: '2024-01-13T09:00:00Z',
          updated_at: '2024-01-13T13:30:00Z',
          week_number: 2,
          iso_year: 2024
        }
      ];
      
      setTasks(mockTasks.slice(0, limit));
      setLoading(false);
    };

    fetchTasks();
  }, [studentId, limit]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getCategoryColor = (categoryId: string) => {
    const category = TASK_CATEGORIES.find(cat => cat.id === categoryId);
    return category?.color || '#6B7280';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Recent Daily Tasks</h2>
        <Button variant="outline" size="sm">
          View All
        </Button>
      </div>

      {tasks.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No daily tasks submitted yet</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => (
            <Card key={task.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: task.task_category.color }}
                    />
                    <div>
                      <CardTitle className="text-lg">{formatDate(task.date)}</CardTitle>
                      <CardDescription className="flex items-center space-x-4 mt-1">
                        <span className="flex items-center space-x-1">
                          <Tag className="h-3 w-3" />
                          <span>{task.task_category.name}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{task.hours_spent}h</span>
                        </span>
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {task.approved ? (
                      <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Approved
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                        <XCircle className="h-3 w-3 mr-1" />
                        Pending
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Task Description */}
                <div>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {task.description.length > 150 
                      ? `${task.description.substring(0, 150)}...` 
                      : task.description
                    }
                  </p>
                </div>

                {/* Tools and Skills */}
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Tools Used */}
                  {task.tools_used.length > 0 && (
                    <div>
                      <div className="flex items-center space-x-1 mb-2">
                        <Wrench className="h-4 w-4 text-gray-600" />
                        <span className="text-sm font-medium text-gray-700">Tools Used</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {task.tools_used.slice(0, 3).map((tool) => (
                          <Badge key={tool} variant="outline" className="text-xs">
                            {tool}
                          </Badge>
                        ))}
                        {task.tools_used.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{task.tools_used.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Skills Applied */}
                  {task.skills_applied.length > 0 && (
                    <div>
                      <div className="flex items-center space-x-1 mb-2">
                        <Award className="h-4 w-4 text-gray-600" />
                        <span className="text-sm font-medium text-gray-700">Skills Applied</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {task.skills_applied.slice(0, 3).map((skill) => (
                          <Badge key={skill} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {task.skills_applied.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{task.skills_applied.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* View Details Button */}
                <div className="flex justify-end pt-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setSelectedTask(task)}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Task Detail Modal - You can implement this as a proper modal */}
      {selectedTask && (
        <Card className="fixed inset-0 z-50 bg-white shadow-2xl overflow-auto">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Task Details - {formatDate(selectedTask.date)}</CardTitle>
              <Button variant="ghost" onClick={() => setSelectedTask(null)}>
                ×
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-gray-700">{selectedTask.description}</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Tools Used</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedTask.tools_used.map((tool) => (
                    <Badge key={tool} variant="outline">{tool}</Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Skills Applied</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedTask.skills_applied.map((skill) => (
                    <Badge key={skill} variant="secondary">{skill}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DailyTaskHistory;