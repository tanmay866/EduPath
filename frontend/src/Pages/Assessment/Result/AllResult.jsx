import React, { useState, useEffect } from 'react';
import { getQuizHistory } from '../../Services/assessmentService';
import AssessmentSidebar from '../../../component/Assessment/AssessmentSidebar';
import BackgroundAnimation from '../AssesmentDashboard.jsx/BackgroundAnimation';
import PreviousAttemptsTable from '../AssesmentDashboard.jsx/PreviousAttemptsTable';

const AllResult = () => {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchQuizHistory();
  }, []);

  const fetchQuizHistory = async () => {
    try {
      setLoading(true);
      const response = await getQuizHistory();
      
      // Access the correct nested data structure
      const results = response.data.data.results || [];
      
      // Format the data for the PreviousAttemptsTable component
      const formattedAttempts = results.map((attempt) => ({
        id: attempt._id,
        resultId: attempt._id,
        date: new Date(attempt.completedAt || attempt.createdAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        score: attempt.score,
        totalQuestions: attempt.totalQuestions,
        percentage: attempt.percentage,
        status: attempt.percentage >= 70 ? 'Pass' : 'Fail'
      }));

      setAttempts(formattedAttempts);
      setError(null);
    } catch (err) {
      console.error('Error fetching quiz history:', err);
      setError('Failed to load quiz history. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-black relative">
        <BackgroundAnimation />
        <AssessmentSidebar />
        <div className="flex-1 flex items-center justify-center relative z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
            <p className="text-white mt-4 text-lg">Loading your quiz history...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-black relative">
        <BackgroundAnimation />
        <AssessmentSidebar />
        <div className="flex-1 flex items-center justify-center p-4 relative z-10">
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-8 max-w-md backdrop-blur-lg">
            <h2 className="text-2xl font-bold text-red-400 mb-4">Error</h2>
            <p className="text-gray-300 mb-6">{error}</p>
            <button
              onClick={fetchQuizHistory}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-black relative">
      <BackgroundAnimation />

      <AssessmentSidebar />

      <div className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">
                  All Quiz Results
                </h1>
                <p className="text-gray-500">
                  View your complete quiz history and track your progress
                </p>
              </div>
              <div className="flex gap-2">
                <span className="px-4 py-2 backdrop-blur-lg bg-indigo-500/20 text-indigo-400 rounded-full font-semibold text-sm border border-indigo-500/30">
                  {attempts.length} Total Attempts
                </span>
              </div>
            </div>
          </div>

          {/* Previous Attempts Table */}
          <PreviousAttemptsTable attempts={attempts} />
        </div>
      </div>
    </div>
  );
};

export default AllResult;