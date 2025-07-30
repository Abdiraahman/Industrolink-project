import React from 'react';
import Sidebar from './Sidebar';
type TabName = 'dashboard' | 'reports' | 'feedback' | 'settings';


interface LayoutProps {
  children: React.ReactNode;
  activeTab: TabName;
  setActiveTab: (tab: TabName) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  return (
    <div className="flex h-screen dashboard-bg">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:ml-0">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-200/50 p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div className="md:ml-0 ml-12">
              <h1 className="text-2xl font-bold text-navy-900 capitalize">
                {activeTab === 'dashboard' ? 'Student Dashboard' : activeTab}
              </h1>
              {activeTab === 'dashboard' && (
                <p className="text-navy-600 mt-1">Welcome, Eunice!</p>
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;