import React, { useState, useContext } from 'react';
import { Eye, EyeOff, User, Mail, Lock, Key, Activity, Sparkles, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { appContext } from '../context/AppContext';

const Login = () => {
  const [mode, setMode] = useState('login'); // 'login' | 'forgot' | 'reset'
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setToken } = useContext(appContext);

  // Login form state
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });

  // Forgot / Reset states
  const [forgotEmail, setForgotEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetToken, setResetToken] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/user/login`, loginData);
      const data = response.data;
      if (data.success && data.token) {
        toast.success('Login successful!');
        localStorage.setItem('token', data.token);
        setToken(data.token);
        const role = data.role;
        const paths = {
          admin: '/admin',
          doctor: '/doctor',
          patient: '/patient'
        };
        setTimeout(() => {
          navigate(paths[role] || '/');
        }, 1000);
      } else {
        toast.error(data.message || 'Login failed. Please try again.');
      }
    } catch (error) {
      toast.error(error.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/user/forgot-password`, { email: forgotEmail });
      const data = response.data;
      if (data.success) {
        toast.success('OTP sent to your email!');
        setResetToken(data.resetToken);
        setMode('reset');
      } else {
        toast.error(data.message || 'Failed to send OTP.');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/user/reset-password`, {
        otp,
        newPassword,
        resetToken
      });
      const data = response.data;
      if (data.success) {
        toast.success('Password reset successful! Please log in.');
        setForgotEmail('');
        setOtp('');
        setNewPassword('');
        setConfirmPassword('');
        setResetToken('');
        setMode('login');
      } else {
        toast.error(data.message || 'Failed to reset password.');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Dynamic Glow Spheres */}
      <div className="absolute top-10 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="bg-slate-900/90 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/15 w-full max-w-md p-8 sm:p-10 relative z-10">
        
        {/* Brand Header Icon */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-tr from-blue-600 to-cyan-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/30 mb-3">
            <Activity className="w-8 h-8" />
          </div>
          <span className="text-2xl font-extrabold bg-gradient-to-r from-white via-slate-100 to-blue-200 bg-clip-text text-transparent">
            HealthHub
          </span>
          <p className="text-xs text-cyan-400 font-semibold uppercase tracking-wider mt-0.5">
            {mode === 'login' ? 'Patient & Practitioner Portal' : mode === 'forgot' ? 'Account Recovery' : 'Reset Credentials'}
          </p>
        </div>

        {/* Header Titles */}
        {mode === 'login' && (
          <div className="text-center mb-6">
            <h1 className="text-2xl font-extrabold text-white">Welcome Back</h1>
            <p className="text-slate-400 text-xs mt-1">Sign in to your HealthHub account</p>
          </div>
        )}

        {mode === 'forgot' && (
          <div className="text-center mb-6">
            <h1 className="text-2xl font-extrabold text-white">Forgot Password</h1>
            <p className="text-slate-400 text-xs mt-1">Enter your registered email to receive a 6-digit OTP code</p>
          </div>
        )}

        {mode === 'reset' && (
          <div className="text-center mb-6">
            <h1 className="text-2xl font-extrabold text-white">Reset Password</h1>
            <p className="text-slate-400 text-xs mt-1">Enter verification code and set your new password</p>
          </div>
        )}

        {/* 1. Login Form */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-cyan-400" />
                <input
                  type="email"
                  value={loginData.email}
                  onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-white/15 rounded-2xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all placeholder-slate-500"
                  placeholder="name@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Password</label>
                <button
                  type="button"
                  onClick={() => setMode('forgot')}
                  className="text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-cyan-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={loginData.password}
                  onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                  className="w-full pl-10 pr-12 py-3 bg-slate-950/80 border border-white/15 rounded-2xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all placeholder-slate-500"
                  placeholder="Enter password"
                  required
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

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-blue-500/25 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* 2. Forgot Password Form */}
        {mode === 'forgot' && (
          <form onSubmit={handleForgotPassword} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Registered Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-cyan-400" />
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-white/15 rounded-2xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all placeholder-slate-500"
                  placeholder="name@example.com"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-blue-500/25 transition-all cursor-pointer disabled:opacity-50 text-sm"
            >
              {loading ? 'Sending Verification Code...' : 'Send OTP Code'}
            </button>

            <button
              type="button"
              onClick={() => setMode('login')}
              className="w-full text-center text-xs font-semibold text-slate-400 hover:text-white transition-colors py-1"
            >
              Back to Sign In
            </button>
          </form>
        )}

        {/* 3. Reset Password Form */}
        {mode === 'reset' && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">6-Digit OTP Code</label>
              <div className="relative">
                <Key className="absolute left-3.5 top-3.5 w-4 h-4 text-cyan-400" />
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-white/15 rounded-2xl text-white text-sm font-bold tracking-widest text-center focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  placeholder="123456"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-cyan-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 bg-slate-950/80 border border-white/15 rounded-2xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  placeholder="At least 6 characters"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Confirm New Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-cyan-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 bg-slate-950/80 border border-white/15 rounded-2xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  placeholder="Repeat new password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-blue-500/25 transition-all cursor-pointer disabled:opacity-50 text-sm"
            >
              {loading ? 'Resetting Password...' : 'Reset Password'}
            </button>

            <button
              type="button"
              onClick={() => setMode('login')}
              className="w-full text-center text-xs font-semibold text-slate-400 hover:text-white transition-colors py-1"
            >
              Cancel & Back to Sign In
            </button>
          </form>
        )}

        {/* Footer Navigation */}
        {mode === 'login' && (
          <div className="mt-8 pt-6 border-t border-white/10 text-center space-y-2">
            <p className="text-xs text-slate-400">
              Don't have a patient account?{' '}
              <button
                onClick={() => navigate('/signup')}
                className="text-cyan-400 hover:text-cyan-300 font-bold ml-1 cursor-pointer underline"
              >
                Sign up here
              </button>
            </p>
            <p className="text-xs text-slate-400">
              Are you a doctor looking to join?{' '}
              <button
                onClick={() => navigate('/doctor-signup')}
                className="text-cyan-400 hover:text-cyan-300 font-bold ml-1 cursor-pointer underline"
              >
                Apply to register
              </button>
            </p>
          </div>
        )}

      </div>
    </div>
  );
};

export default Login;