// import React, { useState } from 'react';
// import { Home, FileText, MessageSquare, Settings, LogOut, Menu, X, type LucideIcon } from 'lucide-react';
// import { Button } from '../ui/Button';
// type TabName = 'dashboard' | 'reports' | 'feedback' | 'settings';

// interface MenuItem {
//   id: TabName;
//   label: string;
//   icon: LucideIcon;
// }

// interface SidebarProps {
//   activeTab: TabName;
//   setActiveTab: (tab: TabName) => void;
// }

// const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
//   const [isOpen, setIsOpen] = useState<boolean>(false);

//   const menuItems: MenuItem[] = [
//     { id: 'dashboard', label: 'Dashboard', icon: Home },
//     { id: 'reports', label: 'Reports', icon: FileText },
//     { id: 'feedback', label: 'Feedback', icon: MessageSquare },
//     { id: 'settings', label: 'Settings', icon: Settings },
//   ];

//   const toggleSidebar = (): void => setIsOpen(!isOpen);

//   return (
//     <>
//       {/* Mobile menu button */}
//       <Button
//         variant="ghost"
//         size="icon"
//         className="fixed top-4 left-4 z-50 md:hidden bg-white shadow-md"
//         onClick={toggleSidebar}
//       >
//         {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
//       </Button>

//       {/* Overlay for mobile */}
//       {isOpen && (
//         <div
//           className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
//           onClick={toggleSidebar}
//         />
//       )}

//       {/* Sidebar */}
//       <div
//         className={`fixed left-0 top-0 h-full w-64 bg-navy-900 text-white transform transition-transform duration-300 ease-in-out z-50 md:translate-x-0 ${
//           isOpen ? 'translate-x-0' : '-translate-x-full'
//         } md:relative md:z-auto`}
//       >
//         {/* User Profile Section */}
//         <div className="p-6 border-b border-navy-700">
//           <div className="flex items-center space-x-3">
//             <div className="w-10 h-10 bg-navy-700 rounded-full flex items-center justify-center">
//               <span className="text-sm font-semibold">EN</span>
//             </div>
//             <div>
//               <h3 className="font-semibold">Eunice</h3>
//               <p className="text-sm text-gray-300">Nyaboke</p>
//             </div>
//           </div>
//         </div>

//         {/* Navigation Menu */}
//         <nav className="flex-1 p-4">
//           <ul className="space-y-2">
//             {menuItems.map((item: MenuItem) => {
//               const Icon = item.icon;
//               return (
//                 <li key={item.id}>
//                   <button
//                     onClick={() => {
//                       setActiveTab(item.id);
//                       setIsOpen(false); // Close mobile menu
//                     }}
//                     className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
//                       activeTab === item.id
//                         ? 'bg-navy-700 text-white'
//                         : 'text-gray-300 hover:bg-navy-800 hover:text-white'
//                     }`}
//                   >
//                     <Icon className="h-5 w-5" />
//                     <span>{item.label}</span>
//                   </button>
//                 </li>
//               );
//             })}
//           </ul>
//         </nav>

//         {/* Logout Button */}
//         <div className="p-4 border-t border-navy-700">
//           <button
//             onClick={() => {
//               // Handle logout logic here
//               console.log('Logout clicked');
//             }}
//             className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-navy-800 hover:text-white transition-colors"
//           >
//             <LogOut className="h-5 w-5" />
//             <span>Log Out</span>
//           </button>
//         </div>
//       </div>
//     </>
//   );
// };

// export default Sidebar;
















import React, { useState } from 'react';
import { Home, FileText, MessageSquare, Settings, LogOut, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

type TabType = 'dashboard' | 'reports' | 'feedback' | 'settings';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'feedback', label: 'Feedback', icon: MessageSquare },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden bg-white shadow-md"
        onClick={toggleSidebar}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full w-64 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out z-50 md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:relative md:z-auto`}
      >
        {/* User Profile Section */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center">
              <span className="text-sm font-semibold">EN</span>
            </div>
            <div>
              <h3 className="font-semibold">Eunice</h3>
              <p className="text-sm text-gray-300">Nyaboke</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      setActiveTab(item.id as TabType);
                      setIsOpen(false); // Close mobile menu
                    }}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      activeTab === item.id
                        ? 'bg-navy-700 text-white'
                        : 'text-gray-300 hover:bg-navy-800 hover:text-white'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-slate-700">
          <button
            onClick={() => {
              // Handle logout logic here
              console.log('Logout clicked');
            }}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-navy-800 hover:text-white transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span>Log Out</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;

