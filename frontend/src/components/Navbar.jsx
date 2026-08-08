import { useState, useEffect, useContext } from "react";
import { User, Heart, ChevronDown, LogOut, Sparkles, Activity } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { appContext } from "../context/AppContext";
import toast from "react-hot-toast";

export default function HealthHubNavbar() {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const navigate = useNavigate();
  const { token, setToken, setUserData, setRole, userData, role } = useContext(appContext);

  const isLoggedIn = !!token;
  const portalLabel = role === 'doctor' ? 'Doctor Suite' : role === 'admin' ? 'Admin Suite' : 'Patient Portal';
  const portalHomePath = role === 'doctor' ? '/doctor' : role === 'admin' ? '/admin' : '/patient';

  const handleLogout = () => {
    setShowUserDropdown(false);
    setToken(null);
    setUserData(false);
    setRole(false);
    localStorage.removeItem("token");
    toast.success("Logged out successfully");
    navigate("/");
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserDropdown && !event.target.closest(".user-dropdown")) {
        setShowUserDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showUserDropdown]);

  return (
    <nav className="bg-slate-950 text-white border-b border-white/10 shadow-xl sticky top-0 z-50 backdrop-blur-md bg-slate-950/90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Left Side - Logo */}
          <div 
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={() => navigate(isLoggedIn ? portalHomePath : "/")}
          >
            <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 via-cyan-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-transform">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-blue-200 bg-clip-text text-transparent">
                HealthHub
              </span>
              <span className="block text-[10px] text-cyan-400 font-bold uppercase tracking-widest -mt-1">
                {portalLabel}
              </span>
            </div>
          </div>

          {/* Right Side - Auth Buttons or User Dropdown */}
          <div className="flex items-center">
            {!isLoggedIn ? (
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => navigate("/login")}
                  className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all border border-slate-700"
                >
                  Log In
                </button>
                <button
                  onClick={() => navigate("/signup")}
                  className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-md shadow-blue-500/20"
                >
                  Create Account
                </button>
              </div>
            ) : (
              <div className="relative user-dropdown">
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center space-x-3 bg-slate-900/80 hover:bg-slate-800 px-3.5 py-1.5 rounded-2xl border border-white/10 transition-all shadow-md"
                >
                  <img
                    src={
                      userData?.image ||
                      "https://ik.imagekit.io/1cfpxrwuh/uploads/vecteezy_user-icon-in-trendy-flat-style-isolated-on-grey-background_5005788-1_WlaUa49y1.jpg?updatedAt=1750169081764"
                    }
                    alt={userData?.name || "User"}
                    className="h-8 w-8 rounded-xl object-cover ring-2 ring-blue-500/30"
                  />
                  <div className="text-left hidden sm:block">
                    <span className="block text-xs font-bold text-slate-100">
                      {userData?.name || "User Account"}
                    </span>
                    <span className="block text-[10px] text-cyan-400 font-medium">
                      {portalLabel}
                    </span>
                  </div>
                  <ChevronDown
                    className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${
                      showUserDropdown ? "rotate-180 text-cyan-400" : ""
                    }`}
                  />
                </button>

                {/* Dropdown Menu */}
                {showUserDropdown && (
                  <div className="absolute right-0 mt-2 w-52 bg-slate-900 rounded-2xl shadow-2xl py-2 z-50 border border-white/10 backdrop-blur-xl">
                    <div className="px-4 py-2 border-b border-white/10 sm:hidden">
                      <p className="text-xs font-bold text-white">{userData?.name}</p>
                      <p className="text-[10px] text-slate-400">{userData?.email}</p>
                    </div>

                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2.5 text-xs font-bold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors flex items-center space-x-2"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Log Out of Account</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
}
