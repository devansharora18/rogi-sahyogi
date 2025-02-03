// components/Profile.tsx
import { useState } from 'react';

interface User {
  email: string;
  displayName: string;
}

export default function Profile({ user }: { user: User }) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-700">Profile Information</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
      <div className="flex justify-end mt-6">
        <button
          onClick={() => setIsEditing((prev) => !prev)}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          {isEditing ? 'Save' : 'Edit'}
        </button>
      </div>
    </div>
  );
}
