import { useState, useEffect, useContext } from "react";
import { User, Heart, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { appContext } from "../context/AppContext";
import toast from "react-hot-toast";
export default function HealthHubNavbar() {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const navigate = useNavigate();
  const { token, setToken, setUserData, setRole, userData } =
    useContext(appContext);

  // Use token from context to determine login state
  const isLoggedIn = !!token;

  const handleLogout = () => {
    setShowUserDropdown(false);
    // Clear token from context
    setToken(null);
    setUserData(false); // Clear user data from context
    setRole(false);
    // Also remove from localStorage if you're syncing them
    localStorage.removeItem("token");
    toast.success("Logged out successfully");
    navigate("/"); // Redirect to login page
  };

  // Close dropdown when clicking outside
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
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-10xl mx-auto  sm:px-6 ">
        <div className="flex justify-between items-center h-16">
          {/* Left Side - Logo/Title with Icon */}
          <div className="flex items-center space-x-2">
            <Heart className="h-8 w-8 text-red-500" />
            <h1 className="text-2xl font-bold text-gray-800">HealthHub</h1>
          </div>


          {/* Right Side - Auth Buttons or User Menu */}
          <div className="flex items-center">
            {!isLoggedIn ? (
              <div className="flex space-x-3">
                <button
                  onClick={() => navigate("/login")}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate("/signup")}
                  className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                  Sign Up
                </button>
              </div>
            ) : (
              <div className="relative user-dropdown">
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center space-x-2 bg-white hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 border border-gray-200 shadow-sm"
                >
                  <div className="rounded-full">
                    <img
                      src={
                        userData?.image ||
                        "https://ik.imagekit.io/1cfpxrwuh/uploads/vecteezy_user-icon-in-trendy-flat-style-isolated-on-grey-background_5005788-1_WlaUa49y1.jpg?updatedAt=1750169081764"
                      }
                      alt="User Profile"
                      className="h-9 w-9 rounded-full object-cover"
                      style={{ imageRendering: "crisp-edges" }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-800">
                    {userData?.name}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 text-gray-600 transition-transform duration-200 ${
                      showUserDropdown ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Dropdown Menu */}
                {showUserDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50 border border-gray-200">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200 flex items-center space-x-2"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                      <span>Logout</span>
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
