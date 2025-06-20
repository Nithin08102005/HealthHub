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
  Users,
  Image,
  Loader,
  BookOpen,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  Stethoscope,
  AlertCircle,
  UserPlus,
  Eye,
  EyeOff
} from "lucide-react";
import { useContext } from "react";
import { useRef } from "react";
import { useState } from "react";
import toast from "react-hot-toast";
import { appContext } from "../../context/AppContext";

const AddDoctor = () => {

  const {token}=useContext(appContext);
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
    consultation_fee: 0,
    is_available: true,
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);

  const handleInputChange = (field, value) => {
    setDoctorData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error for this field when user starts typing
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
        // 10MB limit
        setErrors((prev) => ({
          ...prev,
          image: "Image size should be less than 10MB",
        }));
        return;
      }

      setSelectedImageFile(file);
      setErrors((prev) => ({
        ...prev,
        image: "",
      }));

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

  const validateForm = () => {
    const newErrors = {};



if (doctorData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!doctorData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    }

    if (!doctorData.specialization.trim()) {
      newErrors.specialization = "Specialization is required";
    }

    if (!doctorData.qualification.trim()) {
      newErrors.qualification = "Qualification is required";
    }

    if (!doctorData.address.trim()) {
      newErrors.address = "Practice address is required";
    }

    if (!doctorData.about.trim()) {
      newErrors.about = "About section is required";
    }

    if (doctorData.experience_years < 0) {
      newErrors.experience_years = "Experience years cannot be negative";
    }

    if (doctorData.consultation_fee < 0) {
      newErrors.consultation_fee = "Consultation fee cannot be negative";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      const formData = new FormData();

      if (selectedImageFile) {
        formData.append("file", selectedImageFile);
      }

      Object.entries(doctorData).forEach(([key, value]) => {
        formData.append(key, value);
      });
      formData.append("role", "doctor");

      // Replace with your actual API endpoint
      const response = await axios.post("http://localhost:3000/user/register", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          token
        },
      });
      if(response.data.success)
      {
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
        consultation_fee: 0,
        is_available: true,
      });
      setImagePreview(null);
      setSelectedImageFile(null);
      toast.success("Doctor added successfully!");
      }
      else 
      {
        toast.error(response.data.message || "Failed to add doctor.");
      }
    } catch (error) {
      console.error("Failed to add doctor:", error);
      toast.error("Failed to add doctor.",error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
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
      consultation_fee: 0,
      is_available: true,
    });
    setImagePreview(null);
    setSelectedImageFile(null);
    setErrors({});
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
                <div className="p-2 bg-green-100 rounded-lg">
                  <UserPlus className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Add New Doctor
                  </h1>
                  <p className="text-gray-600">
                    Add a new doctor to the platform
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            {/* Profile Image Section */}
            <div className="flex flex-col lg:flex-row gap-8 mb-8">
              <div className="flex flex-col items-center lg:items-start">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Profile Picture
                </h3>
                <div className="relative">
                  {!imagePreview ? (
                    <div
                      className={`w-64 h-80 rounded-lg border-4 border-dashed flex items-center justify-center cursor-pointer transition-all ${
                        isDragging
                          ? "border-green-500 bg-green-50"
                          : "border-gray-300 bg-gray-50 hover:border-gray-400"
                      } ${errors.image ? "border-red-300" : ""}`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <div className="text-center">
                        <Image
                          className={`w-12 h-12 mx-auto mb-2 ${
                            isDragging ? "text-green-500" : "text-gray-400"
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
                    <div className="w-64 h-80 rounded-lg overflow-hidden border-4 border-white shadow-lg">
                      <img
                        src={imagePreview}
                        alt="Doctor Profile Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {imagePreview && (
                    <>
                      <button
                        onClick={removeImage}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <label className="absolute bottom-2 right-2 bg-green-600 text-white p-2 rounded-full cursor-pointer hover:bg-green-700 transition-colors">
                        <Camera className="w-5 h-5" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </label>
                    </>
                  )}
                </div>

                {errors.image && (
                  <p className="text-red-500 text-sm mt-2 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.image}
                  </p>
                )}

                {selectedImageFile && (
                  <div className="mt-2 text-center">
                    <p className="text-sm text-gray-500">
                      (
                      {(selectedImageFile.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  </div>
                )}
              </div>

              {/* Form Preview */}
              <div className="flex-1 space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Preview
                </h3>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-xl font-bold text-gray-900 mb-2">
                    {doctorData.name || "Doctor Name"}
                  </h4>
                  <div className="flex items-center space-x-4 text-gray-600 mb-4">
                    <span className="font-medium">
                      {doctorData.specialization || "Specialization"}
                    </span>
                    <span className="flex items-center">
                      {doctorData.is_available ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                          Available
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 text-red-500 mr-1" />
                          Unavailable
                        </>
                      )}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-lg font-bold text-blue-600">
                        {doctorData.experience_years}+
                      </div>
                      <div className="text-xs text-gray-600">Years Exp.</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-green-600">
                        ${doctorData.consultation_fee}
                      </div>
                      <div className="text-xs text-gray-600">Fee</div>
                    </div>
                    
                  </div>
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <User className="w-4 h-4 mr-2 text-gray-500" />
                  Full Name *
                </label>
                <input
                  type="text"
                  value={doctorData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.name ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="Enter doctor's full name"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <Mail className="w-4 h-4 mr-2 text-gray-500" />
                  Email Address *
                </label>
                <input
                  type="email"
                  value={doctorData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.email ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="Enter email address"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <User className="w-4 h-4 mr-2 text-gray-500" />
                  Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={doctorData.password}
                    onChange={(e) =>
                      handleInputChange("password", e.target.value)
                    }
                    className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      errors.password ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="Enter password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-sm flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <Phone className="w-4 h-4 mr-2 text-gray-500" />
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={doctorData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.phone ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="Enter phone number"
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.phone}
                  </p>
                )}
              </div>

              {/* Gender */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <Users className="w-4 h-4 mr-2 text-gray-500" />
                  Gender
                </label>
                <select
                  value={doctorData.gender}
                  onChange={(e) => handleInputChange("gender", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Specialization */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <Stethoscope className="w-4 h-4 mr-2 text-gray-500" />
                  Specialization *
                </label>
                <select
                  value={doctorData.specialization}
                  onChange={(e) =>
                    handleInputChange("specialization", e.target.value)
                  }
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white ${
                    errors.specialization ? "border-red-300" : "border-gray-300"
                  }`}
                >
                  <option value="" disabled>
                    Select specialization
                  </option>
                  <option value="General Physician">General Physician</option>
                  <option value="Cardiologist">Cardiologist</option>
                  <option value="Dermatologist">Dermatologist</option>
                  <option value="Gynecologist">Gynecologist</option>
                  <option value="Pediatrician">Pediatrician</option>
                  <option value="Ophthalmologist">Ophthalmologist</option>
                  <option value="Dentist">Dentist</option>
                  <option value="Gastroenterologist">Gastroenterologist</option>
                </select>
                {errors.specialization && (
                  <p className="text-red-500 text-sm flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.specialization}
                  </p>
                )}
              </div>

              {/* Qualification */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <Award className="w-4 h-4 mr-2 text-gray-500" />
                  Qualification *
                </label>
                <input
                  type="text"
                  value={doctorData.qualification}
                  onChange={(e) =>
                    handleInputChange("qualification", e.target.value)
                  }
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.qualification ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="e.g., MBBS, MD, PhD"
                />
                {errors.qualification && (
                  <p className="text-red-500 text-sm flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.qualification}
                  </p>
                )}
              </div>

              {/* Experience Years */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <Clock className="w-4 h-4 mr-2 text-gray-500" />
                  Years of Experience
                </label>
                <input
                  type="text"
                  value={doctorData.experience_years}
                  onChange={(e) =>
                    handleInputChange(
                      "experience_years",
                      parseInt(e.target.value) || 0
                    )
                  }
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.experience_years
                      ? "border-red-300"
                      : "border-gray-300"
                  }`}
                  placeholder="Enter years of experience"
                  min="0"
                />
                {errors.experience_years && (
                  <p className="text-red-500 text-sm flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.experience_years}
                  </p>
                )}
              </div>

              {/* Consultation Fee */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <DollarSign className="w-4 h-4 mr-2 text-gray-500" />
                  Consultation Fee
                </label>
                <input
                  type="text"
                  value={doctorData.consultation_fee}
                  onChange={(e) =>
                    handleInputChange(
                      "consultation_fee",
                      parseInt(e.target.value) || 0
                    )
                  }
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.consultation_fee
                      ? "border-red-300"
                      : "border-gray-300"
                  }`}
                  placeholder="Enter consultation fee"
                  min="0"
                />
                {errors.consultation_fee && (
                  <p className="text-red-500 text-sm flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.consultation_fee}
                  </p>
                )}
              </div>

              {/* Availability Status */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <CheckCircle className="w-4 h-4 mr-2 text-gray-500" />
                  Initial Availability Status
                </label>
                <select
                  value={doctorData.is_available.toString()}
                  onChange={(e) =>
                    handleInputChange("is_available", e.target.value === "true")
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="true">Available</option>
                  <option value="false">Unavailable</option>
                </select>
              </div>

              {/* Address */}
              <div className="space-y-2 md:col-span-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                  Practice Address *
                </label>
                <textarea
                  value={doctorData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none ${
                    errors.address ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="Enter the practice address"
                />
                {errors.address && (
                  <p className="text-red-500 text-sm flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.address}
                  </p>
                )}
              </div>

              {/* About */}
              <div className="space-y-2 md:col-span-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <BookOpen className="w-4 h-4 mr-2 text-gray-500" />
                  About / Bio *
                </label>
                <textarea
                  value={doctorData.about}
                  onChange={(e) => handleInputChange("about", e.target.value)}
                  rows={4}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none ${
                    errors.about ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="Tell about the doctor's experience, approach to care, and specialties..."
                />
                {errors.about && (
                  <p className="text-red-500 text-sm flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.about}
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={handleReset}
                disabled={isSubmitting}
                className="flex items-center space-x-2 px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                <X className="w-4 h-4" />
                <span>Reset</span>
              </button>

              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`flex items-center space-x-2 px-6 py-2 ${
                  isSubmitting
                    ? "bg-green-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"
                } text-white rounded-lg transition-colors`}
              >
                {isSubmitting ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>{isSubmitting ? "Adding Doctor..." : "Add Doctor"}</span>
              </button>
            </div>

            {/* Info Section */}
            <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
              <h3 className="text-sm font-medium text-green-800 mb-2">
                Adding New Doctor
              </h3>
              <p className="text-sm text-green-700">
                Fill in all required fields marked with (*). The doctor will
                receive login credentials via email after successful
                registration. Make sure to provide accurate contact information
                and professional details.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddDoctor;
