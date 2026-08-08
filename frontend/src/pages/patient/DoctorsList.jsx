import React, { useState, useContext, useEffect } from 'react';
import { 
  Stethoscope, 
  Filter, 
  Heart, 
  Eye, 
  User, 
  Search, 
  Award, 
  MapPin, 
  CheckCircle2, 
  ArrowRight,
  BookOpen,
  Sparkles,
  X
} from 'lucide-react';
import axios from 'axios';
import { appContext } from '../../context/AppContext';
import { useNavigate, useSearchParams } from 'react-router-dom';

const DoctorsList = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useContext(appContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const initialSearch = searchParams.get('search') || '';
  const initialSpecialty = searchParams.get('specialty') || 'All';

  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [filters, setFilters] = useState({
    specialization: initialSpecialty,
    availability: 'All'
  });

  useEffect(() => {
    async function getDoctors() {
      setLoading(true);
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/admin/doctors`, {
          headers: { token },
        });

        if (response.data.success) {
          setDoctors(response.data.data);
        }
      } catch (err) {
        console.error("Error fetching doctors:", err);
      } finally {
        setLoading(false);
      }
    }

    getDoctors();
  }, [token]);

  const specializations = [
    'All',
    'General Physician', 
    'Cardiologist', 
    'Dermatologist', 
    'Gynecologist', 
    'Pediatrician', 
    'Ophthalmologist', 
    'Dentist', 
    'Gastroenterologist'
  ];

  const filteredDoctors = doctors.filter(doctor => {
    const searchMatch = 
      !searchTerm.trim() ||
      doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doctor.address && doctor.address.toLowerCase().includes(searchTerm.toLowerCase()));

    const specializationMatch = filters.specialization === 'All' || doctor.specialization === filters.specialization;
    const availabilityMatch = filters.availability === 'All' || doctor.is_available === (filters.availability === 'Available');
    
    return searchMatch && specializationMatch && availabilityMatch;
  });

  const handleDoctorClick = (doctor) => {
    navigate(`/patient/book-appointment/${doctor.id}`); 
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden rounded-3xl border border-white/10 shadow-2xl my-2 p-6 sm:p-10">
      {/* Background Gradients */}
      <div className="absolute top-0 right-10 w-96 h-96 bg-blue-500/15 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-indigo-500/15 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10">

        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Verified Healthcare Specialists</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Find Your Specialist Doctor
          </h1>
          <p className="text-slate-400 mt-3 text-base sm:text-lg">
            Browse through our network of certified medical professionals and book your appointment instantly.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-slate-900/90 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/15 p-6 mb-10">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            
            {/* Search Input */}
            <div className="w-full lg:w-1/2 relative">
              <Search className="w-5 h-5 text-cyan-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by doctor name, specialty, or location..."
                className="w-full pl-11 pr-10 py-3 bg-slate-950/80 border border-white/15 rounded-2xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all placeholder-slate-400"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filter Controls */}
            <div className="w-full lg:w-1/2 flex flex-wrap sm:flex-nowrap gap-3 items-center justify-end">
              <div className="w-full sm:w-auto flex-1">
                <select
                  value={filters.specialization}
                  onChange={(e) => setFilters(prev => ({ ...prev, specialization: e.target.value }))}
                  className="w-full px-4 py-3 bg-slate-950/80 border border-white/15 rounded-2xl text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all"
                >
                  {specializations.map(spec => (
                    <option key={spec} value={spec} className="bg-slate-900 text-white">
                      {spec === 'All' ? 'All Specialties' : spec}
                    </option>
                  ))}
                </select>
              </div>

              <div className="w-full sm:w-auto">
                <select
                  value={filters.availability}
                  onChange={(e) => setFilters(prev => ({ ...prev, availability: e.target.value }))}
                  className="w-full px-4 py-3 bg-slate-950/80 border border-white/15 rounded-2xl text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all"
                >
                  <option value="All" className="bg-slate-900 text-white">All Statuses</option>
                  <option value="Available" className="bg-slate-900 text-white">Available Only</option>
                </select>
              </div>

              {(filters.specialization !== 'All' || filters.availability !== 'All' || searchTerm) && (
                <button
                  onClick={() => {
                    setFilters({ specialization: 'All', availability: 'All' });
                    setSearchTerm('');
                  }}
                  className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl text-sm font-semibold transition-colors flex items-center gap-1 whitespace-nowrap border border-white/10"
                >
                  <X className="w-4 h-4" />
                  <span>Reset</span>
                </button>
              )}
            </div>

          </div>

          {/* Specialty Pill Quick Bar */}
          <div className="mt-6 pt-4 border-t border-white/10 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2 whitespace-nowrap">
              Quick Select:
            </span>
            {specializations.map(spec => (
              <button
                key={spec}
                onClick={() => setFilters(prev => ({ ...prev, specialization: spec }))}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  filters.specialization === spec
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md shadow-blue-500/25'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white border border-white/10'
                }`}
              >
                {spec}
              </button>
            ))}
          </div>
        </div>

        {/* Doctors Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="bg-slate-900/80 rounded-3xl p-6 border border-white/10 animate-pulse space-y-4">
                <div className="w-full h-56 bg-slate-800 rounded-2xl"></div>
                <div className="h-6 bg-slate-800 rounded w-3/4"></div>
                <div className="h-4 bg-slate-800 rounded w-1/2"></div>
                <div className="h-10 bg-slate-800 rounded-xl"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-16">
            {filteredDoctors.map((doctor) => (
              <div
                key={doctor.id}
                onClick={() => handleDoctorClick(doctor)}
                className="group bg-slate-900/90 rounded-3xl p-5 shadow-2xl hover:shadow-cyan-500/10 border border-white/15 hover:border-cyan-400/50 transition-all duration-300 transform hover:-translate-y-2 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  {/* Doctor Image Container */}
                  <div className="relative mb-4 overflow-hidden rounded-2xl bg-slate-950 h-60 border border-white/10">
                    <img
                      src={doctor.image || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&h=500&fit=crop'}
                      alt={doctor.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3 bg-slate-950/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-cyan-400 border border-white/15 shadow-md">
                      ₹{doctor.consultation_fee}
                    </div>
                  </div>

                  {/* Doctor Information */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-cyan-300 bg-cyan-500/15 border border-cyan-500/30 px-2.5 py-1 rounded-md">
                        {doctor.specialization}
                      </span>
                      <div className="flex items-center text-amber-400 text-xs font-semibold">
                        <span>★ 4.9</span>
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                      Dr. {doctor.name}
                    </h3>

                    {doctor.experience_years && (
                      <div className="flex items-center text-xs text-slate-400 gap-1.5">
                        <Award className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{doctor.experience_years} years experience</span>
                      </div>
                    )}

                    {doctor.qualification && (
                      <div className="flex items-center text-xs text-slate-400 gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                        <span className="truncate">{doctor.qualification}</span>
                      </div>
                    )}

                    {doctor.address && (
                      <div className="flex items-center text-xs text-slate-400 gap-1.5 pt-1">
                        <MapPin className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                        <span className="truncate">{doctor.address}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Booking Button */}
                <div className="mt-5 pt-3 border-t border-white/10">
                  <button className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 group-hover:from-blue-500 group-hover:to-cyan-400 text-white rounded-xl py-3 text-xs sm:text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20">
                    <span>Book Appointment</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredDoctors.length === 0 && (
          <div className="bg-slate-900/90 rounded-3xl shadow-2xl border border-white/15 p-12 text-center max-w-lg mx-auto mb-16">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center text-slate-400 mx-auto mb-4">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No Doctors Found</h3>
            <p className="text-slate-400 text-sm mb-6">
              We couldn't find any doctor matching your active filters or search terms.
            </p>
            <button
              onClick={() => {
                setFilters({ specialization: 'All', availability: 'All' });
                setSearchTerm('');
              }}
              className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold px-6 py-3 rounded-2xl text-sm transition-all"
            >
              Clear All Filters
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default DoctorsList;