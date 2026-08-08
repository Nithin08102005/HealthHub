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
  Award,
  BookOpen,
  DollarSign,
  Clock,
  CheckCircle2,
  Stethoscope,
  Loader2,
  Sparkles,
  ShieldCheck,
  Building
} from "lucide-react";
import { appContext } from "../../context/AppContext";
import axios from "axios";
import toast from "react-hot-toast";

const MyProfile = () => {
  const { userData, token, setUserData } = useContext(appContext);

  const [doctorData, setDoctorData] = useState({
    name: "",
    email: "",
    phone: "",
    gender: "",
    specialization: "",
    qualification: "",
    address: "",
    about: "",
    experience_years: 0,
    consultation_fee: 0,
    is_available: true,
    profileImage:
      "https://ik.imagekit.io/1cfpxrwuh/uploads/vecteezy_user-icon-in-trendy-flat-style-isolated-on-grey-background_5005788-1_WlaUa49y1.jpg?updatedAt=1750169081764",
  });

  useEffect(() => {
    if (userData) {
      setDoctorData({
        name: userData.name || "",
        email: userData.email || "",
        phone: userData.phone || "",
        gender: userData.gender || "",
        address: userData.address || "",
        specialization: userData.specialization || "",
        qualification: userData.qualification || "",
        about: userData.about || "",
        experience_years: userData.experience_years || 0,
        consultation_fee: userData.consultation_fee || 0,
        is_available: userData.is_available ?? true,
        profileImage: userData.image || doctorData.profileImage,
      });
    }
  }, [userData]);

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ ...doctorData });
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const fileInputRef = useRef(null);
  const [isSaving, setIsSaving] = useState(false);

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

  useEffect(() => {
    setEditData({ ...doctorData });
  }, [doctorData]);

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
        setDoctorData({ ...editData });

        if (response.data.data.imageUrl) {
          setDoctorData((prev) => ({
            ...prev,
            profileImage: response.data.data.imageUrl,
          }));
          setUserData((prev) => ({
            ...prev,
            ...editData,
            image: response.data.data.imageUrl,
          }));
        } else if (imagePreview) {
          setDoctorData((prev) => ({
            ...prev,
            profileImage: imagePreview,
          }));
        }

        setIsEditing(false);
        setImagePreview(null);
        setSelectedImageFile(null);
        toast.success("Doctor Profile updated successfully!");
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
    setEditData({ ...doctorData });
    setIsEditing(false);
    setImagePreview(null);
    setSelectedImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden rounded-3xl border border-white/10 shadow-2xl my-2 p-6 sm:p-10">
      {/* Background Mesh Gradients */}
      <div className="absolute top-0 right-10 w-96 h-96 bg-emerald-500/15 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-teal-500/15 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-4xl mx-auto relative z-10">

        {/* Page Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-400/30 text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Doctor Settings & Profile</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              My Practice Profile
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Manage your consultation fees, experience, qualifications, and clinic availability.
            </p>
          </div>

          <div>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold px-5 py-2.5 rounded-2xl shadow-lg shadow-emerald-500/25 transition-all flex items-center gap-2 text-sm cursor-pointer"
              >
                <Edit2 className="w-4 h-4" />
                <span>Edit Practice Info</span>
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

          {/* Doctor Header Banner */}
          <div className="flex flex-col sm:flex-row items-center gap-8 pb-8 border-b border-white/10">
            <div className="relative group">
              <img
                src={imagePreview || doctorData.profileImage}
                alt={doctorData.name || "Doctor Avatar"}
                className="w-36 h-44 rounded-3xl object-cover shadow-2xl border-4 border-slate-950 bg-slate-950"
              />

              {isEditing && (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-slate-950/80 rounded-3xl flex flex-col items-center justify-center text-emerald-300 cursor-pointer opacity-90 hover:opacity-100 transition-opacity"
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

            <div className="text-center sm:text-left space-y-3 flex-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="bg-emerald-500/15 text-emerald-300 px-3 py-1 rounded-full text-xs font-bold border border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Verified Medical Practitioner</span>
                </span>
                <span className="bg-cyan-500/15 text-cyan-300 px-3 py-1 rounded-full text-xs font-bold border border-cyan-500/30">
                  {doctorData.specialization || "General Physician"}
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                Dr. {doctorData.name || "Doctor"}
              </h2>

              <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10">
                <span className="text-xs text-slate-300 font-medium uppercase tracking-wider">
                  Consultation Fee:
                </span>
                <span className="text-xl font-extrabold text-emerald-400">
                  ₹{doctorData.consultation_fee}
                </span>
              </div>
            </div>
          </div>

          {/* Form Fields Section */}
          <div className="space-y-8">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-emerald-400" />
              <span>Practice Details & Pricing</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Doctor Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="w-full p-3.5 bg-slate-950/80 border border-white/15 rounded-2xl text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                ) : (
                  <p className="p-3.5 bg-slate-950/60 rounded-2xl text-white text-sm font-semibold border border-white/10">
                    Dr. {doctorData.name || "Not Provided"}
                  </p>
                )}
              </div>

              {/* Specialization */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Specialization
                </label>
                {isEditing ? (
                  <select
                    value={editData.specialization}
                    onChange={(e) => handleInputChange("specialization", e.target.value)}
                    className="w-full p-3.5 bg-slate-950/80 border border-white/15 rounded-2xl text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  >
                    <option value="" className="bg-slate-900 text-white">Select Specialty</option>
                    {specializations.map(spec => (
                      <option key={spec} value={spec} className="bg-slate-900 text-white">{spec}</option>
                    ))}
                  </select>
                ) : (
                  <p className="p-3.5 bg-slate-950/60 rounded-2xl text-white text-sm font-semibold border border-white/10">
                    {doctorData.specialization || "General Physician"}
                  </p>
                )}
              </div>

              {/* Consultation Fee */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Consultation Fee (₹)
                </label>
                {isEditing ? (
                  <input
                    type="number"
                    value={editData.consultation_fee}
                    onChange={(e) => handleInputChange("consultation_fee", Number(e.target.value))}
                    className="w-full p-3.5 bg-slate-950/80 border border-white/15 rounded-2xl text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                ) : (
                  <p className="p-3.5 bg-slate-950/60 rounded-2xl text-emerald-400 text-sm font-extrabold border border-white/10">
                    ₹{doctorData.consultation_fee}
                  </p>
                )}
              </div>

              {/* Experience Years */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Experience (Years)
                </label>
                {isEditing ? (
                  <input
                    type="number"
                    value={editData.experience_years}
                    onChange={(e) => handleInputChange("experience_years", Number(e.target.value))}
                    className="w-full p-3.5 bg-slate-950/80 border border-white/15 rounded-2xl text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                ) : (
                  <p className="p-3.5 bg-slate-950/60 rounded-2xl text-white text-sm font-semibold border border-white/10 flex items-center gap-2">
                    <Award className="w-4 h-4 text-emerald-400" />
                    <span>{doctorData.experience_years} years practice</span>
                  </p>
                )}
              </div>

              {/* Qualification */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Qualification
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.qualification}
                    onChange={(e) => handleInputChange("qualification", e.target.value)}
                    placeholder="e.g. MBBS, MD, FRCS"
                    className="w-full p-3.5 bg-slate-950/80 border border-white/15 rounded-2xl text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                ) : (
                  <p className="p-3.5 bg-slate-950/60 rounded-2xl text-white text-sm font-semibold border border-white/10 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-emerald-400" />
                    <span>{doctorData.qualification || "MBBS"}</span>
                  </p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Contact Phone
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className="w-full p-3.5 bg-slate-950/80 border border-white/15 rounded-2xl text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                ) : (
                  <p className="p-3.5 bg-slate-950/60 rounded-2xl text-white text-sm font-semibold border border-white/10 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-emerald-400" />
                    <span>{doctorData.phone || "Not Provided"}</span>
                  </p>
                )}
              </div>

              {/* Address */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Clinic Location / Address
                </label>
                {isEditing ? (
                  <textarea
                    value={editData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    placeholder="Enter clinic or hospital address..."
                    className="w-full p-3.5 bg-slate-950/80 border border-white/15 rounded-2xl text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-400 h-24 resize-none"
                  />
                ) : (
                  <p className="p-3.5 bg-slate-950/60 rounded-2xl text-white text-sm font-semibold border border-white/10 flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span>{doctorData.address || "No address on record"}</span>
                  </p>
                )}
              </div>

              {/* About / Bio */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Medical Biography & About
                </label>
                {isEditing ? (
                  <textarea
                    value={editData.about}
                    onChange={(e) => handleInputChange("about", e.target.value)}
                    placeholder="Write a brief description of your medical background..."
                    className="w-full p-3.5 bg-slate-950/80 border border-white/15 rounded-2xl text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-400 h-32 resize-none"
                  />
                ) : (
                  <p className="p-3.5 bg-slate-950/60 rounded-2xl text-slate-300 text-sm font-normal border border-white/10 leading-relaxed">
                    {doctorData.about || "No biography provided yet."}
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
