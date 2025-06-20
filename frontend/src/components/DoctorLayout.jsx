import { useContext } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { appContext } from '../context/AppContext';

function DoctorLayout() {
  const location = useLocation();
  const {userData}=useContext(appContext);
  const navItems = [
    { path: '/doctor', label: 'Dashboard', icon: '🏥' },
    { path: '/doctor/appointments', label: 'My Appointments', icon: '📅' },
    { path: '/doctor/schedule', label: 'Schedule', icon: '🗓️' },
    { path: '/doctor/earnings', label: 'Earnings', icon: '💰' },
    { path: '/doctor/profile', label: 'My Profile', icon: '👨‍⚕️' }
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-72 bg-white shadow-xl border-r border-gray-200">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800">Doctor Portal</h2>
          <p className="text-sm text-gray-500 mt-1">Manage your practice</p>
        </div>
        
        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`group flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive 
                    ? 'bg-green-50 text-green-700 shadow-sm' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span className={`mr-4 text-xl transition-transform duration-200 ${
                  isActive ? 'scale-110' : 'group-hover:scale-105'
                }`}>
                  {item.icon}
                </span>
                <span className="flex-1">{item.label}</span>
                {isActive && (
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                )}
              </Link>
            );
          })}
        </nav>
        
        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 w-72 p-4 border-t border-gray-100 bg-white">
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-green-300 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-green-700">Dr</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">Dr. {userData.name}</p>
              <p className="text-xs text-gray-500 truncate">{userData.email}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default DoctorLayout;