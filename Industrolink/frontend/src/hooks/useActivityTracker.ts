// useActivityTracker is a custom hook for logging user actions for audit and analytics.
// It provides helpers to track generic activities, page views, resource access, and data modifications.
// Events are sent to the backend for audit trail and security monitoring.

import { useEffect } from 'react';
import { useAuthContext } from '../context/AuthContext';

// Structure of an activity event sent to the backend audit log
interface ActivityEvent {
  action: string;         // The action performed (e.g., 'login', 'view_submission')
  resource?: string;      // Optional resource identifier (e.g., 'submission:123')
  timestamp: number;      // When the action occurred
  userAgent: string;      // Browser user agent string
  userId?: string;        // User ID (if available)
  sessionId?: string;     // Session ID (if available)
}

export const useActivityTracker = () => {
  const { user } = useAuthContext();

  /**
   * Track a generic user activity.
   * @param action - The action performed
   * @param resource - Optional resource identifier
   */
  const trackActivity = async (action: string, resource?: string) => {
    if (!user) return;

    const event: ActivityEvent = {
      action,
      resource,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      userId: user.id,
      sessionId: sessionStorage.getItem('sessionId') || undefined
    };

    try {
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/audit/`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        credentials: 'include',
        body: JSON.stringify(event)
      });
    } catch (error) {
      console.error('Failed to track activity:', error);
    }
  };

  /**
   * Track a page view event.
   * @param page - The page path or name
   */
  const trackPageView = (page: string) => {
    trackActivity('page_view', `page:${page}`);
  };

  /**
   * Track access to a specific resource (e.g., viewing a submission).
   * @param resourceType - The type of resource (e.g., 'submission')
   * @param resourceId - The resource's unique ID
   */
  const trackResourceAccess = (resourceType: string, resourceId: string) => {
    trackActivity('resource_access', `${resourceType}:${resourceId}`);
  };

  /**
   * Track a data modification event (e.g., edit, delete).
   * @param action - The action performed (e.g., 'edit_submission')
   * @param resourceType - The type of resource
   * @param resourceId - The resource's unique ID
   */
  const trackDataModification = (action: string, resourceType: string, resourceId: string) => {
    trackActivity(action, `${resourceType}:${resourceId}`);
  };

  // Expose all tracking functions
  return { 
    trackActivity, 
    trackPageView, 
    trackResourceAccess, 
    trackDataModification 
  };
}; 