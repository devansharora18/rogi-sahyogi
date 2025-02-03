import { useState, useEffect } from 'react';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { app } from '../firebase/firebase';

const db = getFirestore(app);
const auth = getAuth(app);

export default function MyDoctor() {
  const [feeling, setFeeling] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [language, setLanguage] = useState('en-US');
  const [userId, setUserId] = useState<string | null>(null);

  // Get authenticated user UID
  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) setUserId(user.uid);
    });
  }, []);

  const languages = [
    { code: 'en-US', name: 'English (US)' },
    { code: 'es-ES', name: 'Spanish (ES)' },
    { code: 'fr-FR', name: 'French (FR)' },
    { code: 'hi-IN', name: 'Hindi (IN)' },
    { code: 'de-DE', name: 'German (DE)' },
    { code: 'zh-CN', name: 'Chinese (Mandarin)' },
    { code: 'ta-IN', name: 'Tamil (IN)' },
  ];

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Speech recognition is not supported in your browser.');
      return;
    }

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = language;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let transcript = event.results[0][0].transcript;
      setFeeling(transcript);
    };

    recognition.start();
  };

  const submitFeeling = async () => {
    if (!userId) {
      alert('You must be logged in to save your journal entry.');
      return;
    }

    const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const journalRef = doc(db, `user/${userId}/journals/${date}`);

    try {
      await setDoc(journalRef, { feeling }, { merge: true });
      alert('Journal entry saved successfully!');
      setFeeling(''); // Clear input after saving
    } catch (error) {
      console.error('Error saving entry:', error);
      alert('Failed to save entry.');
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-700">How are you feeling today?</h2>

      {/* Language Dropdown */}
      <div className="mb-4">
        <label className="block text-gray-600 text-sm mb-1">Choose Language:</label>
        <select 
          value={language} 
          onChange={(e) => setLanguage(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring focus:ring-blue-300"
        >
          {languages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.name}
            </option>
          ))}
        </select>
      </div>

      {/* Input Field with Mic Button */}
      <div className="flex items-center space-x-3">
        <input
          type="text"
          value={feeling}
          onChange={(e) => setFeeling(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring focus:ring-blue-300"
          placeholder="Tell here..."
        />
        <button 
          onClick={startListening} 
          className={`p-3 rounded-full ${isListening ? 'bg-red-500' : 'bg-blue-500'} text-white transition`}
        >
          🎤
        </button>
      </div>

      {/* Finish Button */}
      <button 
        onClick={submitFeeling} 
        className="mt-4 w-full bg-green-500 text-white p-3 rounded-lg hover:bg-green-600 transition"
      >
        Finish & Save 📂
      </button>

      {/* Health Report Section */}
      <div className="mt-6">
        <h3 className="text-xl font-semibold text-gray-700 flex items-center">
          HEALTH REPORT <span className="ml-2">🧑‍⚕️📋</span>
        </h3>
        <div className="mt-4 bg-gray-100 p-4 rounded-lg shadow-sm">
          <p className="text-gray-600">Your health report will be available soon.</p>
        </div>
      </div>
    </div>
  );
}
