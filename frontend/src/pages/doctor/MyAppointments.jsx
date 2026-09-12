import React, { useContext, useEffect, useState } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Phone, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  ChevronDown, 
  ChevronUp, 
  DollarSign, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  MessageSquare
} from 'lucide-react';
import { appContext } from '../../context/AppContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import VideoRoom from '../../components/VideoRoom.jsx';
import PrescriptionForm from '../../components/PrescriptionForm.jsx';
import ChatDrawer from '../../components/ChatDrawer.jsx';

const calculateAge = dob => {
  if (!dob) return null;
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

const transformAppointment = raw => ({
  id: raw.id,
  date: new Date(raw.date).toLocaleDateString('en-CA'),
  time: raw.time,
  reasonForVisit: raw.reasonforvisit,
  status: raw.status,
  paymentStatus: raw.paymentstatus,
  consultancyFee: 500,
  meetingType: raw.meeting_type,
  patient: {
    id: raw.patient_id,
    user_id: raw.patient_user_id,
    name: raw.name,
    image: raw.image,
    phone: raw.phone,
    email: raw.email,
    age: calculateAge(raw.date_of_birth),
    gender: raw.gender
  }
});

const isAppointmentActive = (date, time) => {
  const now = new Date();
  const appointmentDate = new Date(date);
  const [hours, minutes] = time.split(':');
  
  const appointmentStart = new Date(appointmentDate);
  appointmentStart.setHours(parseInt(hours), parseInt(minutes), 0, 0);
  
  const appointmentEnd = new Date(appointmentStart);
  appointmentEnd.setHours(appointmentEnd.getHours() + 1);
  
  return now >= appointmentStart && now <= appointmentEnd;
};

const shouldAutoComplete = (date, time) => {
  const now = new Date();
  const appointmentDate = new Date(date);
  const [hours, minutes] = time.split(':');
  
  const appointmentStart = new Date(appointmentDate);
  appointmentStart.setHours(parseInt(hours), parseInt(minutes), 0, 0);
  
  const appointmentEnd = new Date(appointmentStart);
  appointmentEnd.setHours(appointmentEnd.getHours() + 1);
  
  return now > appointmentEnd;
};

const DoctorAppointments = () => {
  const { userData: doctorData } = useContext(appContext);
  const [appointmentData, setAppointmentData] = useState({
    pending: [],
    confirmed: [],
    completed: [],
    cancelled: [],
    expired: []
  });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [expandedAppointment, setExpandedAppointment] = useState(null);
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'confirmed' | 'completed' | 'cancelled'
  const [activeVideoCall, setActiveVideoCall] = useState(null);
  const [activePrescriptionForm, setActivePrescriptionForm] = useState(null);
  const [activeChat, setActiveChat] = useState(null);
  
  useEffect(() => {
    const checkAutoComplete = () => {
      let hasChanges = false;
      const updatedData = { ...appointmentData };
      
      updatedData.confirmed = appointmentData.confirmed.filter(appointment => {
        if (shouldAutoComplete(appointment.date, appointment.time)) {
          hasChanges = true;
          handleCompleteAppointment(appointment.id, true);
          return false;
        }
        return true;
      });
      
      if (hasChanges) {
        setAppointmentData(updatedData);
      }
    };
    
    const interval = setInterval(checkAutoComplete, 60000);
    checkAutoComplete();
    
    return () => clearInterval(interval);
  }, [appointmentData.confirmed]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/doctor/getAppointments`, {
        doctorId: doctorData.id
      });

      if (data.success === 'true' || data.success === true) {
        const grouped = {
          pending: [],
          confirmed: [],
          completed: [],
          cancelled: [],
          expired: []
        };

        data.appointments.forEach(apt => {
          const transformed = transformAppointment(apt);
          const status = apt.status.toLowerCase();
          if (status === 'cancelled' || status === 'expired') {
            grouped.cancelled.push(transformed);
          } else if (grouped[status]) {
            grouped[status].push(transformed);
          }
        });

        setAppointmentData(grouped);
      }
    } catch (err) {
      console.error('Error fetching appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (doctorData?.id) {
      fetchAppointments();
    }
  }, [doctorData?.id]);

  const handleConfirmAppointment = async (appointmentId) => {
    const confirmAction = window.confirm("Are you sure you want to confirm this appointment?");
    if (!confirmAction) return;

    try {
      setActionLoading(true);
      
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/doctor/confirmAppointment`, {
        id: appointmentId
      });

      if (data.success) {
        const appointmentToMove = appointmentData.pending.find(apt => apt.id === appointmentId);
        if (appointmentToMove) {
          const updatedAppointment = { ...appointmentToMove, status: 'confirmed' };
          
          setAppointmentData(prev => ({
            ...prev,
            pending: prev.pending.filter(apt => apt.id !== appointmentId),
            confirmed: [...prev.confirmed, updatedAppointment]
          }));
        }
        
        toast.success("Appointment confirmed successfully!");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error confirming appointment:", error);
      toast.error("Error confirming appointment. Please try again later.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteAppointment = async (appointmentId, isAutoComplete = false) => {
    if (!isAutoComplete) {
      const confirmAction = window.confirm("Are you sure you want to mark this appointment as completed?");
      if (!confirmAction) return;
    }

    try {
      if (!isAutoComplete) setActionLoading(true);
      
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/doctor/completeAppointment`, {
        id: appointmentId
      });
      
      if (data.success) {
        const appointmentToMove = appointmentData.confirmed.find(apt => apt.id === appointmentId);
        if (appointmentToMove) {
          const completedAppointment = { ...appointmentToMove, status: 'completed' };
          
          setAppointmentData(prev => ({
            ...prev,
            confirmed: prev.confirmed.filter(apt => apt.id !== appointmentId),
            completed: [...prev.completed, completedAppointment]
          }));
        }
        
        if (!isAutoComplete) {
          toast.success("Appointment marked as completed!");
        }
      } else {
        if (!isAutoComplete) {
          toast.error(data.message);
        }
      }
    } catch (error) {
      console.error("Error completing appointment:", error);
      if (!isAutoComplete) {
        toast.error("Error completing appointment. Please try again later.");
      }
    } finally {
      if (!isAutoComplete) setActionLoading(false);
    }
  };

  const handleCancelAppointment = async (appointment) => {
    const confirmCancel = window.confirm(
      `Are you sure you want to cancel the appointment with ${appointment.patient.name} on ${formatDate(appointment.date)} at ${formatTime(appointment.time)}?`
    );
    
    if (!confirmCancel) return;

    try {
      setActionLoading(true);
      
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/doctor/cancelAppointment`, {
        id: appointment.id
      });

      if (data.success) {
        const cancelledAppointment = { ...appointment, status: 'cancelled' };
        let updatedData = { ...appointmentData };

        if (appointment.status === 'pending') {
          updatedData.pending = appointmentData.pending.filter(apt => apt.id !== appointment.id);
        } else if (appointment.status === 'confirmed') {
          updatedData.confirmed = appointmentData.confirmed.filter(apt => apt.id !== appointment.id);
        }
        
        updatedData.cancelled = [...appointmentData.cancelled, cancelledAppointment];
        
        setAppointmentData(updatedData);
        toast.success("Appointment cancelled successfully!");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      toast.error("Failed to cancel appointment");
    } fontally: {
      setActionLoading(false);
    }
  };

  const handleMarkPaid = async (appointmentId) => {
    const confirmAction = window.confirm("Confirm that offline payment (Cash/UPI) was received for this appointment?");
    if (!confirmAction) return;

    try {
      setActionLoading(true);
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/doctor/markPaid`, {
        id: appointmentId
      });

      if (data.success) {
        toast.success("Payment marked as received!");
        setAppointmentData(prev => {
          const updateList = list => list.map(apt => apt.id === appointmentId ? { ...apt, paymentStatus: true } : apt);
          return {
            pending: updateList(prev.pending),
            confirmed: updateList(prev.confirmed),
            completed: updateList(prev.completed),
            cancelled: updateList(prev.cancelled)
          };
        });
      } else {
        toast.error(data.message || "Failed to update payment");
      }
    } catch (error) {
      console.error("Error marking payment paid:", error);
      toast.error("Failed to update payment status");
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getStatusBadge = (status) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30';
      case 'pending':
        return 'bg-amber-950/80 text-amber-300 border border-amber-500/30';
      case 'completed':
        return 'bg-blue-950/80 text-cyan-300 border border-blue-500/30';
      case 'cancelled':
        return 'bg-rose-950/80 text-rose-300 border border-rose-500/30';
      case 'expired':
        return 'bg-slate-800 text-slate-400 border border-white/10';
      default:
        return 'bg-slate-800 text-slate-300 border border-white/10';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-300 font-medium">Fetching patient appointments...</p>
        </div>
      </div>
    );
  }

  const currentTabList = activeTab === 'pending' 
    ? appointmentData.pending 
    : activeTab === 'confirmed' 
    ? appointmentData.confirmed 
    : activeTab === 'completed' 
    ? appointmentData.completed 
    : appointmentData.cancelled;

  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden rounded-3xl border border-white/10 shadow-2xl my-2 p-6 sm:p-10">
      {/* Background Gradients */}
      <div className="absolute top-0 left-10 w-96 h-96 bg-emerald-500/15 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-teal-500/15 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-6xl mx-auto relative z-10">

        {/* Page Title Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-400/30 text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Doctor Practice Suite</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Patient Consultations
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Review pending requests, manage active consultations, and confirm offline cash payments.
            </p>
          </div>
        </div>

        {/* Tab Navigation Switcher Bar */}
        <div className="bg-slate-900/90 backdrop-blur-2xl p-1.5 rounded-2xl flex flex-wrap sm:flex-nowrap items-center mb-8 gap-1 border border-white/15">
          
          {/* Pending */}
          <button
            onClick={() => setActiveTab('pending')}
            className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'pending'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Pending Action</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${
              activeTab === 'pending' ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-300'
            }`}>
              {appointmentData.pending.length}
            </span>
          </button>

          {/* Confirmed */}
          <button
            onClick={() => setActiveTab('confirmed')}
            className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'confirmed'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Confirmed</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${
              activeTab === 'confirmed' ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-300'
            }`}>
              {appointmentData.confirmed.length}
            </span>
          </button>

          {/* Completed */}
          <button
            onClick={() => setActiveTab('completed')}
            className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'completed'
                ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Completed</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${
              activeTab === 'completed' ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-300'
            }`}>
              {appointmentData.completed.length}
            </span>
          </button>

          {/* Cancelled & Expired */}
          <button
            onClick={() => setActiveTab('cancelled')}
            className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'cancelled'
                ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Cancelled & Expired</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${
              activeTab === 'cancelled' ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-300'
            }`}>
              {appointmentData.cancelled.length}
            </span>
          </button>

        </div>

        {/* Appointments List */}
        <div className="space-y-4 mb-16">
          {currentTabList.length > 0 ? (
            currentTabList.map((appointment) => {
              const isExpanded = expandedAppointment === appointment.id;
              const isCancelledOrExpired = appointment.status === 'cancelled' || appointment.status === 'expired';
              const isActiveNow = appointment.status === 'confirmed' && isAppointmentActive(appointment.date, appointment.time);

              return (
                <div
                  key={appointment.id}
                  className={`bg-slate-900/90 rounded-3xl p-6 shadow-2xl border border-white/15 hover:border-emerald-400/40 transition-all duration-300 ${
                    isCancelledOrExpired ? 'opacity-75' : ''
                  } ${isActiveNow ? 'ring-2 ring-emerald-400 ring-offset-2 ring-offset-slate-950' : ''}`}
                >
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    
                    {/* Patient Photo & Info */}
                    <div className="flex items-center space-x-5 flex-1">
                      <img
                        src={appointment.patient.image || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=200&fit=crop'}
                        alt={appointment.patient.name}
                        className="w-20 h-24 rounded-2xl object-cover border border-white/15 flex-shrink-0 shadow-md bg-slate-950"
                      />

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${getStatusBadge(appointment.status)}`}>
                            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                          </span>
                          {isActiveNow && (
                            <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-2.5 py-0.5 rounded-full font-extrabold uppercase animate-pulse border border-emerald-400/40">
                              Active Now
                            </span>
                          )}
                        </div>

                        <h3 className="text-lg font-extrabold text-white">
                          {appointment.patient.name}
                        </h3>

                        <p className="text-xs text-slate-400">
                          {appointment.patient.age && `Age: ${appointment.patient.age}`}
                          {appointment.patient.gender && ` • Gender: ${appointment.patient.gender}`}
                        </p>

                        <div className="flex flex-wrap items-center text-xs text-slate-400 gap-4 pt-1">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                            <span>{formatDate(appointment.date)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-emerald-400" />
                            <span>{formatTime(appointment.time)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Side: Payment & Action Buttons */}
                    <div className="flex flex-col items-end justify-between w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-white/10 gap-3">
                      
                      {/* Payment Status & Mark Paid (Cash) */}
                      {!isCancelledOrExpired && (
                        <div className="flex items-center gap-2">
                          <div className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                            appointment.paymentStatus 
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}>
                            {appointment.paymentStatus ? '✓ Paid' : '⏳ Payment Pending'}
                          </div>

                          {!appointment.paymentStatus && (appointment.status === 'confirmed' || appointment.status === 'completed') && (
                            <button
                              onClick={() => handleMarkPaid(appointment.id)}
                              disabled={actionLoading}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-md shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-50"
                              title="Mark offline cash or UPI payment as received"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Mark Paid (Cash)</span>
                            </button>
                          )}
                        </div>
                      )}

                      {/* Doctor Action Buttons */}
                      {!isCancelledOrExpired && (
                        <div className="flex items-center gap-2 flex-wrap justify-end">
                          
                          {/* Confirm */}
                          {appointment.status === 'pending' && (
                            <button
                              onClick={() => handleConfirmAppointment(appointment.id)}
                              disabled={actionLoading}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md shadow-emerald-500/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Confirm Booking</span>
                            </button>
                          )}

                          {/* Video Room Join Button */}
                          {appointment.status === 'confirmed' && appointment.meetingType === 'online' && (
                            <button
                              onClick={() => setActiveVideoCall(appointment.id.toString())}
                              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md shadow-purple-500/25 transition-all flex items-center gap-1.5 cursor-pointer animate-pulse"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                              <span>Join Video Call</span>
                            </button>
                          )}

                          {/* Chat Button */}
                          {appointment.status === 'confirmed' && (
                            <button
                              onClick={() => setActiveChat(appointment)}
                              className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md shadow-indigo-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>Chat</span>
                            </button>
                          )}

                          {/* Mark Complete */}
                          {appointment.status === 'confirmed' && isActiveNow && (
                            <button
                              onClick={() => setActivePrescriptionForm(appointment.id.toString())}
                              disabled={actionLoading}
                              className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Mark Complete</span>
                            </button>
                          )}

                          {/* Cancel */}
                          {appointment.status !== 'completed' && (
                            <button
                              onClick={() => handleCancelAppointment(appointment)}
                              disabled={actionLoading}
                              className="bg-rose-950/80 hover:bg-rose-900/80 text-rose-300 text-xs font-bold px-3 py-2 rounded-xl border border-rose-500/30 transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Cancel</span>
                            </button>
                          )}

                          {/* Dropdown Toggle */}
                          <button
                            onClick={() => setExpandedAppointment(isExpanded ? null : appointment.id)}
                            className="p-2 text-slate-400 hover:bg-slate-800 rounded-xl border border-white/10 transition-colors cursor-pointer"
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>

                        </div>
                      )}

                    </div>
                  </div>

                  {/* Expandable Patient Details Box */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-white/10 space-y-2 text-xs text-slate-300 bg-slate-950/60 p-4 rounded-2xl border border-white/5">
                      <div>
                        <span className="font-bold text-white">Reason for Visit: </span>
                        <span>{appointment.reasonForVisit || 'Routine Checkup'}</span>
                      </div>
                      {appointment.patient.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>Phone: {appointment.patient.phone}</span>
                        </div>
                      )}
                      {appointment.patient.email && (
                        <div className="flex items-center gap-2">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span>Email: {appointment.patient.email}</span>
                        </div>
                      )}
                    </div>
                  )}

                </div>
              );
            })
          ) : (
            <div className="bg-slate-900/90 rounded-3xl shadow-2xl border border-white/15 p-12 text-center">
              <Calendar className="w-12 h-12 text-slate-500 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-white mb-1">
                No {activeTab} appointments
              </h3>
              <p className="text-slate-400 text-xs">
                {activeTab === 'pending'
                  ? 'No patient appointment requests awaiting confirmation.'
                  : activeTab === 'confirmed'
                  ? 'No confirmed active patient appointments.'
                  : activeTab === 'completed'
                  ? 'Your completed consultation history will show up here.'
                  : 'No cancelled or expired appointment records.'}
              </p>
            </div>
          )}
        </div>

      </div>

      {activeVideoCall && (
        <VideoRoom
          channelName={`appointment_${activeVideoCall}`}
          appointmentId={activeVideoCall}
          senderId={doctorData.user_id}
          receiverId={appointmentData.confirmed.find(apt => apt.id.toString() === activeVideoCall.toString())?.patient.user_id}
          receiverName={appointmentData.confirmed.find(apt => apt.id.toString() === activeVideoCall.toString())?.patient.name}
          onLeave={() => {
            const finishedCallId = activeVideoCall;
            setActiveVideoCall(null);
            setActivePrescriptionForm(finishedCallId);
          }}
        />
      )}

      {activePrescriptionForm && (
        <PrescriptionForm
          appointmentId={activePrescriptionForm}
          onClose={() => setActivePrescriptionForm(null)}
          onSuccess={() => {
            setActivePrescriptionForm(null);
            fetchAppointments();
          }}
        />
      )}

      {activeChat && (
        <ChatDrawer
          isOpen={!!activeChat}
          onClose={() => setActiveChat(null)}
          appointmentId={activeChat.id}
          senderId={doctorData.user_id}
          receiverId={activeChat.patient.user_id}
          receiverName={activeChat.patient.name}
        />
      )}
    </div>
  );
};

export default DoctorAppointments;