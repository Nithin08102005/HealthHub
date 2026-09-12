import React, { useState, useEffect, useContext } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail,
  Award,
  BookOpen,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  User,
} from "lucide-react";
import { appContext } from "../../context/AppContext";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

const BookAppointment = () => {
  const { id } = useParams();
  const doctorId = id;
  const navigate = useNavigate();
  const { token, userData } = useContext(appContext);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [bookedTimes, setBookedTimes] = useState([]);
  const [weekDates, setWeekDates] = useState([]);
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reasonForVisit, setReasonForVisit] = useState("");
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [bookingAppointment, setBookingAppointment] = useState(false);
  const [meetingType, setMeetingType] = useState("offline");

  useEffect(() => {
    const fetchDoctorById = async () => {
      try {
        setLoading(true);
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/patient/getDoctorById`,
          { doctorId },
          {
            headers: { token },
          }
        );

        if (response.data.success) {
          setDoctor(response.data.data);
        } else {
          console.error("Failed to fetch doctor:", response.data.message);
        }
      } catch (error) {
        console.error("Error fetching doctor:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctorById();
  }, [doctorId, token]);

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour < 12; hour++) {
      slots.push(`${hour}:00 AM`);
    }
    slots.push("12:00 PM");
    for (let hour = 1; hour <= 9; hour++) {
      const displayHour = hour;
      slots.push(`${displayHour}:00 PM`);
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  const getLocalDateString = (dateInput) => {
    const d = new Date(dateInput);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    const generateWeekDates = () => {
      const dates = [];
      const today = new Date();

      let currentDate = new Date(today);
      if (currentDate.getDay() === 0) {
        currentDate.setDate(currentDate.getDate() + 1);
      }

      while (dates.length < 6) {
        if (currentDate.getDay() !== 0) {
          dates.push({
            date: new Date(currentDate),
            dayName: currentDate.toLocaleDateString("en-US", {
              weekday: "long",
            }),
            dayNumber: currentDate.getDate(),
            month: currentDate.toLocaleDateString("en-US", { month: "short" }),
          });
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }

      setWeekDates(dates);
      if (dates.length > 0) {
        setSelectedDate(dates[0]);
      }
    };

    generateWeekDates();
  }, []);

  useEffect(() => {
    setLoadingSlots(true);
    const fetchBookedSlots = async () => {
      if (!selectedDate || !doctorId) return;
      const dateStr = getLocalDateString(selectedDate.date);

      try {
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/patient/getBookedSlots`,
          {
            doctorId,
            date: dateStr,
          }
        );

        if (response.data.success) {
          setBookedTimes(response.data.bookedTimes);
        }
      } catch (error) {
        console.error("Error fetching booked slots", error);
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchBookedSlots();
  }, [selectedDate, doctorId]);

  const convertTo24Hour = (timeStr) => {
    const [time, modifier] = timeStr.split(" ");
    let [hours, minutes] = time.split(":").map(Number);

    if (modifier === "PM" && hours !== 12) hours += 12;
    if (modifier === "AM" && hours === 12) hours = 0;

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}:00`;
  };

  const isBooked = (timeStr) => {
    const parsed = convertTo24Hour(timeStr);
    return bookedTimes.includes(parsed);
  };

  const isPastSlot = (timeStr) => {
    if (!selectedDate) return false;
    const today = new Date();
    const selDate = new Date(selectedDate.date);

    const isToday =
      selDate.getFullYear() === today.getFullYear() &&
      selDate.getMonth() === today.getMonth() &&
      selDate.getDate() === today.getDate();

    if (!isToday) return false;

    const parsed24 = convertTo24Hour(timeStr);
    const [hours, minutes] = parsed24.split(":").map(Number);
    const slotTime = new Date(today);
    slotTime.setHours(hours, minutes, 0, 0);

    const cutoff = new Date(slotTime.getTime() - 30 * 60 * 1000);
    return today >= cutoff;
  };

  const handleDateSelect = (dateObj) => {
    setSelectedDate(dateObj);
    setSelectedSlot(null);
  };

  const handleSlotSelect = (time) => {
    setSelectedSlot({ date: selectedDate, time });
  };

  const handleBookAppointment = async () => {
    if (!selectedSlot || !reasonForVisit.trim()) return;
    setBookingAppointment(true);

    try {
      const dateStr = getLocalDateString(selectedSlot.date.date);
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/patient/bookAppointment`,
        { 
          doctorId, 
          patientId: userData.id, 
          selectedSlot: {
            date: { date: dateStr },
            time: selectedSlot.time
          }, 
          reasonForVisit, 
          meetingType 
        },
        {
          headers: {
            token,
          },
        }
      );

      if (response.data.success) {
        toast.success("Appointment booked successfully!");
        setBookedTimes((prev) => [...prev, convertTo24Hour(selectedSlot.time)]);
        setSelectedSlot(null);
        setReasonForVisit("");
        setTimeout(() => navigate("/patient/appointments"), 1000);
      } else {
        toast.error(response.data.message || "Failed to book appointment. Please try again.");
      }
    } catch (error) {
      console.error("Booking error:", error);
      toast.error("Something went wrong while booking the appointment.");
    } finally {
      setBookingAppointment(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-300 font-medium">Loading doctor schedule...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden rounded-3xl border border-white/10 shadow-2xl my-2 p-6 sm:p-10">
      {/* Background Subtle Mesh Gradients */}
      <div className="absolute top-0 right-10 w-96 h-96 bg-blue-500/15 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-indigo-500/15 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Doctor Header Profile Section */}
        {doctor && (
          <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 rounded-3xl p-8 sm:p-10 shadow-2xl text-white border border-white/15 mb-10 relative overflow-hidden">
            <div className="flex flex-col lg:flex-row gap-8 items-start relative z-10">
              {/* Doctor Avatar */}
              <div className="relative flex-shrink-0 mx-auto lg:mx-0">
                <img
                  src={doctor.image || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&h=500&fit=crop'}
                  alt={doctor.name}
                  className="w-48 h-60 sm:w-56 sm:h-64 rounded-2xl object-cover shadow-2xl border-2 border-white/20"
                />
                <div className="absolute top-3 left-3 bg-emerald-500 text-slate-950 font-extrabold text-[10px] uppercase tracking-wider px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verified</span>
                </div>
              </div>

              {/* Doctor Details */}
              <div className="flex-1 space-y-4 text-center lg:text-left">
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
                  <span className="bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
                    {doctor.specialization}
                  </span>
                  <div className="flex items-center text-amber-400 text-xs font-bold">
                    <span>★ 4.9 Rating</span>
                  </div>
                </div>

                <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
                  Dr. {doctor.name}
                </h1>

                {/* Consultation Fee Highlight */}
                <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md px-5 py-2.5 rounded-2xl border border-white/15">
                  <span className="text-xs text-slate-300 font-medium uppercase tracking-wider">
                    Consultation Fee:
                  </span>
                  <span className="text-2xl font-extrabold text-cyan-400">
                    ₹{doctor.consultation_fee}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs sm:text-sm text-slate-300">
                  {doctor.experience_years && (
                    <div className="flex items-center justify-center lg:justify-start gap-2">
                      <Award className="w-4 h-4 text-cyan-400" />
                      <span>Experience: <strong>{doctor.experience_years} years</strong></span>
                    </div>
                  )}
                  {doctor.qualification && (
                    <div className="flex items-center justify-center lg:justify-start gap-2">
                      <BookOpen className="w-4 h-4 text-cyan-400" />
                      <span>Qualification: <strong>{doctor.qualification}</strong></span>
                    </div>
                  )}
                  {doctor.phone && (
                    <div className="flex items-center justify-center lg:justify-start gap-2">
                      <Phone className="w-4 h-4 text-slate-400" />
                      <span>{doctor.phone}</span>
                    </div>
                  )}
                  {doctor.email && (
                    <div className="flex items-center justify-center lg:justify-start gap-2">
                      <Mail className="w-4 h-4 text-slate-400" />
                      <span>{doctor.email}</span>
                    </div>
                  )}
                </div>

                {doctor.address && (
                  <div className="flex items-center justify-center lg:justify-start gap-2 text-xs text-slate-300 pt-1">
                    <MapPin className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                    <span>{doctor.address}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Appointment Booking Container */}
        <div className="bg-slate-900/90 backdrop-blur-2xl rounded-3xl p-8 sm:p-10 shadow-2xl border border-white/15 space-y-10">
          
          {/* Step 1: Select Date */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 bg-blue-500/20 rounded-xl flex items-center justify-center text-cyan-400">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">
                  1. Select Preferred Date
                </h3>
                <p className="text-xs text-slate-400">
                  Choose an available date for your consultation.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {weekDates.map((dateObj, index) => {
                const isSelected =
                  selectedDate && selectedDate.dayNumber === dateObj.dayNumber;
                return (
                  <button
                    key={index}
                    onClick={() => handleDateSelect(dateObj)}
                    className={`rounded-2xl p-4 text-center transition-all duration-300 border-2 cursor-pointer ${
                      isSelected
                        ? "bg-gradient-to-br from-blue-600 to-cyan-500 text-white border-cyan-400 shadow-lg shadow-blue-500/25 scale-105"
                        : "bg-slate-950/80 hover:bg-slate-800 text-slate-300 border-white/10 hover:border-cyan-400/50"
                    }`}
                  >
                    <div className={`text-xs font-semibold mb-1 uppercase tracking-wider ${isSelected ? "text-cyan-100" : "text-slate-400"}`}>
                      {dateObj.dayName}
                    </div>
                    <div className={`text-2xl font-extrabold mb-1 ${isSelected ? "text-white" : "text-white"}`}>
                      {dateObj.dayNumber}
                    </div>
                    <div className={`text-xs font-medium ${isSelected ? "text-cyan-100" : "text-slate-400"}`}>
                      {dateObj.month}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Select Time Slot */}
          {selectedDate && (
            <div className="pt-6 border-t border-white/10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 bg-blue-500/20 rounded-xl flex items-center justify-center text-cyan-400">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    2. Select Time Slot
                  </h3>
                  <p className="text-xs text-slate-400">
                    Available slots for {selectedDate.dayName}, {selectedDate.month} {selectedDate.dayNumber}
                  </p>
                </div>
              </div>

              {loadingSlots ? (
                <div className="flex justify-center items-center py-12">
                  <div className="w-8 h-8 border-3 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                  <span className="ml-3 text-sm font-medium text-slate-300">Loading slot availability...</span>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {timeSlots.map((time, timeIndex) => {
                    const isSelected = selectedSlot?.time === time;
                    const booked = isBooked(time);
                    const past = isPastSlot(time);
                    const isDisabled = booked || past;

                    return (
                      <button
                        key={timeIndex}
                        onClick={() => !isDisabled && handleSlotSelect(time)}
                        disabled={isDisabled}
                        className={`relative px-4 py-3.5 rounded-2xl border-2 text-xs sm:text-sm font-bold transition-all duration-200 flex flex-col items-center justify-center cursor-pointer ${
                          isDisabled
                            ? "bg-slate-950/40 text-slate-600 border-white/5 cursor-not-allowed opacity-50"
                            : isSelected
                            ? "bg-gradient-to-br from-blue-600 to-cyan-500 text-white border-cyan-400 shadow-md shadow-blue-500/25 scale-105"
                            : "bg-slate-950/80 text-white border-white/10 hover:bg-slate-800 hover:border-cyan-400/50"
                        }`}
                      >
                        <span>{time}</span>
                        {booked && (
                          <span className="text-[10px] text-rose-400 font-extrabold uppercase mt-0.5">
                            Booked
                          </span>
                        )}
                        {!booked && past && (
                          <span className="text-[10px] text-slate-500 font-extrabold uppercase mt-0.5">
                            Passed
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Reason for Visit */}
          <div className="pt-6 border-t border-white/10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 bg-blue-500/20 rounded-xl flex items-center justify-center text-cyan-400">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">
                  3. Reason for Visit
                </h3>
                <p className="text-xs text-slate-400">
                  Briefly state your symptoms or consultation purpose for the doctor.
                </p>
              </div>
            </div>

            <textarea
              value={reasonForVisit}
              onChange={(e) => setReasonForVisit(e.target.value)}
              placeholder="Describe symptoms, routine checkup request, or follow-up details..."
              className="w-full p-4 bg-slate-950/80 border border-white/15 rounded-2xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 resize-none h-32 transition-all placeholder-slate-500"
              required
            />
          </div>

          {/* Step 4: Consultation Type */}
          <div className="pt-6 border-t border-white/10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 bg-purple-500/20 rounded-xl flex items-center justify-center text-purple-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">
                  4. Consultation Type
                </h3>
                <p className="text-xs text-slate-400">
                  Choose how you would like to consult with the doctor.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
              <button
                type="button"
                onClick={() => setMeetingType("offline")}
                className={`p-4 rounded-2xl border-2 text-left transition-all duration-200 cursor-pointer ${
                  meetingType === "offline"
                    ? "bg-gradient-to-br from-blue-600/20 to-cyan-500/20 border-cyan-400 text-white"
                    : "bg-slate-950/80 border-white/10 text-slate-300 hover:border-white/20"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="w-5 h-5 text-cyan-400" />
                  <span className="font-bold text-sm">🏥 In-Clinic Visit</span>
                </div>
                <p className="text-xs text-slate-400">Meet the practitioner at their physical clinic address.</p>
              </button>

              <button
                type="button"
                onClick={() => setMeetingType("online")}
                className={`p-4 rounded-2xl border-2 text-left transition-all duration-200 cursor-pointer ${
                  meetingType === "online"
                    ? "bg-gradient-to-br from-purple-600/20 to-indigo-500/20 border-purple-400 text-white"
                    : "bg-slate-950/80 border-white/10 text-slate-300 hover:border-white/20"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  <span className="font-bold text-sm">💻 Video Consultation</span>
                </div>
                <p className="text-xs text-slate-400">Join a secure virtual consultation call directly inside the app.</p>
              </button>
            </div>
          </div>

          {/* Summary & Confirm Action */}
          <div className="pt-6 border-t border-white/10 flex flex-col items-center">
            
            {/* Live Summary Box */}
            {selectedSlot && (
              <div className="w-full max-w-xl bg-blue-950/60 border border-cyan-400/30 rounded-2xl p-6 mb-8 text-center shadow-lg">
                <h4 className="text-base font-bold text-white mb-2 flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-cyan-400" />
                  <span>Appointment Summary</span>
                </h4>
                <p className="text-cyan-300 text-sm font-semibold mb-1">
                  📅 {selectedSlot.date.dayName}, {selectedSlot.date.month} {selectedSlot.date.dayNumber} at {selectedSlot.time}
                </p>
                {reasonForVisit && (
                  <p className="text-slate-300 text-xs mt-2 italic">
                    "{reasonForVisit}"
                  </p>
                )}
              </div>
            )}

            <button
              onClick={handleBookAppointment}
              disabled={loading || !selectedSlot || !reasonForVisit.trim() || bookingAppointment}
              className={`w-full max-w-md py-4 rounded-2xl font-bold text-base transition-all duration-300 shadow-xl flex items-center justify-center gap-2 ${
                selectedSlot && reasonForVisit.trim() && !bookingAppointment
                  ? "bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-blue-500/25 hover:scale-[1.02] cursor-pointer"
                  : "bg-slate-800 text-slate-500 cursor-not-allowed shadow-none border border-white/5"
              }`}
            >
              {bookingAppointment ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Booking Appointment...</span>
                </>
              ) : (
                <>
                  <span>Confirm & Book Appointment</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};

export default BookAppointment;
