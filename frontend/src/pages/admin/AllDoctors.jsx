import React, { useContext, useEffect, useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Phone, 
  Mail, 
  MapPin,
  CheckCircle2,
  XCircle,
  User,
  Sparkles,
  Award,
  DollarSign
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { appContext } from '../../context/AppContext';

const AllDoctors = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSpecialization, setFilterSpecialization] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const navigate = useNavigate();
  const { token } = useContext(appContext);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getDoctors() {
      try {
        setLoading(true);
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

    if (token) {
      getDoctors();
    }
  }, [token]);

  const specializations = [
    'General Physician', 'Cardiologist', 'Dermatologist', 
    'Gynecologist', 'Pediatrician', 'Ophthalmologist', 
    'Dentist', 'Gastroenterologist'
  ];

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = (doctor.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (doctor.specialization || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialization = filterSpecialization === '' || doctor.specialization === filterSpecialization;
    const matchesStatus = filterStatus === '' || doctor.is_available === (filterStatus === 'available');
    
    return matchesSearch && matchesSpecialization && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-300 font-medium">Fetching registered doctors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden rounded-3xl border border-white/10 shadow-2xl my-2 p-6 sm:p-10">
      {/* Background Gradients */}
      <div className="absolute top-0 left-10 w-96 h-96 bg-purple-500/15 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-500/15 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-400/30 text-purple-300 text-xs font-semibold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Medical Roster Management</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              All Registered Doctors
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              View specialist profiles, consultation rates, experience, and availability statuses.
            </p>
          </div>

          <button
            onClick={() => navigate('/admin/add-doctor')}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold px-6 py-3 rounded-2xl shadow-lg shadow-purple-500/25 transition-all flex items-center gap-2 text-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Doctor</span>
          </button>
        </div>

        {/* Filters Box */}
        <div className="bg-slate-900/90 backdrop-blur-2xl p-6 rounded-3xl border border-white/15 shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3.5 top-3.5 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by doctor name or specialty..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-white/15 rounded-2xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 placeholder-slate-500"
              />
            </div>

            {/* Specialization Filter */}
            <div className="relative">
              <Filter className="absolute left-3.5 top-3.5 text-slate-400 w-4 h-4" />
              <select
                value={filterSpecialization}
                onChange={(e) => setFilterSpecialization(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-white/15 rounded-2xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 font-medium"
              >
                <option value="" className="bg-slate-900 text-white">All Specializations</option>
                {specializations.map(spec => (
                  <option key={spec} value={spec} className="bg-slate-900 text-white">{spec}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950/80 border border-white/15 rounded-2xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 font-medium"
              >
                <option value="" className="bg-slate-900 text-white">All Statuses</option>
                <option value="available" className="bg-slate-900 text-white">Available</option>
                <option value="unavailable" className="bg-slate-900 text-white">Unavailable</option>
              </select>
            </div>

          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="bg-slate-900/90 backdrop-blur-2xl p-5 rounded-3xl border border-white/15">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-purple-500/20 rounded-2xl border border-purple-500/30 text-purple-400">
                <User className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Doctors</p>
                <p className="text-2xl font-extrabold text-white">{doctors.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/90 backdrop-blur-2xl p-5 rounded-3xl border border-white/15">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-emerald-500/20 rounded-2xl border border-emerald-500/30 text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Available Now</p>
                <p className="text-2xl font-extrabold text-emerald-400">
                  {doctors.filter(d => d.is_available === true).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/90 backdrop-blur-2xl p-5 rounded-3xl border border-white/15">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-rose-500/20 rounded-2xl border border-rose-500/30 text-rose-400">
                <XCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Unavailable</p>
                <p className="text-2xl font-extrabold text-rose-400">
                  {doctors.filter(d => d.is_available === false).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/90 backdrop-blur-2xl p-5 rounded-3xl border border-white/15">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-cyan-500/20 rounded-2xl border border-cyan-500/30 text-cyan-400">
                <Filter className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Specialties</p>
                <p className="text-2xl font-extrabold text-cyan-400">{specializations.length}</p>
              </div>
            </div>
          </div>

        </div>

        {/* Doctors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.map((doctor) => (
            <div 
              key={doctor.id} 
              className="bg-slate-900/90 backdrop-blur-2xl rounded-3xl p-6 shadow-2xl border border-white/15 hover:border-purple-400/40 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Doctor Profile Header */}
                <div className="flex items-start space-x-4 mb-4">
                  <img 
                    src={doctor.image || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&h=200&fit=crop'} 
                    alt={doctor.name}
                    className="w-16 h-20 rounded-2xl object-cover border border-white/15 shadow-md bg-slate-950"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-extrabold text-white truncate">
                      Dr. {doctor.name}
                    </h3>
                    <p className="text-xs text-purple-300 font-bold">{doctor.specialization}</p>
                    
                    <div className="mt-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                        doctor.is_available 
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}>
                        {doctor.is_available ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
                        {doctor.is_available ? 'Available' : 'Unavailable'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-2 mb-4 text-xs text-slate-300 bg-slate-950/60 p-3.5 rounded-2xl border border-white/5">
                  <div className="flex items-center gap-2 truncate">
                    <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{doctor.email}</span>
                  </div>
                  {doctor.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span>{doctor.phone}</span>
                    </div>
                  )}
                  {doctor.address && (
                    <div className="flex items-start gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                      <span className="line-clamp-1">{doctor.address}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Fee & Experience Stats */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-950/80 rounded-2xl border border-white/10 text-center">
                <div>
                  <p className="text-base font-extrabold text-white">{doctor.experience_years || 0} yrs</p>
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Experience</p>
                </div>
                <div>
                  <p className="text-base font-extrabold text-emerald-400">₹{doctor.consultation_fee || 500}</p>
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Fee</p>
                </div>
              </div>

            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredDoctors.length === 0 && (
          <div className="bg-slate-900/90 rounded-3xl p-12 text-center border border-white/15">
            <User className="mx-auto h-12 w-12 text-slate-500 mb-3" />
            <h3 className="text-lg font-bold text-white mb-1">No doctors found</h3>
            <p className="text-slate-400 text-xs">
              Try adjusting your search criteria or clear specialization filters.
            </p>
          </div>
        )}

      </div>
    </div>
  );
};

export default AllDoctors;