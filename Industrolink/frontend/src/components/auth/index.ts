// Core RBAC Components
export { default as PermissionGuard } from './PermissionGuard';
export { default as EnhancedProtectedRoute } from './EnhancedProtectedRoute';
export { default as SessionWarning } from './SessionWarning';
export { default as MFASetup } from './MFASetup';

// Hooks
export { useAuthExtended } from '../../hooks/useAuthExtended';
export { useSession } from '../../hooks/useSession';
export { useActivityTracker } from '../../hooks/useActivityTracker';

// Utilities
export * from '../../utils/permissions';
export * from '../../utils/apiSecurity';
export * from '../../utils/routeConfig';

// Types
export type { UserRole } from '../../types/user';
export type { Permission } from '../../utils/permissions'; 