import React from 'react';
import { Activity, ShieldCheck, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-950 text-slate-400 text-xs border-t border-white/10 mt-12 relative overflow-hidden backdrop-blur-md">
      {/* Glow Orbs */}
      <div className="absolute top-0 left-1/3 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 py-8 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-white/10">
          
          {/* Logo & Slogan */}
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-gradient-to-tr from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <span className="text-lg font-extrabold text-white tracking-tight">
                HealthHub
              </span>
              <p className="text-[10px] text-cyan-400 font-medium">
                Modern Healthcare & Appointment Management
              </p>
            </div>
          </div>

          {/* Nav Links */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-semibold">
            <a href="/patient" className="text-slate-300 hover:text-cyan-300 transition-colors">Dashboard</a>
            <a href="/patient/doctors" className="text-slate-300 hover:text-cyan-300 transition-colors">Find Doctors</a>
            <a href="/patient/appointments" className="text-slate-300 hover:text-cyan-300 transition-colors">My Appointments</a>
            <a href="/patient/profile" className="text-slate-300 hover:text-cyan-300 transition-colors">Profile</a>
          </div>

          {/* Security Badge */}
          <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1.5 rounded-full font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>24/7 Secure Medical Portal</span>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-500">
          <div>
            © {new Date().getFullYear()} HealthHub. All rights reserved.
          </div>
          <div className="flex items-center gap-1">
            <span>Crafted with care for patient wellness</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline ml-1" />
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
