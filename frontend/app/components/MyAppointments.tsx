import React, { useState, useEffect } from 'react';
import { getFirestore, collection, query, getDocs, orderBy, Timestamp, doc, updateDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { app } from '../firebase/firebase';
import { format } from 'date-fns';

const db = getFirestore(app);
const auth = getAuth(app);

interface Appointment {
  id: string;
  doctor: string;
  date: Timestamp;
  price: number;
  status: 'booked' | 'completed' | 'cancelled';
  submitted_reports: {
    id: string;
    endDate: string;
    report: string;
  }[];
}

interface CancelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const CancelModal: React.FC<CancelModalProps> = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full">
        <h3 className="text-xl font-semibold mb-4">Cancel Appointment</h3>
        <p className="text-gray-600 mb-6">Are you sure you want to cancel this appointment?</p>
        <div className="flex justify-end gap-4">
          <button
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            onClick={onClose}
          >
            No, Keep it
          </button>
          <button
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            onClick={onConfirm}
          >
            Yes, Cancel it
          </button>
        </div>
      </div>
    </div>
  );
};

const MyAppointments: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<string | null>(null);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    if (!auth.currentUser) return;

    try {
      const uid = auth.currentUser.uid;
      const appointmentsRef = collection(db, `user/${uid}/appointments`);
      const q = query(
        appointmentsRef,
        orderBy('date', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const fetchedAppointments = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Appointment[];

      // Update status for any appointments that have passed the current time
      const currentTimestamp = Timestamp.now();
      const updatedAppointments = await Promise.all(fetchedAppointments.map(async (appointment) => {
        if (appointment.status === 'booked' && appointment.date.seconds < currentTimestamp.seconds) {
          // Update the status to 'completed' if the appointment time has passed
          const appointmentRef = doc(db, `user/${uid}/appointments`, appointment.id);
          await updateDoc(appointmentRef, { status: 'completed' });
          return { ...appointment, status: 'completed' };
        }
        return appointment;
      }));

      setAppointments(updatedAppointments);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelClick = (appointmentId: string) => {
    setSelectedAppointment(appointmentId);
    setShowCancelModal(true);
  };

  const handleCancelConfirm = async () => {
    if (!auth.currentUser || !selectedAppointment) return;

    try {
      const uid = auth.currentUser.uid;
      const appointmentRef = doc(db, `user/${uid}/appointments`, selectedAppointment);

      await updateDoc(appointmentRef, {
        status: 'cancelled'
      });

      await fetchAppointments();  // Refresh the list
      setShowCancelModal(false);
      setSelectedAppointment(null);
      alert('Appointment cancelled successfully');
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      alert('Error cancelling appointment. Please try again.');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'booked':
        return {
          color: 'bg-blue-100 text-blue-800',
          label: 'Booked'
        };
      case 'completed':
        return {
          color: 'bg-green-100 text-green-800',
          label: 'Completed'
        };
      case 'cancelled':
        return {
          color: 'bg-red-100 text-red-800',
          label: 'Cancelled'
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800',
          label: status
        };
    }
  };

  const formatDate = (timestamp: Timestamp) => {
    return format(timestamp.toDate(), 'dd MMMM yyyy hh:mm a');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">My Appointments</h2>
        
        {appointments.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">No appointments found</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {appointments.map((appointment) => {
              const statusBadge = getStatusBadge(appointment.status);
              
              return (
                <div
                  key={appointment.id}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-semibold">{appointment.doctor}</h3>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${statusBadge.color}`}
                    >
                      {statusBadge.label}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <p className="text-gray-600">
                      <span className="font-medium">Date & Time:</span>{' '}
                      {formatDate(appointment.date)}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium">Fee:</span> ₹{appointment.price}
                    </p>

                    {appointment.submitted_reports.length > 0 && (
                      <div className="mt-4">
                        <p className="font-medium text-gray-700 mb-2">Submitted Reports:</p>
                        <div className="space-y-2">
                          {appointment.submitted_reports.map((report) => (
                            <div
                              key={report.id}
                              className="bg-gray-50 p-3 rounded-md"
                            >
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Date:</span> {report.endDate}
                              </p>
                              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                {report.report}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {appointment.status === 'booked' && (
                      <button
                        onClick={() => handleCancelClick(appointment.id)}
                        className="mt-4 w-full px-4 py-2 text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
                      >
                        Cancel Appointment
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <CancelModal
        isOpen={showCancelModal}
        onClose={() => {
          setShowCancelModal(false);
          setSelectedAppointment(null);
        }}
        onConfirm={handleCancelConfirm}
      />
    </>
  );
};

export default MyAppointments;
