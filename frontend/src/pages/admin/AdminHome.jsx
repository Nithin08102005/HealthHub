import React, { useState, useEffect, useContext } from 'react';
import { 
  Users, 
  UserCheck, 
  Calendar, 
  DollarSign, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  TrendingUp, 
  Activity,
  Sparkles,
  ShieldCheck,
  UserPlus,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { appContext } from '../../context/AppContext';

const AdminHome = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const { token } = useContext(appContext);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/admin/getDashboardStats`, {
          headers: { token }
        });
        if (response.data.success) {
          setDashboardData(response.data);
        }
      } catch (error) {
        console.error('Error loading dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchStats();
    }
  }, [token]);

  const getPercentage = (value, total) => {
    if (!total || total === 0) return '0.0';
    return ((value / total) * 100).toFixed(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-300 font-medium">Loading system analytics...</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
        <div className="text-center">
          <XCircle className="h-16 w-16 text-rose-500 mx-auto mb-4" />
          <p className="text-slate-300 font-medium">Failed to load admin analytics</p>
        </div>
      </div>
    );
  }

  const appointmentTotal = Object.values(dashboardData.appointmentsByStatus || {}).map(Number).reduce((a, b) => a + b, 0);
  const paymentTotal = Number(dashboardData.paymentStats?.paidCount || 0) + Number(dashboardData.paymentStats?.unpaidCount || 0);

  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden rounded-3xl border border-white/10 shadow-2xl my-2 p-6 sm:p-10">
      {/* Mesh Background Gradients */}
      <div className="absolute top-0 right-10 w-96 h-96 bg-purple-500/15 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-indigo-500/15 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10 space-y-10">

        {/* Welcome Header Banner */}
        <div className="bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 rounded-3xl p-8 sm:p-10 shadow-2xl border border-white/15 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/15 border border-purple-400/30 text-purple-300 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>Admin System Control</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white">
              System Admin Dashboard
            </h1>
            <p className="text-slate-300 text-sm sm:text-base">
              Monitor total doctors, patient registrations, booking distribution, and revenue analytics.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate("/admin/add-doctor")}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold px-6 py-3.5 rounded-2xl shadow-lg shadow-purple-500/25 transition-all flex items-center gap-2 text-sm cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add New Doctor</span>
            </button>
            <button
              onClick={() => navigate("/admin/doctors")}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-5 py-3.5 rounded-2xl transition-all border border-white/10 text-sm cursor-pointer"
            >
              <span>Manage Doctors</span>
            </button>
          </div>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Total Doctors */}
          <div className="bg-slate-900/90 backdrop-blur-2xl rounded-3xl p-6 shadow-2xl border border-white/15 hover:border-purple-500/40 transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Doctors</p>
                <h3 className="text-3xl font-extrabold text-purple-400 mt-2">
                  {(dashboardData.totalDoctors || 0).toLocaleString()}
                </h3>
              </div>
              <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center text-purple-400 border border-purple-400/20 group-hover:scale-110 transition-transform">
                <UserCheck className="w-6 h-6" />
              </div>
            </div>
            <p className="text-[11px] text-purple-300/80 mt-3 font-medium">Verified medical practitioners</p>
          </div>

          {/* Total Patients */}
          <div className="bg-slate-900/90 backdrop-blur-2xl rounded-3xl p-6 shadow-2xl border border-white/15 hover:border-blue-500/40 transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Patients</p>
                <h3 className="text-3xl font-extrabold text-cyan-400 mt-2">
                  {(dashboardData.totalPatients || 0).toLocaleString()}
                </h3>
              </div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center text-cyan-400 border border-blue-400/20 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6" />
              </div>
            </div>
            <p className="text-[11px] text-cyan-300/80 mt-3 font-medium">Registered patient accounts</p>
          </div>

          {/* Total Appointments */}
          <div className="bg-slate-900/90 backdrop-blur-2xl rounded-3xl p-6 shadow-2xl border border-white/15 hover:border-emerald-500/40 transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Bookings</p>
                <h3 className="text-3xl font-extrabold text-emerald-400 mt-2">
                  {(dashboardData.totalAppointments || 0).toLocaleString()}
                </h3>
              </div>
              <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-400 border border-emerald-400/20 group-hover:scale-110 transition-transform">
                <Calendar className="w-6 h-6" />
              </div>
            </div>
            <p className="text-[11px] text-emerald-300/80 mt-3 font-medium">Platform-wide consultations</p>
          </div>

          {/* Total Revenue */}
          <div className="bg-slate-900/90 backdrop-blur-2xl rounded-3xl p-6 shadow-2xl border border-white/15 hover:border-amber-500/40 transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Platform Revenue</p>
                <h3 className="text-3xl font-extrabold text-amber-400 mt-2">
                  ₹{(dashboardData.paymentStats?.paid || 0).toLocaleString()}
                </h3>
              </div>
              <div className="w-12 h-12 bg-amber-500/20 rounded-2xl flex items-center justify-center text-amber-400 border border-amber-400/20 group-hover:scale-110 transition-transform">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>
            <p className="text-[11px] text-amber-300/80 mt-3 font-medium">Collected consultations</p>
          </div>

        </div>

        {/* Appointment Status Breakdown & Payment Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Appointment Distribution */}
          <div className="bg-slate-900/90 backdrop-blur-2xl rounded-3xl p-8 shadow-2xl border border-white/15 space-y-6">
            <h2 className="text-xl font-extrabold text-white flex items-center gap-2 border-b border-white/10 pb-4">
              <Activity className="w-5 h-5 text-purple-400" />
              <span>Appointment Distribution</span>
            </h2>

            <div className="space-y-4">
              {/* Pending */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-amber-950/40 border border-amber-500/30">
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-amber-400" />
                  <div>
                    <p className="font-bold text-white text-sm">Pending Confirmation</p>
                    <p className="text-xs text-slate-400">Awaiting doctor review</p>
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
              <div className="flex items-center justify-between p-4 rounded-2xl bg-blue-950/40 border border-blue-500/30">
                <div className="flex items-center space-x-3">
                  <AlertCircle className="h-5 w-5 text-cyan-400" />
                  <div>
                    <p className="font-bold text-white text-sm">Confirmed Bookings</p>
                    <p className="text-xs text-slate-400">Approved consultations</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-extrabold text-cyan-400">
                    {dashboardData.appointmentsByStatus?.confirmed || 0}
                  </p>
                  <p className="text-[10px] text-slate-400 font-semibold">
                    {getPercentage(dashboardData.appointmentsByStatus?.confirmed || 0, appointmentTotal)}%
                  </p>
                </div>
              </div>

              {/* Completed */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30">
                <div className="flex items-center space-x-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  <div>
                    <p className="font-bold text-white text-sm">Completed Consultations</p>
                    <p className="text-xs text-slate-400">Finished care visits</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-extrabold text-emerald-400">
                    {dashboardData.appointmentsByStatus?.completed || 0}
                  </p>
                  <p className="text-[10px] text-slate-400 font-semibold">
                    {getPercentage(dashboardData.appointmentsByStatus?.completed || 0, appointmentTotal)}%
                  </p>
                </div>
              </div>

              {/* Cancelled */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-rose-950/40 border border-rose-500/30">
                <div className="flex items-center space-x-3">
                  <XCircle className="h-5 w-5 text-rose-400" />
                  <div>
                    <p className="font-bold text-white text-sm">Cancelled & Expired</p>
                    <p className="text-xs text-slate-400">Cancelled or auto-expired</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-extrabold text-rose-400">
                    {dashboardData.appointmentsByStatus?.cancelled || 0}
                  </p>
                  <p className="text-[10px] text-slate-400 font-semibold">
                    {getPercentage(dashboardData.appointmentsByStatus?.cancelled || 0, appointmentTotal)}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Analytics */}
          <div className="bg-slate-900/90 backdrop-blur-2xl rounded-3xl p-8 shadow-2xl border border-white/15 space-y-6">
            <h2 className="text-xl font-extrabold text-white flex items-center gap-2 border-b border-white/10 pb-4">
              <DollarSign className="w-5 h-5 text-amber-400" />
              <span>Financial Analytics</span>
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-emerald-950/40 border border-emerald-500/30 p-4 rounded-2xl text-center">
                <div className="text-2xl font-extrabold text-emerald-400 mb-1">
                  {dashboardData.paymentStats?.paidCount || 0}
                </div>
                <div className="text-xs text-slate-300 font-medium">Paid Transactions</div>
                <div className="text-[10px] text-emerald-400 font-bold mt-1">
                  {getPercentage(dashboardData.paymentStats?.paidCount || 0, paymentTotal)}%
                </div>
              </div>

              <div className="bg-rose-950/40 border border-rose-500/30 p-4 rounded-2xl text-center">
                <div className="text-2xl font-extrabold text-rose-400 mb-1">
                  {dashboardData.paymentStats?.unpaidCount || 0}
                </div>
                <div className="text-xs text-slate-300 font-medium">Unpaid Dues</div>
                <div className="text-[10px] text-rose-400 font-bold mt-1">
                  {getPercentage(dashboardData.paymentStats?.unpaidCount || 0, paymentTotal)}%
                </div>
              </div>
            </div>

            {/* Collection Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-300 font-semibold">
                <span>Payment Collection Rate</span>
                <span>{getPercentage(dashboardData.paymentStats?.paidCount || 0, paymentTotal)}%</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-3 border border-white/10 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-emerald-500 to-teal-400 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${getPercentage(dashboardData.paymentStats?.paidCount || 0, paymentTotal)}%` }}
                ></div>
              </div>
            </div>

            {/* Summary */}
            <div className="pt-4 border-t border-white/10 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Total Revenue Collected:</span>
                <span className="text-sm font-extrabold text-emerald-400">
                  ₹{(dashboardData.paymentStats?.paid || 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Pending Dues:</span>
                <span className="text-sm font-extrabold text-rose-400">
                  ₹{(dashboardData.paymentStats?.unpaid || 0).toLocaleString()}
                </span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default AdminHome;