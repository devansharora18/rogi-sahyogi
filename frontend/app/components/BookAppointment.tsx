import React, { useState, useEffect } from 'react';
import { doctors as doctorsData } from '../components/data/doctors.js';
import { haversine } from '../utils/haversine';
import ConfirmationModal from './ConfirmationModal';

interface Doctor {
  name: string;
  district: string;
  latitude: number;
  longitude: number;
  address: string;
  yearsOfExperience: number;
  waitingList: number;
  price: number;
  rating?: number;
  distance?: number;
}

const doctors: Doctor[] = doctorsData;

export default function BookAppointment() {
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [nearestDoctors, setNearestDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [estimatedTime, setEstimatedTime] = useState("");
  const [reportsToSubmit, setReportsToSubmit] = useState(0);
  const [expandedDoctor, setExpandedDoctor] = useState<string | null>(null);

  useEffect(() => {
    const getLocation = () => {
      if (!navigator.geolocation) {
        setError("Geolocation is not supported by your browser");
        setLoading(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
          setLoading(false);
        },
        (error) => {
          setError("Unable to retrieve your location. Using default location (Chennai).");
          setUserLocation({ lat: 13.0827, lon: 80.2707 }); // Default to Chennai
          setLoading(false);
        }
      );
    };

    getLocation();
  }, []);

  useEffect(() => {
    if (userLocation) {
      const processedDoctors = doctors.map(doctor => ({
        ...doctor,
        rating: parseFloat((Math.random() * (4.8 - 3.0) + 3.0).toFixed(1)),
        distance: haversine(userLocation.lat, userLocation.lon, doctor.latitude, doctor.longitude)
      }));

      const sortedDoctors = processedDoctors.sort((a, b) => 
        (a.distance || Infinity) - (b.distance || Infinity)
      );

      setNearestDoctors(sortedDoctors);
    }
  }, [userLocation]);

  const handleScheduleVisit = (doctor: Doctor) => {
    const minutesWait = doctor.waitingList * 15;
    const hours = Math.floor(minutesWait / 60);
    const minutes = minutesWait % 60;
    setEstimatedTime(
      hours > 0 ? `${hours} hrs ${minutes} mins` : `${minutes} mins`
    );
    setSelectedDoctor(doctor);
    setShowConfirmationModal(true);
  };

  const toggleDetails = (doctorName: string) => {
    setExpandedDoctor(prev => prev === doctorName ? null : doctorName);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 p-4">
        {error}
      </div>
    );
  }

  return (
    <div className="bg-white p-4 md:p-6 rounded-lg shadow-md max-w-4xl mx-auto">
      <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-gray-700">Find Nearby Doctors</h2>
      
      <div className="space-y-4">
        {nearestDoctors.map((doctor) => (
          <div key={doctor.name} className="bg-gray-50 p-4 rounded-lg hover:shadow-lg transition-shadow border border-gray-200">
            <div className="flex flex-col md:flex-row justify-between items-start">
              <div className="flex-1 w-full">
                <div className="flex flex-wrap items-center gap-2 md:gap-4 mb-2">
                  <h3 className="text-lg md:text-xl font-semibold text-gray-800">
                    {doctor.name}
                  </h3>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs md:text-sm rounded-full">
                    {doctor.yearsOfExperience} years experience
                  </span>
                </div>
                
                <div className="md:hidden">
                  <button 
                    className="text-blue-600 underline text-sm mb-2"
                    onClick={() => toggleDetails(doctor.name)}
                  >
                    {expandedDoctor === doctor.name ? 'Hide Details' : 'View Details'}
                  </button>
                </div>

                <div className="hidden md:grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600 mb-1">
                      <span className="font-medium">Distance:</span> {doctor.distance?.toFixed(1)} km
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium">Location:</span> {doctor.address}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-gray-600 mb-1">
                      <span className="font-medium">Rating:</span> ⭐ {doctor.rating}/5
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium">Wait List:</span> {doctor.waitingList} patients ahead
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium">Consultation Fee:</span> ₹{doctor.price}
                    </p>
                  </div>
                </div>

                {expandedDoctor === doctor.name && (
                  <div className="md:hidden grid grid-cols-1 gap-2 text-sm mt-2">
                    <p className="text-gray-600">
                      <span className="font-medium">Distance:</span> {doctor.distance?.toFixed(1)} km
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium">Location:</span> {doctor.address}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium">Rating:</span> ⭐ {doctor.rating}/5
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium">Wait List:</span> {doctor.waitingList} patients ahead
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium">Consultation Fee:</span> ₹{doctor.price}
                    </p>
                  </div>
                )}
              </div>

              <div className="w-full md:w-auto mt-4 md:mt-0 md:ml-4">
                <button 
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm w-full md:w-auto"
                  onClick={() => handleScheduleVisit(doctor)}
                >
                  Schedule Visit
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <ConfirmationModal
        isOpen={showConfirmationModal}
        onClose={() => setShowConfirmationModal(false)}
        doctor={{
          name: selectedDoctor?.name || '',
          price: selectedDoctor?.price || 0
        }}
        estimatedTime={estimatedTime}
        reportsToSubmit={reportsToSubmit}
        setReportsToSubmit={setReportsToSubmit}
        onConfirm={(selectedDate) => {
          console.log('Appointment Date:', selectedDate);
        }}
      />

      {nearestDoctors.length === 0 && !loading && (
        <div className="text-gray-500 text-center py-8">
          No doctors found in your area
        </div>
      )}
    </div>
  );
}
