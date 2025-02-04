'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { app } from '../firebase/firebase';
import Image from 'next/image';

export default function Signup() {
  const router = useRouter();
  const auth = getAuth(app);
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push('/home');
      }
    });
    return () => unsubscribe();
  }, [auth, router]);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      router.push('/home');
    } catch (error) {
      console.error('Google sign-in error:', error);
    }
  };

  return (
    <div className="flex flex-col min-h-screen md:flex-row bg-none bg-cover bg-center" style={{ backgroundImage: "url('/background-image.png')" }}>
      {/* Logo Section */}
      <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-4 md:p-8">
        <div className="flex flex-col items-center">
          <div className="rounded-full mb-4 shadow-lg">
            <Image src="/logo.png" alt="Logo" width={100} height={100} className="w-24 h-24 md:w-32 md:h-32" />
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-blue-600 text-center">RogiSahyogi</h1>
          <p className="text-gray-600 mt-2 text-center text-sm md:text-base">Your Voice, Your Health <br /> Simplified and Understood</p>
        </div>
      </div>
      
      {/* Form Section */}
      <div className="w-full md:w-1/2 flex flex-col justify-center px-6 md:px-16 py-8 bg-white shadow-lg rounded-t-[50px] md:rounded-s-[80px]">
        <div className="w-full max-w-md mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-blue-700 text-center mb-6">CREATE ACCOUNT</h2>
          
          {/* Social Login Buttons */}
          <div className="flex flex-col space-y-3 mb-6">
            <button onClick={signInWithGoogle} className="flex items-center justify-center border border-gray-300 rounded-full px-4 py-2 shadow-sm hover:bg-gray-50 transition duration-150 text-gray-600">
              <Image src="/google-icon.png" alt="Google" width={24} height={24} />
              <span className="ml-3 text-sm font-medium">Continue with Google</span>
            </button>
            <button className="flex items-center justify-center border border-gray-300 rounded-full px-4 py-2 shadow-sm hover:bg-gray-50 transition duration-150">
              <Image src="/facebook-icon.png" alt="Facebook" width={24} height={24} />
              <span className="ml-3 text-sm font-medium text-gray-600">Continue with Facebook</span>
            </button>
          </div>
          
          <div className="relative text-center my-6">
            <hr className="border-gray-300" />
            <span className="text-sm text-gray-500 bg-white px-3 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">OR</span>
          </div>
          
          {/* Input Fields */}
          <div className="space-y-4">
            <input 
              type="text" 
              placeholder="Full Name" 
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              value={fullName} 
              onChange={(e) => setFullName(e.target.value)}
            />
            <input 
              type="text" 
              placeholder="Phone Number" 
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              value={phoneNumber} 
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
            <input 
              type="password" 
              placeholder="Password" 
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          
          {/* Create Account Button */}
          <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold mt-6 hover:bg-blue-700 transition duration-150">
            CREATE ACCOUNT
          </button>
        </div>
      </div>
    </div>
  );
}
