// import { StrictMode } from 'react'
// import { createRoot } from 'react-dom/client'
// import './index.css'
// import App from './App.tsx'

// createRoot(document.getElementById('root')!).render(
//   <StrictMode>
//     <App />
//   </StrictMode>,
// )




import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
// import { AuthProvider } from './context/AuthContext'
// import { UserProvider } from './context/UserContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  // <AuthProvider>
  //   <UserProvider>
  //     <App />
  //   </UserProvider>
  // </AuthProvider>
  <React.StrictMode>
    <App />
  </React.StrictMode>
)