import React, { useState, useEffect, useCallback } from 'react';
import DailyTaskHistory from '../../components/features/students/DailyTaskHistory';
import { Progress } from '../../components/ui/progress';
import { CalendarDays, Clock, Building2, User } from 'lucide-react';



interface StudentProfile {
  student_id: string;
  registration_no: string;
  academic_year: string;
  course: string;
  year_of_study: string;
  company_name: string;
  duration_in_weeks: number;
  start_date: string;
  completion_date: string;
}

const Dashboard: React.FC = () => {
  // Student profile state
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Progress tracking state
  const [progress, setProgress] = useState(0);
  const [remainingDays, setRemainingDays] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isNotStarted, setIsNotStarted] = useState(false);

  // Fetch student profile data
  const fetchStudentProfile = useCallback(async () => {
    setProfileLoading(true);
    setProfileError(null);
    
    try {
      // With HTTP-only cookies, we don't need to manually add Authorization headers
      // The cookies will be automatically sent with the request
      // Note: Django automatically redirects /profile to /profile/ (with trailing slash)
      const response = await fetch('http://localhost:8000/api/students/profile/', {
        method: 'GET',
        credentials: 'include', // This ensures cookies are sent with the request
        headers: {
          'Content-Type': 'application/json',
        },
        // Handle redirects automatically
        redirect: 'follow',
      });
      
      if (response.ok) {
        const profileData = await response.json();
        setStudentProfile(profileData);
      } else if (response.status === 404) {
        throw new Error('Student profile not found. Please complete your profile first.');
      } else if (response.status === 401) {
        throw new Error('Authentication failed. Please log in again.');
      } else if (response.status === 403) {
        throw new Error('Access denied. You may not have permission to view this profile.');
      } else {
        throw new Error(`Failed to fetch student profile: ${response.status}`);
      }
    } catch (error) {
      console.error('Error fetching student profile:', error);
      
      // Check for specific CORS or network errors
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        setProfileError('Network error: Unable to connect to the backend server. Please check if the server is running and CORS is configured.');
      } else if (error instanceof Error) {
        setProfileError(error.message);
      } else {
        setProfileError('Failed to load student profile');
      }

    } finally {
      setProfileLoading(false);
    }
  }, []);

  // Calculate progress based on actual student dates
  const calculateProgress = useCallback(() => {
    if (!studentProfile) return 0;
    
    const start = new Date(studentProfile.start_date);
    const end = new Date(studentProfile.completion_date);
    const today = new Date();
    
    // If today is before start date
    if (today < start) {
      const daysUntilStart = Math.ceil((start.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      setRemainingDays(daysUntilStart);
      setIsNotStarted(true);
      setIsCompleted(false);
      return 0;
    }
    
    // If today is after completion date
    if (today > end) {
      setRemainingDays(0);
      setIsNotStarted(false);
      setIsCompleted(true);
      return 100;
    }
    
    // Calculate percentage based on current progress
    const totalDuration = end.getTime() - start.getTime();
    const elapsed = today.getTime() - start.getTime();
    const percentage = Math.round((elapsed / totalDuration) * 100);
    
    // Calculate remaining days
    const remaining = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    setRemainingDays(remaining);
    setIsNotStarted(false);
    setIsCompleted(false);
    
    return percentage;
  }, [studentProfile]);

  // Update progress every minute
  useEffect(() => {
    const updateProgress = () => {
      setProgress(calculateProgress());
    };

    // Initial calculation
    updateProgress();

    // Set up interval to update every minute
    const interval = setInterval(updateProgress, 60000);

    return () => clearInterval(interval);
  }, [calculateProgress]);

  // Fetch profile on component mount
  useEffect(() => {
    fetchStudentProfile();
  }, [fetchStudentProfile]);

  // Debug logging for DailyTaskHistory
  useEffect(() => {
    console.log('StudentDashboard: studentProfile changed:', studentProfile);
    console.log('StudentDashboard: student_id:', studentProfile?.student_id);
  }, [studentProfile]);



  // Format date for display
  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return 'Not set';
    
    return dateObj.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    });
  };



  return (
    <div className="space-y-6 p-4">
      {/* Attachment Details Section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Attachment Details</h2>
        </div>

        {/* Student Information Cards */}
        {studentProfile ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-blue-200">
              <div className="flex items-center space-x-3 mb-3">
                <Building2 className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Company</h3>
              </div>
                             <p className="text-2xl font-bold text-blue-600">{studentProfile.company_name}</p>
              <p className="text-sm text-gray-500 mt-1">Attachment Institution</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-green-200">
              <div className="flex items-center space-x-3 mb-3">
                <CalendarDays className="h-5 w-5 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900">Duration</h3>
              </div>
              <p className="text-2xl font-bold text-green-600">{studentProfile.duration_in_weeks} weeks</p>
              <p className="text-sm text-gray-500 mt-1">
                {formatDate(studentProfile.start_date)} - {formatDate(studentProfile.completion_date)}
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-purple-200">
              <div className="flex items-center space-x-3 mb-3">
                <User className="h-5 w-5 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-900">Course</h3>
              </div>
              <p className="text-lg font-bold text-purple-600">{studentProfile.course}</p>
              <p className="text-sm text-gray-500 mt-1">
                Year {studentProfile.year_of_study} • {studentProfile.academic_year}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Students</h3>
              <p className="text-3xl font-bold text-blue-600">1,234</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Active Evaluations</h3>
              <p className="text-3xl font-bold text-green-600">45</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Pending Messages</h3>
              <p className="text-3xl font-bold text-orange-600">12</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">System Status</h3>
              <p className="text-3xl font-bold text-green-600">Online</p>
            </div>
          </div>
        )}


      </div>

      {/* Attachment Progress Section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center space-x-3 mb-6">
          <CalendarDays className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">Attachment Progress</h2>
        </div>
        
        {profileLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading attachment information...</p>
          </div>
        ) : profileError ? (
          <div className="text-center py-8">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <p className="text-red-800 font-medium mb-2">Unable to load attachment information</p>
              <p className="text-red-600 text-sm mb-4">{profileError}</p>
              
              <div className="space-y-3">
                <button
                  onClick={fetchStudentProfile}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mr-2"
                >
                  Try Again
                </button>
                
                {profileError.includes('profile not found') && (
                  <button
                    onClick={() => window.location.href = '/profile/setup'}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Complete Profile
                  </button>
                )}
              </div>
              
                             <div className="mt-4 text-xs text-red-500">
                 <p>If the problem persists, please check:</p>
                 <ul className="list-disc list-inside mt-1 space-y-1">
                   <li>Your internet connection</li>
                   <li>That you're logged in (check if your session is active)</li>
                   <li>That the backend server is running on port 8000</li>
                   <li>That your browser allows cookies for localhost</li>
                 </ul>
               </div>
            </div>
          </div>
        ) : studentProfile ? (
          <div className="space-y-6">
            {/* Progress Bar */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Overall Progress</span>
                <span className="text-lg font-bold text-blue-600">{progress}%</span>
              </div>
              <Progress value={progress} className="h-3" />
            </div>

            {/* Status Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center space-x-2 mb-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">Timeline</span>
                </div>
                <div className="space-y-1 text-sm text-blue-700">
                  <div>Start: {formatDate(studentProfile.start_date)}</div>
                  <div>End: {formatDate(studentProfile.completion_date)}</div>
                  <div>Duration: {studentProfile.duration_in_weeks} weeks</div>
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-center space-x-2 mb-2">
                  <Building2 className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-900">Company</span>
                </div>
                                 <div className="space-y-1 text-sm text-green-700">
                   <div>{studentProfile.company_name}</div>
                   <div>Course: {studentProfile.course}</div>
                   <div>Year: {studentProfile.year_of_study}</div>
                 </div>
              </div>
            </div>

            {/* Status Message */}
            {isNotStarted && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="text-orange-800 font-medium">Attachment not started yet</p>
                    <p className="text-orange-600 text-sm">Starts in {remainingDays} day{remainingDays !== 1 ? 's' : ''}</p>
                  </div>
                </div>
              </div>
            )}

            {isCompleted && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <CalendarDays className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-green-800 font-medium">Attachment completed!</p>
                    <p className="text-green-600 text-sm">Congratulations on completing your attachment</p>
                  </div>
                </div>
              </div>
            )}

            {!isNotStarted && !isCompleted && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-blue-800 font-medium">In Progress</p>
                    <p className="text-blue-600 text-sm">{remainingDays} day{remainingDays !== 1 ? 's' : ''} remaining</p>
                  </div>
                </div>
              </div>
            )}

            <div className="text-center text-xs text-gray-500">
              Progress updates automatically based on time elapsed
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <CalendarDays className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">No attachment information available</p>
            <p className="text-gray-400 text-sm">Complete your student profile to view attachment progress</p>
          </div>
        )}
      </div>

      {/* Daily Task History Section */}
      <div className="mt-8">
        {studentProfile ? (
          <DailyTaskHistory limit={3} />
        ) : (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading daily tasks...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

