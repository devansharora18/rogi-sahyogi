import { useState, useEffect } from 'react';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
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
  const [selectedTab, setSelectedTab] = useState("journals");

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
      const querySnapshot = await getDocs(journalsRef);
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

  // Define the order of sections to display in the report
  const reportSections = [
    "Patient Report Symptoms Summary",
    "Duration",
    "Symptom Progression",
    "Possible Conditions",
    "Urgency Level",
    "Additional Notes"
  ];

  return (
    <div className="bg-gray-50 p-6 rounded-lg shadow-md w-full max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-700 text-center mb-6">My Health</h2>
      
      {/* Tab Navigation */}
      <div className="flex mb-6 border-b">
        <button 
          onClick={() => setSelectedTab("journals")} 
          className={`mr-4 pb-2 ${selectedTab === "journals" ? "border-b-2 border-blue-500 text-blue-500 font-bold" : "text-gray-500"}`}
        >
          Journal 📖
        </button>
        <button 
          onClick={() => setSelectedTab("reports")} 
          className={`pb-2 ${selectedTab === "reports" ? "border-b-2 border-green-500 text-green-500 font-bold" : "text-gray-500"}`}
        >
          Reports 📊
        </button>
      </div>
      
      {/* Content based on selected tab */}
      {selectedTab === "journals" && (
        <section>
          {journals.length > 0 ? journals.map((journal) => (
            <div key={journal.id} className="bg-white p-4 rounded-lg shadow-md mb-4 border-l-4 border-blue-500">
              <h4 className="font-semibold text-blue-600">{journal.id}</h4>
              <p className="text-gray-700 mt-2">{journal.feeling || 'No entry available'}</p>
            </div>
          )) : <p className="text-gray-500">No journal entries found</p>}
        </section>
      )}
      
      {selectedTab === "reports" && (
        <section>
          {reports.length > 0 ? reports.map((report) => {
            // Assuming report.report contains the plain text report
            const parsedReport = parseReport(report.report || '');
            return (
              <div key={report.id} className="bg-white p-6 rounded-lg shadow-md mb-4 border-l-4 border-green-500">
                <h3 className='text-lg font-semibold text-green-600 mb-4'>
                  {report.startDate} - {report.endDate}
                </h3>
                {reportSections.map((section) => (
                  parsedReport[section] ? (
                    <div key={section} className="mb-4">
                      <h4 className="text-lg font-bold text-green-600">{section}</h4>
                      <p className="text-gray-700 mt-2 whitespace-pre-line">{parsedReport[section]}</p>
                    </div>
                  ) : null
                ))}
              </div>
            );
          }) : <p className="text-gray-500">No reports available</p>}
        </section>
      )}
    </div>
  );
}
