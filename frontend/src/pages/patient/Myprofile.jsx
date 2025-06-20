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
  Loader,
} from "lucide-react";
import { appContext } from "../../context/AppContext";
import axios from "axios";
import toast from "react-hot-toast";

const MyProfile = () => {
  // Sample patient data - replace with actual data from your backend
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

  // Update editData when patientData changes
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
      const formData = new FormData();

      // Append image if selected
      if (selectedImageFile) {
        formData.append("file", selectedImageFile); // 'file' matches your upload.single('file')
      }

      // Append other user details
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

      if (response.data.success) {
        setPatientData({ ...editData });
        if (response.data.data.imageUrl) {
          setPatientData((prev) => ({
            ...prev,
            profileImage: response.data.data.imageUrl,
          }));
          setUserData(() => ({
            ...editData,
            image: response.data.data.imageUrl,
          }));
        } else if (imagePreview) {
          setPatientData((prev) => ({
            ...prev,
            profileImage: imagePreview,
          }));
        }

        // Reset editing state
        setIsEditing(false);
        setImagePreview(null);
        setSelectedImageFile(null);

        toast.success("Profile updated successfully!");
        // console.log("Updated patient data:", response.data.data);
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
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const calculateAge = (date_of_birth) => {
    const today = new Date();
    const birthDate = new Date(date_of_birth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Patient Profile
                  </h1>
                  <p className="text-gray-600">
                    Manage your personal information
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
            {/* Profile Image Section */}
            <div className="flex flex-col items-center mb-8">
              <div className="relative">
                {isEditing && !imagePreview ? (
                  // Drag and drop area for editing
                  <div
                    className={`w-32 h-32 rounded-full border-4 border-dashed flex items-center justify-center cursor-pointer transition-all ${
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
                        className={`w-8 h-8 mx-auto mb-1 ${
                          isDragging ? "text-blue-500" : "text-gray-400"
                        }`}
                      />
                      <p className="text-xs text-gray-500">
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
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
                    <img
                      src={imagePreview || patientData.profileImage}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {isEditing && imagePreview && (
                  <button
                    onClick={removeImage}
                    className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}

                {isEditing && imagePreview && (
                  <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
                    <Camera className="w-4 h-4" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mt-4">
                {isEditing ? editData.name : patientData.name}
              </h2>
              {(isEditing
                ? editData.date_of_birth
                : patientData.date_of_birth) && (
                <p className="text-gray-600">
                  Age:{" "}
                  {calculateAge(
                    isEditing
                      ? editData.date_of_birth
                      : patientData.date_of_birth
                  )}{" "}
                  years
                </p>
              )}

              {isEditing && selectedImageFile && (
                <div className="mt-2 text-center">
                  <p className="text-sm text-gray-500">
                    {(selectedImageFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              )}
            </div>

            {/* Patient Information */}
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
                    {patientData.name}
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
                    {patientData.email}
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
                    {patientData.phone}
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
                  <p className="text-gray-900 px-3 py-2 bg-gray-50 rounded-lg">
                    {patientData.gender}
                  </p>
                )}
              </div>

              {/* Date of Birth */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                  Date of Birth
                </label>
                {isEditing ? (
                  <input
                    type="date"
                    value={editData.date_of_birth}
                    onChange={(e) =>
                      handleInputChange("date_of_birth", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900 px-3 py-2 bg-gray-50 rounded-lg">
                    {patientData.date_of_birth
                      ? formatDate(patientData.date_of_birth)
                      : "Date Not Available"}
                  </p>
                )}
              </div>

              {/* Address */}
              <div className="space-y-2 md:col-span-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                  Address
                </label>
                {isEditing ? (
                  <textarea
                    value={editData.address}
                    onChange={(e) =>
                      handleInputChange("address", e.target.value)
                    }
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Enter your address"
                  />
                ) : (
                  <p className="text-gray-900 px-3 py-2 bg-gray-50 rounded-lg">
                    {patientData.address}
                  </p>
                )}
              </div>
            </div>

            {/* Additional Info */}
            <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="text-sm font-medium text-blue-800 mb-2">
                Profile Information
              </h3>
              <p className="text-sm text-blue-700">
                Keep your profile information up to date to ensure we can
                contact you and provide the best care possible.
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
