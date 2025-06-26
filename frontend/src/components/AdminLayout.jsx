import { useContext } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { appContext } from '../context/AppContext';

function AdminLayout() {
  const location = useLocation();
  const {userData} = useContext(appContext);
  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: '🎛️' },
    { path: '/admin/doctors', label: 'All Doctors', icon: '👨‍⚕️' },
    { path: '/admin/appointments', label: ' Appointments', icon: '📋' },
    { path: '/admin/add-doctor', label: 'Add Doctor', icon: '👨' }
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-72 bg-white shadow-xl border-r border-gray-200">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800">Admin Portal</h2>
          <p className="text-sm text-gray-500 mt-1">System administration</p>
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
                    ? 'bg-purple-50 text-purple-700 shadow-sm' 
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
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                )}
              </Link>
            );
          })}
        </nav>
        
        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 w-72 p-4 border-t border-gray-100 bg-white">
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-purple-300 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-purple-700">A</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{userData.name}</p>
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

export default AdminLayout;