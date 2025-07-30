// // App.tsx
// import React from 'react';
// import StudentDashboard from './pages/dashboard/StudentDashboard';

// function App() {
//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
//       {/* Header */}
//       <div className="bg-white shadow-sm border-b">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="py-6">
//             <h1 className="text-2xl font-bold text-gray-900">Internship Management System</h1>
//             <p className="mt-1 text-sm text-gray-600">
//               Welcome back! Here's your dashboard overview.
//             </p>
//           </div>
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         <StudentDashboard />
//       </div>
//     </div>
//   );
// }

// export default App;











// import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
// import { useAuth } from './hooks/auth/useAuth'
// import MainLayout from './components/layout/MainLayout'
// import Login from './pages/auth/Login'
// import StudentDashboard from './pages/dashboard/StudentDashboard'
// //import TaskList from './pages/tasks/TaskList'

// function App() {
//   const { isAuthenticated, user } = useAuth()

//   if (!isAuthenticated) {
//     return (
//       <BrowserRouter>
//         <Routes>
//           <Route path="/login" element={<Login />} />
//           <Route path="*" element={<Navigate to="/login" />} />
//         </Routes>
//       </BrowserRouter>
//     )
//   }

//   return (
//     <BrowserRouter>
//       <MainLayout>
//         <Routes>
//           <Route path="/dashboard" element={<StudentDashboard />} />
//           {/* <Route path="/tasks" element={<TaskList />} /> */}
//           <Route path="*" element={<Navigate to="/dashboard" />} />
//         </Routes>
//       </MainLayout>
//     </BrowserRouter>
//   )
// }

// export default App















// import React, { useState } from 'react';
// import Layout from './components/layout/Layout';
// // import Dashboard from './components/Dashboard';
// // import Reports from './components/Reports';
// // import Feedback from './components/Feedback';
// import Settings from './components/layout/Settings';
// import StudentDashboard from './pages/dashboard/StudentDashboard';

// type TabName = 'dashboard' | 'reports' | 'feedback' | 'settings';

// const App: React.FC = () => {
//   const [activeTab, setActiveTab] = useState<TabName>('dashboard');

//   const renderContent = (): React.ReactNode => {
//     switch (activeTab) {
//       case 'dashboard':
//         return <StudentDashboard />;
//       // case 'reports':
//       //   return <Reports />;
//       // case 'feedback':
//       //   return <Feedback />;
//       case 'settings':
//         return <Settings />;
//       default:
//         return <StudentDashboard />;
//     }
//   };

//   return (
//     <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
//       {renderContent()}
//     </Layout>
//   );
// };

// export default App;






// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/dashboard/Dashboard'; // Your existing dashboard
//import './App.css';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/auth/login" replace />} />
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        {/* Add more routes as needed */}
      </Routes>
    </Router>
  );
};

export default App;