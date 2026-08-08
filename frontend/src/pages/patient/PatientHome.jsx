import React, { useState, useEffect, useContext } from "react";
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
  Search,
  ArrowRight,
  ShieldCheck,
  Award,
  Clock,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import axios from "axios";
import { appContext } from "../../context/AppContext";
import { useNavigate } from "react-router-dom";
import AISymptomChecker from "../../components/AISymptomChecker.jsx";

const PatientDashboard = () => {
  const navigate = useNavigate();
  const { userData } = useContext(appContext);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);

  useEffect(() => {
    const getDashboardDetails = async () => {
      setLoading(true);
      try {
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/patient/getPatientDashboardStats`,
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
            userName: userData?.name || "Patient",
          });
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
  }, [userData?.id]);

  const specializations = [
    {
      name: "General Physician",
      icon: <Stethoscope className="w-7 h-7" />,
      description: "Comprehensive primary care, routine checkups, and general diagnosis.",
      color: "from-blue-500 to-cyan-500",
      bgCard: "bg-gradient-to-br from-blue-900/30 via-slate-900/40 to-blue-950/30 border-blue-500/20",
    },
    {
      name: "Cardiologist",
      icon: <Heart className="w-7 h-7" />,
      description: "Advanced cardiovascular care, heart monitoring, and hypertension treatment.",
      color: "from-rose-500 to-red-600",
      bgCard: "bg-gradient-to-br from-rose-900/30 via-slate-900/40 to-rose-950/30 border-rose-500/20",
    },
    {
      name: "Dermatologist",
      icon: <User className="w-7 h-7" />,
      description: "Expert skin health, acne management, and cosmetic dermatology.",
      color: "from-amber-500 to-orange-500",
      bgCard: "bg-gradient-to-br from-amber-900/30 via-slate-900/40 to-amber-950/30 border-amber-500/20",
    },
    {
      name: "Gynecologist",
      icon: <Activity className="w-7 h-7" />,
      description: "Women's reproductive health, prenatal care, and wellness guidance.",
      color: "from-fuchsia-500 to-pink-500",
      bgCard: "bg-gradient-to-br from-fuchsia-900/30 via-slate-900/40 to-fuchsia-950/30 border-fuchsia-500/20",
    },
    {
      name: "Pediatrician",
      icon: <Baby className="w-7 h-7" />,
      description: "Specialized healthcare and growth tracking for infants and adolescents.",
      color: "from-emerald-500 to-teal-500",
      bgCard: "bg-gradient-to-br from-emerald-900/30 via-slate-900/40 to-emerald-950/30 border-emerald-500/20",
    },
    {
      name: "Ophthalmologist",
      icon: <Eye className="w-7 h-7" />,
      description: "Vision correction, eye disease diagnosis, and surgical consultation.",
      color: "from-indigo-500 to-purple-600",
      bgCard: "bg-gradient-to-br from-indigo-900/30 via-slate-900/40 to-indigo-950/30 border-indigo-500/20",
    },
    {
      name: "Dentist",
      icon: <Smile className="w-7 h-7" />,
      description: "Complete dental hygiene, cosmetic procedures, and oral health care.",
      color: "from-sky-500 to-blue-600",
      bgCard: "bg-gradient-to-br from-sky-900/30 via-slate-900/40 to-sky-950/30 border-sky-500/20",
    },
    {
      name: "Gastroenterologist",
      icon: <Scissors className="w-7 h-7" />,
      description: "Digestive health, liver care, and gastrointestinal disorder treatment.",
      color: "from-violet-500 to-purple-600",
      bgCard: "bg-gradient-to-br from-violet-900/30 via-slate-900/40 to-violet-950/30 border-violet-500/20",
    },
  ];

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/patient/doctors?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate("/patient/doctors");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-300 font-medium">Loading your portal dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden rounded-3xl border border-white/10 shadow-2xl my-2">
      {/* Dynamic Background Mesh Spheres */}
      <div className="absolute top-0 left-1/4 w-[30rem] h-[30rem] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute top-1/2 right-0 w-[30rem] h-[30rem] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-1/3 w-[30rem] h-[30rem] bg-cyan-500/15 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Hero Header Section */}
      <section className="relative pt-10 pb-16 px-6 sm:px-10">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            
            {/* Left Content */}
            <div className="w-full lg:w-3/5 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-400/30 backdrop-blur-md text-cyan-300 text-xs font-semibold tracking-wider uppercase">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Next-Gen Healthcare Portal</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight text-white">
                Welcome back,{" "}
                <span className="bg-gradient-to-r from-cyan-400 via-blue-300 to-indigo-300 bg-clip-text text-transparent">
                  {dashboardData?.userName || "Patient"}!
                </span>
              </h1>

              <p className="text-slate-300 text-base sm:text-lg font-normal leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Book top-rated specialists, manage active consultations, and track your medical history seamlessly in real time.
              </p>

              {/* Instant Search Form */}
              <form onSubmit={handleSearchSubmit} className="mt-8 max-w-xl mx-auto lg:mx-0">
                <div className="bg-slate-900/80 backdrop-blur-xl p-2 rounded-2xl flex items-center gap-2 shadow-2xl border border-white/15">
                  <div className="pl-3 text-slate-400">
                    <Search className="w-5 h-5 text-cyan-400" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search doctor by name, specialty, or location..."
                    className="w-full bg-transparent text-white placeholder-slate-400 px-2 py-3 focus:outline-none text-sm font-medium"
                  />
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 shadow-lg shadow-blue-500/25 flex items-center gap-2 whitespace-nowrap cursor-pointer"
                  >
                    <span>Find Doctor</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>

              {/* Verified Badges */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-slate-300 text-xs sm:text-sm font-medium">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>100% Verified Practitioners</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-cyan-400" />
                  <span>Instant Slot Booking</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>24/7 Medical Portal</span>
                </div>
              </div>
            </div>

            {/* Right Card / CTA Highlights */}
            <div className="w-full lg:w-2/5">
              <div className="bg-slate-900/90 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 space-y-6 border border-white/15 shadow-2xl">
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Activity className="w-5 h-5 text-cyan-400" />
                    <span>Quick Healthcare Hub</span>
                  </h3>
                  <span className="bg-emerald-500/20 text-emerald-300 text-xs px-3 py-1 rounded-full font-semibold border border-emerald-500/30">
                    Live Portal
                  </span>
                </div>

                <div className="space-y-4">
                  <button
                    onClick={() => navigate("/patient/doctors")}
                    className="w-full bg-gradient-to-r from-blue-900/50 to-indigo-900/50 hover:from-blue-800/70 hover:to-indigo-800/70 border border-blue-400/30 text-white rounded-2xl p-4 flex items-center justify-between group transition-all duration-300 cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center text-cyan-300">
                        <Stethoscope className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-sm">Book Specialist Doctor</p>
                        <p className="text-xs text-slate-400">Choose from certified doctors</p>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-cyan-300 group-hover:translate-x-1 transition-all" />
                  </button>

                  <button
                    onClick={() => navigate("/patient/appointments")}
                    className="w-full bg-slate-800/50 hover:bg-slate-800/80 border border-slate-700/50 text-white rounded-2xl p-4 flex items-center justify-between group transition-all duration-300 cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-300">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-sm">My Appointments</p>
                        <p className="text-xs text-slate-400">View & track bookings</p>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-300 group-hover:translate-x-1 transition-all" />
                  </button>

                  <button
                    onClick={() => setIsAIModalOpen(true)}
                    className="w-full bg-gradient-to-r from-purple-900/40 to-indigo-900/40 hover:from-purple-800/60 hover:to-indigo-800/60 border border-purple-500/30 text-white rounded-2xl p-4 flex items-center justify-between group transition-all duration-300 cursor-pointer shadow-lg shadow-purple-950/20"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center text-purple-300 border border-purple-500/30">
                        <Sparkles className="w-5 h-5 animate-pulse" />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-sm flex items-center gap-1">
                          <span>AI Symptoms Helper</span>
                          <span className="bg-purple-500/30 text-purple-200 text-[9px] px-1.5 py-0.5 rounded-full font-bold">New</span>
                        </p>
                        <p className="text-xs text-slate-400">Analyze symptoms using Gemini</p>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-purple-300 group-hover:translate-x-1 transition-all" />
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-6 sm:px-10 pb-20 relative z-20 space-y-12">

        {/* Financial & Appointment Stats Row */}
        {dashboardData && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Total Consultations */}
            <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/10 flex items-center justify-between hover:border-blue-500/40 transition-all duration-300 group">
              <div>
                <p className="text-slate-400 text-xs font-semibold tracking-wider uppercase">
                  Total Consultations
                </p>
                <h3 className="text-3xl font-extrabold text-white mt-2">
                  {dashboardData.totalAppointments}
                </h3>
                <span className="inline-block mt-2 text-xs font-medium text-cyan-300 bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-1 rounded-md">
                  Active Patient Record
                </span>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/25 group-hover:scale-110 transition-transform">
                <Calendar className="w-7 h-7" />
              </div>
            </div>

            {/* Total Paid */}
            <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/10 flex items-center justify-between hover:border-emerald-500/40 transition-all duration-300 group">
              <div>
                <p className="text-slate-400 text-xs font-semibold tracking-wider uppercase">
                  Total Paid Online
                </p>
                <h3 className="text-3xl font-extrabold text-emerald-400 mt-2">
                  ₹{Number(dashboardData.totalPaid).toLocaleString()}
                </h3>
                <span className="inline-block mt-2 text-xs font-medium text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-md">
                  Cleared Online Payments
                </span>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/25 group-hover:scale-110 transition-transform">
                <DollarSign className="w-7 h-7" />
              </div>
            </div>

            {/* Amount Due */}
            <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/10 flex items-center justify-between hover:border-amber-500/40 transition-all duration-300 group">
              <div>
                <p className="text-slate-400 text-xs font-semibold tracking-wider uppercase">
                  Unpaid Due Balance
                </p>
                <h3 className="text-3xl font-extrabold text-amber-400 mt-2">
                  ₹{Number(dashboardData.totalDue).toLocaleString()}
                </h3>
                <span className="inline-block mt-2 text-xs font-medium text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-md">
                  Offline / Pending Pay
                </span>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-amber-500/25 group-hover:scale-110 transition-transform">
                <CreditCard className="w-7 h-7" />
              </div>
            </div>

          </div>
        )}

        {/* Specializations Showcase Section */}
        <div className="bg-slate-900/90 backdrop-blur-2xl rounded-3xl p-8 sm:p-10 shadow-2xl border border-white/15">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-3.5 py-1.5 rounded-full">
              Explore Medical Departments
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-3">
              Comprehensive Care Across Specializations
            </h2>
            <p className="text-slate-400 mt-3 text-base">
              Select a specialty to browse verified doctors and book your consultation instantly.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {specializations.map((spec) => (
              <div
                key={spec.name}
                onClick={() => navigate(`/patient/doctors?specialty=${encodeURIComponent(spec.name)}`)}
                className={`group ${spec.bgCard} rounded-2xl p-6 border shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1.5 flex flex-col justify-between`}
              >
                <div>
                  <div className={`w-14 h-14 bg-gradient-to-br ${spec.color} rounded-2xl flex items-center justify-center text-white mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    {spec.icon}
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">
                    {spec.name}
                  </h3>
                  <p className="text-slate-300 text-xs leading-relaxed">
                    {spec.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-semibold text-cyan-400 group-hover:text-cyan-300">
                  <span>View Doctors</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Feature Highlights Banner */}
        <div className="bg-gradient-to-r from-blue-950 via-indigo-950 to-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-2xl border border-white/15 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-2xl text-center md:text-left">
            <h3 className="text-2xl sm:text-3xl font-extrabold">
              Need Immediate Consultation or Second Opinion?
            </h3>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Our verified doctors are available for in-clinic and online consultation requests. Instant confirmation, clear fee structure, and zero hidden charges.
            </p>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2">
              <div className="flex items-center gap-2 text-xs text-cyan-300 font-medium">
                <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                <span>Verified Practitioners</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-cyan-300 font-medium">
                <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                <span>Zero Cancellation Penalty for Expired Slots</span>
              </div>
            </div>
          </div>

          <div>
            <button
              onClick={() => navigate("/patient/doctors")}
              className="bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-bold px-8 py-4 rounded-2xl shadow-xl hover:shadow-cyan-500/25 transition-all duration-300 transform hover:scale-105 whitespace-nowrap text-sm sm:text-base cursor-pointer"
            >
              Browse All Doctors
            </button>
          </div>
        </div>

      </div>
      <AISymptomChecker isOpen={isAIModalOpen} onClose={() => setIsAIModalOpen(false)} />
    </div>
  );
};

export default PatientDashboard;
