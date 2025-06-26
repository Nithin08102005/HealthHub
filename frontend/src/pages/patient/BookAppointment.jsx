import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail,
  Award,
  BookOpen,
  DollarSign,
  Star,
  Users,
  Loader2,
} from "lucide-react";
import { useContext } from "react";
import { appContext } from "../../context/AppContext";
import axios from "axios";
import { useParams } from "react-router-dom";
import { toast } from "react-hot-toast";

const BookAppointment = () => {
  const { id } = useParams();
  const doctorId = id;
  const { token, userData } = useContext(appContext);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [bookedTimes, setBookedTimes] = useState([]);
  const [weekDates, setWeekDates] = useState([]);
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reasonForVisit, setReasonForVisit] = useState("");
  const [loadingSlots, setLoadingSlots] = useState();
  const [bookingAppointment, setBookingAppointment] = useState(false);
  useEffect(() => {
    const fetchDoctorById = async () => {
      try {
        setLoading(true);
        const response = await axios.post(
          "http://localhost:3000/patient/getDoctorById",
          { doctorId },
          {
            headers: {
              token,
            },
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
  }, []);

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour < 12; hour++) {
      slots.push(`${hour}:00 AM`);
    }
    for (let hour = 1; hour <= 9; hour++) {
      const displayHour = hour;
      slots.push(`${displayHour}:00 PM`);
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  useEffect(() => {
    const generateWeekDates = () => {
      const dates = [];
      const today = new Date();

      // Start from tomorrow, or Monday if today is Saturday
      const startDate = new Date(today);
      startDate.setDate(today.getDate() + (today.getDay() === 6 ? 2 : 1));

      // Fill up 6 dates, skipping Sundays
      let currentDate = new Date(startDate);
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
      const dateStr = new Date(selectedDate.date).toISOString().split("T")[0];

      try {
        const response = await axios.post(
          "http://localhost:3000/patient/getBookedSlots",
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
    const parsed = convertTo24Hour(timeStr); // e.g., "10:00 AM" → "10:00:00"

    return bookedTimes.includes(parsed);
  };

  const handleDateSelect = (dateObj) => {
    setSelectedDate(dateObj);
    setSelectedSlot(null);
  };

  const handleSlotSelect = (time) => {
    setSelectedSlot({ date: selectedDate, time });
  };

  const handleBookAppointment = async () => {
    setBookingAppointment(true);
    try {
      const response = await axios.post(
        "http://localhost:3000/patient/bookAppointment",
        { doctorId, patientId: userData.id, selectedSlot, reasonForVisit },
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
      } else {
        toast.error("Failed to book appointment. Please try again.");
      }
    } catch (error) {
      console.error("Booking error:", error);
      toast.error("Something went wrong while booking the appointment.");
    }
    finally{
      setBookingAppointment(false);
    }
  };

  const LoadingSkeleton = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-shrink-0">
              <div className="w-60 h-80 bg-gray-200 rounded-2xl animate-pulse"></div>
            </div>
            <div className="flex-1 space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4 animate-pulse"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2 animate-pulse"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-5 bg-gray-200 rounded animate-pulse"
                    ></div>
                  ))}
                </div>
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-5 bg-gray-200 rounded animate-pulse"
                    ></div>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-6 bg-gray-200 rounded w-1/4 animate-pulse"></div>
                <div className="h-20 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">
              Loading appointment slots...
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Doctor Profile Section */}
        <div className="bg-white shadow-lg rounded-lg mb-8 border border-gray-200">
          <div className="p-8">
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="flex-shrink-0 relative">
                <img
                  src={doctor?.image}
                  alt={doctor?.name}
                  className="w-70 h-100 rounded-lg object-cover border border-gray-300"
                />
                <div className="absolute top-4 right-4 bg-green-600 text-white px-3 py-1 rounded-md text-sm font-medium">
                  Available
                </div>
              </div>

              <div className="flex-1">
                <div className="mb-8">
                  <h1 className="text-3xl font-semibold text-gray-900 mb-3">
                    Dr. {doctor?.name}
                  </h1>
                  <p className="text-xl text-blue-700 font-medium mb-6">
                    {doctor?.specialization}
                  </p>

                  {/* Styled Consultation Fee */}
                  <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg mb-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <DollarSign className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600 mb-1">
                            Consultation Fee
                          </p>
                          <p className="text-2xl font-semibold text-blue-700">
                            ${doctor?.consultation_fee}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <Award className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 font-medium">
                          Qualification
                        </p>
                        <p className="text-gray-900 font-semibold">
                          {doctor?.qualification}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 font-medium">
                          Experience
                        </p>
                        <p className="text-gray-900 font-semibold">
                          {doctor?.experience_years} years
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <Phone className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 font-medium">
                          Phone
                        </p>
                        <p className="text-gray-900 font-semibold">
                          {doctor?.phone}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <Mail className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 font-medium">
                          Email
                        </p>
                        <p className="text-gray-900 font-semibold">
                          {doctor?.email}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-8">
                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mt-1">
                      <MapPin className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">
                        Address
                      </p>
                      <p className="text-gray-900 font-semibold">
                        {doctor?.address}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <BookOpen className="w-4 h-4 text-blue-600" />
                    </div>
                    About Dr. {doctor?.name}
                  </h3>
                  <p className="text-gray-700 leading-relaxed text-base">
                    {doctor?.about}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Appointment Scheduling Section */}
        <div className="bg-white shadow-lg rounded-lg p-8 border border-gray-200">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900">
              Schedule Your Appointment
            </h2>
          </div>

          <div className="mb-10">
            <h3 className="text-lg font-medium text-gray-900 mb-6 flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              Select Your Preferred Date
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {weekDates.map((dateObj, index) => {
                const isSelected =
                  selectedDate && selectedDate.dayNumber === dateObj.dayNumber;
                return (
                  <div
                    key={index}
                    onClick={() => handleDateSelect(dateObj)}
                    className={`rounded-lg p-4 text-center cursor-pointer transition-all duration-200 border-2 ${
                      isSelected
                        ? "bg-blue-600 text-white border-blue-600 shadow-md"
                        : "bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:bg-blue-50"
                    }`}
                  >
                    <div
                      className={`text-sm mb-1 font-medium ${
                        isSelected ? "text-blue-100" : "text-gray-500"
                      }`}
                    >
                      {dateObj.dayName}
                    </div>
                    <div
                      className={`text-xl font-semibold mb-1 ${
                        isSelected ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {dateObj.dayNumber}
                    </div>
                    <div
                      className={`text-sm font-medium ${
                        isSelected ? "text-blue-100" : "text-gray-500"
                      }`}
                    >
                      {dateObj.month}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {selectedDate && (
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Clock className="w-4 h-4 text-blue-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">
                  Time Slots for {selectedDate.dayName}, {selectedDate.month}{" "}
                  {selectedDate.dayNumber}
                </h3>
              </div>

              {loadingSlots ? (
                <div className="flex justify-center items-center py-10">
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-blue-600 border-opacity-50" />
                  <span className="ml-2 text-sm text-gray-600">
                    Loading slots...
                  </span>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {timeSlots.map((time, timeIndex) => {
                    const isSelected = selectedSlot?.time === time;
                    const booked = isBooked(time);

                    return (
                      <button
                        key={timeIndex}
                        onClick={() => !booked && handleSlotSelect(time)}
                        disabled={booked}
                        className={`relative px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all duration-200 ${
                          booked
                            ? "bg-gray-300 text-gray-500 border-gray-400 cursor-not-allowed"
                            : isSelected
                            ? "bg-blue-600 text-white border-blue-600 shadow-md"
                            : "bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-400"
                        }`}
                      >
                        {time}
                        {booked && (
                          <span className="absolute bottom-1 right-1 text-[10px] text-red-500 font-semibold">
                            Booked
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              Reason for Visit
            </h3>
            <textarea
              value={reasonForVisit}
              onChange={(e) => setReasonForVisit(e.target.value)}
              placeholder="Please describe the reason for your visit (e.g., routine checkup, specific symptoms, follow-up appointment)"
              className="w-full p-4 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none h-28 text-gray-700 placeholder-gray-400 transition-all duration-200"
              required
            />
          </div>

          <div className="text-center">
            <button
              onClick={handleBookAppointment}
              disabled={loading || !selectedSlot || !reasonForVisit.trim()}
              className={`px-8 py-3 rounded-lg font-medium text-base transition-all duration-200 ${
                selectedSlot && reasonForVisit.trim() && !loading
                  ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {bookingAppointment ? "Booking..." : "Confirm Appointment"}
            </button>

            {selectedSlot && (
              <div className="mt-6 p-6 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="text-lg font-medium text-blue-900 mb-2">
                  Appointment Summary
                </h4>
                <p className="text-blue-800 font-medium mb-2">
                  📅 {selectedSlot.date.dayName}, {selectedSlot.date.month}{" "}
                  {selectedSlot.date.dayNumber} at {selectedSlot.time}
                </p>
                {reasonForVisit && (
                  <p className="text-blue-700">
                    📝 <strong>Reason:</strong> {reasonForVisit}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookAppointment;
