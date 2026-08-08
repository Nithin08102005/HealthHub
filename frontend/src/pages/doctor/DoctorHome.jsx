import React, { useState, useEffect, useContext } from 'react';
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  DollarSign, 
  Activity,
  User,
  Sparkles,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Stethoscope
} from 'lucide-react';
import axios from 'axios';
import { appContext } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';

const DoctorHome = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const { userData } = useContext(appContext);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDoctorStats = async () => {
      try {
        setLoading(true);
        const response = await axios.post(`${import.meta.env.VITE_API_URL}/doctor/getDoctorDashboardStats`, {
          doctorId: userData.id,
        });
        if (response.data.success) {
          setDashboardData(response.data);
        }
      } catch (error) {
        console.error('Error loading doctor dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userData?.id) {
      fetchDoctorStats();
    }
  }, [userData?.id]);

  const getPercentage = (value, total) => {
    if (total === 0) return '0.0';
    return ((value / total) * 100).toFixed(1);
  };

  const getTodayDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-300 font-medium">Loading clinical metrics...</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-slate-950 text-white p-6 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="h-16 w-16 text-rose-500 mx-auto mb-4" />
          <p className="text-slate-300 font-medium">Failed to load doctor dashboard stats</p>
        </div>
      </div>
    );
  }

  const appointmentTotal = Object.values(dashboardData.appointmentsByStatus || {})
    .map(Number)
    .reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden rounded-3xl border border-white/10 shadow-2xl my-2 p-6 sm:p-10">
      {/* Background Mesh Spheres */}
      <div className="absolute top-0 right-10 w-96 h-96 bg-emerald-500/15 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-teal-500/15 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10 space-y-10">

        {/* Welcome Header Banner */}
        <div className="bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 rounded-3xl p-8 sm:p-10 shadow-2xl border border-white/15 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Clinical Suite & Dashboard</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white">
              Welcome back,{" "}
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300 bg-clip-text text-transparent">
                Dr. {dashboardData.doctorName || 'Doctor'}!
              </span>
            </h1>
            <p className="text-slate-300 text-sm sm:text-base">
              📅 Today is <strong>{getTodayDate()}</strong>. Manage your appointments and earnings wallet.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate("/doctor/appointments")}
              className="bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold px-6 py-3.5 rounded-2xl shadow-lg shadow-emerald-500/25 transition-all flex items-center gap-2 text-sm cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              <span>View Appointments</span>
            </button>
            <button
              onClick={() => navigate("/doctor/profile")}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-5 py-3.5 rounded-2xl transition-all border border-white/10 text-sm cursor-pointer"
            >
              <span>Manage Profile</span>
            </button>
          </div>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Earnings */}
          <div className="bg-slate-900/90 backdrop-blur-2xl rounded-3xl p-6 shadow-2xl border border-white/15 hover:border-emerald-500/40 transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Earnings</p>
                <h3 className="text-3xl font-extrabold text-emerald-400 mt-2">
                  ₹{(dashboardData.totalEarnings || 0).toLocaleString()}
                </h3>
              </div>
              <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-400 border border-emerald-400/20 group-hover:scale-110 transition-transform">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>
            <p className="text-[11px] text-emerald-300/80 mt-3 font-medium">From completed consultations</p>
          </div>

          {/* Total Appointments */}
          <div className="bg-slate-900/90 backdrop-blur-2xl rounded-3xl p-6 shadow-2xl border border-white/15 hover:border-blue-500/40 transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Consultations</p>
                <h3 className="text-3xl font-extrabold text-white mt-2">{appointmentTotal}</h3>
              </div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center text-cyan-400 border border-blue-400/20 group-hover:scale-110 transition-transform">
                <Calendar className="w-6 h-6" />
              </div>
            </div>
            <p className="text-[11px] text-cyan-300/80 mt-3 font-medium">All time patient bookings</p>
          </div>

          {/* Pending Confirmations */}
          <div className="bg-slate-900/90 backdrop-blur-2xl rounded-3xl p-6 shadow-2xl border border-white/15 hover:border-amber-500/40 transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Pending Action</p>
                <h3 className="text-3xl font-extrabold text-amber-400 mt-2">
                  {dashboardData.appointmentsByStatus?.pending || 0}
                </h3>
              </div>
              <div className="w-12 h-12 bg-amber-500/20 rounded-2xl flex items-center justify-center text-amber-400 border border-amber-400/20 group-hover:scale-110 transition-transform">
                <Clock className="w-6 h-6" />
              </div>
            </div>
            <p className="text-[11px] text-amber-300/80 mt-3 font-medium">Requires doctor confirmation</p>
          </div>

          {/* Completed */}
          <div className="bg-slate-900/90 backdrop-blur-2xl rounded-3xl p-6 shadow-2xl border border-white/15 hover:border-teal-500/40 transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Completed</p>
                <h3 className="text-3xl font-extrabold text-teal-400 mt-2">
                  {dashboardData.appointmentsByStatus?.completed || 0}
                </h3>
              </div>
              <div className="w-12 h-12 bg-teal-500/20 rounded-2xl flex items-center justify-center text-teal-400 border border-teal-400/20 group-hover:scale-110 transition-transform">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>
            <p className="text-[11px] text-teal-300/80 mt-3 font-medium">Finished consultations</p>
          </div>

        </div>

        {/* Appointment Status Breakdown */}
        <div className="bg-slate-900/90 backdrop-blur-2xl rounded-3xl p-8 shadow-2xl border border-white/15 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-400" />
              <span>Consultation Distribution</span>
            </h2>
            <span className="text-xs text-slate-400 font-semibold">Live Realtime Metrics</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Pending */}
            <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/30 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Clock className="h-6 w-6 text-amber-400" />
                <div>
                  <p className="font-bold text-white text-sm">Pending Confirmation</p>
                  <p className="text-xs text-slate-400">Needs doctor review</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-extrabold text-amber-400">
                  {dashboardData.appointmentsByStatus?.pending || 0}
                </p>
                <p className="text-[10px] text-slate-400 font-semibold">
                  {getPercentage(dashboardData.appointmentsByStatus?.pending || 0, appointmentTotal)}%
                </p>
              </div>
            </div>

            {/* Confirmed */}
            <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                <div>
                  <p className="font-bold text-white text-sm">Confirmed Appointments</p>
                  <p className="text-xs text-slate-400">Active upcoming visits</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-extrabold text-emerald-400">
                  {dashboardData.appointmentsByStatus?.confirmed || 0}
                </p>
                <p className="text-[10px] text-slate-400 font-semibold">
                  {getPercentage(dashboardData.appointmentsByStatus?.confirmed || 0, appointmentTotal)}%
                </p>
              </div>
            </div>

            {/* Completed */}
            <div className="p-4 rounded-2xl bg-blue-950/40 border border-blue-500/30 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Stethoscope className="h-6 w-6 text-cyan-400" />
                <div>
                  <p className="font-bold text-white text-sm">Completed Consultations</p>
                  <p className="text-xs text-slate-400">Fulfillments</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-extrabold text-cyan-400">
                  {dashboardData.appointmentsByStatus?.completed || 0}
                </p>
                <p className="text-[10px] text-slate-400 font-semibold">
                  {getPercentage(dashboardData.appointmentsByStatus?.completed || 0, appointmentTotal)}%
                </p>
              </div>
            </div>

            {/* Cancelled / Expired */}
            <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/30 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <XCircle className="h-6 w-6 text-rose-400" />
                <div>
                  <p className="font-bold text-white text-sm">Cancelled & Expired</p>
                  <p className="text-xs text-slate-400">Missed / Auto-expired</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-extrabold text-rose-400">
                  {(dashboardData.appointmentsByStatus?.cancelled || 0) + (dashboardData.appointmentsByStatus?.expired || 0)}
                </p>
                <p className="text-[10px] text-slate-400 font-semibold">
                  {getPercentage((dashboardData.appointmentsByStatus?.cancelled || 0) + (dashboardData.appointmentsByStatus?.expired || 0), appointmentTotal)}%
                </p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default DoctorHome;