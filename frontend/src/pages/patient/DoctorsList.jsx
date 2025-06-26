import { 
  Phone, 
  Mail, 
  MapPin, 
  User, 
  Filter,
  Star,
  Heart,
  Eye,
  Stethoscope,
  CheckCircle,
  XCircle,
  Search,
  Sparkles
} from 'lucide-react';
import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { appContext } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';
const DoctorsList = () => {
  const [doctors, setDoctors] = useState([]);
  const {token}=useContext(appContext);
  const navigate=useNavigate();
  useEffect(() => {
    async function getDoctors() {
      try {
        const response = await axios.get("http://localhost:3000/admin/doctors", {
          headers: { token },
        });

        if (response.data.success) {
          setDoctors(response.data.data);
        }
      } catch (err) {
        console.error("Error fetching doctors:", err);
      }
    }

    getDoctors();
  }, [token]);

  const [filters, setFilters] = useState({
    specialization: 'All',
    availability: 'All'
  });

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
  
  const availabilityOptions = ['All', 'Available', 'Not Available'];

  const filteredDoctors = doctors.filter(doctor => {
    const specializationMatch = filters.specialization === 'All' || doctor.specialization === filters.specialization;
    const availabilityMatch = filters.availability === 'All' || doctor.is_available === (filters.availability === 'Available');
    return specializationMatch && availabilityMatch;
  });

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
  };

 const handleDoctorClick = (doctor) => {
    navigate(`/patient/book-appointment/${doctor.id}`); 
  };

  const getSpecializationIcon = (specialization) => {
    const icons = {
      'Cardiologist': Heart,
      'Ophthalmologist': Eye,
      'Pediatrician': User,
      'General Physician': Stethoscope,
      'Dentist': User,
      'Dermatologist': User,
      'Gynecologist': User,
      'Gastroenterologist': Stethoscope
    };
    return icons[specialization] || Stethoscope;
  };

  const DoctorCard = ({ doctor }) => {
    const IconComponent = getSpecializationIcon(doctor.specialization);
    
    return (
      <div 
        className="bg-white rounded-lg shadow-md border border-gray-200 p-6 cursor-pointer hover:shadow-xl hover:-translate-y-2 transition-all duration-300 ease-in-out transform"
        onClick={() => handleDoctorClick(doctor)}
      >
        {/* Doctor Image - Large and Rectangular */}
        <div className="mb-4">
          <div className="w-full h-64 bg-gray-100 rounded-lg overflow-hidden">
            {doctor.image ? (
              <img 
                src={doctor.image} 
                alt={doctor.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <IconComponent className="w-16 h-16 text-gray-400" />
              </div>
            )}
          </div>
        </div>
        
        {/* Doctor Information */}
        <div className="space-y-3">
          <h3 className="text-xl font-semibold text-gray-900">
            {doctor.name}
          </h3>
          
          <p className="text-blue-600 font-medium">
            {doctor.specialization}
          </p>
          
          <div className="flex items-center text-gray-600">
            <Stethoscope className="w-4 h-4 mr-2" />
            <span>{doctor.experience_years} years experience</span>
          </div>
          
          <p className="text-lg font-semibold text-green-600">
            ${doctor.consultation_fee}
          </p>
        </div>
      </div>
    );
  };

  const FilterSection = () => (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-8">
      <div className="flex items-center mb-4">
        <Filter className="w-5 h-5 text-gray-600 mr-2" />
        <h3 className="text-lg font-semibold text-gray-900">Filter Doctors</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Specialization
          </label>
          <select
            value={filters.specialization}
            onChange={(e) => handleFilterChange('specialization', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {specializations.map(spec => (
              <option key={spec} value={spec}>{spec}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Availability
          </label>
          <select
            value={filters.availability}
            onChange={(e) => handleFilterChange('availability', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {availabilityOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="mt-4 flex items-center justify-between">
        <span className="text-sm text-gray-600">
          Showing {filteredDoctors.length} doctor{filteredDoctors.length !== 1 ? 's' : ''}
        </span>
        {(filters.specialization !== 'All' || filters.availability !== 'All') && (
          <button
            onClick={() => setFilters({ specialization: 'All', availability: 'All' })}
            className="text-sm bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
          >
            Clear Filters
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Our Doctors
          </h1>
          <p className="text-lg text-gray-600">
            Find experienced healthcare professionals
          </p>
        </div>

        <FilterSection />

        {/* Doctors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
          {filteredDoctors.map((doctor) => (
            <DoctorCard key={doctor.id} doctor={doctor} />
          ))}
        </div>

        {/* No Results */}
        {filteredDoctors.length === 0 && (
          <div className="text-center py-16 bg-white rounded-lg shadow-md">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No doctors found</h3>
            <p className="text-gray-500 mb-4">Try adjusting your filters</p>
            <button
              onClick={() => setFilters({ specialization: 'All', availability: 'All' })}
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Show All Doctors
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorsList;