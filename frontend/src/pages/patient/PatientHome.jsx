import React, { useState, useEffect } from "react";
import {
  Calendar,
  DollarSign,
  CreditCard,
  Stethoscope,
  Heart,
  Eye,
  Scissors,
  Baby,
  User,
  Smile,
  Activity,
} from "lucide-react";
import axios from "axios";
import { useContext } from "react";
import { appContext } from "../../context/AppContext";

const PatientDashboard = () => {
  const [visibleSections, setVisibleSections] = useState(new Set());
  const [waveAnimation, setWaveAnimation] = useState(true);
  const { userData } = useContext(appContext);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const getDashboardDetails = async () => {
      setLoading(true);
      try {
        const response = await axios.post(
          "http://localhost:3000/patient/getPatientDashboardStats",
          {
            patientId: userData?.id,
          }
        );

        if (response.data.success) {
          const { totalAppointments, totalPaid, totalDue } = response.data;
          setDashboardData({
            totalAppointments,
            totalPaid,
            totalDue,
            userName: userData?.name || "",
          });
        } else {
          console.warn("Failed to fetch dashboard stats");
        }
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };

    if (userData?.id) {
      getDashboardDetails();
    }
  }, []);

  useEffect(() => {
    if (!dashboardData) return;

    const sections = document.querySelectorAll("[data-animate]");
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections((prev) => new Set([...prev, entry.target.id]));
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px",
      }
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, [dashboardData]);

  const specializations = [
    {
      name: "General Physician",
      icon: <Stethoscope className="w-8 h-8" />,
      description:
        "Primary care doctors who diagnose and treat common illnesses, provide preventive care, and coordinate your overall health management.",
      color: "from-blue-400 to-blue-600",
    },
    {
      name: "Cardiologist",
      icon: <Heart className="w-8 h-8" />,
      description:
        "Heart specialists who diagnose and treat conditions related to your cardiovascular system, including heart disease and blood pressure issues.",
      color: "from-red-400 to-red-600",
    },
    {
      name: "Dermatologist",
      icon: <User className="w-8 h-8" />,
      description:
        "Skin experts who treat conditions like acne, eczema, skin cancer, and provide cosmetic treatments for healthy, beautiful skin.",
      color: "from-pink-400 to-pink-600",
    },
    {
      name: "Gynecologist",
      icon: <Activity className="w-8 h-8" />,
      description:
        "Women's health specialists focusing on reproductive health, pregnancy care, and conditions affecting the female reproductive system.",
      color: "from-purple-400 to-purple-600",
    },
    {
      name: "Pediatrician",
      icon: <Baby className="w-8 h-8" />,
      description:
        "Child specialists who provide medical care for infants, children, and teenagers, ensuring proper growth and development.",
      color: "from-green-400 to-green-600",
    },
    {
      name: "Ophthalmologist",
      icon: <Eye className="w-8 h-8" />,
      description:
        "Eye doctors who diagnose and treat eye diseases, perform eye surgeries, and help maintain your vision and eye health.",
      color: "from-indigo-400 to-indigo-600",
    },
    {
      name: "Dentist",
      icon: <Smile className="w-8 h-8" />,
      description:
        "Oral health professionals who maintain your teeth and gums, prevent dental problems, and provide treatments for a healthy smile.",
      color: "from-cyan-400 to-cyan-600",
    },
    {
      name: "Gastroenterologist",
      icon: <Scissors className="w-8 h-8" />,
      description:
        "Digestive system specialists who treat conditions affecting your stomach, intestines, liver, and other digestive organs.",
      color: "from-orange-400 to-orange-600",
    },
  ];
  const AnimatedAvatar = () => (
    <div className="relative">
      <div className="w-24 h-24 bg-gradient-to-br from-purple-400 via-pink-400 to-blue-400 rounded-full flex items-center justify-center shadow-lg">
        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
          <User className="w-10 h-10 text-gray-600" />
        </div>
      </div>
      {waveAnimation && (
        <div className="absolute -top-2 -right-2 animate-bounce">
          <div className="w-8 h-8 text-2xl">👋</div>
        </div>
      )}
    </div>
  );

  if (loading || !dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-4 -left-4 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-8 -right-4 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-4000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header Section */}
        <div
          id="header"
          data-animate
          className="opacity-100 transform translate-y-0 transition-all duration-1000"
        >
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20 mb-8">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-6">
                <AnimatedAvatar />
                <div>
                  <h1 className="text-4xl font-bold text-black">
                    Welcome back, {dashboardData.userName}!
                  </h1>
                  <p className="text-gray-600 text-lg mt-2">
                    Here's your health dashboard overview
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div
          id="stats"
          data-animate
          className={`transition-all duration-1000 delay-200 ${
            visibleSections.has("stats")
              ? "opacity-100 transform translate-y-0"
              : "opacity-0 transform translate-y-8"
          }`}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-xl transform hover:scale-105 transition-transform duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">
                    Total Appointments
                  </p>
                  <p className="text-3xl font-bold mt-2">
                    {dashboardData.totalAppointments}
                  </p>
                </div>
                <Calendar className="w-12 h-12 text-blue-200" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-xl transform hover:scale-105 transition-transform duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">
                    Total Paid
                  </p>
                  <p className="text-3xl font-bold mt-2">
                    ₹{dashboardData.totalPaid.toLocaleString()}
                  </p>
                </div>
                <DollarSign className="w-12 h-12 text-green-200" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-xl transform hover:scale-105 transition-transform duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">
                    Amount Due
                  </p>
                  <p className="text-3xl font-bold mt-2">
                    ₹{dashboardData.totalDue.toLocaleString()}
                  </p>
                </div>
                <CreditCard className="w-12 h-12 text-orange-200" />
              </div>
            </div>
          </div>
        </div>

        {/* Specializations Section */}
        <div
          id="specializations"
          data-animate
          className={`transition-all duration-1000 delay-400 ${
            visibleSections.has("specializations")
              ? "opacity-100 transform translate-y-0"
              : "opacity-0 transform translate-y-8"
          }`}
        >
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20">
            <h2 className="text-3xl font-bold text-black mb-2 text-center">
              Our Medical Specializations
            </h2>
            <p className="text-gray-600 text-center mb-8">
              Expert care across all major medical disciplines
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {specializations.map((spec, index) => (
                <div
                  key={spec.name}
                  className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
                  style={{
                    animationDelay: `${index * 100}ms`,
                  }}
                >
                  <div
                    className={`w-16 h-16 bg-gradient-to-br ${spec.color} rounded-2xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform duration-300`}
                  >
                    {spec.icon}
                  </div>
                  <h3 className="text-xl font-bold text-black mb-3">
                    {spec.name}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {spec.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div
          id="actions"
          data-animate
          className={`transition-all duration-1000 delay-600 mt-12 ${
            visibleSections.has("actions")
              ? "opacity-100 transform translate-y-0"
              : "opacity-0 transform translate-y-8"
          }`}
        >
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20 text-center">
            <h3 className="text-2xl font-bold mb-4 text-black">
              Need to Schedule an Appointment?
            </h3>
            <p className="text-gray-600 mb-6">
              Book with any of our specialists or manage your existing
              appointments
            </p>
            <div className="flex justify-center">
              <button className="bg-purple-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-purple-700 transition-colors duration-300 transform hover:scale-105">
                Manage Appointments
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default PatientDashboard;
