import React, { useState, useRef, useContext } from "react";
import axios from "axios";
import {
  User,
  Save,
  X,
  Camera,
  Phone,
  Mail,
  MapPin,
  Award,
  BookOpen,
  DollarSign,
  Stethoscope,
  Eye,
  EyeOff,
  UserPlus,
  Sparkles,
  Loader2
} from "lucide-react";
import toast from "react-hot-toast";
import { appContext } from "../../context/AppContext";

const AddDoctor = () => {
  const { token } = useContext(appContext);
  
  const [doctorData, setDoctorData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    gender: "male",
    specialization: "",
    qualification: "",
    address: "",
    about: "",
    experience_years: 0,
    consultation_fee: 500,
    is_available: true,
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);

  const specializations = [
    'General Physician', 
    'Cardiologist', 
    'Dermatologist', 
    'Gynecologist', 
    'Pediatrician', 
    'Ophthalmologist', 
    'Dentist', 
    'Gastroenterologist'
  ];

  const handleInputChange = (field, value) => {
    setDoctorData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const handleImageSelect = (file) => {
    if (file && file.type.startsWith("image/")) {
      if (file.size > 10 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          image: "Image size should be less than 10MB",
        }));
        return;
      }

      setSelectedImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    handleImageSelect(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    setSelectedImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!doctorData.name.trim()) newErrors.name = "Doctor name is required";
    if (!doctorData.email.trim()) newErrors.email = "Email is required";
    if (doctorData.password.length < 6) newErrors.password = "Password must be at least 6 characters";
    if (!doctorData.phone.trim()) newErrors.phone = "Phone number is required";
    if (!doctorData.specialization.trim()) newErrors.specialization = "Specialization is required";
    if (!doctorData.qualification.trim()) newErrors.qualification = "Qualification is required";
    if (!doctorData.address.trim()) newErrors.address = "Practice address is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();

      if (selectedImageFile) {
        formData.append("file", selectedImageFile);
      }

      Object.entries(doctorData).forEach(([key, value]) => {
        formData.append(key, value);
      });
      formData.append("role", "doctor");

      const response = await axios.post(`${import.meta.env.VITE_API_URL}/user/register`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          token
        },
      });

      if (response.data.success) {
        toast.success("Doctor registered successfully!");
        setDoctorData({
          name: "",
          email: "",
          password: "",
          phone: "",
          gender: "male",
          specialization: "",
          qualification: "",
          address: "",
          about: "",
          experience_years: 0,
          consultation_fee: 500,
          is_available: true,
        });
        removeImage();
      } else {
        toast.error(response.data.message || "Registration failed.");
      }
    } catch (error) {
      console.error("Add doctor failed:", error);
      toast.error(error.response?.data?.message || "Registration failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden rounded-3xl border border-white/10 shadow-2xl my-2 p-6 sm:p-10">
      {/* Background Mesh Gradients */}
      <div className="absolute top-0 left-10 w-96 h-96 bg-purple-500/15 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-500/15 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-4xl mx-auto relative z-10">

        {/* Page Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-400/30 text-purple-300 text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Admin Control Panel</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Add New Doctor
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Register a new specialist practitioner to the HealthHub medical roster.
          </p>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="bg-slate-900/90 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/15 p-8 sm:p-10 space-y-8">
          
          {/* Doctor Photo Section */}
          <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-white/10">
            <div className="relative group">
              <img
                src={imagePreview || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&h=200&fit=crop'}
                alt="Doctor Avatar"
                className="w-32 h-40 rounded-3xl object-cover shadow-2xl border-4 border-slate-950 bg-slate-950"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-slate-950/80 rounded-3xl flex flex-col items-center justify-center text-purple-300 cursor-pointer opacity-90 hover:opacity-100 transition-opacity"
              >
                <Camera className="w-7 h-7 mb-1" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Upload Photo</span>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>

            <div className="space-y-1 text-center sm:text-left">
              <h3 className="text-lg font-bold text-white">Doctor Profile Picture</h3>
              <p className="text-xs text-slate-400">
                Upload a professional portrait photo (JPG/PNG under 10MB).
              </p>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* Doctor Name */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Full Name *
              </label>
              <input
                type="text"
                value={doctorData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Dr. John Doe"
                className="w-full p-3.5 bg-slate-950/80 border border-white/15 rounded-2xl text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-400"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Email Address *
              </label>
              <input
                type="email"
                value={doctorData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="doctor@healthhub.com"
                className="w-full p-3.5 bg-slate-950/80 border border-white/15 rounded-2xl text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-400"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Password *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={doctorData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full p-3.5 pr-10 bg-slate-950/80 border border-white/15 rounded-2xl text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-400"
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

            {/* Phone */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                value={doctorData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full p-3.5 bg-slate-950/80 border border-white/15 rounded-2xl text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-400"
                required
              />
            </div>

            {/* Specialization */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Specialization *
              </label>
              <select
                value={doctorData.specialization}
                onChange={(e) => handleInputChange("specialization", e.target.value)}
                className="w-full p-3.5 bg-slate-950/80 border border-white/15 rounded-2xl text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-400"
                required
              >
                <option value="" className="bg-slate-900 text-white">Select Specialty</option>
                {specializations.map(spec => (
                  <option key={spec} value={spec} className="bg-slate-900 text-white">{spec}</option>
                ))}
              </select>
            </div>

            {/* Qualification */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Qualification *
              </label>
              <input
                type="text"
                value={doctorData.qualification}
                onChange={(e) => handleInputChange("qualification", e.target.value)}
                placeholder="MBBS, MD, FRCS"
                className="w-full p-3.5 bg-slate-950/80 border border-white/15 rounded-2xl text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-400"
                required
              />
            </div>

            {/* Consultation Fee */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Consultation Fee (₹) *
              </label>
              <input
                type="number"
                value={doctorData.consultation_fee}
                onChange={(e) => handleInputChange("consultation_fee", Number(e.target.value))}
                className="w-full p-3.5 bg-slate-950/80 border border-white/15 rounded-2xl text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-400"
                required
              />
            </div>

            {/* Experience Years */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Experience (Years) *
              </label>
              <input
                type="number"
                value={doctorData.experience_years}
                onChange={(e) => handleInputChange("experience_years", Number(e.target.value))}
                className="w-full p-3.5 bg-slate-950/80 border border-white/15 rounded-2xl text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-400"
                required
              />
            </div>

            {/* Address */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Clinic / Hospital Address *
              </label>
              <textarea
                value={doctorData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                placeholder="Enter full clinic location address..."
                className="w-full p-3.5 bg-slate-950/80 border border-white/15 rounded-2xl text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-400 h-24 resize-none"
                required
              />
            </div>

            {/* About */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Doctor Biography & Summary
              </label>
              <textarea
                value={doctorData.about}
                onChange={(e) => handleInputChange("about", e.target.value)}
                placeholder="Write a brief medical bio..."
                className="w-full p-3.5 bg-slate-950/80 border border-white/15 rounded-2xl text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-400 h-28 resize-none"
              />
            </div>

          </div>

          {/* Submit Action */}
          <div className="pt-4 border-t border-white/10 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold px-8 py-4 rounded-2xl shadow-lg shadow-purple-500/25 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2 text-sm"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Registering Doctor...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Register Doctor Account</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

export default AddDoctor;
