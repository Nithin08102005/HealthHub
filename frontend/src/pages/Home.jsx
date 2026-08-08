import React, { useContext, useEffect } from "react";
import { appContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import { 
  Activity, 
  Stethoscope, 
  ShieldCheck, 
  Clock, 
  Award, 
  ArrowRight, 
  Sparkles, 
  Heart, 
  Calendar, 
  CheckCircle2, 
  Users 
} from "lucide-react";

function Home() {
  const navigate = useNavigate();
  const { token, role } = useContext(appContext);

  useEffect(() => {
    if (!token) return;
    if (role && role !== false) {
      navigate(`/${role}`);
    }
  }, [role, token, navigate]);

  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden">
      {/* Mesh Background Glow Orbs */}
      <div className="absolute top-0 left-1/4 w-[35rem] h-[35rem] bg-blue-600/20 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute top-1/3 right-10 w-[35rem] h-[35rem] bg-indigo-600/20 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-10 left-1/3 w-[35rem] h-[35rem] bg-cyan-500/15 rounded-full blur-[140px] pointer-events-none"></div>

      {/* Hero Section */}
      <section className="relative z-10 pt-16 pb-24 px-6 sm:px-10 max-w-7xl mx-auto text-center lg:text-left">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          
          {/* Left Text & Actions */}
          <div className="w-full lg:w-3/5 space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-xs font-semibold uppercase tracking-wider backdrop-blur-md">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Next-Gen Healthcare Management</span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold leading-tight tracking-tight text-white">
              Your Health, <br />
              <span className="bg-gradient-to-r from-cyan-400 via-blue-300 to-indigo-300 bg-clip-text text-transparent">
                Our Top Priority.
              </span>
            </h1>

            <p className="text-slate-300 text-lg sm:text-xl font-normal leading-relaxed max-w-2xl mx-auto lg:mx-0">
              Connect with verified specialist doctors, book instant appointments, and manage your family's health history seamlessly.
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-4">
              <button
                onClick={() => navigate("/signup")}
                className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold px-8 py-4 rounded-2xl shadow-xl shadow-blue-500/25 transition-all duration-300 transform hover:scale-105 flex items-center gap-2 text-sm sm:text-base cursor-pointer"
              >
                <span>Get Started Now</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                onClick={() => navigate("/login")}
                className="bg-slate-900/80 hover:bg-slate-800 text-slate-200 font-bold px-8 py-4 rounded-2xl border border-white/15 transition-all text-sm sm:text-base cursor-pointer"
              >
                <span>Sign In to Account</span>
              </button>
            </div>

            {/* Trust Counters */}
            <div className="pt-8 border-t border-white/10 grid grid-cols-3 gap-4 text-center lg:text-left">
              <div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-cyan-400">100+</h3>
                <p className="text-xs text-slate-400 font-medium">Verified Doctors</p>
              </div>
              <div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-emerald-400">24/7</h3>
                <p className="text-xs text-slate-400 font-medium">Online Care</p>
              </div>
              <div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-amber-400">10k+</h3>
                <p className="text-xs text-slate-400 font-medium">Happy Patients</p>
              </div>
            </div>
          </div>

          {/* Right Hero Visual Card */}
          <div className="w-full lg:w-2/5">
            <div className="bg-slate-900/90 backdrop-blur-2xl rounded-3xl p-8 shadow-2xl border border-white/15 space-y-6 relative">
              <div className="flex items-center gap-4 pb-4 border-b border-white/10">
                <div className="w-12 h-12 bg-gradient-to-tr from-blue-600 to-cyan-500 rounded-2xl flex items-center justify-center text-white shadow-lg">
                  <Activity className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">HealthHub Portal</h3>
                  <p className="text-xs text-cyan-400 font-medium">Smart Medical Scheduling</p>
                </div>
              </div>

              <div className="space-y-4 text-xs text-slate-300">
                <div className="flex items-center gap-3 p-3.5 bg-slate-950/60 rounded-2xl border border-white/10">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <span>Real-time Doctor Slot Availability</span>
                </div>
                <div className="flex items-center gap-3 p-3.5 bg-slate-950/60 rounded-2xl border border-white/10">
                  <CheckCircle2 className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                  <span>Razorpay Instant Online Payments</span>
                </div>
                <div className="flex items-center gap-3 p-3.5 bg-slate-950/60 rounded-2xl border border-white/10">
                  <CheckCircle2 className="w-5 h-5 text-amber-400 flex-shrink-0" />
                  <span>Automatic Slot Expiry Protection</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Features Grid */}
      <section className="relative z-10 py-16 px-6 sm:px-10 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-3.5 py-1.5 rounded-full">
            Why Choose HealthHub
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-3">
            Everything You Need for Total Peace of Mind
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900/90 backdrop-blur-2xl rounded-3xl p-8 shadow-2xl border border-white/15 space-y-4">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
              <Stethoscope className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-white">Verified Specialists</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Access top cardiologists, dermatologists, physicians, and pediatricians with verified credentials.
            </p>
          </div>

          <div className="bg-slate-900/90 backdrop-blur-2xl rounded-3xl p-8 shadow-2xl border border-white/15 space-y-4">
            <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
              <Calendar className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-white">Instant Slot Booking</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Pick your preferred date and time slot with 30-minute advance deadline protection.
            </p>
          </div>

          <div className="bg-slate-900/90 backdrop-blur-2xl rounded-3xl p-8 shadow-2xl border border-white/15 space-y-4">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-white">Secure Encrypted Data</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Your consultation records and personal medical information are protected by encrypted protocols.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
