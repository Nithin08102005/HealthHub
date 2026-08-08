import React, { useState, useContext } from "react";
import { Eye, EyeOff, User, Mail, Lock, Phone, Calendar, MapPin, Activity, Sparkles, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import axios from "axios";
import { appContext } from "../context/AppContext";

const SignUp = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setToken } = useContext(appContext);

  const [signupData, setSignupData] = useState({
    name: "",
    email: "",
    password: "",
    role: "patient",
    phone: "",
    gender: "male",
    date_of_birth: "",
    address: "",
  });

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Fixed URL typo
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/user/register`, signupData);
      const data = response.data;

      if (data.success) {
        toast.success('Account created successfully!');
        localStorage.setItem('token', data.token);
        setToken(data.token);
        setTimeout(() => {   
          navigate('/patient');
        }, 1000);
      } else {
        toast.error(data.message || 'Signup failed. Please try again.');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4 relative overflow-hidden py-12">
      {/* Dynamic Glow Spheres */}
      <div className="absolute top-10 left-1/4 w-96 h-96 bg-emerald-600/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-teal-500/20 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="bg-slate-900/90 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/15 w-full max-w-lg p-8 sm:p-10 relative z-10">
        
        {/* Brand Header Icon */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-2xl flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/30 mb-3 font-extrabold">
            <Activity className="w-8 h-8 text-slate-950" />
          </div>
          <span className="text-2xl font-extrabold bg-gradient-to-r from-white via-slate-100 to-emerald-200 bg-clip-text text-transparent">
            HealthHub Patient Signup
          </span>
          <p className="text-xs text-emerald-400 font-semibold uppercase tracking-wider mt-0.5">
            Create Your Medical Care Account
          </p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          
          {/* Name */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-3.5 w-4 h-4 text-emerald-400" />
              <input
                type="text"
                value={signupData.name}
                onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                className="w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-white/15 rounded-2xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all placeholder-slate-500"
                placeholder="Enter full name"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-emerald-400" />
              <input
                type="email"
                value={signupData.email}
                onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                className="w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-white/15 rounded-2xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all placeholder-slate-500"
                placeholder="name@example.com"
                required
              />
            </div>
          </div>

          {/* Phone & Gender */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-emerald-400" />
                <input
                  type="tel"
                  value={signupData.phone}
                  onChange={(e) => setSignupData({ ...signupData, phone: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-white/15 rounded-2xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all placeholder-slate-500"
                  placeholder="+91 98765 43210"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Gender
              </label>
              <select
                value={signupData.gender}
                onChange={(e) => setSignupData({ ...signupData, gender: e.target.value })}
                className="w-full px-4 py-3 bg-slate-950/80 border border-white/15 rounded-2xl text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all"
                required
              >
                <option value="male" className="bg-slate-900 text-white">Male</option>
                <option value="female" className="bg-slate-900 text-white">Female</option>
                <option value="other" className="bg-slate-900 text-white">Other</option>
              </select>
            </div>
          </div>

          {/* Password & DOB */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-emerald-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={signupData.password}
                  onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                  className="w-full pl-10 pr-10 py-3 bg-slate-950/80 border border-white/15 rounded-2xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all placeholder-slate-500"
                  placeholder="At least 6 chars"
                  required
                  minLength="6"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Date of Birth
              </label>
              <input
                type="date"
                value={signupData.date_of_birth}
                onChange={(e) => setSignupData({ ...signupData, date_of_birth: e.target.value })}
                className="w-full px-4 py-3 bg-slate-950/80 border border-white/15 rounded-2xl text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all"
                required
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Residential Address
            </label>
            <textarea
              value={signupData.address}
              onChange={(e) => setSignupData({ ...signupData, address: e.target.value })}
              className="w-full p-3.5 bg-slate-950/80 border border-white/15 rounded-2xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all resize-none placeholder-slate-500"
              rows="2"
              placeholder="Enter full street address"
              required
            />
          </div>

          <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-2xl text-xs text-emerald-300">
            <strong>Note:</strong> Practitioner and administrator logins are granted by the portal administrator.
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-emerald-500/25 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <span>Create Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-white/10 text-center">
          <p className="text-xs text-slate-400">
            Already have an account?{" "}
            <button
              onClick={() => navigate("/login")}
              className="text-emerald-400 hover:text-emerald-300 font-bold ml-1 cursor-pointer"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
