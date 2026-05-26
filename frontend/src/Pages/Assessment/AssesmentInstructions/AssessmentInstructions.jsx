import { useState, useEffect } from "react";
import { useQuiz } from "../../Context/QuizContext";
import { useNavigate } from "react-router-dom";
import { startQuiz } from "../../Services/assessmentService";
import BackToHomeButton from "../../../component/Assessment/BackToHomeButton";

const AssessmentInstructions = () => {
  const { assessment: contextAssessment, setTimer, setAssessment } = useQuiz();
  const navigate = useNavigate();
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Check authentication on component mount
  useEffect(() => {
    const token = sessionStorage.getItem('token');
    if (!token) {
      navigate('/signin');
      return;
    }
  }, [navigate]);

  // Quiz configuration state
  const [quizConfig, setQuizConfig] = useState({
    difficulty: 'beginner',
    experienceLevel: 'beginner',
    questionCount: 10
  });

  // Use context assessment or redirect to dashboard
  const assessment = contextAssessment;

  if (!assessment || !assessment.topicId) {
    navigate("/assessment");
    return null;
  }

  // Assessment details
  const assessmentDetails = {
    description: `This test evaluates your understanding of ${assessment.topicName} concepts including fundamentals, advanced topics, and practical applications.`,
    passingCriteria: "You must score at least 60% to pass this assessment.",
    attemptLimit: "You can retry this assessment multiple times to improve your score.",
    difficulty: quizConfig.difficulty,
    passingScore: "60%",
    attemptsAllowed: "Unlimited",
  };

  const handleStartClick = () => {
    if (!agreedToTerms) return;
    setShowConfirmModal(true);
  };

  const handleConfirmStart = async () => {
    try {
      setLoading(true);
      setError(null);

      // Call start quiz API
      const payload = {
        topicId: assessment.topicId,
        difficulty: quizConfig.difficulty,
        experienceLevel: quizConfig.experienceLevel,
        questionCount: quizConfig.questionCount
      };

      const response = await startQuiz(payload);
      const sessionData = response.data?.data;

      if (sessionData && sessionData.sessionId) {
        // Store session ID and quiz data
        localStorage.setItem('sessionId', sessionData.sessionId);
        localStorage.setItem('startTime', Date.now());

        // Update context with session data
        setAssessment({
          ...assessment,
          sessionId: sessionData.sessionId,
          questions: sessionData.questions,
          totalQuestions: sessionData.totalQuestions,
          difficulty: sessionData.difficulty,
          startedAt: sessionData.startedAt
        });

        // Set timer (convert minutes to seconds)
        setTimer(quizConfig.questionCount * 60); // 1 minute per question

        setShowConfirmModal(false);
        navigate("/assessment/quiz");
      }
    } catch (err) {
      console.error('Failed to start quiz:', err);
      setError(err.response?.data?.message || 'Failed to start quiz. Please try again.');
      setShowConfirmModal(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black relative">
      {/* Live Moving Background Animations */}
      <div className="animated-bg">
        {/* Moving Shapes */}
        <div className="moving-shape shape-1"></div>
        <div className="moving-shape shape-2"></div>
        <div className="moving-shape shape-3"></div>
        <div className="moving-shape shape-4"></div>
        <div className="moving-shape shape-5"></div>
        <div className="moving-shape shape-6"></div>
        <div className="moving-shape shape-7"></div>
        <div className="moving-shape shape-8"></div>
        
        {/* Rotating Center Gradient */}
        <div className="rotating-gradient"></div>
        
        {/* Floating Particles */}
        <div className="floating-particle" style={{top: '5%', left: '15%', animationDelay: '0s'}}></div>
        <div className="floating-particle" style={{top: '8%', left: '85%', animationDelay: '2s'}}></div>
        <div className="floating-particle" style={{top: '12%', left: '50%', animationDelay: '1.5s'}}></div>
        <div className="floating-particle" style={{top: '15%', left: '20%', animationDelay: '0s'}}></div>
        <div className="floating-particle" style={{top: '25%', left: '70%', animationDelay: '1s'}}></div>
        <div className="floating-particle" style={{top: '45%', left: '10%', animationDelay: '2s'}}></div>
        <div className="floating-particle" style={{top: '55%', left: '85%', animationDelay: '1.5s'}}></div>
        <div className="floating-particle" style={{top: '75%', left: '30%', animationDelay: '0.5s'}}></div>
        <div className="floating-particle" style={{top: '65%', left: '60%', animationDelay: '2.5s'}}></div>
        <div className="floating-particle" style={{top: '35%', left: '50%', animationDelay: '3s'}}></div>
        <div className="floating-particle" style={{top: '85%', left: '75%', animationDelay: '1.2s'}}></div>
      </div>

      <div className="p-4 md:p-6 lg:p-8 overflow-auto relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6 flex justify-end">
            <BackToHomeButton />
          </div>

          {/* 1️⃣ PAGE HEADER SECTION */}
          <div className="mb-8">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 flex items-center gap-3">
                  <span className="text-4xl">{assessment.topicIcon}</span>
                  {assessment.title || `${assessment.topicName} Assessment`}
                </h1>
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <span className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full border border-indigo-500/30">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                      <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                    </svg>
                    {assessment.topicName}
                  </span>
                  {assessment.category && (
                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full border border-purple-500/30">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                      </svg>
                      {assessment.category}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-full border border-yellow-500/30">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                    </svg>
                    <span className="capitalize">{quizConfig.difficulty}</span>
                  </span>
                  <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full border border-blue-500/30">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    ~{quizConfig.questionCount} Minutes
                  </span>
                  <span className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/20 text-green-300 rounded-full border border-green-500/30">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                      <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {quizConfig.questionCount} Questions
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 2️⃣ ASSESSMENT OVERVIEW CARD */}
          <div className="backdrop-blur-xl bg-slate-900/60 border-l-4 border-indigo-500 rounded-xl p-6 mb-6 shadow-xl border border-indigo-400/30">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              Assessment Overview
            </h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="text-indigo-400 mt-1">📌</span>
                <div>
                  <p className="text-gray-300 leading-relaxed">
                    {assessmentDetails.description}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-green-400 mt-1">🎯</span>
                <div>
                  <p className="text-sm font-semibold text-gray-200">Passing Criteria:</p>
                  <p className="text-gray-300">{assessmentDetails.passingCriteria}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-yellow-400 mt-1">🔁</span>
                <div>
                  <p className="text-sm font-semibold text-gray-200">Attempt Limit:</p>
                  <p className="text-gray-300">{assessmentDetails.attemptLimit}</p>
                </div>
              </div>
            </div>
          </div>

          {/* ⚙️ QUIZ CONFIGURATION SECTION */}
          <div className="backdrop-blur-xl bg-slate-900/60 border border-white/10 rounded-xl p-6 mb-6 shadow-xl">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
              Configure Your Quiz
            </h2>
            
            <div className="grid md:grid-cols-3 gap-4">
              {/* Difficulty Level */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Difficulty Level
                </label>
                <select
                  value={quizConfig.difficulty}
                  onChange={(e) => setQuizConfig({ ...quizConfig, difficulty: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-700 text-white rounded-lg border border-white/20 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
                <p className="text-xs text-gray-400 mt-1">Choose the question difficulty</p>
              </div>

              {/* Experience Level */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Experience Level
                </label>
                <select
                  value={quizConfig.experienceLevel}
                  onChange={(e) => setQuizConfig({ ...quizConfig, experienceLevel: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-700 text-white rounded-lg border border-white/20 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                >
                  <option value="beginner">Beginner (0-1 years)</option>
                  <option value="intermediate">Intermediate (1-3 years)</option>
                  <option value="advanced">Advanced (3+ years)</option>
                </select>
                <p className="text-xs text-gray-400 mt-1">Your practical experience</p>
              </div>

              {/* Number of Questions */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Number of Questions
                </label>
                <select
                  value={quizConfig.questionCount}
                  onChange={(e) => setQuizConfig({ ...quizConfig, questionCount: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 bg-slate-700 text-white rounded-lg border border-white/20 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                >
                  <option value="5">5 Questions (~5 mins)</option>
                  <option value="10">10 Questions (~10 mins)</option>
                  <option value="15">15 Questions (~15 mins)</option>
                  <option value="20">20 Questions (~20 mins)</option>
                </select>
                <p className="text-xs text-gray-400 mt-1">Estimated time</p>
              </div>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg flex items-center gap-2 text-red-300">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* 3️⃣ RULES & GUIDELINES SECTION */}
            <div className="backdrop-blur-xl bg-slate-900/60 border border-white/10 rounded-xl p-6 shadow-xl">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <svg className="w-6 h-6 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Rules & Guidelines
              </h2>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-gray-300">
                  <span className="text-blue-400 text-lg mt-0.5">⏳</span>
                  <span>The timer will start once you click Start</span>
                </li>
                <li className="flex items-start gap-3 text-gray-300">
                  <span className="text-red-400 text-lg mt-0.5">🚫</span>
                  <span>Do not refresh the page during the test</span>
                </li>
                <li className="flex items-start gap-3 text-gray-300">
                  <span className="text-red-400 text-lg mt-0.5">🚫</span>
                  <span>Do not switch tabs or minimize browser</span>
                </li>
                <li className="flex items-start gap-3 text-gray-300">
                  <span className="text-orange-400 text-lg mt-0.5">📤</span>
                  <span>Test will auto-submit when time expires</span>
                </li>
                <li className="flex items-start gap-3 text-gray-300">
                  <span className="text-yellow-400 text-lg mt-0.5">❌</span>
                  <span>You cannot change answers after submission</span>
                </li>
              </ul>
            </div>

            {/* 4️⃣ ASSESSMENT DETAILS SUMMARY BOX */}
            <div className="backdrop-blur-xl bg-slate-900/60 border border-white/10 rounded-xl p-6 shadow-xl">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <svg className="w-6 h-6 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
                </svg>
                Assessment Summary
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-white/10">
                  <span className="text-gray-400 font-medium">Topic</span>
                  <span className="text-white font-semibold flex items-center gap-2">
                    <span>{assessment.topicIcon}</span>
                    {assessment.topicName}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/10">
                  <span className="text-gray-400 font-medium">Questions</span>
                  <span className="text-white font-semibold">{quizConfig.questionCount}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/10">
                  <span className="text-gray-400 font-medium">Est. Duration</span>
                  <span className="text-white font-semibold">{quizConfig.questionCount} Minutes</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/10">
                  <span className="text-gray-400 font-medium">Passing Score</span>
                  <span className="text-green-400 font-semibold">{assessmentDetails.passingScore}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/10">
                  <span className="text-gray-400 font-medium">Difficulty</span>
                  <span className="text-yellow-400 font-semibold capitalize">{quizConfig.difficulty}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-400 font-medium">Attempts Allowed</span>
                  <span className="text-white font-semibold">{assessmentDetails.attemptsAllowed}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 5️⃣ AGREEMENT CHECKBOX */}
          <div className="backdrop-blur-xl bg-slate-900/60 border border-white/10 rounded-xl p-6 mb-6 shadow-xl">
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="flex items-center h-6">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="w-5 h-5 text-indigo-600 bg-white rounded focus:ring-indigo-500 focus:ring-2 cursor-pointer"
                />
              </div>
              <div className="flex-1">
                <span className="text-gray-300 group-hover:text-white transition-colors">
                  I have read and understood the instructions, rules, and guidelines. I agree to follow all the assessment policies and understand that any violation may result in disqualification.
                </span>
              </div>
            </label>
          </div>

          {/* 6️⃣ START ASSESSMENT BUTTON */}
          <div className="flex justify-center">
            <button
              onClick={handleStartClick}
              disabled={!agreedToTerms || loading}
              className={`px-12 py-4 rounded-xl font-bold text-lg transition-all shadow-xl ${
                agreedToTerms && !loading
                  ? "bg-gradient-to-r from-indigo-500/40 to-purple-600/40 text-white hover:from-indigo-500/50 hover:to-purple-600/50 hover:shadow-2xl border-2 border-indigo-400/50 transform hover:scale-105 active:scale-100"
                  : "bg-slate-700 text-gray-500 cursor-not-allowed border border-white/10"
              }`}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Starting Quiz...
                </span>
              ) : agreedToTerms ? "Start Assessment →" : "Accept Terms to Continue"}
            </button>
          </div>

          {/* Warning Message */}
          {!agreedToTerms && (
            <p className="text-center text-yellow-500 text-sm mt-4 flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Please read and accept the terms before starting
            </p>
          )}

        </div>
      </div>

      {/* CONFIRMATION MODAL */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="backdrop-blur-xl bg-slate-900/60 border border-white/20 rounded-2xl p-8 max-w-md w-full shadow-2xl transform transition-all">
            <div className="text-center mb-6">
              <div className="mx-auto w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mb-4 border-2 border-yellow-500/50">
                <svg className="w-8 h-8 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">
                Ready to Begin?
              </h3>
              <p className="text-gray-300 mb-2">
                Are you sure you want to start the assessment?
              </p>
              <p className="text-yellow-400 text-sm font-semibold">
                ⏱️ Timer will start immediately!
              </p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 px-6 py-3 bg-slate-700 text-gray-300 rounded-xl font-semibold hover:bg-slate-600 transition-all border border-white/20"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmStart}
                disabled={loading}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-500/40 to-purple-600/40 text-white rounded-xl font-semibold hover:from-indigo-500/50 hover:to-purple-600/50 transition-all shadow-xl border border-indigo-400/50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Starting...
                  </span>
                ) : "Yes, Start Now"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssessmentInstructions;
