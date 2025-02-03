import { useState, useEffect, useRef } from 'react';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { app } from '../firebase/firebase';
import axios from 'axios';

const db = getFirestore(app);
const auth = getAuth(app);

export default function MyDoctor() {
  const [feeling, setFeeling] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [language, setLanguage] = useState('en-US');
  const [userId, setUserId] = useState<string | null>(null);
  const [reportDay, setReportDay] = useState(1); // Default last 1 day
  const [report, setReport] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);


  // Get authenticated user UID
  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) setUserId(user.uid);
    });
  }, []);

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

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
      setTimeout(adjustTextareaHeight, 10);
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
      setTimeout(adjustTextareaHeight, 10);
    } catch (error) {
      console.error('Error saving entry:', error);
      alert('Failed to save entry.');
    }
  };

  const generateReport = async () => {
    if (!userId) {
      alert('You must be logged in to generate a report.');
      return;
    }

    setIsLoading(true); // Start loading

    const currentDate = new Date();
    let combinedFeeling = '';
    let startDate = '';
    let endDate = '';

    for (let i = 0; i < reportDay; i++) {
      const date = new Date(currentDate);
      date.setDate(date.getDate() - i);
      const formattedDate = date.toISOString().split('T')[0];

      // Set startDate to the earliest date
      if (i === reportDay - 1) startDate = formattedDate;

      const journalRef = doc(db, `user/${userId}/journals/${formattedDate}`);

      try {
        const docSnap = await getDoc(journalRef);
        if (docSnap.exists()) {
          const feeling = docSnap.data().feeling;
          combinedFeeling += `Day ${i + 1} (${formattedDate}): ${feeling}\n\n`;
        } else {
          combinedFeeling += `Day ${i + 1} (${formattedDate}): No entry found.\n\n`;
        }
      } catch (error) {
        console.error('Error fetching report:', error);
        alert('Failed to generate report.');
        setIsLoading(false);
        return;
      }
    }

    if (combinedFeeling.trim()) {
      // Set endDate to the current date
      endDate = currentDate.toISOString().split('T')[0];

      try {
        const response = await fetch('/api/medreport', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ journalDescription: combinedFeeling }),
        });

        const data = await response.json();
        setReport(data.report);

        // Upload the report to Firebase under user/{uid}/reports/{startdatetoenddate}
        const reportRef = doc(db, `user/${userId}/reports/${startDate}to${endDate}`);
        await setDoc(reportRef, { report: data.report, startDate, endDate });
        console.log('Report saved to Firestore successfully!');
      } catch (error) {
        console.error('Error calling API or saving report:', error);
        alert('Failed to generate or save report.');
      }
    } else {
      setReport('No journal entries found for the selected period.');
    }

    setIsLoading(false); // Stop loading
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

      {/* Expandable Textarea with Mic Button */}
      <div className="flex items-start space-x-3">
        <textarea
          ref={textareaRef}
          rows={1}
          value={feeling}
          onChange={(e) => {
            setFeeling(e.target.value);
            adjustTextareaHeight();
          }}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring focus:ring-blue-300 resize-none overflow-hidden"
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

        {/* Report Selection */}
        <div className="mt-4">
          <label className="block text-gray-600 text-sm mb-1">Select Days:</label>
          <select 
            value={reportDay} 
            onChange={(e) => setReportDay(Number(e.target.value))}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring focus:ring-blue-300"
          >
            {[...Array(7)].map((_, i) => (
              <option key={i} value={i + 1}>
                Last {i + 1} Day{i !== 0 ? 's' : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Generate Report Button */}
      <button 
        onClick={generateReport} 
        className={`mt-4 w-full text-white p-3 rounded-lg transition ${
          isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
        }`}
        disabled={isLoading} // Disable while loading
      >
        {isLoading ? 'Generating Report...' : 'Generate Report 📊'}
      </button>

      {/* Display Report */}
      {isLoading && (
        <div className="mt-4 text-center text-gray-600">
          <span className="animate-spin inline-block w-5 h-5 border-t-2 border-blue-500 border-solid rounded-full"></span> 
          Generating your report...
        </div>
      )}

      {report && !isLoading && (
        <div className="mt-4 bg-gray-100 p-4 rounded-lg shadow-sm">
          <h3 className="text-xl font-semibold text-gray-700">Health Report 🧑‍⚕️📋</h3>
          <p className="text-gray-700 whitespace-pre-wrap">{report}</p>
        </div>
      )}
      </div>
    </div>
  );
}
