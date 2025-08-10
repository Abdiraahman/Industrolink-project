# RBAC (Role-Based Access Control) Implementation

This document describes the comprehensive RBAC system implemented for the Industrolink project.

## Overview

The RBAC system provides:
- **Permission-based access control** for UI components and routes
- **Session management** with auto-logout and warnings
- **Activity tracking** for audit purposes
- **Multi-factor authentication** support
- **Enhanced security** with CSRF protection and secure headers
- **Dynamic route loading** based on user roles and permissions

## Core Components

### 1. Permission System (`utils/permissions.ts`)

Defines permissions and role-based access rules:

```typescript
import { Permission, hasPermission, ROLE_PERMISSIONS } from '../utils/permissions';

// Check if user has a specific permission
const canGrade = hasPermission(user.role, 'grade:submissions');

// Get all permissions for a role
const studentPermissions = ROLE_PERMISSIONS.student;
```

**Available Permissions:**
- `read:profile` | `write:profile` - Profile management
- `read:students` | `write:students` - Student data access
- `read:submissions` | `write:submissions` | `grade:submissions` - Submission management
- `read:evaluations` | `write:evaluations` - Evaluation management
- `read:internships` | `write:internships` | `manage:internships` - Internship management
- `read:users` | `write:users` | `delete:users` - User management
- `read:reports` | `generate:reports` - Report access
- `system:admin` - Full system administration

### 2. PermissionGuard Component

Protects UI components based on permissions:

```typescript
import { PermissionGuard } from '../components/auth';

// Single permission check
<PermissionGuard permission="read:submissions">
  <SubmissionsList />
</PermissionGuard>

// Multiple permissions (ANY)
<PermissionGuard permissions={['read:submissions', 'grade:submissions']}>
  <SubmissionsList />
</PermissionGuard>

// Multiple permissions (ALL)
<PermissionGuard 
  permissions={['read:submissions', 'write:submissions']} 
  requireAll={true}
>
  <SubmissionsList />
</PermissionGuard>

// With custom fallback
<PermissionGuard 
  permission="write:submissions"
  fallback={<p>You don't have permission to create submissions</p>}
>
  <CreateSubmissionButton />
</PermissionGuard>
```

### 3. Enhanced Protected Route

Route-level permission protection:

```typescript
import { EnhancedProtectedRoute } from '../components/auth';

<EnhancedProtectedRoute
  allowedRoles={['lecturer', 'supervisor']}
  requiredPermission="grade:submissions"
  fallbackPath="/unauthorized"
>
  <GradingPage />
</EnhancedProtectedRoute>
```

### 4. Extended Auth Hook

Enhanced authentication utilities:

```typescript
import { useAuthExtended } from '../hooks/useAuthExtended';

const MyComponent = () => {
  const { 
    checkPermission, 
    isRole, 
    isAnyRole, 
    canAccess 
  } = useAuthExtended();

  // Check specific permission
  const canGrade = checkPermission('grade:submissions');

  // Check role
  const isStudent = isRole('student');

  // Check multiple roles
  const isStaff = isAnyRole(['lecturer', 'supervisor']);

  // Flexible access check
  const canManage = canAccess('manage:internships');

  return (
    <div>
      {canGrade && <GradingInterface />}
      {isStudent && <StudentView />}
    </div>
  );
};
```

## Session Management

### Session Hook

Automatic session management with warnings:

```typescript
import { useSession } from '../hooks/useSession';

const MyLayout = () => {
  const [showWarning, setShowWarning] = useState(false);

  useSession({
    timeout: 30, // 30 minutes
    warningTime: 5, // 5 minutes before timeout
    onWarning: (time) => {
      setShowWarning(true);
    },
    onTimeout: () => {
      logout();
    }
  });

  return (
    <div>
      {/* Your layout */}
      {showWarning && <SessionWarning />}
    </div>
  );
};
```

### Session Warning Component

```typescript
import { SessionWarning } from '../components/auth';

<SessionWarning
  remainingTime={5}
  onExtend={() => {
    // Extend session
    setShowWarning(false);
  }}
  onLogout={() => {
    // Force logout
    logout();
  }}
/>
```

## Activity Tracking

Track user actions for audit purposes:

```typescript
import { useActivityTracker } from '../hooks/useActivityTracker';

const SubmissionsPage = () => {
  const { 
    trackActivity, 
    trackPageView, 
    trackResourceAccess,
    trackDataModification 
  } = useActivityTracker();

  // Track page view
  useEffect(() => {
    trackPageView('/submissions');
  }, []);

  const handleViewSubmission = (id: string) => {
    trackResourceAccess('submission', id);
  };

  const handleEditSubmission = (id: string) => {
    trackDataModification('edit_submission', 'submission', id);
  };

  return (
    <div>
      {/* Your component */}
    </div>
  );
};
```

## Multi-Factor Authentication

### MFA Setup Component

```typescript
import { MFASetup } from '../components/auth';

const SecuritySettings = () => {
  const [showMFASetup, setShowMFASetup] = useState(false);

  return (
    <div>
      <button onClick={() => setShowMFASetup(true)}>
        Set Up 2FA
      </button>
      
      {showMFASetup && (
        <MFASetup
          onComplete={() => {
            setShowMFASetup(false);
            // Handle successful setup
          }}
          onSkip={() => {
            setShowMFASetup(false);
            // Handle skip
          }}
        />
      )}
    </div>
  );
};
```

## API Security

### Secure API Calls

```typescript
import { secureApiCall, createSecureRequest } from '../utils/apiSecurity';

// Secure API call with automatic error handling
const fetchSubmissions = async () => {
  try {
    const submissions = await secureApiCall<Submission[]>(
      '/api/submissions/'
    );
    return submissions;
  } catch (error) {
    // Handle error (automatic redirect on 401)
    console.error('Failed to fetch submissions:', error);
  }
};

// Manual secure request
const response = await createSecureRequest('/api/submissions/', {
  method: 'POST',
  body: JSON.stringify(data)
});
```

## Route Configuration

### Dynamic Route Loading

```typescript
import { ROUTE_CONFIGS, getNavRoutesForRole } from '../utils/routeConfig';

// Get routes for specific role
const studentRoutes = getNavRoutesForRole('student');

// Route configuration
const routes = [
  {
    path: '/submissions',
    component: lazy(() => import('../pages/Submissions')),
    requiredPermissions: ['read:submissions'],
    requireAuth: true,
    title: 'Submissions',
    showInNav: true
  }
];
```

## Usage Examples

### Complete Component Example

```typescript
import React from 'react';
import { 
  PermissionGuard, 
  useAuthExtended, 
  useActivityTracker 
} from '../components/auth';

const SubmissionsPage = () => {
  const { checkPermission, isRole } = useAuthExtended();
  const { trackActivity, trackResourceAccess } = useActivityTracker();

  const handleViewSubmission = (id: string) => {
    trackResourceAccess('submission', id);
  };

  const handleCreateSubmission = () => {
    trackActivity('create_submission');
  };

  return (
    <div>
      <h1>Submissions</h1>
      
      <PermissionGuard permission="write:submissions">
        <button onClick={handleCreateSubmission}>
          Create New Submission
        </button>
      </PermissionGuard>

      <PermissionGuard permission="read:submissions">
        <SubmissionsList onView={handleViewSubmission} />
      </PermissionGuard>

      {isRole('lecturer') && checkPermission('grade:submissions') && (
        <GradingInterface />
      )}
    </div>
  );
};
```

### Route Protection Example

```typescript
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { EnhancedProtectedRoute } from '../components/auth';

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        <Route 
          path="/submissions" 
          element={
            <EnhancedProtectedRoute
              requiredPermission="read:submissions"
              fallbackPath="/unauthorized"
            >
              <SubmissionsPage />
            </EnhancedProtectedRoute>
          } 
        />
        
        <Route 
          path="/admin" 
          element={
            <EnhancedProtectedRoute
              allowedRoles={['admin']}
              fallbackPath="/unauthorized"
            >
              <AdminPage />
            </EnhancedProtectedRoute>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
};
```

## Best Practices

1. **Always use PermissionGuard for sensitive UI elements**
2. **Use EnhancedProtectedRoute for route-level protection**
3. **Track important user actions for audit purposes**
4. **Implement session management in your main layout**
5. **Use secure API calls for all backend communication**
6. **Test permissions thoroughly for each user role**
7. **Keep permission definitions centralized and well-documented**

## Security Considerations

- All API calls include security headers
- CSRF protection is enabled
- Session tokens are automatically managed
- Activity is logged for audit purposes
- MFA provides additional security layer
- Automatic logout on session expiration

## Troubleshooting

### Common Issues

1. **Permission not working**: Check if the permission is defined in `ROLE_PERMISSIONS`
2. **Session expiring too quickly**: Adjust timeout values in `useSession`
3. **API calls failing**: Ensure you're using `secureApiCall` or `createSecureRequest`
4. **Routes not loading**: Verify route configuration in `routeConfig.ts`

### Debug Mode

Enable debug logging by setting:

```typescript
localStorage.setItem('debug', 'rbac');
```

This will log permission checks and activity tracking to the console. 