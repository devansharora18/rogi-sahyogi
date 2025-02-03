'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { app } from '../firebase/firebase';
import Image from 'next/image';
import { User } from 'firebase/auth';
import Profile from '../components/Profile';

export default function Dashboard() {
  const router = useRouter();
  const auth = getAuth(app);
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Account'); // Default tab

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

  const handleLogout = () => {
    signOut(auth).then(() => {
      router.push('/login');
    }).catch((error) => {
      console.error("Logout Error:", error);
    });
  };

  // Function to render the selected component
  const renderContent = () => {
    switch (activeTab) {
      case 'Account':
        return <Profile user={user} />;
      case 'My Doctor':
        return <div className="bg-white p-6 rounded-lg shadow-md">Doctor Info Coming Soon</div>;
      case 'My Health':
        return <div className="bg-white p-6 rounded-lg shadow-md">Health Records Coming Soon</div>;
      case 'Book Appointment':
        return <div className="bg-white p-6 rounded-lg shadow-md">Booking System Coming Soon</div>;
      case 'My Appointments':
        return <div className="bg-white p-6 rounded-lg shadow-md">Appointments List Coming Soon</div>;
      default:
        return <Profile user={user} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-700">
      {/* Header */}
      <header className="bg-white shadow-md p-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Image src="/logo.png" alt="Logo" width={40} height={40} />
            <span className="text-xl font-bold text-gray-800">YOU COME FIRST</span>
          </div>

          {/* Hamburger Menu for Mobile */}
          <button 
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-gray-600 text-2xl"
          >
            ☰
          </button>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="hidden md:block px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6 flex flex-col md:flex-row gap-8">
        {/* Sidebar - Hidden on Mobile */}
        <aside className={`w-64 bg-white p-4 rounded-lg shadow-md md:block ${menuOpen ? "block" : "hidden"}`}>
          <h2 className="text-lg font-semibold mb-4 text-gray-700">My Dashboard</h2>
          <nav className="space-y-3">
            {[
              { label: 'Account', icon: 'person' },
              { label: 'My Doctor', icon: 'medical_services' },
              { label: 'My Health', icon: 'favorite' },
              { label: 'Book Appointment', icon: 'calendar_today' },
              { label: 'My Appointments', icon: 'schedule' },
            ].map(({ label, icon }) => (
              <div
                key={label}
                className={`flex items-center space-x-2 p-3 rounded-lg cursor-pointer ${
                  activeTab === label ? 'bg-blue-200' : 'hover:bg-blue-100'
                }`}
                onClick={() => setActiveTab(label)}
              >
                <span className="material-icons text-blue-600">
                  <Image src={`${icon}.svg`} alt={icon} width={20} height={20} />
                </span>
                <span className="text-gray-800">{label}</span>
              </div>
            ))}
          </nav>
        </aside>

        {/* Main Content - Dynamic Component Rendering */}
        <main className="flex-1">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
