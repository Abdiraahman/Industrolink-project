// UserRole defines all possible roles in the system for RBAC
export type UserRole = 'student' | 'lecturer' | 'supervisor' | 'admin';

// User interface represents an authenticated user in the system
// - id: Unique identifier for the user
// - email: User's email address
// - name: User's full name
// - role: The user's role (used for RBAC)
// - permissions: (Optional) Additional permissions (if any, for future extension)
// - lastLogin: (Optional) Last login timestamp
// - isActive: (Optional) Whether the user account is active
export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  permissions?: string[]
  lastLogin?: Date
  isActive?: boolean
}