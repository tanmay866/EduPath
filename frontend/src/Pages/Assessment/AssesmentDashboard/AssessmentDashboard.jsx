import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchQuizTopics, getQuizStats, getQuizHistory } from "../../Services/assessmentService";
import { useQuiz } from "../../context/QuizContext";
import BackToHomeButton from "../../../component/Assessment/BackToHomeButton";
import DashboardHeader from "./components/DashboardHeader";
import PerformanceCards from "./components/PerformanceCards";
import PreviousAttemptsTable from "./components/PreviousAttemptsTable";
import { Brain, Zap } from "lucide-react";

const AssessmentDashboard = () => {
  const { setAssessment } = useQuiz();
  const navigate = useNavigate();

  const [topics,  setTopics]  = useState([]);
  const [stats,   setStats]   = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    if (!token) { navigate('/signin'); return; }
  }, [navigate]);

  useEffect(() => { fetchDashboardData(); }, []);

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
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const performanceCardsConfig = stats ? [
    {
      id: 1, label: "Total Attempts", value: stats.overall?.totalQuizzes || 0, color: "blue",
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
    },
    {
      id: 2, label: "Average Score", value: `${Math.round(stats.overall?.averageScore || 0)}%`, color: "purple",
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
    },
    {
      id: 3, label: "Topics Covered", value: stats.topicPerformance?.length || 0, color: "yellow",
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
    },
    {
      id: 4, label: "Last Attempt", value: history[0]?.status?.toUpperCase() || "N/A",
      color: history[0]?.status === "pass" ? "green" : "red",
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>,
    },
  ] : [];

  const previousAttempts = history.slice(0, 5).map(attempt => ({
    id:             attempt._id,
    resultId:       attempt._id,
    date:           new Date(attempt.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
    score:          attempt.score,
    totalQuestions: attempt.totalQuestions,
    percentage:     attempt.percentage,
    status:         attempt.percentage >= 70 ? 'Pass' : 'Fail',
  }));

  if (error) {
    return (
      <div className="flex min-h-screen bg-black items-center justify-center">
        <div className="backdrop-blur-3xl bg-[#090b14]/70 rounded-[1.5rem] border border-rose-500/20 shadow-2xl p-10 text-center max-w-md">
          <p className="text-rose-400 font-black text-lg mb-2">Failed to load</p>
          <p className="text-slate-500 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">

      {/* ── Animated background ── */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(circle, rgba(99,102,241,0.08) 1px, transparent 1px)',
          backgroundSize: '36px 36px',
        }} />
        <div style={{
          position: 'absolute', top: '5%', left: '10%',
          width: 520, height: 520, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.06), transparent 70%)',
        }} />
        <div style={{
          position: 'absolute', bottom: '10%', right: '8%',
          width: 380, height: 380, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.05), transparent 70%)',
        }} />
      </div>

      <div className="relative z-10 pt-10 pb-20 px-4 md:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">

          {/* Back to home — top right */}
          <div className="mb-6 flex justify-end">
            <BackToHomeButton />
          </div>

          <DashboardHeader totalAttempts={stats?.overall?.totalQuizzes || 0} />

          <PerformanceCards cards={performanceCardsConfig} />

          {/* ── Start Assessment CTA ── */}
          <div className="mb-10">
            <div className="relative backdrop-blur-3xl bg-[#090b14]/70 rounded-[1.5rem] border border-white/5 shadow-2xl p-10 overflow-hidden text-center">
              <div style={{
                position: 'absolute', inset: 0,
                background: 'radial-gradient(circle at 50% 120%, rgba(99,102,241,0.1), transparent 65%)',
                pointerEvents: 'none',
              }} />
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center mx-auto mb-5">
                  <Brain size={24} className="text-indigo-400" />
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-white mb-2 tracking-tight">
                  Ready to Test Your Skills?
                </h2>
                <p className="text-slate-500 text-sm mb-8 max-w-md mx-auto">
                  Start a new assessment and challenge yourself with AI-generated questions
                </p>
                <button
                  onClick={() => navigate("/assessment/quiz")}
                  className="inline-flex items-center gap-2.5 px-8 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-black rounded-xl hover:scale-105 hover:shadow-xl hover:shadow-indigo-500/30 transition-all duration-300"
                >
                  <Zap size={16} />
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
