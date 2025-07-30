export interface User {
  id: string
  email: string
  name: string
  role: 'student' | 'lecturer' | 'supervisor' | 'admin'
}