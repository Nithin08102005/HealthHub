import { useContext } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { appContext } from '../context/AppContext';
import { LayoutDashboard, Users, Calendar, UserPlus, Sparkles, ChevronRight, ShieldAlert } from 'lucide-react';

function AdminLayout() {
  const location = useLocation();
  const { userData } = useContext(appContext);
  
  const navItems = [
    { path: '/admin', label: 'Admin Dashboard', icon: LayoutDashboard },
    { path: '/admin/doctors', label: 'All Doctors', icon: Users },
    { path: '/admin/appointments', label: 'All Appointments', icon: Calendar },
    { path: '/admin/add-doctor', label: 'Add Doctor', icon: UserPlus }
  ];

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-slate-950 text-white">
      {/* Executive Dark Sidebar for Admin */}
      <aside className="w-64 sm:w-72 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white shadow-2xl border-r border-white/10 flex-shrink-0 flex flex-col justify-between hidden md:flex">
        
        <div>
          {/* Sidebar Header */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center gap-2 text-purple-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4" />
              <span>Admin Suite</span>
            </div>
            <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-purple-400" />
              <span>System Admin</span>
            </h2>
          </div>
          
          {/* Navigation Links */}
          <nav className="p-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`group flex items-center px-4 py-3.5 rounded-2xl text-xs sm:text-sm font-bold transition-all duration-300 ${
                    isActive 
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/25 translate-x-1' 
                      : 'text-slate-400 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon className={`w-5 h-5 mr-3.5 transition-transform duration-300 ${
                    isActive ? 'text-white scale-110' : 'text-slate-400 group-hover:text-purple-300 group-hover:scale-105'
                  }`} />
                  
                  <span className="flex-1">{item.label}</span>
                  
                  {isActive ? (
                    <ChevronRight className="w-4 h-4 text-white" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Admin Footer Account Widget */}
        <div className="p-4 m-4 rounded-2xl bg-purple-500/10 border border-purple-400/20">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-purple-600 to-indigo-500 rounded-xl flex items-center justify-center text-white font-extrabold text-sm shadow-md">
              A
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">
                {userData?.name || "Administrator"}
              </p>
              <p className="text-[10px] text-purple-300 truncate">
                {userData?.email || "System Superuser"}
              </p>
            </div>
          </div>
        </div>

      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-950">
        
        {/* Mobile Horizontal Sub-Navigation Bar */}
        <div className="md:hidden bg-slate-900 text-white px-4 py-3 border-b border-white/10 flex items-center justify-around overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center py-1 px-3 rounded-xl text-[10px] font-bold whitespace-nowrap transition-all ${
                  isActive ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4 mb-0.5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Dynamic Page Outlet Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto bg-slate-950 text-white">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

    </div>
  );
}

export default AdminLayout;