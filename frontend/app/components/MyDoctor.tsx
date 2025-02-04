import { useState, useEffect, useRef } from 'react';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { app } from '../firebase/firebase';

const db = getFirestore(app);
const auth = getAuth(app);

export default function MyDoctor() {
  const [feeling, setFeeling] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [language, setLanguage] = useState('en-US');
  const [userId, setUserId] = useState(null);
  const [reportDay, setReportDay] = useState(1);
  const [report, setReport] = useState(null);
  const textareaRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [recognition, setRecognition] = useState(null);

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
    { code: 'en-US', name: 'Eng (US)' },
    { code: 'es-ES', name: 'Spanish' },
    { code: 'fr-FR', name: 'French' },
    { code: 'hi-IN', name: 'Hindi' },
    { code: 'de-DE', name: 'German' },
    { code: 'zh-CN', name: 'Mandarin' },
    { code: 'ta-IN', name: 'Tamil' },
  ];

  const handleSave = async () => {
    // You can replace this with your save logic (e.g. setDoc to Firestore)
    alert('Saved Successfully!');
  };

  const submitFeeling = async () => {
    if (!userId) {
      alert('You must be logged in to save your journal entry.');
      return;
    }

    const date = new Date().toISOString().split('T')[0];
    const journalRef = doc(db, `user/${userId}/journals/${date}`);

    try {
      await setDoc(journalRef, { feeling }, { merge: true });
      alert('Journal entry saved successfully!');
      setFeeling('');
      setTimeout(adjustTextareaHeight, 10);
    } catch (error) {
      console.error('Error saving entry:', error);
      alert('Failed to save entry.');
    }
  };

  const handleGenerateReport = async () => {
    if (!userId) {
      alert('You must be logged in to generate a report.');
      return;
    }

    setIsLoading(true);

    const currentDate = new Date();
    let combinedFeeling = '';
    let startDate = '';
    let endDate = '';

    for (let i = 0; i < reportDay; i++) {
      const date = new Date(currentDate);
      date.setDate(date.getDate() - i);
      const formattedDate = date.toISOString().split('T')[0];

      if (i === reportDay - 1) startDate = formattedDate;

      const journalRef = doc(db, `user/${userId}/journals/${formattedDate}`);

      try {
        const docSnap = await getDoc(journalRef);
        if (docSnap.exists()) {
          startDate = docSnap.id;
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
      endDate = currentDate.toISOString().split('T')[0];

      try {
        const response = await fetch('/api/medreport', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ journalDescription: combinedFeeling }),
        });

        const data = await response.json();
        setReport(data.report);

        const datetime = new Date();

        const reportRef = doc(db, `user/${userId}/reports/${datetime}`);
        await setDoc(reportRef, { report: data.report, startDate, endDate });
        console.log('Report saved to Firestore successfully!');
      } catch (error) {
        console.error('Error calling API or saving report:', error);
        alert('Failed to generate or save report.');
      }
    } else {
      setReport('No journal entries found for the selected period.');
    }

    setIsLoading(false);
  };

  return (
    <div className="bg-gray-50 min-h-screen flex justify-center ">
      <div className="bg-white rounded-xl p-8 w-full md:max-w-7xl">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          How are you feeling today?
        </h2>
        <div className="hidden md:flex md:flex-row md:space-x-4 md:space-y-0">
          <textarea
            ref={textareaRef}
            rows={1}
            value={feeling}
            onChange={(e) => {
              setFeeling(e.target.value);
              adjustTextareaHeight();
            }}
            className="p-3 border border-gray-300 rounded-lg focus:ring focus:ring-blue-300 resize-none w-[50vw]"
            placeholder="Tell here..."
          />

          {/* Row with microphone button and language select */}
          <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
            <button
              onClick={() => setIsListening(!isListening)}
              className={`p-3 rounded-lg text-white transition flex-1 ${
                isListening ? 'bg-red-500' : 'bg-blue-500 hover:bg-blue-600'
              }`}
            >
              <svg width="30" height="30" viewBox="0 0 90 90" fill="none" xmlns="http://www.w3.org/2000/svg">
				<path fillRule="evenodd" clipRule="evenodd" d="M47.8125 71.1V82.5H42.1875V71.1C35.7496 70.4062 29.7953 67.3575 25.469 62.5397C21.1427 57.722 18.7497 51.4752 18.75 45V37.5H24.375V45C24.375 50.4701 26.548 55.7161 30.4159 59.5841C34.2839 63.452 39.5299 65.625 45 65.625C50.4701 65.625 55.7161 63.452 59.5841 59.5841C63.452 55.7161 65.625 50.4701 65.625 45V37.5H71.25V45C71.2503 51.4752 68.8573 57.722 64.531 62.5397C60.2047 67.3575 54.2504 70.4062 47.8125 71.1ZM30 22.5C30 18.5218 31.5804 14.7064 34.3934 11.8934C37.2064 9.08035 41.0218 7.5 45 7.5C48.9782 7.5 52.7936 9.08035 55.6066 11.8934C58.4197 14.7064 60 18.5218 60 22.5V45C60 48.9782 58.4197 52.7936 55.6066 55.6066C52.7936 58.4196 48.9782 60 45 60C41.0218 60 37.2064 58.4196 34.3934 55.6066C31.5804 52.7936 30 48.9782 30 45V22.5Z" fill="#FFBE00"/>
			</svg>

            </button>
            <div className="relative">
  <select
    value={language}
    onChange={(e) => setLanguage(e.target.value)}
    style={{
      appearance: "none",
      WebkitAppearance: "none",
      MozAppearance: "none",
      backgroundImage: "none",
    }}
    className="p-3 border border-gray-300 rounded-lg focus:ring focus:ring-blue-300 w-full"
  >
    {languages.map((lang) => (
      <option key={lang.code} value={lang.code}>
        {lang.name}
      </option>
    ))}
  </select>
</div>

          </div>

          {/* Save Entry Button */}
          <button
            onClick={submitFeeling}
            className=" bg-green-500 text-white p-3 rounded-lg hover:bg-green-600 transition"
          >
            Save
          </button>

        </div>

		{/* Phone ui */}

		<div className="flex flex-col space-y-4 md:hidden">
          <textarea
            ref={textareaRef}
            rows={1}
            value={feeling}
            onChange={(e) => {
              setFeeling(e.target.value);
              adjustTextareaHeight();
            }}
            className="p-3 border border-gray-300 rounded-lg focus:ring focus:ring-blue-300 resize-none w-full"
            placeholder="Tell here..."
          />

		  <div className='flex flex-row space-x-4 w-full'>

          {/* Row with microphone button and language select */}
          {/* <div className=""> */}
            <button
              onClick={() => setIsListening(!isListening)}
              className={`p-3 rounded-lg text-white transition flex-1 ${
                isListening ? 'bg-red-500' : 'bg-blue-500 hover:bg-blue-600'
              }`}
            >
              <svg width="30" height="30" viewBox="0 0 90 90" fill="none" xmlns="http://www.w3.org/2000/svg">
				<path fillRule="evenodd" clipRule="evenodd" d="M47.8125 71.1V82.5H42.1875V71.1C35.7496 70.4062 29.7953 67.3575 25.469 62.5397C21.1427 57.722 18.7497 51.4752 18.75 45V37.5H24.375V45C24.375 50.4701 26.548 55.7161 30.4159 59.5841C34.2839 63.452 39.5299 65.625 45 65.625C50.4701 65.625 55.7161 63.452 59.5841 59.5841C63.452 55.7161 65.625 50.4701 65.625 45V37.5H71.25V45C71.2503 51.4752 68.8573 57.722 64.531 62.5397C60.2047 67.3575 54.2504 70.4062 47.8125 71.1ZM30 22.5C30 18.5218 31.5804 14.7064 34.3934 11.8934C37.2064 9.08035 41.0218 7.5 45 7.5C48.9782 7.5 52.7936 9.08035 55.6066 11.8934C58.4197 14.7064 60 18.5218 60 22.5V45C60 48.9782 58.4197 52.7936 55.6066 55.6066C52.7936 58.4196 48.9782 60 45 60C41.0218 60 37.2064 58.4196 34.3934 55.6066C31.5804 52.7936 30 48.9782 30 45V22.5Z" fill="#FFBE00"/>
			</svg>

            </button>
  <select
    value={language}
    onChange={(e) => setLanguage(e.target.value)}
    style={{
      appearance: "none",
      WebkitAppearance: "none",
      MozAppearance: "none",
      backgroundImage: "none",
    }}
    className="p-3 border border-gray-300 rounded-lg focus:ring focus:ring-blue-300"
  >
    {languages.map((lang) => (
      <option key={lang.code} value={lang.code}>
        {lang.name}
      </option>
    ))}
  </select>

          {/* Save Entry Button */}
          <button
            onClick={submitFeeling}
            className=" bg-green-500 text-white p-3 rounded-lg hover:bg-green-600 transition w-full"
          >
            Save
          </button>
		  {/* </div> */}
		  </div>

        </div>

        {/* Health Report Section */}
        <div className="mt-8">
		<div className='flex flex-row space-x-4 justify-between items-center'>
        <h2 className="text-3xl font-bold text-gray-900 my-12"> HEALTH REPORT </h2>
		<div className="">
            {/* <label className="block text-gray-600 text-sm mb-1">Select Days:</label> */}
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
		  </div>

          <button
            onClick={handleGenerateReport}
            className={`mt-4 w-full text-white p-3 rounded-lg transition ${
              isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
            }`}
            disabled={isLoading}
          >
            {isLoading ? 'Generating Report...' : 'Generate Report 📊'}
          </button>

          {isLoading && (
            <div className="mt-4 text-center text-gray-600">
              <span className="animate-spin inline-block w-5 h-5 border-t-2 border-blue-500 border-solid rounded-full mr-2"></span>
              Generating your report...
            </div>
          )}

          {report && !isLoading && (
            <div className="mt-4 bg-gray-100 p-4 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold text-gray-700">
                Health Report 🧑‍⚕️📋
              </h3>
              <p className="text-gray-700 whitespace-pre-wrap">{report}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
