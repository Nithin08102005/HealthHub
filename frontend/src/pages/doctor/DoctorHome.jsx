import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Users, 
  DollarSign, 
  Activity,
  User,
  CalendarCheck,
  CalendarX,
  TrendingUp,
  Star
} from 'lucide-react';
import axios from 'axios';
import { useContext } from 'react';
import { appContext } from '../../context/AppContext';

const DoctorHome = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const { userData} = useContext(appContext);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoctorStats = async () => {
      try {
        setLoading(true);
        const response = await axios.post('http://localhost:3000/doctor/getDoctorDashboardStats', {
          doctorId:userData.id,
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

    fetchDoctorStats();
  }, []);

  // Calculate percentages for appointment status
  const getPercentage = (value, total) => {
    if (total === 0) return '0.0';
    return ((value / total) * 100).toFixed(1);
  };

  // Get today's date formatted
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
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Doctor Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's your practice overview</p>
        </div>
        
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Doctor Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's your practice overview</p>
        </div>
        
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-gray-600">Failed to load dashboard data</p>
          </div>
        </div>
      </div>
    );
  }

  const appointmentTotal = Object.values(dashboardData.appointmentsByStatus || {})
    .map(Number)
    .reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Doctor Dashboard</h1>
        <p className="text-gray-600">Welcome back, Dr. {dashboardData.doctorName || 'Doctor'}! Today is {getTodayDate()}</p>
      </div>

      {/* Today's Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Today's Appointments */}
        {/* <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Today's Appointments</p>
              <p className="text-3xl font-bold text-gray-900">{dashboardData.todayAppointments || 0}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <CalendarCheck className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-xs text-blue-600 font-medium">
              {dashboardData.todayPending || 0} pending
            </span>
          </div>
        </div> */}


        {/* Total Appointments */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Appointments</p>
              <p className="text-3xl font-bold text-gray-900">{appointmentTotal}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-xs text-purple-600 font-medium">
              All time appointments
            </span>
          </div>
        </div>

        {/* Earnings */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Earnings</p>
              <p className="text-3xl font-bold text-gray-900">₹{(dashboardData.totalEarnings || 0).toLocaleString()}</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <DollarSign className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-xs text-yellow-600 font-medium">
              From completed appointments
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Appointment Status Breakdown */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">My Appointment Status</h2>
          <div className="space-y-4">
            {/* Pending */}
            <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-yellow-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-800">Pending</p>
                  <p className="text-sm text-gray-600">Awaiting your confirmation</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-yellow-600">
                  {dashboardData.appointmentsByStatus?.pending || 0}
                </p>
                <p className="text-sm text-gray-500">
                  {getPercentage(dashboardData.appointmentsByStatus?.pending || 0, appointmentTotal)}%
                </p>
              </div>
            </div>

            {/* Confirmed */}
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-blue-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-800">Confirmed</p>
                  <p className="text-sm text-gray-600">Ready for consultation</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-600">
                  {dashboardData.appointmentsByStatus?.confirmed || 0}
                </p>
                <p className="text-sm text-gray-500">
                  {getPercentage(dashboardData.appointmentsByStatus?.confirmed || 0, appointmentTotal)}%
                </p>
              </div>
            </div>

            {/* Completed */}
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-800">Completed</p>
                  <p className="text-sm text-gray-600">Successfully finished</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-600">
                  {dashboardData.appointmentsByStatus?.completed || 0}
                </p>
                <p className="text-sm text-gray-500">
                  {getPercentage(dashboardData.appointmentsByStatus?.completed || 0, appointmentTotal)}%
                </p>
              </div>
            </div>

            {/* Cancelled */}
            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
              <div className="flex items-center">
                <XCircle className="h-5 w-5 text-red-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-800">Cancelled</p>
                  <p className="text-sm text-gray-600">Cancelled appointments</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-red-600">
                  {dashboardData.appointmentsByStatus?.cancelled || 0}
                </p>
                <p className="text-sm text-gray-500">
                  {getPercentage(dashboardData.appointmentsByStatus?.cancelled || 0, appointmentTotal)}%
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Appointments */}
      {/* <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Today's Schedule</h2>
        {dashboardData.todaySchedule && dashboardData.todaySchedule.length > 0 ? (
          <div className="space-y-3">
            {dashboardData.todaySchedule.slice(0, 5).map((appointment, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="bg-blue-100 p-2 rounded-full mr-3">
                    <User className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{appointment.patientName}</p>
                    <p className="text-sm text-gray-600">{appointment.appointmentTime}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    appointment.status === 'confirmed' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {appointment.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No appointments scheduled for today</p>
          </div>
        )}
      </div> */}

    </div>
  );
};
export default DoctorHome;