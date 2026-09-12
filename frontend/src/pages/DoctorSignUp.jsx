import React, { useState } from "react";
import { 
  User, Mail, Lock, Phone, Calendar, MapPin, 
  Activity, Sparkles, ArrowRight, ArrowLeft, Award, 
  DollarSign, Briefcase, FileText, Image, CheckCircle2, Loader2 
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import axios from "axios";

const DoctorSignUp = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [doctorData, setDoctorData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    gender: "male",
    specialization: "General Physician",
    qualification: "",
    experience_years: "",
    consultation_fee: "",
    address: "",
    about: "",
  });

  const [imageFile, setImageFile] = useState(null);
  const [docFile, setDocFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const handleInputChange = (field, val) => {
    setDoctorData({ ...doctorData, [field]: val });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleDocChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setDocFile(file);
    }
  };

  const nextStep = () => {
    if (step === 1) {
      if (!doctorData.name.trim() || !doctorData.email.trim() || !doctorData.password.trim() || !doctorData.phone.trim()) {
        toast.error("Please fill in all details.");
        return;
      }
      if (doctorData.password.length < 6) {
        toast.error("Password must be at least 6 characters.");
        return;
      }
    } else if (step === 2) {
      if (!doctorData.qualification.trim() || !doctorData.experience_years || !doctorData.consultation_fee || !doctorData.address.trim()) {
        toast.error("Please fill in all professional fields.");
        return;
      }
    }
    setStep(step + 1);
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imageFile || !docFile) {
      toast.error("Please upload both your profile photo and license/resume document.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("image", imageFile);
      formData.append("document", docFile);
      formData.append("role", "doctor");
      formData.append("is_available", "true");

      Object.entries(doctorData).forEach(([key, value]) => {
        formData.append(key, value);
      });

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/user/register`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (response.data.success) {
        toast.success("Application submitted successfully!");
        setTimeout(() => {
          navigate("/login");
        }, 1500);
      } else {
        toast.error(response.data.message || "Registration failed.");
      }
    } catch (error) {
      console.error("Doctor signup error:", error);
      toast.error(error.response?.data?.message || "Onboarding failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4 relative overflow-hidden py-12">
      {/* Glow Effects */}
      <div className="absolute top-10 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="bg-slate-900/90 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/10 w-full max-w-xl p-8 sm:p-10 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 bg-gradient-to-tr from-blue-600 to-cyan-400 rounded-2xl flex items-center justify-center text-slate-950 shadow-lg shadow-blue-500/30 mb-3 font-extrabold">
            <Activity className="w-8 h-8 text-white" />
          </div>
          <span className="text-2xl font-extrabold bg-gradient-to-r from-white via-slate-100 to-cyan-200 bg-clip-text text-transparent">
            Join the HealthHub Roster
          </span>
          <p className="text-xs text-cyan-400 font-semibold uppercase tracking-wider mt-0.5">
            Submit Your Application Profile
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex justify-between items-center mb-8 max-w-xs mx-auto text-xs text-slate-400">
          <div className={`flex flex-col items-center ${step >= 1 ? "text-cyan-400 font-bold" : ""}`}>
            <div className={`w-6 h-6 rounded-full border flex items-center justify-center mb-1 ${step >= 1 ? "border-cyan-400 bg-cyan-500/10" : "border-white/10"}`}>1</div>
            <span>Account</span>
          </div>
          <div className="h-[1px] flex-1 bg-white/10 mx-2 mb-4"></div>
          <div className={`flex flex-col items-center ${step >= 2 ? "text-cyan-400 font-bold" : ""}`}>
            <div className={`w-6 h-6 rounded-full border flex items-center justify-center mb-1 ${step >= 2 ? "border-cyan-400 bg-cyan-500/10" : "border-white/10"}`}>2</div>
            <span>Professional</span>
          </div>
          <div className="h-[1px] flex-1 bg-white/10 mx-2 mb-4"></div>
          <div className={`flex flex-col items-center ${step >= 3 ? "text-cyan-400 font-bold" : ""}`}>
            <div className={`w-6 h-6 rounded-full border flex items-center justify-center mb-1 ${step >= 3 ? "border-cyan-400 bg-cyan-500/10" : "border-white/10"}`}>3</div>
            <span>Documents</span>
          </div>
        </div>

        {/* Forms */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* STEP 1 */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3.5 w-4 h-4 text-cyan-400" />
                  <input
                    type="text"
                    value={doctorData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-white/15 rounded-2xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all placeholder-slate-500"
                    placeholder="Dr. John Doe"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-cyan-400" />
                  <input
                    type="email"
                    value={doctorData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-white/15 rounded-2xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all placeholder-slate-500"
                    placeholder="doctor@healthhub.com"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-cyan-400" />
                    <input
                      type="password"
                      value={doctorData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-white/15 rounded-2xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all placeholder-slate-500"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Mobile Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-cyan-400" />
                    <input
                      type="tel"
                      value={doctorData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-white/15 rounded-2xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all placeholder-slate-500"
                      placeholder="+91 XXXXX XXXXX"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Gender</label>
                <select
                  value={doctorData.gender}
                  onChange={(e) => handleInputChange("gender", e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950/80 border border-white/15 rounded-2xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Specialization</label>
                  <select
                    value={doctorData.specialization}
                    onChange={(e) => handleInputChange("specialization", e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950/80 border border-white/15 rounded-2xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
                  >
                    <option value="General Physician">General Physician</option>
                    <option value="Gynecologist">Gynecologist</option>
                    <option value="Dermatologist">Dermatologist</option>
                    <option value="Pediatrician">Pediatrician</option>
                    <option value="Neurologist">Neurologist</option>
                    <option value="Gastroenterologist">Gastroenterologist</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Qualifications</label>
                  <div className="relative">
                    <Award className="absolute left-3.5 top-3.5 w-4 h-4 text-cyan-400" />
                    <input
                      type="text"
                      value={doctorData.qualification}
                      onChange={(e) => handleInputChange("qualification", e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-white/15 rounded-2xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all placeholder-slate-500"
                      placeholder="MBBS, MD"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Experience (Years)</label>
                  <div className="relative">
                    <Briefcase className="absolute left-3.5 top-3.5 w-4 h-4 text-cyan-400" />
                    <input
                      type="number"
                      value={doctorData.experience_years}
                      onChange={(e) => handleInputChange("experience_years", e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-white/15 rounded-2xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all placeholder-slate-500"
                      placeholder="e.g. 8"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Consultation Fee (INR)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3.5 top-3.5 w-4 h-4 text-cyan-400" />
                    <input
                      type="number"
                      value={doctorData.consultation_fee}
                      onChange={(e) => handleInputChange("consultation_fee", e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-white/15 rounded-2xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all placeholder-slate-500"
                      placeholder="e.g. 500"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Clinic/Practice Address</label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-cyan-400" />
                  <input
                    type="text"
                    value={doctorData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-white/15 rounded-2xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all placeholder-slate-500"
                    placeholder="e.g. Apollo Hospitals, New Delhi"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">About / Professional Bio</label>
                <textarea
                  value={doctorData.about}
                  onChange={(e) => handleInputChange("about", e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950/80 border border-white/15 rounded-2xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all placeholder-slate-500 resize-none h-20"
                  placeholder="Tell patients about your medical background..."
                  required
                />
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="space-y-6">
              
              {/* Profile Photo */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Profile Photo</label>
                <div className="flex items-center gap-4 bg-slate-950/50 p-4 border border-white/10 rounded-2xl">
                  {imagePreview ? (
                    <img src={imagePreview} className="w-16 h-16 rounded-xl object-cover border border-white/20" alt="Preview" />
                  ) : (
                    <div className="w-16 h-16 bg-slate-900 border border-white/10 rounded-xl flex items-center justify-center text-slate-500">
                      <Image className="w-6 h-6" />
                    </div>
                  )}
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-cyan-500/10 file:text-cyan-400 hover:file:bg-cyan-500/20 file:cursor-pointer"
                      required
                    />
                    <p className="text-[10px] text-slate-500 mt-1">Upload a professional headshot</p>
                  </div>
                </div>
              </div>

              {/* License/Resume PDF */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">License or Qualification Certificate</label>
                <div className="flex items-center gap-4 bg-slate-950/50 p-4 border border-white/10 rounded-2xl">
                  <div className={`w-16 h-16 rounded-xl flex items-center justify-center border ${docFile ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-slate-900 border-white/10 text-slate-500"}`}>
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <input
                      type="file"
                      accept=".pdf,image/*"
                      onChange={handleDocChange}
                      className="text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-cyan-500/10 file:text-cyan-400 hover:file:bg-cyan-500/20 file:cursor-pointer"
                      required
                    />
                    <p className="text-[10px] text-slate-500 mt-1">
                      Upload medical registration ID card, license document, or resume (PDF/Image)
                    </p>
                  </div>
                </div>
              </div>

              {/* Test placeholder download hint */}
              <div className="bg-cyan-950/30 border border-cyan-800/30 p-4 rounded-2xl text-xs text-cyan-200">
                💡 **Testing Hint**: Need a sample credential file to test? You can download a dummy PDF to your computer from: 
                <a href="https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" target="_blank" rel="noreferrer" className="underline font-bold block mt-1 hover:text-cyan-100">
                  w3.org/dummy.pdf (Click to Download)
                </a>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-white/5">
            {step > 1 ? (
              <button
                type="button"
                onClick={prevStep}
                className="flex items-center gap-1 text-sm font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={nextStep}
                className="flex items-center gap-1 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white px-6 py-3 rounded-2xl text-sm font-semibold shadow-lg shadow-blue-500/25 transition-all cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white px-6 py-3 rounded-2xl text-sm font-semibold shadow-lg shadow-emerald-500/25 transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Submit Application</span>
                  </>
                )}
              </button>
            )}
          </div>
        </form>

        {/* Back to login */}
        <div className="text-center mt-6">
          <p className="text-xs text-slate-400">
            Already have an account?{" "}
            <Link to="/login" className="text-cyan-400 hover:underline font-semibold cursor-pointer">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default DoctorSignUp;
