import React, { useState, useContext, useEffect } from 'react';
import { Eye, X, Calendar, Clock, Phone, Mail, User, FileText, CreditCard, Search, Filter, Sparkles, CheckCircle2, XCircle } from 'lucide-react';
import axios from "axios";
import { appContext } from "../../context/AppContext";

const ManageAppointments = () => {
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const { token } = useContext(appContext);
  
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [filters, setFilters] = useState({
    patientName: '',
    doctorName: '',
    status: '',
    paymentStatus: '',
    dateFrom: '',
    dateTo: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const getAppointments = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/admin/getAppointments`, {
          headers: { token }
        });
        if (response.data.success) {
          setAppointments(response.data.appointments);
        } else {
          console.error('Failed to load appointments');
        }
      } catch (error) {
        console.error('Error fetching appointments:', error);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      getAppointments();
    }
  }, [token]);

  const filteredAppointments = appointments.filter(appointment => {
    const matchesPatientName = !filters.patientName || 
      (appointment.patient?.name || '').toLowerCase().includes(filters.patientName.toLowerCase());
    
    const matchesDoctorName = !filters.doctorName || 
      (appointment.doctor?.name || '').toLowerCase().includes(filters.doctorName.toLowerCase());
    
    const matchesStatus = !filters.status || appointment.status === filters.status;
    
    const matchesPaymentStatus = !filters.paymentStatus || 
      appointment.paymentStatus === filters.paymentStatus;
    
    const matchesDateFrom = !filters.dateFrom || 
      new Date(appointment.date) >= new Date(filters.dateFrom);
    
    const matchesDateTo = !filters.dateTo || 
      new Date(appointment.date) <= new Date(filters.dateTo);
    
    return matchesPatientName && matchesDoctorName && matchesStatus && 
           matchesPaymentStatus && matchesDateFrom && matchesDateTo;
  });

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      patientName: '',
      doctorName: '',
      status: '',
      paymentStatus: '',
      dateFrom: '',
      dateTo: ''
    });
  };

  const getStatusBadge = (status) => {
    switch ((status || '').toLowerCase()) {
      case 'confirmed': return 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30';
      case 'completed': return 'bg-blue-950/80 text-cyan-300 border border-blue-500/30';
      case 'cancelled': return 'bg-rose-950/80 text-rose-300 border border-rose-500/30';
      case 'expired': return 'bg-slate-800 text-slate-400 border border-white/10';
      default: return 'bg-amber-950/80 text-amber-300 border border-amber-500/30';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-300 font-medium">Fetching platform appointments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden rounded-3xl border border-white/10 shadow-2xl my-2 p-6 sm:p-10">
      {/* Background Mesh Gradients */}
      <div className="absolute top-0 left-10 w-96 h-96 bg-purple-500/15 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-500/15 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10 space-y-8">

        {/* Page Title */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-400/30 text-purple-300 text-xs font-semibold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Platform Appointment Registry</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Manage Appointments
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              View and filter all patient consultations across all registered doctors.
            </p>
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="bg-purple-600 hover:bg-purple-500 text-white px-5 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-md shadow-purple-500/20 flex items-center gap-2 cursor-pointer w-fit"
          >
            <Filter className="w-4 h-4" />
            <span>{showFilters ? 'Hide Filters' : 'Toggle Filters'}</span>
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="bg-slate-900/90 backdrop-blur-2xl p-6 rounded-3xl border border-white/15 shadow-2xl space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Patient</label>
                <input
                  type="text"
                  placeholder="Patient name..."
                  value={filters.patientName}
                  onChange={(e) => handleFilterChange('patientName', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950/80 border border-white/15 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Doctor</label>
                <input
                  type="text"
                  placeholder="Doctor name..."
                  value={filters.doctorName}
                  onChange={(e) => handleFilterChange('doctorName', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950/80 border border-white/15 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950/80 border border-white/15 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-purple-400"
                >
                  <option value="" className="bg-slate-900 text-white">All Status</option>
                  <option value="confirmed" className="bg-slate-900 text-white">Confirmed</option>
                  <option value="completed" className="bg-slate-900 text-white">Completed</option>
                  <option value="cancelled" className="bg-slate-900 text-white">Cancelled</option>
                  <option value="pending" className="bg-slate-900 text-white">Pending</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Payment</label>
                <select
                  value={filters.paymentStatus}
                  onChange={(e) => handleFilterChange('paymentStatus', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950/80 border border-white/15 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-purple-400"
                >
                  <option value="" className="bg-slate-900 text-white">All Payments</option>
                  <option value="Paid" className="bg-slate-900 text-white">Paid</option>
                  <option value="Pending" className="bg-slate-900 text-white">Pending</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Date From</label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950/80 border border-white/15 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Date To</label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950/80 border border-white/15 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>

            </div>

            <div className="flex justify-end">
              <button
                onClick={clearFilters}
                className="text-xs text-slate-400 hover:text-white font-semibold underline cursor-pointer"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        )}

        {/* Appointments Table Card */}
        <div className="bg-slate-900/90 backdrop-blur-2xl rounded-3xl border border-white/15 shadow-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 font-bold uppercase tracking-wider border-b border-white/10">
                <tr>
                  <th className="px-6 py-4">Patient</th>
                  <th className="px-6 py-4">Doctor</th>
                  <th className="px-6 py-4">Date & Time</th>
                  <th className="px-6 py-4">Fee</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Payment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredAppointments.length > 0 ? (
                  filteredAppointments.map((apt) => (
                    <tr key={apt.id} className="hover:bg-white/5 transition-colors">
                      
                      {/* Patient */}
                      <td className="px-6 py-4 font-bold text-white">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center font-extrabold text-xs">
                            {apt.patient?.name ? apt.patient.name.charAt(0) : 'P'}
                          </div>
                          <div>
                            <p className="text-white text-xs font-bold">{apt.patient?.name || 'Patient'}</p>
                            <p className="text-[10px] text-slate-400">{apt.patient?.email || ''}</p>
                          </div>
                        </div>
                      </td>

                      {/* Doctor */}
                      <td className="px-6 py-4 font-semibold text-slate-200">
                        Dr. {apt.doctor?.name || 'Doctor'}
                      </td>

                      {/* Date & Time */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-white">{new Date(apt.date).toLocaleDateString()}</span>
                          <span className="text-[10px] text-slate-400">{apt.time}</span>
                        </div>
                      </td>

                      {/* Fee */}
                      <td className="px-6 py-4 font-extrabold text-emerald-400">
                        ₹{apt.doctor?.consultation_fee || 500}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${getStatusBadge(apt.status)}`}>
                          {apt.status}
                        </span>
                      </td>

                      {/* Payment */}
                      <td className="px-6 py-4">
                        <span className={`text-[10px] font-bold ${
                          apt.paymentStatus === 'Paid' || apt.paymentStatus === true ? 'text-emerald-400' : 'text-amber-400'
                        }`}>
                          {apt.paymentStatus === 'Paid' || apt.paymentStatus === true ? '✓ Paid' : '⏳ Pending'}
                        </span>
                      </td>

                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                      No appointments match the selected filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ManageAppointments;