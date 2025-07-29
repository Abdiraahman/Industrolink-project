import React, { useState, useEffect, useCallback } from 'react';

interface FormData {
  institution: string;
  duration: string;
  period: string;
  supervisor: string;
  course: string;
  university: string;
}

interface CardProps {
  label: string;
  name: keyof FormData;
  placeholder: string;
}

const Dashboard: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    institution: '',
    duration: '',
    period: '',
    supervisor: '',
    course: '',
    university: ''
  });

  // Progress tracking state
  const [progress, setProgress] = useState<number>(0);
  const [startDate, setStartDate] = useState<Date>(new Date('2024-06-01'));
  const [endDate, setEndDate] = useState<Date>(new Date('2024-08-01'));
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Auto-save functionality with debouncing
  const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null);

  // Calculate progress based on current time
  const calculateProgress = useCallback((): number => {
    const now = new Date();
    const totalDuration = endDate.getTime() - startDate.getTime();
    const elapsed = now.getTime() - startDate.getTime();
    
    if (elapsed < 0) return 0; // Before start date
    if (elapsed > totalDuration) return 100; // After end date
    
    return Math.round((elapsed / totalDuration) * 100);
  }, [startDate, endDate]);

  // Update progress every minute
  useEffect(() => {
    const updateProgress = (): void => {
      setProgress(calculateProgress());
    };

    // Initial calculation
    updateProgress();

    // Set up interval to update every minute
    const interval = setInterval(updateProgress, 60000);

    return () => clearInterval(interval);
  }, [calculateProgress]);

  // Debounced auto-save function
  const debouncedSave = useCallback((data: FormData): void => {
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }

    const timeout = setTimeout(() => {
      console.log('Auto-saved Data:', data);
      setLastSaved(new Date());
      // Here you would typically send data to backend
      // localStorage.setItem('attachmentData', JSON.stringify(data));
    }, 1000); // Save after 1 second of no typing

    setSaveTimeout(timeout);
  }, [saveTimeout]);

  // Enhanced input change handler with continuous writing support
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    const newFormData: FormData = {
      ...formData,
      [name]: value
    };
    
    setFormData(newFormData);
    
    // Trigger auto-save
    debouncedSave(newFormData);
  };

  // Manual save function
  const handleSave = (): void => {
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }
    console.log('Manually Saved Data:', formData);
    setLastSaved(new Date());
    // Send to backend or store locally
  };

  // Format date for display
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Enhanced Card component with better UX
  const Card: React.FC<CardProps> = ({ label, name, placeholder }) => (
    <div className="glass-card backdrop-blur-sm bg-white/70 border border-white/20 shadow-lg rounded-xl p-6 hover:bg-white/80 transition-all duration-300">
      <div className="flex flex-col space-y-2">
        <h3 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">{label}</h3>
        <input
          type="text"
          name={name}
          value={formData[name] || ''}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="text-lg font-medium text-navy-700 bg-transparent border-b border-gray-300 focus:outline-none focus:border-navy-700 placeholder-gray-500 transition-colors duration-200"
          autoComplete="off"
          spellCheck={true}
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-6 p-4">
      {/* Attachment Details Section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Attachment Details</h2>
          {lastSaved && (
            <span className="text-sm text-green-600">
              Last saved: {lastSaved.toLocaleTimeString()}
            </span>
          )}
        </div>

        {/* Cards Grid */}
        {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card label="Institution" name="institution" placeholder="Jhub Africa" />
          <Card label="Duration" name="duration" placeholder="8 weeks" />
          <Card label="Period" name="period" placeholder="June 1st - August 1st" />
          <Card label="Supervisor" name="supervisor" placeholder="Dr. Lawrence Nderu" />
          <Card label="Course" name="course" placeholder="BSc Computer Science" />
          <Card label="University" name="university" placeholder="Jomo Kenyatta University of Agriculture and Technology" />
        </div> */}
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

        {/* Save Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSave}
            className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            Save Details
          </button>
        </div>
      </div>

      {/* Attachment Progress Section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Attachment Progress</h2>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Overall Progress</span>
            <span className="text-sm font-medium text-navy-700">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
            <div
              className="bg-gradient-to-r from-navy-600 to-navy-700 h-4 rounded-full transition-all duration-500 ease-out shadow-sm"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>Started: {formatDate(startDate)}</span>
            <span>Expected completion: {formatDate(endDate)}</span>
          </div>
          <div className="text-center text-xs text-gray-600 mt-2">
            Progress updates automatically based on time elapsed
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;