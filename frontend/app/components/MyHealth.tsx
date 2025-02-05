
import { useState, useEffect } from 'react';
import { getFirestore, collection, getDocs, orderBy, query } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { app } from '../firebase/firebase';

const db = getFirestore(app);
const auth = getAuth(app);

// Helper function to parse the plain text report into sections
const parseReport = (reportText) => {
	// This regex will look for the following headings followed by a colon and then capture the content until the next heading or end of text
	const regex = /(Patient Report Symptoms Summary|Duration|Symptom Progression|Possible Conditions|Urgency Level|Additional Notes):\s*([\s\S]*?)(?=(Patient Report Symptoms Summary|Duration|Symptom Progression|Possible Conditions|Urgency Level|Additional Notes):|$)/g;
	const result = {};
	let match;
	while ((match = regex.exec(reportText)) !== null) {
	  const key = match[1];
	  const value = match[2].trim();
	  result[key] = value;
	}
	return result;
  };

export default function MyHealth() {
  const [journals, setJournals] = useState([]);
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState("1 Week");
  const [selectedTab, setSelectedTab] = useState("journal");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        const user = auth.currentUser;
        if (user) {
          await Promise.all([
            fetchJournals(user.uid),
            fetchReports(user.uid)
          ]);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserData();
  }, []);

  const fetchJournals = async (uid) => {
    try {
      const journalsRef = collection(db, `user/${uid}/journals`);
	  const sort = query(journalsRef, orderBy('date', 'desc'));
      const querySnapshot = await getDocs(sort);
      setJournals(querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })));
    } catch (error) {
      console.error('Error fetching journals:', error);
    }
  };

  const fetchReports = async (uid) => {
    try {
      const reportsRef = collection(db, `user/${uid}/reports`);
      const querySnapshot = await getDocs(reportsRef);
      setReports(querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })));
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-blue-500"></div>
      </div>
    );
  }

  const reportSections = [
    "Patient Report Symptoms Summary",
    "Duration",
    "Symptom Progression",
    "Possible Conditions",
    "Urgency Level",
    "Additional Notes"
  ];

  return (
    <div className="min-h-screen bg-white p-6">
      {/* Navigation Tabs */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex space-x-2">
          <button
            onClick={() => setSelectedTab("journal")}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
              selectedTab === "journal"
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            Journal
          </button>
          <button
            onClick={() => setSelectedTab("report")}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
              selectedTab === "report"
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            Report
          </button>
        </div>
        
        {/* Timeframe Dropdown */}
        <div className="flex items-center space-x-2">
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="bg-transparent text-gray-600 text-sm focus:outline-none"
          >
            <option value="1 Week">1 Week</option>
            <option value="1 Month">1 Month</option>
            <option value="3 Months">3 Months</option>
          </select>
        </div>
      </div>

      {selectedTab === "journal" && (
        <div className="space-y-4">
        {journals.map((journal) => (
          <div
            key={journal.id}
            className="w-full p-6 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-400 text-white cursor-pointer hover:opacity-95 transition-opacity"
          >
			<div className="text-xl font-semibold">
				{journal.id}
			</div>
            <div className="text-xl font-semibold">
              {journal.feeling}
            </div>
          </div>
        ))}
      </div>
      )}

{selectedTab === "report" && (
  <section>
    {reports.length > 0 ? reports.map((report) => {
      const parsedReport = parseReport(report.report || '');
	  console.log(parsedReport);
      return (
        <div key={report.id} 
          className="bg-gradient-to-r from-blue-600 to-blue-400 p-8 rounded-3xl text-white mb-4"
        >
          <div className="text-2xl mb-6 font-extrabold">
            {report.startDate} - {report.endDate}
          </div>

          {/* <div className="space-y-6">
            {reportSections.map((section) => (
              parsedReport[section] && (
                <div key={section}>
                  <h3 className="text-xl font-semibold mb-2">{section}</h3>
                  {section === "Possible Conditions" ? (
                    <ul className="text-white/80 space-y-1">
                      {parsedReport[section].split('\n').map((condition, index) => (
                        <li key={index}>- {condition.trim()}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-white/80">{parsedReport[section]}</p>
                  )}
                </div>
              )
            ))}
          </div> */}

<div className="text-xl font-semibold">
  {report.report.split("\\n").map((paragraph, index) => (
    <p key={index} className='mt-6'>{paragraph}</p>
	// empty line
  ))}
</div>
        </div>
      );
    }) : (
      <p className="text-gray-500">No reports available</p>
    )}
  </section>
)}


	  
      
    </div>
  );
}
