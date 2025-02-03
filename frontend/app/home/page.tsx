'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { app } from '../firebase/firebase';
import Image from 'next/image';
import { User } from 'firebase/auth';

export default function Dashboard() {
  const router = useRouter();
  const auth = getAuth(app);
  const [user, setUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);

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

  return (
    <div className="min-h-screen bg-gray-100 text-gray-700">
      {/* Header */}
      <header className="bg-white shadow-md p-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Image src="/logo.png" alt="Logo" width={40} height={40} />
            <span className="text-xl font-bold text-gray-800">YOU COME FIRST</span>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6 flex gap-8">
        {/* Sidebar */}
        <aside className="w-64 bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">My Dashboard</h2>
          <nav className="space-y-3">
            {[
              { label: 'Account', icon: 'person' },
              { label: 'My Doctor', icon: 'medical_services' },
              { label: 'My Health', icon: 'favorite' },
              { label: 'Book Appointment', icon: 'calendar_today' },
              { label: 'My Appointments', icon: 'schedule' },
            ].map(({ label, icon }) => (
              <div key={label} className="flex items-center space-x-2 p-3 rounded-lg hover:bg-blue-100 cursor-pointer">
                <span className="material-icons text-blue-600">
                  <Image src={`${icon}.svg`} alt={icon} width={20} height={20} />
                </span>
                <span className="text-gray-800">{label}</span>
              </div>
            ))}
          </nav>
        </aside>

        {/* Form Content */}
        <main className="flex-1 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-6 text-gray-700">Profile Information</h2>
          <div className="grid grid-cols-2 gap-6">
            {[
              { label: 'Email', value: user?.email ?? '', type: 'email' },
              { label: 'Full Name', value: user?.displayName ?? '', type: 'text' },
              { label: 'Phone Number', value: '', type: 'tel' },
              { label: 'Height', value: '', type: 'text' },
              { label: 'Weight', value: '', type: 'text' },
              { label: 'Chronic Diseases (if any)', value: '', type: 'text' },
            ].map(({ label, value, type }) => (
              <div key={label}>
                <label className="block text-sm text-gray-600 mb-1">{label}</label>
                <input
                  type={type}
                  value={value}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring focus:ring-blue-300"
                  placeholder={label}
                  disabled={!isEditing}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-end mt-6 space-x-4">
            <button
              onClick={() => setIsEditing((prev) => !prev)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              {isEditing ? 'Save' : 'Edit'}
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
