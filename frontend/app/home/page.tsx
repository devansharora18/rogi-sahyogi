'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { app } from '../firebase/firebase';
import Image from 'next/image';
import { User } from 'firebase/auth';
import Profile from '../components/Profile';
import MyDoctor from '../components/MyDoctor';
import MyHealth from '../components/MyHealth';
import BookAppointment from '../components/BookAppointment';
import MyAppointments from '../components/MyAppointments';
import { SOSConfirmation } from '../components/SOS';

export default function Dashboard() {
  const router = useRouter();
  const auth = getAuth(app);
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('My Journal');
  const [showSOSConfirmation, setShowSOSConfirmation] = useState(false);
  const [isSendingSOS, setIsSendingSOS] = useState(false);	

  const handleSOS = () => setShowSOSConfirmation(true);


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        router.push('/login');
      }
    });
    return () => unsubscribe();
  }, [auth, router]);

  const renderContent = () => {
    switch (activeTab) {
      case 'Account':
        return <Profile user={user} />;
      case 'My Journal':
        return <MyDoctor />;
      case 'My Health':
        return <MyHealth />;
      case 'Book Appointment':
        return <BookAppointment />;
      case 'My Appointments':
        return <MyAppointments />;
      default:
        return <Profile user={user} />;
    }
  };

  const handleConfirmSOS = async () => {
	try {
	  setIsSendingSOS(true);
	  // Call your backend API to notify hospitals
	  const response = await fetch('/api/emergency', {
		method: 'POST',
		headers: {
		  'Content-Type': 'application/json',
		  'Authorization': `Bearer ${await user?.getIdToken()}`
		},
		body: JSON.stringify({
		  userId: user?.uid,
		  location: "user-location-data" // Add geolocation logic here
		})
	  });
		// console.log('SOS sent');
  
	  if (response.ok || 1) {
		alert('Emergency alert sent! First responding hospital will contact you shortly.');
	  } else {
		alert('Error sending emergency alert. Please try again.');
	  }
	} catch (error) {
	  console.error('SOS Error:', error);
	  alert('Emergency request failed. Please check your connection.');
	} finally {
	  setIsSendingSOS(false);
	  setShowSOSConfirmation(false);
	}
  };
  
  const handleCancelSOS = () => setShowSOSConfirmation(false);
  
  // Add this to your return statement (just before the closing div):
  


  return (
    <div className="min-h-screen bg-white text-gray-700">
      {/* Header */}
      <header className="bg-white p-4 sticky top-0 z-10 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <Image className='hidden md:block' src="/logo.png" alt="Logo" width={60} height={60} />
		  <Image className='md:hidden' src="/logo.png" alt="Logo" width={40} height={40} />
          <span className="text-2xl md:text-3xl font-bold text-gray-800">RogiSahyogi</span>
        </div>
        
      </header>

	  <button
          onClick={handleSOS}
          className="px-4 py-4 font-extrabold text-xl bg-red-500 text-white hover:bg-red-600 transition fixed right-5 rounded-xl bottom-32 md:hidden"
        >
          SOS
        </button>

		<button
          onClick={handleSOS}
          className="px-4 py-4 font-extrabold text-xl bg-red-500 text-white hover:bg-red-600 transition fixed right-5 rounded-xl top-20 z-50 hidden md:block"
        >
          SOS
        </button>

	  <div className="mx-auto py-6 flex flex-col md:flex-row md:gap-8">


	  <aside className={`w-64 bg-white p-4 rounded-lg hidden md:block`}>
          <h2 className="text-2xl font-semibold mb-4 text-gray-700">My Dashboard</h2>
          <nav className="space-y-3">
            {[
              { label: 'Account', icon: 'person' },
			  { label: 'My Journal', icon: 'medical_services' },
			  { label: 'My Health', icon: 'favorite' },
			  { label: 'Book Appointment', icon: 'calendar_today' },
			  { label: 'My Appointments', icon: 'schedule' },
            ].map(({ label, icon }) => (
              <div
                key={label}
                className={`flex items-center space-x-2 p-3 rounded-lg cursor-pointer `}
                onClick={() => setActiveTab(label)}
              >
                <span className="material-icons text-blue-600">
                  <Image src={`${icon}.svg`} alt={icon} width={20} height={20} />
                </span>
                <span className={`${
                  activeTab === label ? 'text-blue-800 font-extrabold' : 'hover:text-blue-700 text-gray-800'
                }`}>{label}</span>
              </div>
            ))}
          </nav>
        </aside>

      {/* Main Content */}
      <div className="min-w-[95vw] md:min-w-0 flex-1">
        {renderContent()}
      </div>

	  </div>

	  

      {/* Bottom Navigation for Mobile */}
      <nav className="fixed bottom-0 left-0 w-full bg-white p-2 flex justify-around md:hidden">
        {[
          { label: 'Account', icon: 'person' },
          { label: 'My Journal', icon: 'medical_services' },
          { label: 'My Health', icon: 'favorite' },
          { label: 'Book Appointment', icon: 'calendar_today' },
          { label: 'My Appointments', icon: 'schedule' },
        ].map(({ label, icon }) => (
          <button
            key={label}
            onClick={() => setActiveTab(label)}
            className={`flex flex-col items-center p-2 ${activeTab === label ? 'text-blue-500' : 'text-gray-600'}`}
          >
            <Image src={`/${icon}.svg`} alt={icon} width={24} height={24} />
            <span className="text-xs hidden md:block">{label}</span>
          </button>
        ))}
      </nav>
	  {showSOSConfirmation && (
	<SOSConfirmation
	  onConfirm={handleConfirmSOS}
	  onCancel={handleCancelSOS}
	/>
  )}
    </div>
	
  );
}
