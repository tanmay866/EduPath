import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchQuizTopics, getQuizStats, getQuizHistory } from "../../Services/assessmentService";
import { useQuiz } from "../../context/QuizContext";
import AssessmentSidebar from "../../../component/Assessment/AssessmentSidebar";
import DashboardHeader from "./components/DashboardHeader";
import PerformanceCards from "./components/PerformanceCards";
import PreviousAttemptsTable from "./components/PreviousAttemptsTable";

const AssessmentDashboard = () => {
  const { setAssessment } = useQuiz();
  const navigate = useNavigate();
  
  const [topics, setTopics] = useState([]);
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check authentication on component mount
  useEffect(() => {
    const token = sessionStorage.getItem('token');
    if (!token) {
      navigate('/signin');
      return;
    }
  }, [navigate]);

  // Fetch data from APIs
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [topicsRes, statsRes, historyRes] = await Promise.all([
        fetchQuizTopics(),
        getQuizStats().catch(() => ({ data: { data: { overall: { totalQuizzes: 0, averageScore: 0 }, topicPerformance: [] } } })),
        getQuizHistory().catch(() => ({ data: { data: { results: [] } } }))
      ]);

      setTopics(topicsRes.data?.data || []);
      setStats(statsRes.data?.data || null);
      setHistory(historyRes.data?.data?.results || []);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  // Group topics by category
  const groupedTopics = topics.reduce((acc, topic) => {
    const categoryName = topic.category?.name || "Other";
    if (!acc[categoryName]) {
      acc[categoryName] = {
        category: topic.category,
        topics: []
      };
    }
    acc[categoryName].topics.push(topic);
    return acc;
  }, {});

  // No longer needed - removed assessment list

  // Transform stats for performance cards
  const performanceCardsConfig = stats ? [
    {
      id: 1,
      label: "Total Attempts",
      value: stats.overall?.totalQuizzes || 0,
      color: "blue",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      id: 2,
      label: "Average Score",
      value: `${Math.round(stats.overall?.averageScore || 0)}%`,
      color: "purple",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      id: 3,
      label: "Topics Covered",
      value: stats.topicPerformance?.length || 0,
      color: "yellow",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    {
      id: 4,
      label: "Last Attempt",
      value: history[0]?.status?.toUpperCase() || "N/A",
      color: history[0]?.status === "pass" ? "green" : "red",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      ),
    },
  ] : [];

  // Transform history for previous attempts table
  const previousAttempts = history.slice(0, 5).map(attempt => ({
    id: attempt._id,
    resultId: attempt._id,
    date: new Date(attempt.createdAt).toLocaleDateString('en-US', {
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

  const handleStartQuiz = () => {
    // Navigate directly to quiz configuration page
    navigate("/assessment/quiz");
  };

  if (error) {
    return (
      <div className="flex min-h-screen bg-black items-center justify-center">
        <div className="text-red-500 text-xl">{error}</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-black relative">

      <AssessmentSidebar />

      <div className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto relative z-10">
        <div className="max-w-7xl mx-auto">
          <DashboardHeader totalAttempts={stats?.overall?.totalQuizzes || 0} />

          <PerformanceCards cards={performanceCardsConfig} />

          {/* Start Quiz Button */}
          <div className="mb-8">
            <div className="backdrop-blur-xl bg-slate-900/60 rounded-xl shadow-xl p-8 border border-white/10">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-white mb-3">
                  Ready to Test Your Skills?
                </h2>
                <p className="text-gray-400 mb-6">
                  Start a new assessment and challenge yourself with AI-generated questions
                </p>
                <button
                  onClick={handleStartQuiz}
                  className="px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-lg font-bold rounded-xl hover:from-indigo-600 hover:to-purple-700 transform hover:scale-105 transition-all shadow-xl hover:shadow-2xl flex items-center gap-3 mx-auto"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                  </svg>
                  Start Skill Assessment
                </button>
              </div>
            </div>
          </div>

          <PreviousAttemptsTable attempts={previousAttempts} />
        </div>
      </div>
    </div>
  );
};

export default AssessmentDashboard;
