import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, Stethoscope, Calendar, User, ShieldCheck, ChevronRight, Activity, Sparkles } from 'lucide-react';

function PatientLayout() {
  const location = useLocation();
  
  const navItems = [
    { path: '/patient', label: 'Dashboard', icon: Home },
    { path: '/patient/doctors', label: 'Find Doctors', icon: Stethoscope },
    { path: '/patient/appointments', label: 'My Appointments', icon: Calendar },
    { path: '/patient/profile', label: 'My Profile', icon: User }
  ];

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-slate-950 text-white">
      {/* Executive Dark Sidebar */}
      <aside className="w-64 sm:w-72 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white shadow-2xl border-r border-white/10 flex-shrink-0 hidden md:block">
        
        {/* Sidebar Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Patient Portal</span>
          </div>
          <h2 className="text-xl font-extrabold text-white tracking-tight">
            Navigation Menu
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
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/25 translate-x-1' 
                    : 'text-slate-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 mr-3.5 transition-transform duration-300 ${
                  isActive ? 'text-white scale-110' : 'text-slate-400 group-hover:text-cyan-300 group-hover:scale-105'
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

        {/* Sidebar Footer Badge */}
        <div className="p-4 mx-4 mt-8 rounded-2xl bg-blue-500/10 border border-blue-400/20 text-center">
          <ShieldCheck className="w-6 h-6 text-cyan-400 mx-auto mb-1" />
          <p className="text-xs font-bold text-white">24/7 Verified Care</p>
          <p className="text-[10px] text-slate-400 mt-0.5">HealthHub Encrypted System</p>
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
                  isActive ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
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

export default PatientLayout;