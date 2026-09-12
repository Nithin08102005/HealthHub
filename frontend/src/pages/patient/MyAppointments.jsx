import React, { useContext, useEffect, useState } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  CreditCard, 
  X, 
  Phone, 
  ChevronDown, 
  ChevronUp, 
  Loader2,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Stethoscope,
  Sparkles,
  ShieldCheck,
  FileText,
  MessageSquare
} from 'lucide-react';
import axios from 'axios';
import { appContext } from '../../context/AppContext';
import toast from 'react-hot-toast';
import VideoRoom from '../../components/VideoRoom.jsx';
import ChatDrawer from '../../components/ChatDrawer.jsx';

const key = import.meta.env.VITE_RAZORPAY_KEY_ID;

const MyAppointments = () => {
  const { token, userData } = useContext(appContext);
  const [appointmentData, setAppointmentData] = useState({
    upcoming: [],
    past: [],
    cancelled: []
  });
  const [loading, setLoading] = useState(true);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [expandedAppointment, setExpandedAppointment] = useState(null);
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming' | 'past' | 'cancelled'
  const [activeVideoCall, setActiveVideoCall] = useState(null);
  const [activeChat, setActiveChat] = useState(null);

  useEffect(() => {
    async function getAppointments() {
      try {
        setLoading(true);
        const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/patient/getAppointments`, {
          patientId: userData.id
        });
        
        if (data.success) {
          const appointments = data.appointments;
          
          const transformedAppointments = appointments.map(appointment => ({
            id: appointment.appointment_id,
            date: appointment.appointment_date,
            time: appointment.appointment_time,
            reasonForVisit: appointment.reason,
            status: appointment.status,
            payment_status: appointment.payment_status,
            consultancyFee: parseFloat(appointment.consultation_fee),
            meetingType: appointment.meeting_type,
            doctor: {
              id: appointment.doctor_id,
              user_id: appointment.doctor_user_id,
              name: appointment.doctor_name,
              specialization: appointment.specialization,
              image: appointment.image,
              address: appointment.address,
              phone: appointment.phone
            }
          }));

          const currentDate = new Date();
          
          const getAppointmentDateTime = (dateStr, timeStr) => {
            if (!dateStr) return new Date(0);
            const d = new Date(dateStr);
            if (!timeStr) return d;
            const [hours, minutes] = timeStr.split(':').map(Number);
            d.setHours(hours || 0, minutes || 0, 0, 0);
            return d;
          };

          const cancelled = transformedAppointments.filter(apt => apt.status === 'cancelled' || apt.status === 'expired');
          const activeAppointments = transformedAppointments.filter(apt => apt.status !== 'cancelled' && apt.status !== 'expired');
          
          const upcoming = activeAppointments.filter(apt => {
            const appointmentDateTime = getAppointmentDateTime(apt.date, apt.time);
            return appointmentDateTime >= currentDate;
          });
          
          const past = activeAppointments.filter(apt => {
            const appointmentDateTime = getAppointmentDateTime(apt.date, apt.time);
            return appointmentDateTime < currentDate;
          });

          setAppointmentData({ upcoming, past, cancelled });
        }
      } catch (error) {
        console.error("Error fetching appointments:", error);
      } finally {
        setLoading(false);
      }
    }
    
    if (userData?.id) {
      getAppointments();
    }
  }, [userData?.id]);

  const handlePayment = async (appointmentId, consultancyFee) => {
    try {
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/payments/create-order`, {
        amount: consultancyFee
      });

      if (!data.success) {
        throw new Error("Order creation failed");
      }

      const { id: razorpayOrderId, amount } = data.order;

      const options = {
        key,
        amount,
        currency: "INR",
        name: "HealthHub",
        order_id: razorpayOrderId,
        handler: async function () {
          try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/patient/makepayment`, {
              appointmentId,
              consultancyFee
            });
            if(response.data.success) {
              const updatedUpcoming = appointmentData.upcoming.map(apt => {
                if (apt.id === appointmentId) {
                  return { ...apt, payment_status: true };
                }
                return apt;
              });

              setAppointmentData(prev => ({
                ...prev,
                upcoming: updatedUpcoming
              }));
              toast.success("Payment completed successfully!");
            } else {
              toast.error("Payment registration failed");
            }
          } catch (err) {
            console.error("makePayment failed:", err);
            toast.error("Error verifying payment");
          }
        },
        prefill: {
          name: userData.name,
          email: userData.email,
          contact: userData.phone
        },
        theme: {
          color: "#2563EB"
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error) {
      console.error("handlePayment error:", error);
      toast.error("Something went wrong while initiating payment");
    }
  };

  const handleCancelAppointment = async (appointment) => {
    const confirmCancel = window.confirm(
      `Are you sure you want to cancel your appointment with Dr. ${appointment.doctor.name} on ${formatDate(appointment.date)} at ${formatTime(appointment.time)}?`
    );
    
    if (!confirmCancel) return;

    try {
      setCancelLoading(true);
      const response = await axios.put(`${import.meta.env.VITE_API_URL}/patient/cancelAppointment`, {
        appointmentId: appointment.id
      });
      
      if(response.data.success) {
        const updatedUpcoming = appointmentData.upcoming.filter(apt => apt.id !== appointment.id);
        const cancelledAppointment = { ...appointment, status: 'cancelled' };
        const updatedCancelled = [...appointmentData.cancelled, cancelledAppointment];
        
        setAppointmentData({
          ...appointmentData,
          upcoming: updatedUpcoming,
          cancelled: updatedCancelled
        });
        
        toast.success("Appointment cancelled successfully");
      }
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      toast.error("Failed to cancel appointment. Please try again.");
    } finally {
      setCancelLoading(false);
    }
  };

  const handleDownloadPrescription = async (appointmentId) => {
    try {
      const tokenVal = token || localStorage.getItem("token");
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/user/get-prescription`,
        { appointmentId },
        { headers: { token: tokenVal } }
      );
      if (response.data.success && response.data.data.pdf_url) {
        window.open(response.data.data.pdf_url, "_blank");
      } else {
        toast.error("Prescription file not found or still generating.");
      }
    } catch (error) {
      console.error("Error downloading prescription:", error);
      toast.error("Failed to load prescription.");
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
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

  const getStatusBadge = (status, paymentStatus) => {
    if (status === 'expired') {
      return (
        <span className="bg-slate-800 text-slate-400 border border-white/10 text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
          Expired
        </span>
      );
    }
    if (status === 'cancelled') {
      return (
        <span className="bg-rose-950/80 text-rose-300 border border-rose-500/30 text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
          Cancelled
        </span>
      );
    }
    if (status === 'completed') {
      return (
        <span className="bg-blue-950/80 text-cyan-300 border border-blue-500/30 text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
          Completed
        </span>
      );
    }
    if (status === 'confirmed') {
      return (
        <span className="bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Confirmed</span>
        </span>
      );
    }
    return (
      <span className="bg-amber-950/80 text-amber-300 border border-amber-500/30 text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
        Pending
      </span>
    );
  };

  const totalBookings = appointmentData.upcoming.length + appointmentData.past.length + appointmentData.cancelled.length;
  const totalPaidSum = [...appointmentData.upcoming, ...appointmentData.past]
    .filter(a => a.payment_status)
    .reduce((acc, curr) => acc + curr.consultancyFee, 0);

  const totalDueSum = appointmentData.upcoming
    .filter(a => !a.payment_status && (a.status === 'confirmed' || a.status === 'pending'))
    .reduce((acc, curr) => acc + curr.consultancyFee, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-300 font-medium">Fetching your appointments history...</p>
        </div>
      </div>
    );
  }

  const currentTabList = activeTab === 'upcoming' 
    ? appointmentData.upcoming 
    : activeTab === 'past' 
    ? appointmentData.past 
    : appointmentData.cancelled;

  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden rounded-3xl border border-white/10 shadow-2xl my-2 p-6 sm:p-10">
      {/* Background Gradients */}
      <div className="absolute top-0 left-10 w-96 h-96 bg-blue-500/15 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-500/15 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-6xl mx-auto relative z-10">

        {/* Page Title Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-xs font-semibold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Patient Appointments Hub</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              My Appointments
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Manage your active bookings, view consultation history, and settle outstanding dues online.
            </p>
          </div>
        </div>

        {/* Metric Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/15 flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Bookings</p>
              <h3 className="text-2xl font-extrabold text-white mt-1">{totalBookings}</h3>
            </div>
            <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center text-cyan-400 border border-blue-400/20">
              <Calendar className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/15 flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Paid Online</p>
              <h3 className="text-2xl font-extrabold text-emerald-400 mt-1">₹{totalPaidSum.toLocaleString()}</h3>
            </div>
            <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-400 border border-emerald-400/20">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/15 flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Unpaid Dues</p>
              <h3 className="text-2xl font-extrabold text-amber-400 mt-1">₹{totalDueSum.toLocaleString()}</h3>
            </div>
            <div className="w-12 h-12 bg-amber-500/20 rounded-2xl flex items-center justify-center text-amber-400 border border-amber-400/20">
              <CreditCard className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Tab Navigation Switcher */}
        <div className="bg-slate-900/90 backdrop-blur-2xl p-1.5 rounded-2xl flex items-center mb-8 gap-1 max-w-xl border border-white/15">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'upcoming'
                ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Upcoming</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${
              activeTab === 'upcoming' ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-300'
            }`}>
              {appointmentData.upcoming.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('past')}
            className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'past'
                ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Past History</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${
              activeTab === 'past' ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-300'
            }`}>
              {appointmentData.past.length}
            </span>
          </button>

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

        {/* Appointments List Container */}
        <div className="space-y-4 mb-16">
          {currentTabList.length > 0 ? (
            currentTabList.map((appointment) => {
              const isExpanded = expandedAppointment === appointment.id;
              const isCancelledOrExpired = appointment.status === 'cancelled' || appointment.status === 'expired';

              return (
                <div
                  key={appointment.id}
                  className={`bg-slate-900/90 rounded-3xl p-6 shadow-2xl border border-white/15 hover:border-cyan-400/40 transition-all duration-300 ${
                    isCancelledOrExpired ? 'opacity-75' : ''
                  }`}
                >
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    
                    {/* Doctor Info */}
                    <div className="flex items-center space-x-5 flex-1">
                      <img
                        src={appointment.doctor.image || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&h=200&fit=crop'}
                        alt={appointment.doctor.name}
                        className="w-20 h-24 rounded-2xl object-cover border border-white/15 flex-shrink-0 shadow-md bg-slate-950"
                      />

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-bold text-cyan-300 bg-cyan-500/15 border border-cyan-500/30 px-2.5 py-0.5 rounded-md">
                            {appointment.doctor.specialization}
                          </span>
                          {getStatusBadge(appointment.status, appointment.payment_status)}
                        </div>

                        <h3 className="text-lg font-extrabold text-white">
                          Dr. {appointment.doctor.name}
                        </h3>

                        <div className="flex flex-wrap items-center text-xs text-slate-400 gap-4 pt-1">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                            <span>{formatDate(appointment.date)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-cyan-400" />
                            <span>{formatTime(appointment.time)}</span>
                          </div>
                        </div>

                        {appointment.doctor.address && (
                          <div className="flex items-center gap-1 text-xs text-slate-400">
                            <MapPin className="w-3.5 h-3.5" />
                            <span>{appointment.doctor.address}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right Side: Fee & Action Buttons */}
                    <div className="flex flex-col items-end justify-between w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-white/10 gap-3">
                      
                      <div className="text-right">
                        <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Fee</div>
                        <div className="text-xl font-extrabold text-white">₹{appointment.consultancyFee}</div>
                        <div className={`text-[10px] font-bold uppercase mt-0.5 ${appointment.payment_status ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {appointment.payment_status ? '✓ Paid Online / Cash' : '⏳ Payment Pending'}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap justify-end">
                        
                        {/* Razorpay Pay Now button */}
                        {appointment.status === 'confirmed' && !appointment.payment_status && (
                          <button
                            onClick={() => handlePayment(appointment.id, appointment.consultancyFee)}
                            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md shadow-emerald-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>Pay Now Online</span>
                          </button>
                        )}

                        {/* Video Room Join Button */}
                        {appointment.status === 'confirmed' && appointment.meetingType === 'online' && (
                          <button
                            onClick={() => setActiveVideoCall(appointment.id.toString())}
                            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md shadow-purple-500/25 transition-all flex items-center gap-1.5 cursor-pointer animate-pulse"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                            <span>Join Video Call</span>
                          </button>
                        )}
                        
                        {/* Chat Button */}
                        {appointment.status === 'confirmed' && (
                          <button
                            onClick={() => setActiveChat(appointment)}
                            className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md shadow-indigo-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Chat</span>
                          </button>
                        )}

                         {/* Download Prescription Button */}
                         {appointment.status === 'completed' && (
                           <button
                             onClick={() => handleDownloadPrescription(appointment.id)}
                             className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md shadow-blue-500/25 transition-all flex items-center gap-1.5 cursor-pointer"
                           >
                             <FileText className="w-3.5 h-3.5" />
                             <span>Download Prescription</span>
                           </button>
                         )}
                        {/* Cancel Appointment Button */}
                        {appointment.status === 'pending' && (
                          <button
                            onClick={() => handleCancelAppointment(appointment)}
                            disabled={cancelLoading}
                            className="bg-rose-950/80 hover:bg-rose-900/80 text-rose-300 text-xs font-bold px-3.5 py-2 rounded-xl border border-rose-500/30 transition-colors flex items-center gap-1 disabled:opacity-50 cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Cancel Booking</span>
                          </button>
                        )}

                        {/* Toggle Details Dropdown */}
                        <button
                          onClick={() => setExpandedAppointment(isExpanded ? null : appointment.id)}
                          className="p-2 text-slate-400 hover:bg-slate-800 rounded-xl border border-white/10 transition-colors cursor-pointer"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>

                    </div>
                  </div>

                  {/* Expandable Details Box */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-white/10 space-y-2 text-xs text-slate-300 bg-slate-950/60 p-4 rounded-2xl border border-white/5">
                      <div>
                        <span className="font-bold text-white">Reason for Consultation: </span>
                        <span>{appointment.reasonForVisit || 'Routine Consultation'}</span>
                      </div>
                      {appointment.doctor.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>Clinic Helpline: {appointment.doctor.phone}</span>
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
                {activeTab === 'upcoming' 
                  ? 'You have no scheduled upcoming appointments at the moment.' 
                  : activeTab === 'past'
                  ? 'Your completed past appointment history will show up here.'
                  : 'No cancelled or expired appointment records found.'}
              </p>
            </div>
          )}
        </div>

      </div>
      
      {activeVideoCall && (
        <VideoRoom
          channelName={`appointment_${activeVideoCall}`}
          appointmentId={activeVideoCall}
          senderId={userData.user_id}
          receiverId={appointmentData.upcoming.find(apt => apt.id.toString() === activeVideoCall.toString())?.doctor.user_id}
          receiverName={`Dr. ${appointmentData.upcoming.find(apt => apt.id.toString() === activeVideoCall.toString())?.doctor.name}`}
          onLeave={() => setActiveVideoCall(null)}
        />
      )}

      {activeChat && (
        <ChatDrawer
          isOpen={!!activeChat}
          onClose={() => setActiveChat(null)}
          appointmentId={activeChat.id}
          senderId={userData.user_id}
          receiverId={activeChat.doctor.user_id}
          receiverName={`Dr. ${activeChat.doctor.name}`}
        />
      )}
    </div>
  );
};

export default MyAppointments;