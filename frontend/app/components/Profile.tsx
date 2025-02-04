import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import { getAuth, signOut } from 'firebase/auth';
import { app } from '../firebase/firebase';
import { useRouter } from 'next/navigation';


const db = getFirestore(app);
const auth = getAuth(app);

interface User {
  uid: string;
  email: string;
  displayName: string;
  phoneNumber?: string;
  height?: string;
  weight?: string;
  chronicDiseases?: string;
  bloodGroup?: string;
}

export default function Profile() {
  const [profileData, setProfileData] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [profileAttempted, setProfileAttempted] = useState(false);

  const router = useRouter();
  

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        console.log("No authenticated user");
        setProfileAttempted(true);
        return;
      }

      try {
        const profileRef = doc(db, 'user', user.uid, 'profile', 'details');
        const profileSnap = await getDoc(profileRef);

        if (profileSnap.exists()) {
          console.log("Existing profile found");
          setProfileData(profileSnap.data() as User);
        } else {
          console.log("No existing profile, creating new one");
          const newProfile = {
            uid: user.uid,
            email: user.email || '',
            displayName: user.displayName || '',
            phoneNumber: '',
            height: '',
            weight: '',
            chronicDiseases: '',
            bloodGroup: '',
          };
          await setDoc(profileRef, newProfile);
          setProfileData(newProfile);
        }
      } catch (error) {
        console.error("Error handling profile:", error);
      } finally {
        setProfileAttempted(true);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSave = async () => {
    if (!profileData) return;
    const profileRef = doc(db, 'user', profileData.uid, 'profile', 'details');
    await setDoc(profileRef, profileData);
    setIsEditing(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!profileData) return;
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  if (!profileAttempted) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  const handleLogout = () => {
    signOut(auth).then(() => {
      router.push('/login');
    }).catch((error) => {
      console.error("Logout Error:", error);
    });
  };

  if (!profileData) {
    return (
      <div className="text-red-500">
        Authentication expired. Please <a href="/login" className="underline">log in again</a>.
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-700">Profile Information</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { label: 'Email', value: profileData.email, type: 'email', name: 'email' },
          { label: 'Full Name', value: profileData.displayName, type: 'text', name: 'displayName' },
          { label: 'Phone Number', value: profileData.phoneNumber ?? '', type: 'tel', name: 'phoneNumber' },
          { label: 'Height', value: profileData.height ?? '', type: 'text', name: 'height' },
          { label: 'Weight', value: profileData.weight ?? '', type: 'text', name: 'weight' },
          { label: 'Chronic Diseases (if any)', value: profileData.chronicDiseases ?? '', type: 'text', name: 'chronicDiseases' },
          { label: 'Blood Group', value: profileData.bloodGroup ?? '', type: 'text', name: 'bloodGroup' },
        ].map(({ label, value, type, name }) => (
          <div key={label}>
            <label className="block text-sm text-gray-600 mb-1">{label}</label>
            <input
              type={type}
              name={name}
              value={value}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring focus:ring-blue-300"
              placeholder={label}
              disabled={!isEditing}
            />
          </div>
        ))}
      </div>
      <div className="flex justify-end mt-6 mb-4">
        <button
          onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          {isEditing ? 'Save' : 'Edit'}
        </button>
		<button
            onClick={handleLogout}
            className="px-4 mx-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
          >
            Logout
          </button>
      </div>
    </div>
  );
}
