// import { createContext, useContext, useState, type ReactNode } from 'react'
// import { type User } from '../types/user'

// interface AuthContextType {
//   isAuthenticated: boolean
//   user: User | null
//   login: (email: string, password: string) => Promise<void>
//   logout: () => void
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined)

// export function AuthProvider({ children }: { children: ReactNode }) {
//   const [isAuthenticated, setIsAuthenticated] = useState(false)
//   const [user, setUser] = useState<User | null>(null)

//   const login = async (email: string, password: string) => {
//     // Simulate API call
//     setUser({ id: '1', email, name: 'John Doe', role: 'student' })
//     setIsAuthenticated(true)
//   }

//   const logout = () => {
//     setUser(null)
//     setIsAuthenticated(false)
//   }

//   return (
//     <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
//       {children}
//     </AuthContext.Provider>
//   )
// }

// export const useAuthContext = () => {
//   const context = useContext(AuthContext)
//   if (!context) throw new Error('useAuthContext must be used within AuthProvider')
//   return context
// }

