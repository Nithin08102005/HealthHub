import React from 'react';
import { Calendar, Clock, Heart, Phone, Sun, Bell } from 'lucide-react';

export default function PatientHome() {
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Welcome Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Welcome to your Health Hub</h1>
              <p className="text-gray-600 mt-1">{currentDate}</p>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            


            {/* Upcoming Appointments */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Next Appointments</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800">Dr. Sarah Johnson</p>
                    <p className="text-sm text-gray-600">General Checkup</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-blue-600">June 25, 2025</p>
                    <p className="text-sm text-gray-600">10:30 AM</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800">Dr. Michael Chen</p>
                    <p className="text-sm text-gray-600">Follow-up Visit</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-green-600">July 8, 2025</p>
                    <p className="text-sm text-gray-600">2:15 PM</p>
                  </div>
                </div>
              </div>
            </div>

            {/* About Health Hub */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">About Health Hub</h2>
              <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-lg">
                <p className="text-gray-700 mb-3">
                  Welcome to Health Hub - your comprehensive healthcare platform where you can find qualified doctors with various specialties and easily book appointments with them.
                </p>
                <p className="text-gray-700 mb-3">
                  Our platform connects you with experienced healthcare professionals across multiple specialties including General Medicine, Cardiology, Dermatology, Pediatrics, and many more.
                </p>
                <p className="text-gray-700">
                  Manage your appointments, track your health journey, and access quality healthcare services all in one place. Your health is our priority!
                </p>
              </div>
            </div>

            {/* Health Tips */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Daily Health Tip</h2>
              <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg">
                <p className="text-gray-700 italic">"Stay hydrated throughout the day. Aim for 8 glasses of water to keep your body functioning at its best!"</p>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            
            {/* Weather Widget */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Today's Weather</h3>
              <div className="flex items-center space-x-3">
                <Sun className="w-8 h-8 text-yellow-500" />
                <div>
                  <p className="text-2xl font-bold text-gray-800">28°C</p>
                  <p className="text-sm text-gray-600">Sunny & Clear</p>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">Perfect weather for a walk!</p>
            </div>

            {/* Health Reminders */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Health Reminders</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <Bell className="w-4 h-4 text-orange-500 mt-1" />
                  <p className="text-sm text-gray-700">Take your morning medication</p>
                </div>
                <div className="flex items-start space-x-3">
                  <Bell className="w-4 h-4 text-blue-500 mt-1" />
                  <p className="text-sm text-gray-700">Annual checkup due next month</p>
                </div>
                <div className="flex items-start space-x-3">
                  <Bell className="w-4 h-4 text-green-500 mt-1" />
                  <p className="text-sm text-gray-700">Remember to exercise 30 mins today</p>
                </div>
              </div>
            </div>

            {/* Clinic Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Clinic Information</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Phone className="w-4 h-4 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-800">Emergency</p>
                    <p className="text-sm text-gray-600">+91 40 1234 5678</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="w-4 h-4 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-800">Clinic Hours</p>
                    <p className="text-sm text-gray-600">Mon-Fri: 8AM-6PM</p>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-800 font-medium">Patient ID: PAT-2025-001</p>
                </div>
              </div>
            </div>


          </div>
        </div>
      </div>
    </div>
  );
}