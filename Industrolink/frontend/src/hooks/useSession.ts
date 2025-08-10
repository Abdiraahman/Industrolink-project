// useSession is a custom hook for session timeout and auto-logout management.
// It tracks user activity and triggers warnings or logout after inactivity.
// Useful for security and compliance in web apps.

import { useEffect, useRef } from 'react';
import { useAuthContext } from '../context/AuthContext';

// Options for useSession:
// - timeout: session duration in minutes (default: 30)
// - warningTime: minutes before timeout to show warning (default: 5)
// - onTimeout: callback when session expires
// - onWarning: callback when warning should be shown
interface UseSessionOptions {
  timeout?: number; // in minutes
  warningTime?: number; // in minutes before timeout
  onTimeout?: () => void;
  onWarning?: (remainingTime: number) => void;
}

export const useSession = ({
  timeout = 30,
  warningTime = 5,
  onTimeout,
  onWarning
}: UseSessionOptions = {}) => {
  const { isAuthenticated, logout } = useAuthContext();
  const timeoutRef = useRef<NodeJS.Timeout>();
  const warningRef = useRef<NodeJS.Timeout>();
  const lastActivityRef = useRef<number>(Date.now());

  /**
   * Resets the session timer on user activity.
   * Sets up warning and logout timers.
   */
  const resetTimer = () => {
    if (!isAuthenticated) return;

    lastActivityRef.current = Date.now();

    // Clear existing timers
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningRef.current) clearTimeout(warningRef.current);

    // Set warning timer (fires before session expires)
    warningRef.current = setTimeout(() => {
      const remainingTime = timeout - warningTime;
      onWarning?.(remainingTime);
    }, (timeout - warningTime) * 60 * 1000);

    // Set logout timer (fires when session expires)
    timeoutRef.current = setTimeout(() => {
      onTimeout?.();
      logout();
    }, timeout * 60 * 1000);
  };

  // Listen for user activity and reset timers accordingly
  useEffect(() => {
    if (!isAuthenticated) return;

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    const resetOnActivity = () => resetTimer();

    // Add event listeners for activity
    events.forEach(event => {
      document.addEventListener(event, resetOnActivity, true);
    });

    // Initialize timer on mount
    resetTimer();

    return () => {
      // Cleanup event listeners and timers
      events.forEach(event => {
        document.removeEventListener(event, resetOnActivity, true);
      });
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningRef.current) clearTimeout(warningRef.current);
    };
  }, [isAuthenticated, timeout, warningTime]);

  // Expose resetTimer and lastActivity timestamp
  return {
    resetTimer,
    lastActivity: lastActivityRef.current
  };
}; 