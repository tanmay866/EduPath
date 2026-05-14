import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getQuizResult, retryQuiz } from "../../Services/assessmentService";
import BackToHomeButton from "../../../component/Assessment/BackToHomeButton";
import {
  CheckCircle2, XCircle, RotateCcw, LayoutDashboard, Download,
  BarChart2, Brain, Calendar, Clock, Target, ChevronDown, Lightbulb,
  Loader2,
} from "lucide-react";

/* ── Circular Score SVG ─────────────────────────────────────────── */
const ScoreRing = ({ percentage, passed }) => {
  const r   = 54;
  const circ = 2 * Math.PI * r;
  const dash = (percentage / 100) * circ;
  const color = passed ? '#34d399' : '#fb7185';
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: 148, height: 148 }}>
      <svg width="148" height="148" viewBox="0 0 148 148" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="74" cy="74" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
        <circle
          cx="74" cy="74" r={r} fill="none"
          stroke={color} strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
          style={{ filter: `drop-shadow(0 0 8px ${color}80)`, transition: 'stroke-dasharray 1s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-black" style={{ color }}>{percentage}%</span>
        <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-0.5">Score</span>
      </div>
    </div>
  );
};

const ResultPage = () => {
  const { resultId } = useParams();
  const navigate     = useNavigate();
  const [showReview, setShowReview] = useState(false);
  const [resultData, setResultData] = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [retrying,   setRetrying]   = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    if (!token) { navigate('/signin'); return; }
  }, [navigate]);

  useEffect(() => {
    if (resultId) fetchResultData();
    else navigate("/assessment");
  }, [resultId]);

  const fetchResultData = async () => {
    try {
      setLoading(true);
      const response = await getQuizResult(resultId);
      setResultData(response.data?.data);
    } catch (err) {
      console.error('Failed to fetch result:', err);
      setError('Failed to load quiz result');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = async () => {
    try {
      setRetrying(true);
      const response   = await retryQuiz(resultId);
      const sessionData = response.data?.data;
      if (sessionData?.sessionId) {
        localStorage.setItem('sessionId', sessionData.sessionId);
        localStorage.setItem('startTime', Date.now());
        navigate("/assessment/quiz");
      }
    } catch (err) {
      console.error('Failed to retry quiz:', err);
      alert('Failed to start retry. Please try again.');
    } finally {
      setRetrying(false);
    }
  };

  /* ── Loading ── */
  if (loading) return (
    <div className="flex min-h-screen bg-black items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center">
          <Loader2 size={28} className="text-indigo-400 animate-spin" />
        </div>
        <p className="text-slate-500 text-sm font-semibold">Loading your results…</p>
      </div>
    </div>
  );

  /* ── Error ── */
  if (error || !resultData) return (
    <div className="flex min-h-screen bg-black items-center justify-center">
      <div className="backdrop-blur-3xl bg-[#090b14]/70 rounded-[1.5rem] border border-rose-500/20 shadow-2xl p-10 text-center max-w-md">
        <XCircle size={40} className="text-rose-400 mx-auto mb-4" />
        <p className="text-rose-400 font-black text-lg mb-2">{error || "Result not found"}</p>
        <button onClick={() => navigate("/assessment")} className="mt-4 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl transition-colors">
          Back to Assessments
        </button>
      </div>
    </div>
  );

  /* ── Data transform ── */
  const percentage      = resultData.percentage || Math.round((resultData.score / resultData.totalQuestions) * 100);
  const passed          = percentage >= 70;
  const correctAnswers  = resultData.correctAnswers;
  const wrongAnswers    = resultData.incorrectAnswers || (resultData.totalQuestions - correctAnswers);
  const skill           = resultData.topic?.name || "Unknown";
  const assessmentTitle = `${resultData.topic?.name || 'Assessment'} — ${resultData.difficulty}`;
  const attemptDate     = new Date(resultData.completedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const timeTaken       = `${Math.floor(resultData.timeTaken / 60)} min ${resultData.timeTaken % 60} sec`;
  const questionReview  = resultData.detailedAnswers?.map((a, i) => ({
    id: i + 1, question: a.question, selectedAnswer: a.userAnswer,
    correctAnswer: a.correctAnswer, isCorrect: a.isCorrect, explanation: a.explanation,
  })) || [];

  const insightMsg = resultData.performance?.message ||
    (passed
      ? percentage >= 80
        ? "🌟 Excellent! You performed above average and demonstrated strong knowledge."
        : "✅ Great job! You passed the assessment successfully."
      : `📚 You need ${Math.ceil((70 / 100) * resultData.totalQuestions) - correctAnswers} more correct answer(s) to pass. Keep practicing!`);

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">

      {/* ── Background ── */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(circle, rgba(99,102,241,0.08) 1px, transparent 1px)',
          backgroundSize: '36px 36px',
        }} />
        <div style={{
          position: 'absolute', top: '3%', left: '8%', width: 500, height: 500, borderRadius: '50%',
          background: `radial-gradient(circle, ${passed ? 'rgba(52,211,153,0.05)' : 'rgba(251,113,133,0.05)'}, transparent 70%)`,
        }} />
        <div style={{
          position: 'absolute', bottom: '8%', right: '6%', width: 380, height: 380, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.05), transparent 70%)',
        }} />
      </div>

      <div className="relative z-10 pt-8 pb-20 px-4 md:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-6">

          {/* Back button */}
          <div className="flex justify-end">
            <BackToHomeButton />
          </div>

          {/* ── 1. SCORE SUMMARY ── */}
          <div className="backdrop-blur-3xl bg-[#090b14]/70 rounded-[1.5rem] border border-white/5 shadow-2xl overflow-hidden">
            {/* Pass/Fail glow strip */}
            <div className="h-1 w-full" style={{
              background: passed
                ? 'linear-gradient(90deg, #34d399, #059669)'
                : 'linear-gradient(90deg, #fb7185, #e11d48)',
            }} />

            <div className="p-8">
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-widest mb-4">
                  <Brain size={10} /> Assessment Results
                </div>
                <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-1">Assessment Results</h1>
                <p className="text-slate-500 text-sm">{assessmentTitle}</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Score circle */}
                <div className="flex flex-col items-center justify-center backdrop-blur-xl bg-white/3 rounded-2xl border border-white/5 p-8 gap-5">
                  <ScoreRing percentage={percentage} passed={passed} />

                  <div className="text-center">
                    <p className="text-3xl font-black text-white tracking-tight">
                      {resultData.score}
                      <span className="text-slate-600 font-normal text-xl"> / {resultData.totalQuestions}</span>
                    </p>
                    <p className="text-[11px] text-slate-600 uppercase tracking-widest font-bold mt-1">Questions Answered</p>
                  </div>

                  <span className={`inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-black border ${
                    passed
                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 shadow-[0_0_20px_rgba(52,211,153,0.15)]'
                      : 'bg-rose-500/15 text-rose-300 border-rose-500/30 shadow-[0_0_20px_rgba(251,113,133,0.15)]'
                  }`}>
                    {passed ? <CheckCircle2 size={15} /> : <XCircle size={15} />}
                    {passed ? 'PASSED' : 'FAILED'}
                  </span>
                </div>

                {/* Meta info */}
                <div className="flex flex-col gap-3 justify-center">
                  {[
                    { icon: Target,   label: 'Skill Assessed', value: skill,       color: 'text-indigo-400', bg: 'bg-indigo-500/15 border-indigo-500/25' },
                    { icon: Calendar, label: 'Attempt Date',   value: attemptDate, color: 'text-blue-400',   bg: 'bg-blue-500/15 border-blue-500/25'   },
                    { icon: Clock,    label: 'Time Taken',      value: timeTaken,   color: 'text-violet-400', bg: 'bg-violet-500/15 border-violet-500/25' },
                  ].map(({ icon: Icon, label, value, color, bg }) => (
                    <div key={label} className="backdrop-blur-xl bg-white/3 rounded-2xl border border-white/5 p-4 flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl border ${bg} ${color} shrink-0`}>
                        <Icon size={16} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">{label}</p>
                        <p className="text-white font-black text-base mt-0.5">{value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── 2. BREAKDOWN + INSIGHT ── */}
          <div className="grid md:grid-cols-2 gap-6">

            {/* Performance Breakdown */}
            <div className="backdrop-blur-3xl bg-[#090b14]/70 rounded-[1.5rem] border border-white/5 shadow-2xl p-6">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="p-1.5 rounded-lg bg-indigo-500/15 border border-indigo-500/25">
                  <BarChart2 size={13} className="text-indigo-400" />
                </div>
                <h2 className="text-[11px] font-black uppercase tracking-widest text-indigo-400">Performance Breakdown</h2>
              </div>

              <div className="space-y-3">
                {[
                  { label: 'Total Questions',     value: resultData.totalQuestions, color: 'text-white',       bg: 'bg-white/4 border-white/8'              },
                  { label: 'Correct Answers',     value: correctAnswers,            color: 'text-emerald-400', bg: 'bg-emerald-500/8 border-emerald-500/20', icon: <CheckCircle2 size={13} className="text-emerald-400" /> },
                  { label: 'Incorrect Answers',   value: wrongAnswers,              color: 'text-rose-400',    bg: 'bg-rose-500/8 border-rose-500/20',       icon: <XCircle size={13} className="text-rose-400" /> },
                  { label: 'Passing Score',       value: '70%',                     color: 'text-indigo-400',  bg: 'bg-indigo-500/8 border-indigo-500/20'   },
                ].map(({ label, value, color, bg, icon }) => (
                  <div key={label} className={`flex items-center justify-between p-3.5 rounded-xl border ${bg}`}>
                    <span className="text-slate-300 text-sm font-semibold flex items-center gap-2">
                      {icon}{label}
                    </span>
                    <span className={`text-xl font-black ${color}`}>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Performance Insight */}
            <div className="backdrop-blur-3xl bg-[#090b14]/70 rounded-[1.5rem] border border-white/5 shadow-2xl p-6">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="p-1.5 rounded-lg bg-amber-500/15 border border-amber-500/25">
                  <Lightbulb size={13} className="text-amber-400" />
                </div>
                <h2 className="text-[11px] font-black uppercase tracking-widest text-amber-400">Performance Insight</h2>
              </div>

              {/* Insight message */}
              <div className={`p-4 rounded-2xl border mb-5 ${
                passed
                  ? 'bg-emerald-500/8 border-emerald-500/20'
                  : 'bg-rose-500/8 border-rose-500/20'
              }`}>
                <p className={`text-sm font-semibold leading-relaxed ${passed ? 'text-emerald-300' : 'text-rose-300'}`}>
                  {insightMsg}
                </p>
              </div>

              {/* Accuracy bar */}
              <div className="mb-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Accuracy Rate</span>
                  <span className={`text-sm font-black ${passed ? 'text-emerald-400' : 'text-rose-400'}`}>{percentage}%</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${percentage}%`,
                      background: passed
                        ? 'linear-gradient(90deg, #34d399, #059669)'
                        : 'linear-gradient(90deg, #fb7185, #e11d48)',
                      transition: 'width 1s ease',
                    }}
                  />
                </div>
              </div>

              {/* Mini stats */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                {[
                  { label: 'Correct',   value: correctAnswers, color: 'text-emerald-400', bg: 'bg-emerald-500/8 border-emerald-500/20' },
                  { label: 'Incorrect', value: wrongAnswers,   color: 'text-rose-400',    bg: 'bg-rose-500/8 border-rose-500/20'       },
                ].map(({ label, value, color, bg }) => (
                  <div key={label} className={`rounded-2xl border ${bg} p-4 text-center`}>
                    <p className={`text-3xl font-black ${color}`}>{value}</p>
                    <p className="text-[10px] text-slate-600 uppercase tracking-widest font-bold mt-1">{label}</p>
                  </div>
                ))}
              </div>

              {/* Recommendation */}
              <div className="p-4 rounded-2xl bg-indigo-500/8 border border-indigo-500/20">
                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-1.5">💡 Recommendation</p>
                <p className="text-slate-400 text-xs leading-relaxed">
                  {passed
                    ? "Continue practicing to maintain your skills. Try more advanced assessments to challenge yourself."
                    : "Review the incorrect answers below and strengthen your understanding before retaking."}
                </p>
              </div>
            </div>
          </div>

          {/* ── 3. QUESTION REVIEW ── */}
          <div className="backdrop-blur-3xl bg-[#090b14]/70 rounded-[1.5rem] border border-white/5 shadow-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-blue-500/15 border border-blue-500/25">
                  <Target size={13} className="text-blue-400" />
                </div>
                <h2 className="text-[11px] font-black uppercase tracking-widest text-blue-400">Question Review</h2>
              </div>
              <button
                onClick={() => setShowReview(!showReview)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500/15 border border-indigo-500/25 text-indigo-300 text-xs font-black hover:bg-indigo-500/25 transition-all duration-200"
              >
                {showReview ? 'Hide' : 'Show'} Review
                <ChevronDown size={13} className={`transition-transform duration-300 ${showReview ? 'rotate-180' : ''}`} />
              </button>
            </div>
            <p className="text-slate-600 text-xs mb-5 ml-8">
              {questionReview.length} questions — {correctAnswers} correct, {wrongAnswers} incorrect
            </p>

            {showReview && (
              <div className="space-y-4">
                {questionReview.map((q, idx) => (
                  <div
                    key={q.id}
                    className={`rounded-2xl border p-5 ${
                      q.isCorrect
                        ? 'bg-emerald-500/5 border-emerald-500/20'
                        : q.selectedAnswer
                        ? 'bg-rose-500/5 border-rose-500/20'
                        : 'bg-amber-500/5 border-amber-500/20'
                    }`}
                  >
                    <div className="flex items-start gap-3 mb-4">
                      <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${
                        q.isCorrect
                          ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-300'
                          : q.selectedAnswer
                          ? 'bg-rose-500/20 border border-rose-500/30 text-rose-300'
                          : 'bg-amber-500/20 border border-amber-500/30 text-amber-300'
                      }`}>
                        {q.isCorrect ? '✓' : q.selectedAnswer ? '✗' : '?'}
                      </div>
                      <h3 className="text-white font-bold text-sm leading-relaxed">
                        Q{idx + 1}. {q.question}
                      </h3>
                    </div>

                    <div className="ml-11 space-y-2">
                      {q.selectedAnswer && (
                        <div className={`p-3 rounded-xl ${q.isCorrect ? 'bg-emerald-500/8' : 'bg-rose-500/8'}`}>
                          <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${q.isCorrect ? 'text-emerald-500' : 'text-rose-500'}`}>Your Answer</p>
                          <p className="text-white text-sm">{q.selectedAnswer}</p>
                        </div>
                      )}
                      {!q.isCorrect && (
                        <div className="p-3 rounded-xl bg-emerald-500/8">
                          <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-1">Correct Answer</p>
                          <p className="text-white text-sm">{q.correctAnswer}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── 4. ACTION BUTTONS ── */}
          <div className="backdrop-blur-3xl bg-[#090b14]/70 rounded-[1.5rem] border border-white/5 shadow-2xl p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <button
                onClick={handleRetry}
                disabled={retrying}
                className="flex items-center justify-center gap-2 px-4 py-3.5 bg-emerald-500/15 border border-emerald-500/25 text-emerald-300 text-xs font-black rounded-xl hover:bg-emerald-500/25 hover:scale-[1.03] hover:shadow-lg hover:shadow-emerald-500/15 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {retrying ? <Loader2 size={14} className="animate-spin" /> : <RotateCcw size={14} />}
                {retrying ? 'Starting…' : 'Retry Quiz'}
              </button>

              <button
                onClick={() => navigate("/assessment")}
                className="flex items-center justify-center gap-2 px-4 py-3.5 bg-indigo-500/15 border border-indigo-500/25 text-indigo-300 text-xs font-black rounded-xl hover:bg-indigo-500/25 hover:scale-[1.03] hover:shadow-lg hover:shadow-indigo-500/15 transition-all duration-200"
              >
                <LayoutDashboard size={14} /> Dashboard
              </button>

              <button
                disabled
                className="flex items-center justify-center gap-2 px-4 py-3.5 bg-white/4 border border-white/8 text-slate-600 text-xs font-black rounded-xl cursor-not-allowed opacity-50"
              >
                <Download size={14} /> Certificate <span className="text-[10px] text-slate-700">(Soon)</span>
              </button>

              <button
                disabled
                className="flex items-center justify-center gap-2 px-4 py-3.5 bg-white/4 border border-white/8 text-slate-600 text-xs font-black rounded-xl cursor-not-allowed opacity-50"
              >
                <BarChart2 size={14} /> Analytics <span className="text-[10px] text-slate-700">(Soon)</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ResultPage;
