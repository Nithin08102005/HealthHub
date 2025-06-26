import React, { useState, useEffect } from 'react';
import { Users, UserCheck, Calendar, DollarSign, Clock, CheckCircle, XCircle, AlertCircle, TrendingUp, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useContext } from 'react';
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
        const response = await axios.get('http://localhost:3000/admin/getDashboardStats',
          {
            headers: { token }
          }
        );
        if (response.data.success) {
          setDashboardData(response.data);

        }
      } catch (error) {
        console.error('Error loading dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Calculate percentages for appointment status
  const getPercentage = (value, total) => {
   
    return ((value / total) * 100).toFixed(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Monitor your healthcare platform's performance and analytics</p>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Monitor your healthcare platform's performance and analytics</p>
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

  const appointmentTotal = Object.values(dashboardData.appointmentsByStatus).map(Number).reduce((a, b) => a + b, 0);
  const paymentTotal = Number(dashboardData.paymentStats.paidCount) + Number(dashboardData.paymentStats.unpaidCount);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2"> Admin Dashboard</h1>
        <p className="text-gray-600">Monitor your healthcare platform's performance and analytics</p>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Doctors */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Doctors</p>
              <p className="text-3xl font-bold text-gray-900">{dashboardData.totalDoctors.toLocaleString()}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <UserCheck className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          
        </div>

        {/* Total Patients */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Patients</p>
              <p className="text-3xl font-bold text-gray-900">{dashboardData.totalPatients.toLocaleString()}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <Users className="h-6 w-6 text-green-600" />
            </div>
          </div>
         
        </div>

        {/* Total Appointments */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Appointments</p>
              <p className="text-3xl font-bold text-gray-900">{dashboardData.totalAppointments.toLocaleString()}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
          </div>
         
        </div>

        {/* Revenue */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Revenue</p>
              <p className="text-3xl font-bold text-gray-900">₹{(dashboardData.paymentStats.paid ).toLocaleString()}</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <DollarSign className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
          
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Appointment Status Breakdown */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Appointment Status Breakdown</h2>
          <div className="space-y-4">
            {/* Pending */}
            <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-yellow-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-800">Pending</p>
                  <p className="text-sm text-gray-600">Awaiting confirmation</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-yellow-600">{dashboardData.appointmentsByStatus.pending}</p>
                <p className="text-sm text-gray-500">{getPercentage(dashboardData.appointmentsByStatus.pending, appointmentTotal)}%</p>
              </div>
            </div>

            {/* Confirmed */}
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-blue-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-800">Confirmed</p>
                  <p className="text-sm text-gray-600">Doctor confirmed</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-600">{dashboardData.appointmentsByStatus.confirmed}</p>
                <p className="text-sm text-gray-500">{getPercentage(dashboardData.appointmentsByStatus.confirmed, appointmentTotal)}%</p>
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
                <p className="text-2xl font-bold text-green-600">{dashboardData.appointmentsByStatus.completed}</p>
                <p className="text-sm text-gray-500">{getPercentage(dashboardData.appointmentsByStatus.completed, appointmentTotal)}%</p>
              </div>
            </div>

            {/* Cancelled */}
            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
              <div className="flex items-center">
                <XCircle className="h-5 w-5 text-red-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-800">Cancelled</p>
                  <p className="text-sm text-gray-600">Cancelled by user/doctor</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-red-600">{dashboardData.appointmentsByStatus.cancelled}</p>
                <p className="text-sm text-gray-500">{getPercentage(dashboardData.appointmentsByStatus.cancelled, appointmentTotal)}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Status */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Payment Analytics</h2>
          
          {/* Payment Overview */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">{dashboardData.paymentStats.paidCount}</div>
              <div className="text-sm text-gray-600">Paid</div>
              <div className="text-xs text-green-600 mt-1">{getPercentage(dashboardData.paymentStats.paidCount, paymentTotal)}%</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-red-600 mb-1">{dashboardData.paymentStats.unpaidCount}</div>
              <div className="text-sm text-gray-600">Unpaid</div>
              <div className="text-xs text-red-600 mt-1">{getPercentage(dashboardData.paymentStats.unpaidCount, paymentTotal)}%</div>
            </div>
          </div>

          {/* Payment Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Payment Collection Rate</span>
              <span>{getPercentage(dashboardData.paymentStats.paidCount, paymentTotal)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-green-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${getPercentage(dashboardData.paymentStats.paidCount, paymentTotal)}%` }}
              ></div>
            </div>
          </div>

          {/* Revenue Summary */}
          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Total Revenue Collected</span>
              <span className="text-lg font-semibold text-green-600">₹{(dashboardData.paymentStats.paid).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Pending Revenue</span>
              <span className="text-lg font-semibold text-red-600">₹{(dashboardData.paymentStats.unpaid ).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>


      {/* Quick Actions */}
      <div className="mt-8 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <button className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg text-center transition-colors"
          onClick={()=>navigate("/admin/add-doctor")}
          >
            <UserCheck className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <span className="text-sm font-medium text-blue-800">Add Doctor</span>
          </button>
          <button className="p-4 bg-green-50 hover:bg-green-100 rounded-lg text-center transition-colors"
          onClick={()=>navigate("/admin/doctors")}>
            <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <span className="text-sm font-medium text-green-800">View Doctors</span>
          </button>
          <button className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg text-center transition-colors"
          onClick={()=>navigate("/admin/appointments")}
          >
            <Calendar className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <span className="text-sm font-medium text-purple-800">View Appointments</span>
          </button>
          
        </div>
      </div>
    </div>
  );
};

export default AdminHome;