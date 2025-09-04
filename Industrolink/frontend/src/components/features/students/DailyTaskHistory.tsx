import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Tag, Wrench, Award, CheckCircle, XCircle, Eye } from 'lucide-react';
import { DailyTask, TaskCategory } from '@/types/task';
import { dailyTasksAPI } from '@/services/api/dailyTasks';
import { useAuthExtended } from '@/hooks/useAuthExtended';

interface DailyTaskHistoryProps {
  studentId?: string;
  limit?: number;
}

const DailyTaskHistory: React.FC<DailyTaskHistoryProps> = ({ studentId, limit = 10 }) => {
  console.log('DailyTaskHistory: Component rendered with props:', { studentId, limit });
  
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<DailyTask | null>(null);
  const [categories, setCategories] = useState<TaskCategory[]>([]);
  
  const { user } = useAuthExtended();

  // Load categories and tasks
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('DailyTaskHistory: Fetching with studentId:', studentId, 'limit:', limit);
      
      // Fetch categories first
      const fetchedCategories = await dailyTasksAPI.getTaskCategories();
      console.log('DailyTaskHistory: Categories fetched:', fetchedCategories);
      setCategories(fetchedCategories || []);
      
      // Fetch tasks for the current authenticated student
      // If no studentId is provided, the API should return tasks for the authenticated user
      console.log('DailyTaskHistory: Calling API with studentId:', studentId || 'AUTHENTICATED_USER', 'and limit:', limit);
      const tasksResponse = await dailyTasksAPI.getDailyTasks(studentId, { limit });
      console.log('DailyTaskHistory: Raw API response:', tasksResponse);
      console.log('DailyTaskHistory: Response type:', typeof tasksResponse);
      console.log('DailyTaskHistory: Is array?', Array.isArray(tasksResponse));
      if (tasksResponse && typeof tasksResponse === 'object') {
        console.log('DailyTaskHistory: Response keys:', Object.keys(tasksResponse));
      }
      
      // Handle both response formats: {results: [...]} and direct array [...]
      let tasksArray: DailyTask[] = [];
      if (tasksResponse && Array.isArray(tasksResponse)) {
        // Direct array response
        tasksArray = tasksResponse as DailyTask[];
        console.log('DailyTaskHistory: Direct array response, tasks:', tasksArray);
      } else if (tasksResponse && tasksResponse.results && Array.isArray(tasksResponse.results)) {
        // Paginated response format
        tasksArray = tasksResponse.results as DailyTask[];
        console.log('DailyTaskHistory: Paginated response, tasks:', tasksArray);
      } else {
        console.warn('DailyTaskHistory: Unexpected response format:', tasksResponse);
        tasksArray = [];
      }
      
      setTasks(tasksArray);
      console.log('DailyTaskHistory: Final tasks set:', tasksArray);
      
      // Debug: Log individual task details
      if (tasksArray.length > 0) {
        console.log('DailyTaskHistory: First task details:', {
          id: tasksArray[0].id,
          description: tasksArray[0].description,
          tools_used: tasksArray[0].tools_used,
          skills_applied: tasksArray[0].skills_applied,
          task_category: tasksArray[0].task_category,
          date: tasksArray[0].date,
          hours_spent: tasksArray[0].hours_spent,
          approved: tasksArray[0].approved
        });
      }
    } catch (error) {
      console.error('DailyTaskHistory: Error fetching data:', error);
      setError('Failed to load daily tasks. Please try again later.');
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [studentId, limit]); // Include studentId and limit in dependencies

  useEffect(() => {
    console.log('DailyTaskHistory: useEffect triggered, studentId:', studentId, 'limit:', limit);
    fetchData();
  }, [studentId, limit]); // Only depend on studentId and limit, not fetchData

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getCategoryColor = (categoryId: string) => {
    if (!categories || !Array.isArray(categories)) {
      return '#6B7280';
    }
    const category = categories.find(cat => cat.id === categoryId);
    return category?.color || '#6B7280';
  };

  if (loading) {
    return (
      <Card className="border border-gray-200">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border border-red-200">
        <CardContent className="pt-6 text-center">
          <div className="text-red-600 mb-4">{error}</div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchData}
            className="border-red-300 text-red-700 hover:bg-red-50"
          >
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Recent Daily Tasks</h2>
          {tasks.length > 0 && (
            <p className="text-sm text-gray-500 mt-1">
              Showing {tasks.length} of your recent task submissions
            </p>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => window.location.href = '/tasks/daily-report'}
            className="text-sm"
          >
            Submit New Task
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchData}
            disabled={loading}
            className="text-sm"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-2"></div>
                Loading...
              </>
            ) : (
              'Refresh'
            )}
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => window.location.href = '/tasks'}
            className="text-sm"
          >
            View All
          </Button>
        </div>
      </div>

      {!tasks || tasks.length === 0 ? (
        <Card className="border border-gray-200">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">No daily tasks submitted yet</p>
              <p className="text-gray-400 text-sm">
                Start tracking your daily activities by submitting your first daily task report
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-3"
                onClick={() => window.location.href = '/tasks/daily-report'}
              >
                Submit Daily Task
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Task Summary */}
          <Card className="border border-gray-200 bg-gray-50">
            <CardContent className="pt-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-blue-600">{tasks.length}</p>
                  <p className="text-sm text-gray-600">Tasks</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">
                    {tasks.reduce((total, task) => total + task.hours_spent, 0).toFixed(1)}h
                  </p>
                  <p className="text-sm text-gray-600">Total Hours</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-orange-600">
                    {tasks.filter(task => task.approved).length}/{tasks.length}
                  </p>
                  <p className="text-sm text-gray-600">Approved</p>
                </div>
              </div>
            </CardContent>
          </Card>

                     {/* Task List */}
           <div className="space-y-4">
             {tasks && tasks.map((task, index) => {
               console.log(`DailyTaskHistory: Rendering task ${index}:`, task);
               return (
               <Card key={task.id || `task-${Math.random()}`} className="hover:shadow-md transition-shadow border border-gray-200">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: task.task_category?.color || '#6B7280' }}
                      />
                      <div>
                        <CardTitle className="text-lg">{formatDate(task.date)}</CardTitle>
                        <CardDescription className="flex items-center space-x-4 mt-1">
                          <span className="flex items-center space-x-1">
                            <Tag className="h-3 w-3" />
                            <span>{task.task_category?.name || 'Unknown Category'}</span>
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
                      {task.description?.length > 150 
                        ? `${task.description.substring(0, 150)}...` 
                        : task.description
                      }
                    </p>
                  </div>

                  {/* Tools and Skills */}
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Tools Used */}
                    {task.tools_used && task.tools_used.length > 0 && (
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
                    {task.skills_applied && task.skills_applied.length > 0 && (
                      <div>
                        <div className="flex items-center space-x-1 mb-2">
                          <Award className="h-4 w-4 text-gray-600" />
                          <span className="text-sm font-medium text-gray-700">Skills Applied</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {task.skills_applied.slice(0, 3).map((skill) => (
                            <Badge key={skill} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {task.skills_applied.length > 3 && (
                            <Badge variant="outline" className="text-xs">
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
               );
             })}
           </div>
        </>
      )}

      {/* Task Detail Modal - You can implement this as a proper modal */}
      {selectedTask && (
        <Card className="fixed inset-0 z-50 bg-white shadow-2xl overflow-auto border border-gray-200">
          <CardHeader className="border-b border-gray-200">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">Task Details - {formatDate(selectedTask.date)}</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setSelectedTask(null)} className="text-gray-500">
                ×
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-gray-700">{selectedTask.description}</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Tools Used</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedTask.tools_used.map((tool) => (
                    <Badge key={tool} variant="outline" className="text-sm">{tool}</Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Skills Applied</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedTask.skills_applied.map((skill) => (
                    <Badge key={skill} variant="secondary" className="text-sm">{skill}</Badge>
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