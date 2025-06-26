import React, { useContext, useEffect, useState } from 'react';
import { Calendar, Clock, MapPin, User, Phone, CheckCircle, XCircle, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { appContext } from '../../context/AppContext';
import axios from 'axios';
import toast from 'react-hot-toast';


const calculateAge = dob => {
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
  consultancyFee: 500, // Hardcoded as you didn't specify a source
  patient: {
    name: raw.name,
    image: raw.image,
    phone: raw.phone,
    email: raw.email,
    age: calculateAge(raw.date_of_birth),
    gender: raw.gender
  }
});

// Helper function to check if appointment is currently active (should show complete button)
const isAppointmentActive = (date, time) => {
  const now = new Date();
  const appointmentDate = new Date(date);
  const [hours, minutes] = time.split(':');
  
  // Set appointment start time
  const appointmentStart = new Date(appointmentDate);
  appointmentStart.setHours(parseInt(hours), parseInt(minutes), 0, 0);
  
  // Set appointment end time (1 hour later)
  const appointmentEnd = new Date(appointmentStart);
  appointmentEnd.setHours(appointmentEnd.getHours() + 1);
  
  return now >= appointmentStart && now <= appointmentEnd;
};

// Helper function to check if appointment should be auto-completed
const shouldAutoComplete = (date, time) => {
  const now = new Date();
  const appointmentDate = new Date(date);
  const [hours, minutes] = time.split(':');
  
  // Set appointment start time
  const appointmentStart = new Date(appointmentDate);
  appointmentStart.setHours(parseInt(hours), parseInt(minutes), 0, 0);
  
  // Set appointment end time (1 hour later)
  const appointmentEnd = new Date(appointmentStart);
  appointmentEnd.setHours(appointmentEnd.getHours() + 1);
  
  return now > appointmentEnd;
};

const DoctorAppointments = () => {
  const {userData: doctorData} = useContext(appContext);
  const [appointmentData, setAppointmentData] = useState({
    pending: [],
    confirmed: [],
    completed: [],
    cancelled: []
  });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [expandedAppointment, setExpandedAppointment] = useState(null);
  const [showCompleted, setShowCompleted] = useState(false);
  const [showCancelled, setShowCancelled] = useState(false);
  
  // Auto-complete checker
  useEffect(() => {
    const checkAutoComplete = () => {
      let hasChanges = false;
      const updatedData = { ...appointmentData };
      
      // Check confirmed appointments for auto-completion
      updatedData.confirmed = appointmentData.confirmed.filter(appointment => {
        if (shouldAutoComplete(appointment.date, appointment.time)) {
          // Move to completed
      
          hasChanges = true;
          
          // Auto-complete via API
          handleCompleteAppointment(appointment.id, true);
          
          return false; // Remove from confirmed
        }
        return true;
      });
      
      if (hasChanges) {
        setAppointmentData(updatedData);
      }
    };
    
    // Check every minute
    const interval = setInterval(checkAutoComplete, 60000);
    
    // Check immediately
    checkAutoComplete();
    
    return () => clearInterval(interval);
  }, [appointmentData.confirmed]);

  useEffect(() => {
    const fetchAppointments = async () => {
      setLoading(true);
      try {
        const { data } = await axios.post('http://localhost:3000/doctor/getAppointments',
          {
            doctorId: doctorData.id
          }
        );

        if (data.success === 'true') {
          const grouped = {
            pending: [],
            confirmed: [],
            completed: [],
            cancelled: []
          };

          data.appointments.forEach(apt => {
            const transformed = transformAppointment(apt);
            const status = apt.status.toLowerCase();
            if (grouped[status]) {
              grouped[status].push(transformed);
            }
          });

          setAppointmentData(grouped);
        }
      } catch (err) {
        console.error('Error fetching appointments:', err);
      }
      finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  const handleConfirmAppointment = async (appointmentId) => {
    const confirmAction = window.confirm("Are you sure you want to confirm this appointment?");
    if (!confirmAction) return;

    try {
      setActionLoading(true);
      
      const {data} = await axios.post("http://localhost:3000/doctor/confirmAppointment", {
        id: appointmentId
      })
      if (data.success) {
        const appointmentToMove = appointmentData.pending.find(apt => apt.id === appointmentId);
        if (appointmentToMove) {
          const updatedAppointment = { ...appointmentToMove, status: 'confirmed' };
          
          setAppointmentData({
            ...appointmentData,
            pending: appointmentData.pending.filter(apt => apt.id !== appointmentId),
            confirmed: [...appointmentData.confirmed, updatedAppointment]
          });
        }
        
        toast.success("Appointment confirmed successfully");
        setActionLoading(false);
      }
      else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error confirming appointment:", error);
      toast.error("Error confirming appointment. Please try again later");
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
      
      const {data} = await axios.post("http://localhost:3000/doctor/completeAppointment", {
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
          toast.success("Appointment marked as completed");
        }
      } else {
        if (!isAutoComplete) {
          toast.error(data.message);
        }
      }
    } catch (error) {
      console.error("Error completing appointment:", error);
      if (!isAutoComplete) {
        toast.error("Error completing appointment. Please try again later");
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
      
      const {data} = await axios.post("http://localhost:3000/doctor/cancelAppointment",
        {
          id: appointment.id
        }
      )
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
        toast.success("Appointment cancelled successfully");
        setActionLoading(false);
      }
      else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      toast.error("Failed to cancel appointment");
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

  const getStatusColor = (status) => {
    switch (status) {
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

  const AppointmentCard = ({ appointment, showActions = true, isCompleted = false, isCancelled = false }) => {
    const isExpanded = expandedAppointment === appointment.id;
    const isActive = appointment.status === 'confirmed' && isAppointmentActive(appointment.date, appointment.time);
    
    return (
      <div className={`bg-white border border-gray-200 rounded-lg p-4 mb-3 ${isCancelled ? 'opacity-75' : ''} ${isActive ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1">
            {/* Patient Image */}
            <img
              src={appointment.patient.image || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=200&fit=crop&crop=face'}
              alt={appointment.patient.name}
              className={`w-20 h-24 rounded-lg object-cover border-2 ${isCancelled ? 'border-gray-300 grayscale' : 'border-blue-100'}`}
            />
            
            {/* Patient Info */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className={`font-medium ${isCancelled ? 'text-gray-500' : 'text-gray-900'}`}>
                    {appointment.patient.name}
                  </h3>
                  <p className={`text-sm ${isCancelled ? 'text-gray-400' : 'text-gray-600'}`}>
                    {appointment.patient.age && `Age: ${appointment.patient.age}`}
                    {appointment.patient.gender && ` • ${appointment.patient.gender}`}
                  </p>
                </div>
                <div className="flex flex-col items-end space-y-1">
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                    {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                  </div>
                  {isActive && (
                    <div className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 animate-pulse">
                      Active Now
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className={`flex items-center text-sm ${isCancelled ? 'text-gray-400' : 'text-gray-600'}`}>
                  <Calendar className="w-4 h-4 mr-1" />
                  <span className="mr-3">{formatDate(appointment.date)}</span>
                  <Clock className="w-4 h-4 mr-1" />
                  <span>{formatTime(appointment.time)}</span>
                </div>
                <div className="flex flex-col items-end">
                  
                  {/* Payment Status - only show for confirmed appointments */}
                  {appointment.status === 'confirmed' && !isCancelled && (
                    <div className={`text-xs px-2 py-1 rounded-full mt-1 ${
                      appointment.paymentStatus 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-orange-100 text-orange-800'
                    }`}>
                      {appointment.paymentStatus ? 'Paid' : 'Payment Pending'}
                    </div>
                  )}
                  
                  {/* Action Buttons */}
                  {showActions && !isCompleted && !isCancelled && (
                    <div className="flex space-x-2 mt-2">
                      {appointment.status === 'pending' && (
                        <button
                          onClick={() => handleConfirmAppointment(appointment.id)}
                          disabled={actionLoading}
                          className="bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors disabled:opacity-50"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Confirm</span>
                        </button>
                      )}
                      
                      {/* Mark as Complete button - only show during appointment time */}
                      {appointment.status === 'confirmed' && isActive && (
                        <button
                          onClick={() => handleCompleteAppointment(appointment.id)}
                          disabled={actionLoading}
                          className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors disabled:opacity-50"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Mark Complete</span>
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleCancelAppointment(appointment)}
                        disabled={actionLoading}
                        className="bg-red-50 hover:bg-red-100 text-red-600 text-sm px-4 py-2 rounded-lg border border-red-200 flex items-center space-x-2 transition-colors disabled:opacity-50"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Cancel</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Show details directly for completed and cancelled appointments */}
              {(isCompleted || isCancelled) && (
                <div className="mt-3 space-y-2 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Reason for Visit: </span>
                    <span className={isCancelled ? 'text-gray-400' : 'text-gray-600'}>
                      {appointment.reasonForVisit}
                    </span>
                  </div>
                  {appointment.patient.phone && (
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className={isCancelled ? 'text-gray-400' : 'text-gray-600'}>
                        {appointment.patient.phone}
                      </span>
                    </div>
                  )}
                  {appointment.patient.email && (
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className={isCancelled ? 'text-gray-400' : 'text-gray-600'}>
                        {appointment.patient.email}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Dropdown button for active appointments */}
          {showActions && !isCompleted && !isCancelled && (
            <button
              onClick={() => setExpandedAppointment(isExpanded ? null : appointment.id)}
              className="ml-4 p-2 hover:bg-gray-100 rounded-lg border border-gray-300 transition-colors"
            >
              {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-600" /> : <ChevronDown className="w-5 h-5 text-gray-600" />}
            </button>
          )}
        </div>
        
        {/* Expandable content for active appointments */}
        {isExpanded && showActions && !isCompleted && !isCancelled && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium text-gray-700">Reason for Visit: </span>
                <span className="text-gray-600">{appointment.reasonForVisit}</span>
              </div>
              {appointment.patient.phone && (
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">{appointment.patient.phone}</span>
                </div>
              )}
              {appointment.patient.email && (
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">{appointment.patient.email}</span>
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
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">My Appointments</h1>
            <p className="text-gray-600">Manage patient appointments and consultations</p>
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
          <p className="text-gray-600">Manage patient appointments and consultations</p>
        </div>

        {/* Pending Appointments */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Pending Appointments</h2>
            <span className="bg-yellow-100 text-yellow-800 text-sm px-2 py-1 rounded-full">
              {appointmentData.pending.length} pending
            </span>
          </div>
          
          <div className="space-y-0">
            {appointmentData.pending.length > 0 ? (
              appointmentData.pending.map((appointment) => (
                <AppointmentCard key={appointment.id} appointment={appointment} />
              ))
            ) : (
              <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
                <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No pending appointments</p>
              </div>
            )}
          </div>
        </div>

        {/* Confirmed Appointments */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Confirmed Appointments</h2>
            <span className="bg-green-100 text-green-800 text-sm px-2 py-1 rounded-full">
              {appointmentData.confirmed.length} confirmed
            </span>
          </div>
          
          <div className="space-y-0">
            {appointmentData.confirmed.length > 0 ? (
              appointmentData.confirmed.map((appointment) => (
                <AppointmentCard key={appointment.id} appointment={appointment} />
              ))
            ) : (
              <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
                <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No confirmed appointments</p>
              </div>
            )}
          </div>
        </div>

        {/* Completed Appointments */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Completed Appointments</h2>
            <button
              onClick={() => setShowCompleted(!showCompleted)}
              className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg border transition-colors"
            >
              <span className="text-sm font-medium text-gray-700">{showCompleted ? 'Hide' : 'Show'} Completed</span>
              {showCompleted ? <ChevronUp className="w-5 h-5 text-gray-600" /> : <ChevronDown className="w-5 h-5 text-gray-600" />}
            </button>
          </div>
          
          {showCompleted && (
            <div className="space-y-0">
              {appointmentData.completed.length > 0 ? (
                appointmentData.completed.map((appointment) => (
                  <AppointmentCard key={appointment.id} appointment={appointment} showActions={false} isCompleted={true} />
                ))
              ) : (
                <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No completed appointments</p>
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
                onClick={() => setShowCancelled(!showCancelled)}
                className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg border transition-colors"
              >
                <span className="text-sm font-medium text-gray-700">
                  {showCancelled ? 'Hide' : 'Show'} Cancelled
                </span>
                {showCancelled ? <ChevronUp className="w-5 h-5 text-gray-600" /> : <ChevronDown className="w-5 h-5 text-gray-600" />}
              </button>
            </div>
          </div>
          
          {showCancelled && (
            <div className="space-y-0">
              {appointmentData.cancelled.length > 0 ? (
                appointmentData.cancelled.map((appointment) => (
                  <AppointmentCard key={appointment.id} appointment={appointment} showActions={false} isCancelled={true} />
                ))
              ) : (
                <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
                  <XCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
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

export default DoctorAppointments;