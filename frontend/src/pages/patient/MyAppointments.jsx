import React, { useContext, useEffect, useState } from 'react';
import { Calendar, Clock, MapPin, CreditCard, X, Phone, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import axios from 'axios';
import { appContext } from '../../context/AppContext';
import toast from 'react-hot-toast';
const key = import.meta.env.VITE_RAZORPAY_KEY_ID;


const MyAppointments = () => {
  const { userData } = useContext(appContext);
  const [appointmentData, setAppointmentData] = useState({
    upcoming: [],
    past: [],
    cancelled: []
  });
  const [loading, setLoading] = useState(true);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [expandedAppointment, setExpandedAppointment] = useState(null);
  const [showPastAppointments, setShowPastAppointments] = useState(true);
  const [showCancelledAppointments, setShowCancelledAppointments] = useState(false);

  useEffect(() => {
    async function getAppointments() {
      try {
        setLoading(true);
        const { data } = await axios.post("http://localhost:3000/patient/getAppointments", {
          patientId: userData.id
        });
        
        if (data.success) {
          const appointments = data.appointments;
          
          // Transform backend data to match component structure
          const transformedAppointments = appointments.map(appointment => ({
            id: appointment.appointment_id,
            date: appointment.appointment_date,
            time: appointment.appointment_time,
            reasonForVisit: appointment.reason,
            status:  appointment.status,
            payment_status:appointment.payment_status,
            consultancyFee: parseFloat(appointment.consultation_fee),
            doctor: {
              name: appointment.doctor_name,
              specialization: appointment.specialization,
              image: appointment.image,
              address: appointment.address,
              phone: appointment.phone
            }
          }));

          // Separate appointments by status and date
          const currentDate = new Date();
          
          const cancelled = transformedAppointments.filter(apt => apt.status === 'cancelled');
          
          const activeAppointments = transformedAppointments.filter(apt => apt.status !== 'cancelled');
          
          const upcoming = activeAppointments.filter(apt => {
            const appointmentDate = new Date(apt.date);
            return appointmentDate >= currentDate;
          });
          
          const past = activeAppointments.filter(apt => {
            const appointmentDate = new Date(apt.date);
            return appointmentDate < currentDate;
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
    // Step 1: Create order on backend
    const { data } = await axios.post("http://localhost:3000/payments/create-order", {
      amount: consultancyFee
    });

    if (!data.success) {
      throw new Error("Order creation failed");
    }

    const { id: razorpayOrderId, amount } = data.order;

    // Step 2: Configure Razorpay Checkout options
    const options = {
      key,
      amount,
      currency: "INR",
      name: "HealthHub",
      order_id: razorpayOrderId,
      handler: async function () {
        // ⚠️ No signature verification — directly call makePayment
        try {
         const response= await axios.post("http://localhost:3000/patient/makepayment", {
            appointmentId,
            consultancyFee
          });
          if(response.data.success)
          {
                
            const updatedUpcoming = appointmentData.upcoming.map(apt => {
  if (apt.id === appointmentId) {
    return { ...apt, payment_status:true };
  }
  return apt;
});

setAppointmentData({
  ...appointmentData,
  upcoming: updatedUpcoming
});
          toast("payment done Successfully");
          }
          else toast.error("something went wrong");
          
        } catch (err) {
          console.error("❌ makePayment failed:", err);
        }
      },
      prefill: {
        name: userData.name,
        email: userData.email,
        contact: userData.phone
      },
      theme: {
        color: "#2f8ee5"
      }
    };

    // Step 3: Launch Razorpay Checkout
    const rzp = new window.Razorpay(options);
    rzp.open();

  } catch (error) {
    console.error("handlePayment error:", error);
   toast.error("Something went wrong while initiating payment");
  }
};

  const handleCancelAppointment = async (appointment) => {
    const confirmCancel = window.confirm(
      `Are you sure you want to cancel your appointment with ${appointment.doctor.name} on ${formatDate(appointment.date)} at ${formatTime(appointment.time)}? This action cannot be undone.`
    );
    
    if (!confirmCancel) return;

    try {
      setCancelLoading(true);
      const response = await axios.put("http://localhost:3000/patient/cancelAppointment", {
        appointmentId: appointment.id
      });
      
      if(response.data.success) {
        // Move the cancelled appointment to cancelled section
        const updatedUpcoming = appointmentData.upcoming.filter(apt => apt.id !== appointment.id);
        const cancelledAppointment = { ...appointment, status: 'cancelled' };
        const updatedCancelled = [...appointmentData.cancelled, cancelledAppointment];
        
        setAppointmentData({
          ...appointmentData,
          upcoming: updatedUpcoming,
          cancelled: updatedCancelled
        });
        
        toast.success("Appoitnment cancelled successfully");
      }
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      toast.error("Failed to cancel appointment. Please try again.");
    } finally {
      setCancelLoading(false);
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
    
    // Handle time format like "20:00:00"
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const LoadingSpinner = () => (
    <div className="flex items-center justify-center py-8">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      <span className="ml-2 text-gray-600">Loading appointments...</span>
    </div>
  );

  const AppointmentCard = ({ appointment, isPast = false, isCancelled = false }) => {
    const isExpanded = expandedAppointment === appointment.id;
    const canPay = appointment.status === 'confirmed' && !isPast && !isCancelled;
    const showDropdown = !isPast && !isCancelled; // Only show dropdown for upcoming appointments
    
    return (
      <div className={`bg-white border border-gray-200 rounded-lg p-4 mb-3 ${isCancelled ? 'opacity-75' : ''}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1">
            {/* Doctor Image */}
            <img
              src={appointment.doctor.image}
              alt={appointment.doctor.name}
              className={`w-30 h-40 rounded-lg object-cover border-2 ${isCancelled ? 'border-gray-300 grayscale' : 'border-blue-100'}`}
            />
            
            {/* Doctor Info */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className={`font-medium ${isCancelled ? 'text-gray-500' : 'text-gray-900'}`}>
                    {appointment.doctor.name}
                  </h3>
                  <p className={`text-sm ${isCancelled ? 'text-gray-400' : 'text-blue-600'}`}>
                    {appointment.doctor.specialization}
                  </p>
                </div>
                {/* Only show status for upcoming appointments */}
                {!isPast && !isCancelled && (
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                    {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                  </div>
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <div className={`flex items-center text-sm ${isCancelled ? 'text-gray-400' : 'text-gray-600'}`}>
                  <Calendar className="w-4 h-4 mr-1" />
                  <span className="mr-3">{formatDate(appointment.date)}</span>
                  <Clock className="w-4 h-4 mr-1" />
                  <span>{formatTime(appointment.time)}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className={`text-lg font-semibold ${isCancelled ? 'text-gray-400' : 'text-blue-600'}`}>
                    ₹{appointment.consultancyFee}
                  </span>
                  {!isPast && !isCancelled && (
                    <div className="flex space-x-2 mt-2">
                      {appointment.status === 'pending' && (
                        <button
                          onClick={() => handlePayment(appointment.id,appointment.consultancyFee)}
                          disabled={!canPay}
                          className={`text-sm px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
                            canPay 
                              ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                          title={!canPay ? "Payment only available for confirmed appointments" : ""}
                        >
                          <CreditCard className="w-4 h-4" />
                          <span>Pay Now</span>
                        </button>
                      )}
                      {(appointment.status === 'confirmed'&&appointment.payment_status===false )&& (
                        <button
                          onClick={() => handlePayment(appointment.id,appointment.consultancyFee)}
                          className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                        >
                          <CreditCard className="w-4 h-4" />
                          <span>Pay Now</span>
                        </button>
                      )}
                      {appointment.payment_status === true && (
                        <div className="bg-green-100 text-green-800 text-sm px-4 py-2 rounded-lg flex items-center space-x-2">
                          <span>Paid</span>
                        </div>
                      )}
                      <button
                        onClick={() => handleCancelAppointment(appointment)}
                        disabled={cancelLoading}
                        className="bg-red-50 hover:bg-red-100 text-red-600 text-sm px-4 py-2 rounded-lg border border-red-200 flex items-center space-x-2 transition-colors disabled:opacity-50"
                      >
                        <X className="w-4 h-4" />
                        <span>Cancel</span>
                      </button>
                    </div>
                  )}
                  {isPast && appointment.status === 'completed' && (
                    <div className="bg-green-100 text-green-800 text-sm px-4 py-2 rounded-lg mt-2">
                      Completed
                    </div>
                  )}
                </div>
              </div>
              
              {/* Show details directly for past and cancelled appointments */}
              {(isPast || isCancelled) && (
                <div className="mt-3 space-y-2 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Reason: </span>
                    <span className={isCancelled ? 'text-gray-400' : 'text-gray-600'}>
                      {appointment.reasonForVisit}
                    </span>
                  </div>
                  {appointment.doctor.address && (
                    <div className="flex items-start space-x-2">
                      <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <span className={isCancelled ? 'text-gray-400' : 'text-gray-600'}>
                        {appointment.doctor.address}
                      </span>
                    </div>
                  )}
                  {appointment.doctor.phone && (
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className={isCancelled ? 'text-gray-400' : 'text-gray-600'}>
                        {appointment.doctor.phone}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Only show dropdown button for upcoming appointments */}
          {showDropdown && (
            <button
              onClick={() => setExpandedAppointment(isExpanded ? null : appointment.id)}
              className="ml-4 p-2 hover:bg-gray-100 rounded-lg border border-gray-300 transition-colors"
            >
              {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-600" /> : <ChevronDown className="w-5 h-5 text-gray-600" />}
            </button>
          )}
        </div>
        
        {/* Expandable content only for upcoming appointments */}
        {isExpanded && showDropdown && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium text-gray-700">Reason: </span>
                <span className="text-gray-600">{appointment.reasonForVisit}</span>
              </div>
              {appointment.doctor.address && (
                <div className="flex items-start space-x-2">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600">{appointment.doctor.address}</span>
                </div>
              )}
              {appointment.doctor.phone && (
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">{appointment.doctor.phone}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-6 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">My Appointments</h1>
            <p className="text-gray-600">Manage your upcoming and past appointments</p>
          </div>
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">My Appointments</h1>
          <p className="text-gray-600">Manage your upcoming, past, and cancelled appointments</p>
        </div>

        {/* Upcoming Appointments */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Upcoming Appointments</h2>
            <span className="bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-full">
              {appointmentData.upcoming.length} appointments
            </span>
          </div>
          
          <div className="space-y-0">
            {appointmentData.upcoming.length > 0 ? (
              appointmentData.upcoming.map((appointment) => (
                <AppointmentCard key={appointment.id} appointment={appointment} />
              ))
            ) : (
              <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No upcoming appointments</p>
              </div>
            )}
          </div>
        </div>

        {/* Past Appointments */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Past Appointments</h2>
            <button
              onClick={() => setShowPastAppointments(!showPastAppointments)}
              className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg border transition-colors"
            >
              <span className="text-sm font-medium text-gray-700">{showPastAppointments ? 'Hide' : 'Show'} History</span>
              {showPastAppointments ? <ChevronUp className="w-5 h-5 text-gray-600" /> : <ChevronDown className="w-5 h-5 text-gray-600" />}
            </button>
          </div>
          
          {showPastAppointments && (
            <div className="space-y-0">
              {appointmentData.past.length > 0 ? (
                appointmentData.past.map((appointment) => (
                  <AppointmentCard key={appointment.id} appointment={appointment} isPast={true} />
                ))
              ) : (
                <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
                  <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No past appointments</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Cancelled Appointments */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Cancelled Appointments</h2>
            <div className="flex items-center space-x-3">
              <span className="bg-red-100 text-red-800 text-sm px-2 py-1 rounded-full">
                {appointmentData.cancelled.length} cancelled
              </span>
              <button
                onClick={() => setShowCancelledAppointments(!showCancelledAppointments)}
                className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg border transition-colors"
              >
                <span className="text-sm font-medium text-gray-700">
                  {showCancelledAppointments ? 'Hide' : 'Show'} Cancelled
                </span>
                {showCancelledAppointments ? <ChevronUp className="w-5 h-5 text-gray-600" /> : <ChevronDown className="w-5 h-5 text-gray-600" />}
              </button>
            </div>
          </div>
          
          {showCancelledAppointments && (
            <div className="space-y-0">
              {appointmentData.cancelled.length > 0 ? (
                appointmentData.cancelled.map((appointment) => (
                  <AppointmentCard key={appointment.id} appointment={appointment} isCancelled={true} />
                ))
              ) : (
                <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
                  <X className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No cancelled appointments</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyAppointments;