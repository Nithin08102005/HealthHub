import React, { useEffect, useState, useRef } from "react";
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
  Users,
  Image,
  Loader,
  BookOpen,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  Stethoscope,
} from "lucide-react";
import { useContext } from "react";
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
        is_available: userData.is_available || true,
        profileImage: userData.image || doctorData.profileImage,
      });
    }
  }, [userData]);

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ ...doctorData });
  const [imagePreview, setImagePreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const fileInputRef = useRef(null);
  const [isSaving, setIsSaving] = useState(false);

  // Update editData when doctorData changes
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

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleImageSelect(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    setSelectedImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
        const formData = new FormData();

        if (selectedImageFile) {
        formData.append("file", selectedImageFile); // 'file' matches your upload.single('file')
      }

       Object.entries(editData).forEach(([key, value]) => {
        if (key !== "profileImage") {
          // Exclude image since it's separately handled
          formData.append(key, value);
        }
      });

        const response = await axios.post(
        "http://localhost:3000/user/updateUserDetails",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            token,
          },
        }
      );

        if(response.data.success){
             setDoctorData({ ...editData });
              
              if (response.data.data.imageUrl) {
          setDoctorData((prev) => ({
            ...prev,
            profileImage: response.data.data.imageUrl,
          }));
          setUserData(() => ({
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
        toast.success("Profile updated successfully!");
        }else {
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
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Stethoscope className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Doctor Profile
                  </h1>
                  <p className="text-gray-600">
                    Manage your professional information
                  </p>
                </div>
              </div>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                  <span>Edit Profile</span>
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className={`flex items-center space-x-2 px-4 py-2 ${
                      isSaving
                        ? "bg-green-400 cursor-not-allowed"
                        : "bg-green-600 hover:bg-green-700"
                    } text-white rounded-lg transition-colors`}
                  >
                    {isSaving ? (
                      <Loader className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    <span>{isSaving ? "Saving..." : "Save"}</span>
                  </button>

                  <button
                    onClick={handleCancel}
                    disabled={isSaving}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    <span>Cancel</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            {/* Profile Header with Image and Basic Info */}
            <div className="flex flex-col lg:flex-row gap-8 mb-8">
              {/* Profile Image Section */}
              <div className="flex flex-col items-center lg:items-start">
                <div className="relative">
                  {isEditing && !imagePreview ? (
                    // Drag and drop area for editing
                    <div
                      className={`w-64 h-80 rounded-lg border-4 border-dashed flex items-center justify-center cursor-pointer transition-all ${
                        isDragging
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-300 bg-gray-50 hover:border-gray-400"
                      }`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <div className="text-center">
                        <Image
                          className={`w-12 h-12 mx-auto mb-2 ${
                            isDragging ? "text-blue-500" : "text-gray-400"
                          }`}
                        />
                        <p className="text-sm text-gray-500">
                          {isDragging ? "Drop here" : "Click or drag"}
                        </p>
                       
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </div>
                  ) : (
                    // Regular image display
                    <div className="w-64 h-80 rounded-lg overflow-hidden border-4 border-white shadow-lg">
                      <img
                        src={imagePreview || doctorData.profileImage}
                        alt="Doctor Profile"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {isEditing && imagePreview && (
                    <button
                      onClick={removeImage}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}

                  {isEditing && (imagePreview || doctorData.profileImage) && (
                    <label className="absolute bottom-2 right-2 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
                      <Camera className="w-5 h-5" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                {isEditing && selectedImageFile && (
                  <div className="mt-2 text-center">
                    <p className="text-sm text-gray-500">
                      {(selectedImageFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                )}
              </div>

              {/* Doctor Basic Info */}
              <div className="flex-1 space-y-4">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    {isEditing ? editData.name : doctorData.name}
                  </h2>
                  <div className="flex items-center space-x-4 text-lg text-gray-600 mb-4">
                    <span className="font-medium">
                      {isEditing
                        ? editData.specialization
                        : doctorData.specialization}
                    </span>
                    <span className="flex items-center">
                      {(
                        isEditing
                          ? editData.is_available
                          : doctorData.is_available
                      ) ? (
                        <>
                          <CheckCircle className="w-5 h-5 text-green-500 mr-1" />
                          Available
                        </>
                      ) : (
                        <>
                          <XCircle className="w-5 h-5 text-red-500 mr-1" />
                          Unavailable
                        </>
                      )}
                    </span>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {isEditing
                        ? editData.experience_years
                        : doctorData.experience_years}
                      +
                    </div>
                    <div className="text-sm text-gray-600">
                      Years Experience
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      $
                      {isEditing
                        ? editData.consultation_fee
                        : doctorData.consultation_fee}
                    </div>
                    <div className="text-sm text-gray-600">
                      Consultation Fee
                    </div>
                  </div>
                  <div className="text-center md:col-span-1 col-span-2">
                    <div className="text-2xl font-bold text-purple-600">
                      4.8★
                    </div>
                    <div className="text-sm text-gray-600">Patient Rating</div>
                  </div>
                </div>

                {/* About Section Preview */}
                <div className="mt-4">
                  <h4 className="font-semibold text-gray-900 mb-2">About</h4>
                  <p className="text-gray-700 text-sm leading-relaxed line-clamp-3">
                    {isEditing ? editData.about : doctorData.about}
                  </p>
                </div>
              </div>
            </div>

            {/* Detailed Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <User className="w-4 h-4 mr-2 text-gray-500" />
                  Full Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your full name"
                  />
                ) : (
                  <p className="text-gray-900 px-3 py-2 bg-gray-50 rounded-lg">
                    {doctorData.name}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <Mail className="w-4 h-4 mr-2 text-gray-500" />
                  Email Address
                </label>
                <div className="relative">
                  <p className="text-gray-900 px-3 py-2 bg-gray-100 rounded-lg">
                    {doctorData.email}
                  </p>
                  {isEditing && (
                    <span className="absolute right-3 top-2 text-xs text-gray-500">
                      Not editable
                    </span>
                  )}
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <Phone className="w-4 h-4 mr-2 text-gray-500" />
                  Phone Number
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={editData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your phone number"
                  />
                ) : (
                  <p className="text-gray-900 px-3 py-2 bg-gray-50 rounded-lg">
                    {doctorData.phone}
                  </p>
                )}
              </div>

              {/* Gender */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <Users className="w-4 h-4 mr-2 text-gray-500" />
                  Gender
                </label>
                {isEditing ? (
                  <select
                    value={editData.gender}
                    onChange={(e) =>
                      handleInputChange("gender", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                ) : (
                  <p className="text-gray-900 px-3 py-2 bg-gray-50 rounded-lg capitalize">
                    {doctorData.gender}
                  </p>
                )}
              </div>

              {/* Specialization */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <Stethoscope className="w-4 h-4 mr-2 text-gray-500" />
                  Specialization
                </label>
                {isEditing ? (
                  <select
                    value={editData.specialization}
                    onChange={(e) =>
                      handleInputChange("specialization", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  >
                    <option value="" disabled>
                      Select your specialization
                    </option>
                    <option value="General Physician">General Physician</option>
                    <option value="Cardiologist">Cardiologist</option>
                    <option value="Dermatologist">Dermatologist</option>
                    <option value="Gynecologist">Gynecologist</option>
                    <option value="Pediatrician">Pediatrician</option>
                    <option value="Ophthalmologist">Ophthalmologist</option>
                    <option value="Dentist">Dentist</option>
                    <option value="Gastroenterologist">
                      Gastroenterologist
                    </option>
                  </select>
                ) : (
                  <p className="text-gray-900 px-3 py-2 bg-gray-50 rounded-lg">
                    {doctorData.specialization}
                  </p>
                )}
              </div>

              {/* Qualification */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <Award className="w-4 h-4 mr-2 text-gray-500" />
                  Qualification
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.qualification}
                    onChange={(e) =>
                      handleInputChange("qualification", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your qualifications"
                  />
                ) : (
                  <p className="text-gray-900 px-3 py-2 bg-gray-50 rounded-lg">
                    {doctorData.qualification}
                  </p>
                )}
              </div>

              {/* Experience Years */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <Clock className="w-4 h-4 mr-2 text-gray-500" />
                  Years of Experience
                </label>
                {isEditing ? (
                  <input
                    type="number"
                    value={editData.experience_years}
                    onChange={(e) =>
                      handleInputChange(
                        "experience_years",
                        parseInt(e.target.value)
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter years of experience"
                    min="0"
                  />
                ) : (
                  <p className="text-gray-900 px-3 py-2 bg-gray-50 rounded-lg">
                    {doctorData.experience_years} years
                  </p>
                )}
              </div>

              {/* Consultation Fee */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <DollarSign className="w-4 h-4 mr-2 text-gray-500" />
                  Consultation Fee
                </label>
                {isEditing ? (
                  <input
                    type="number"
                    value={editData.consultation_fee}
                    onChange={(e) =>
                      handleInputChange(
                        "consultation_fee",
                        parseInt(e.target.value)
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter consultation fee"
                    min="0"
                  />
                ) : (
                  <p className="text-gray-900 px-3 py-2 bg-gray-50 rounded-lg">
                    ${doctorData.consultation_fee}
                  </p>
                )}
              </div>

              {/* Availability Status */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <CheckCircle className="w-4 h-4 mr-2 text-gray-500" />
                  Availability Status
                </label>
                {isEditing ? (
                  <select
                    value={editData.is_available.toString()}
                    onChange={(e) =>
                      handleInputChange(
                        "is_available",
                        e.target.value === "true"
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="true">Available</option>
                    <option value="false">Unavailable</option>
                  </select>
                ) : (
                  <p className="text-gray-900 px-3 py-2 bg-gray-50 rounded-lg flex items-center">
                    {doctorData.is_available ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        Available
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 text-red-500 mr-2" />
                        Unavailable
                      </>
                    )}
                  </p>
                )}
              </div>

              {/* Address */}
              <div className="space-y-2 md:col-span-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                  Practice Address
                </label>
                {isEditing ? (
                  <textarea
                    value={editData.address}
                    onChange={(e) =>
                      handleInputChange("address", e.target.value)
                    }
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Enter your practice address"
                  />
                ) : (
                  <p className="text-gray-900 px-3 py-2 bg-gray-50 rounded-lg">
                    {doctorData.address}
                  </p>
                )}
              </div>

              {/* About */}
              <div className="space-y-2 md:col-span-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <BookOpen className="w-4 h-4 mr-2 text-gray-500" />
                  About / Bio
                </label>
                {isEditing ? (
                  <textarea
                    value={editData.about}
                    onChange={(e) => handleInputChange("about", e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Tell patients about yourself, your experience, and approach to care..."
                  />
                ) : (
                  <p className="text-gray-900 px-3 py-2 bg-gray-50 rounded-lg leading-relaxed">
                    {doctorData.about}
                  </p>
                )}
              </div>
            </div>

            {/* Additional Info */}
            <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="text-sm font-medium text-blue-800 mb-2">
                Professional Profile
              </h3>
              <p className="text-sm text-blue-700">
                Keep your professional information up to date to help patients
                find and choose you. A clear, professional photo helps build
                trust with patients.
                {isEditing &&
                  " You can drag and drop an image on the profile picture area or click to browse."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;
