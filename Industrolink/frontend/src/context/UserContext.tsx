// import { createContext, useContext, useState, type ReactNode } from 'react'

// interface UserContextType {
//   profile: any
//   updateProfile: (data: any) => void
// }

// const UserContext = createContext<UserContextType | undefined>(undefined)

// export function UserProvider({ children }: { children: ReactNode }) {
//   const [profile, setProfile] = useState({})

//   const updateProfile = (data: any) => {
//     setProfile(prev => ({ ...prev, ...data }))
//   }

//   return (
//     <UserContext.Provider value={{ profile, updateProfile }}>
//       {children}
//     </UserContext.Provider>
//   )
// }

// export const useUserContext = () => {
//   const context = useContext(UserContext)
//   if (!context) throw new Error('useUserContext must be used within UserProvider')
//   return context
// }