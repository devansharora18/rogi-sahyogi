import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { getFirestore, collection, getDocs, setDoc, doc, query, orderBy, limit } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { app } from '../firebase/firebase';

const db = getFirestore(app);
const auth = getAuth(app);

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctor: {
    name: string;
    price: number;
  };
  estimatedTime: string;
  reportsToSubmit: number;
  setReportsToSubmit: (value: number) => void;
  onConfirm: (selectedDate: Date) => void;
}

interface Report {
  id: string;
  endDate: string;
  report: string;
  startDate: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  doctor,
  estimatedTime,
  reportsToSubmit,
  setReportsToSubmit,
  onConfirm,
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [userReports, setUserReports] = useState<Report[]>([]);

  useEffect(() => {
    const fetchReports = async () => {
      if (!auth.currentUser || reportsToSubmit === 0) return;
      
      const uid = auth.currentUser.uid;
      const reportsRef = collection(db, `user/${uid}/reports`);
      const q = query(
        reportsRef,
        orderBy('endDate', 'desc'),
        limit(reportsToSubmit)
      );

      try {
        const querySnapshot = await getDocs(q);
        const reports = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Report));
        setUserReports(reports);
      } catch (error) {
        console.error('Error fetching reports:', error);
      }
    };

    fetchReports();
  }, [reportsToSubmit]);

  const handleConfirm = async () => {
    if (!auth.currentUser || !selectedDate) return;

    try {
      const uid = auth.currentUser.uid;
      const appointmentRef = doc(collection(db, `user/${uid}/appointments`));

      await setDoc(appointmentRef, {
        doctor: doctor.name,
        date: selectedDate,
        requested_reports: reportsToSubmit,
        submitted_reports: userReports.map(report => ({
          id: report.id,
		  startDate: report.startDate,
          endDate: report.endDate,
          report: report.report
        })),
        price: doctor.price,
        status: 'booked',
      });

      onClose();
      alert(`Appointment booked and last ${userReports.length} reports sent!`);
    } catch (error) {
      console.error('Error booking appointment:', error);
      alert('Error booking appointment. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 className="text-xl font-semibold mb-4">Confirm Appointment</h3>
        <p className="mb-2">
          <span className="font-medium">Doctor:</span> {doctor.name}
        </p>
        <p className="mb-2">
          <span className="font-medium">Estimated Wait Time:</span> {estimatedTime}
        </p>
        <p className="mb-4">
          <span className="font-medium">Total Fee:</span> ₹{doctor.price}
        </p>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Appointment Date:
          </label>
          <DatePicker
            selected={selectedDate}
            onChange={(date: Date | null) => setSelectedDate(date)}
            className="w-full p-2 border rounded-lg"
            dateFormat="dd/MM/yyyy"
            minDate={new Date()}
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Include previous health reports:
          </label>
          <select
            value={reportsToSubmit}
            onChange={(e) => setReportsToSubmit(Number(e.target.value))}
            className="w-full p-2 border rounded-lg"
          >
            {[0, 1, 2, 3, 4, 5].map((num) => (
              <option key={num} value={num}>
                {num === 0 ? 'None' : `Last ${num} report${num > 1 ? 's' : ''}`}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end gap-4">
          <button
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            onClick={handleConfirm}
          >
            Confirm Booking
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
