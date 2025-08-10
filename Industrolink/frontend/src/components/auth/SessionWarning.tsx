import React, { useState, useEffect } from 'react';
import { AlertTriangle, Clock } from 'lucide-react';

interface SessionWarningProps {
  remainingTime: number; // in minutes
  onExtend: () => void;
  onLogout: () => void;
}

const SessionWarning: React.FC<SessionWarningProps> = ({
  remainingTime,
  onExtend,
  onLogout
}) => {
  const [timeLeft, setTimeLeft] = useState(remainingTime * 60); // Convert to seconds

  useEffect(() => {
    setTimeLeft(remainingTime * 60);
  }, [remainingTime]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          onLogout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [onLogout]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center space-x-3 mb-4">
          <AlertTriangle className="w-6 h-6 text-amber-500" />
          <h3 className="text-lg font-semibold text-gray-900">Session Expiring</h3>
        </div>
        
        <div className="mb-4">
          <p className="text-gray-600 mb-2">
            Your session will expire in:
          </p>
          <div className="flex items-center space-x-2 text-2xl font-mono text-red-600">
            <Clock className="w-5 h-5" />
            <span>{formatTime(timeLeft)}</span>
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onExtend}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Extend Session
          </button>
          <button
            onClick={onLogout}
            className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Logout Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionWarning; 