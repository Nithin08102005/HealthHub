import React, { useEffect, useState, useRef, useContext } from "react";
import {
  User,
  Edit2,
  Save,
  X,
  Camera,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Users,
  Image,
  Loader2,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Upload
} from "lucide-react";
import { appContext } from "../../context/AppContext";
import axios from "axios";
import toast from "react-hot-toast";

const MyProfile = () => {
  const { userData, token, setUserData } = useContext(appContext);

  const [patientData, setPatientData] = useState({
    name: "",
    email: "",
    phone: "",
    gender: "",
    date_of_birth: "",
    address: "",
    profileImage:
      "https://ik.imagekit.io/1cfpxrwuh/uploads/vecteezy_user-icon-in-trendy-flat-style-isolated-on-grey-background_5005788-1_WlaUa49y1.jpg?updatedAt=1750169081764",
  });

  useEffect(() => {
    if (userData) {
      setPatientData({
        name: userData.name || "",
        email: userData.email || "",
        phone: userData.phone || "",
        gender: userData.gender || "",
        date_of_birth: userData.date_of_birth || "",
        address: userData.address || "",
        profileImage: userData.image || patientData.profileImage,
      });
    }
  }, [userData]);

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ ...patientData });
  const [imagePreview, setImagePreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const fileInputRef = useRef(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setEditData({ ...patientData });
  }, [patientData]);

  const handleInputChange = (field, value) => {
    setEditData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImageSelect = (file) => {
    if (file && file.type.startsWith("image/")) {
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

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const formData = new FormData();

      if (selectedImageFile) {
        formData.append("file", selectedImageFile);
      }

      Object.entries(editData).forEach(([key, value]) => {
        if (key !== "profileImage") {
          formData.append(key, value);
        }
      });

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/user/updateUserDetails`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            token,
          },
        }
      );

      if (response.data.success) {
        setPatientData({ ...editData });
        if (response.data.data.imageUrl) {
          setPatientData((prev) => ({
            ...prev,
            profileImage: response.data.data.imageUrl,
          }));
          setUserData((prev) => ({
            ...prev,
            ...editData,
            image: response.data.data.imageUrl,
          }));
        } else if (imagePreview) {
          setPatientData((prev) => ({
            ...prev,
            profileImage: imagePreview,
          }));
        }

        setIsEditing(false);
        setImagePreview(null);
        setSelectedImageFile(null);

        toast.success("Profile updated successfully!");
      } else {
        throw new Error(response.data.message || "Update failed");
      }
    } catch (error) {
      console.error("Profile update failed:", error);
      toast.error(
        "Profile update failed: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditData({ ...patientData });
    setIsEditing(false);
    setImagePreview(null);
    setSelectedImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not Provided";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const calculateAge = (date_of_birth) => {
    if (!date_of_birth) return null;
    const today = new Date();
    const birthDate = new Date(date_of_birth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden rounded-3xl border border-white/10 shadow-2xl my-2 p-6 sm:p-10">
      {/* Background Mesh Gradients */}
      <div className="absolute top-0 right-10 w-96 h-96 bg-blue-500/15 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-indigo-500/15 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-4xl mx-auto relative z-10">

        {/* Page Title */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-xs font-semibold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Personal Account Center</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              My Patient Profile
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Keep your contact information and personal details updated for seamless consultations.
            </p>
          </div>

          <div>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold px-5 py-2.5 rounded-2xl shadow-lg shadow-blue-500/25 transition-all flex items-center gap-2 text-sm cursor-pointer"
              >
                <Edit2 className="w-4 h-4" />
                <span>Edit Profile</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-4 py-2.5 rounded-2xl transition-all text-sm flex items-center gap-1.5 border border-white/10 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                  <span>Cancel</span>
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold px-5 py-2.5 rounded-2xl shadow-lg shadow-emerald-500/25 transition-all flex items-center gap-2 text-sm cursor-pointer"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Profile Card Container */}
        <div className="bg-slate-900/90 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/15 p-8 sm:p-10 space-y-10">

          {/* Avatar Banner Header */}
          <div className="flex flex-col sm:flex-row items-center gap-8 pb-8 border-b border-white/10">
            <div className="relative group">
              <img
                src={imagePreview || patientData.profileImage}
                alt={patientData.name || "Patient Avatar"}
                className="w-32 h-32 rounded-3xl object-cover shadow-2xl border-4 border-slate-950 bg-slate-950"
              />

              {isEditing && (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-slate-950/80 rounded-3xl flex flex-col items-center justify-center text-cyan-300 cursor-pointer opacity-90 hover:opacity-100 transition-opacity"
                >
                  <Camera className="w-7 h-7 mb-1" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Change Photo</span>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>

            <div className="text-center sm:text-left space-y-2">
              <div className="inline-flex items-center gap-1.5 bg-emerald-500/15 text-emerald-300 px-3 py-1 rounded-full text-xs font-bold border border-emerald-500/30">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Verified Patient Account</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                {patientData.name || "Unnamed Patient"}
              </h2>
              <p className="text-slate-400 text-sm">
                {patientData.email || "No email registered"}
              </p>
              {patientData.date_of_birth && (
                <p className="text-xs text-slate-400 font-medium">
                  Age: {calculateAge(patientData.date_of_birth)} years old
                </p>
              )}
            </div>
          </div>

          {/* Form Fields Section */}
          <div className="space-y-8">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <User className="w-5 h-5 text-cyan-400" />
              <span>Personal Information</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Full Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="w-full p-3.5 bg-slate-950/80 border border-white/15 rounded-2xl text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  />
                ) : (
                  <p className="p-3.5 bg-slate-950/60 rounded-2xl text-white text-sm font-semibold border border-white/10">
                    {patientData.name || "Not Provided"}
                  </p>
                )}
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <p className="p-3.5 bg-slate-950/40 rounded-2xl text-slate-400 text-sm font-semibold border border-white/5 cursor-not-allowed">
                  {patientData.email || "Not Provided"} (Account Email)
                </p>
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Phone Number
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full p-3.5 bg-slate-950/80 border border-white/15 rounded-2xl text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  />
                ) : (
                  <p className="p-3.5 bg-slate-950/60 rounded-2xl text-white text-sm font-semibold border border-white/10 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-cyan-400" />
                    <span>{patientData.phone || "Not Provided"}</span>
                  </p>
                )}
              </div>

              {/* Gender */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Gender
                </label>
                {isEditing ? (
                  <select
                    value={editData.gender}
                    onChange={(e) => handleInputChange("gender", e.target.value)}
                    className="w-full p-3.5 bg-slate-950/80 border border-white/15 rounded-2xl text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  >
                    <option value="" className="bg-slate-900 text-white">Select Gender</option>
                    <option value="Male" className="bg-slate-900 text-white">Male</option>
                    <option value="Female" className="bg-slate-900 text-white">Female</option>
                    <option value="Other" className="bg-slate-900 text-white">Other</option>
                  </select>
                ) : (
                  <p className="p-3.5 bg-slate-950/60 rounded-2xl text-white text-sm font-semibold border border-white/10">
                    {patientData.gender || "Not Specified"}
                  </p>
                )}
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Date of Birth
                </label>
                {isEditing ? (
                  <input
                    type="date"
                    value={editData.date_of_birth}
                    onChange={(e) => handleInputChange("date_of_birth", e.target.value)}
                    className="w-full p-3.5 bg-slate-950/80 border border-white/15 rounded-2xl text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  />
                ) : (
                  <p className="p-3.5 bg-slate-950/60 rounded-2xl text-white text-sm font-semibold border border-white/10 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-cyan-400" />
                    <span>{formatDate(patientData.date_of_birth)}</span>
                  </p>
                )}
              </div>

              {/* Residential Address */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Residential Address
                </label>
                {isEditing ? (
                  <textarea
                    value={editData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    placeholder="Enter street, city, state, and pin code..."
                    className="w-full p-3.5 bg-slate-950/80 border border-white/15 rounded-2xl text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-cyan-400 h-24 resize-none"
                  />
                ) : (
                  <p className="p-3.5 bg-slate-950/60 rounded-2xl text-white text-sm font-semibold border border-white/10 flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                    <span>{patientData.address || "No address on record"}</span>
                  </p>
                )}
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default MyProfile;
