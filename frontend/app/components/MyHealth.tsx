import { useState, useEffect } from 'react';
import { getFirestore, collection, getDocs, query, orderBy } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { app } from '../firebase/firebase';

const db = getFirestore(app);
const auth = getAuth(app);

export default function MyHealth() {
  const [journals, setJournals] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        const user = auth.currentUser;
        if (user) {
          setUserId(user.uid);
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

  const fetchJournals = async (uid: string) => {
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

  const fetchReports = async (uid: string) => {
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

  const renderJournals = () => {
    if (journals.length === 0) return <p>No journal entries found</p>;
    return journals.map((journal) => (
      <div key={journal.id} className="bg-gray-100 p-4 rounded-lg mb-4">
        <h4 className="font-semibold text-gray-700">{journal.id}</h4>
        <p className="text-gray-700">{journal.feeling || 'No entry available'}</p>
      </div>
    ));
  };

  const renderReports = () => {
    if (reports.length === 0) return <p>No reports available</p>;
    return reports.map((report) => (
      <div key={report.id} className="bg-gray-100 p-4 rounded-lg mb-4">
        <h4 className="font-semibold text-gray-700">{report.startDate} - {report.endDate}</h4>
        <p className="text-gray-700">{report.report || 'No report generated'}</p>
      </div>
    ));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-700">My Health</h2>

      {/* Journal Section */}
      <section>
        <h3 className="text-xl font-semibold text-gray-700">Journal 📖</h3>
        <div className="mt-4">
          {renderJournals()}
        </div>
      </section>

      {/* Reports Section */}
      <section className="mt-8">
        <h3 className="text-xl font-semibold text-gray-700">Reports 📊</h3>
        <div className="mt-4">
          {renderReports()}
        </div>
      </section>
    </div>
  );
}
