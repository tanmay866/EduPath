import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import AssessmentSidebar from "../../component/Assessment/AssessmentSidebar";

const ResultPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [showReview, setShowReview] = useState(false);

  // 📦 STATIC RESULT DATA (for testing)
  const staticResult = {
    score: 8,
    totalQuestions: 10,
    percentage: 80,
    passed: true,
    correctAnswers: 8,
    wrongAnswers: 2,
    unanswered: 0,
    passingScore: 60,
    skill: "React.js",
    assessmentTitle: "Frontend Development Assessment",
    attemptDate: new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }),
    timeTaken: "25 minutes",
    questionReview: [
      {
        id: 1,
        question: "What is React?",
        selectedAnswer: "A JavaScript library for building user interfaces",
        correctAnswer: "A JavaScript library for building user interfaces",
        isCorrect: true,
        options: [
          "A JavaScript library for building user interfaces",
          "A server-side framework",
          "A database management system",
          "A CSS preprocessor"
        ]
      },
      {
        id: 2,
        question: "Which hook is used to manage state in functional components?",
        selectedAnswer: "useState",
        correctAnswer: "useState",
        isCorrect: true,
        options: ["useEffect", "useState", "useContext", "useReducer"]
      },
      {
        id: 3,
        question: "What does JSX stand for?",
        selectedAnswer: "JavaScript XML",
        correctAnswer: "JavaScript XML",
        isCorrect: true,
        options: ["JavaScript XML", "Java Syntax Extension", "JavaScript Extension", "Java XML"]
      },
      {
        id: 4,
        question: "Which method is used to create components in React?",
        selectedAnswer: "React.component()",
        correctAnswer: "function or class",
        isCorrect: false,
        options: ["React.createComponent()", "React.component()", "function or class", "React.makeComponent()"]
      },
      {
        id: 5,
        question: "What is the virtual DOM?",
        selectedAnswer: "A copy of the real DOM kept in memory",
        correctAnswer: "A copy of the real DOM kept in memory",
        isCorrect: true,
        options: ["A copy of the real DOM kept in memory", "A new browser API", "A CSS framework", "A database structure"]
      },
      {
        id: 6,
        question: "Which hook is used for side effects in React?",
        selectedAnswer: "useEffect",
        correctAnswer: "useEffect",
        isCorrect: true,
        options: ["useState", "useEffect", "useCallback", "useMemo"]
      },
      {
        id: 7,
        question: "What is prop drilling in React?",
        selectedAnswer: "Passing data through multiple layers of components",
        correctAnswer: "Passing data through multiple layers of components",
        isCorrect: true,
        options: ["Passing data through multiple layers of components", "Creating new props", "Deleting props", "Updating props automatically"]
      },
      {
        id: 8,
        question: "Which of the following is true about React keys?",
        selectedAnswer: "Keys should be unique among siblings",
        correctAnswer: "Keys should be unique among siblings",
        isCorrect: true,
        options: ["Keys should be unique among siblings", "Keys can be random numbers", "Keys are not important", "Keys should always be index"]
      },
      {
        id: 9,
        question: "What is the purpose of useContext hook?",
        selectedAnswer: "To manage state",
        correctAnswer: "To access React Context",
        isCorrect: false,
        options: ["To manage state", "To access React Context", "To create side effects", "To optimize performance"]
      },
      {
        id: 10,
        question: "Which lifecycle method is equivalent to useEffect with empty dependency array?",
        selectedAnswer: "componentDidMount",
        correctAnswer: "componentDidMount",
        isCorrect: true,
        options: ["componentDidUpdate", "componentWillMount", "componentDidMount", "componentWillUnmount"]
      }
    ]
  };

  const result = state || staticResult;

  const {
    score,
    totalQuestions,
    percentage,
    passed,
    correctAnswers,
    wrongAnswers,
    unanswered = 0,
    passingScore = 60,
    skill = "React.js",
    assessmentTitle = "Frontend Development Assessment",
    attemptDate = staticResult.attemptDate,
    timeTaken = "25 minutes",
    questionReview = staticResult.questionReview
  } = result;

  // 🧠 Dynamic Performance Insight
  const getPerformanceInsight = () => {
    if (passed) {
      const aboveAverage = percentage >= 80;
      return {
        message: aboveAverage 
          ? "🌟 Excellent! You performed above average and demonstrated strong knowledge." 
          : "✅ Great job! You passed the assessment successfully.",
        color: "text-green-400"
      };
    } else {
      const needed = Math.ceil((passingScore / 100) * totalQuestions) - correctAnswers;
      return {
        message: `📚 You need ${needed} more correct answer${needed > 1 ? 's' : ''} to pass. Keep practicing and try again!`,
        color: "text-red-400"
      };
    }
  };

  const insight = getPerformanceInsight();

  return (
    <div className="flex min-h-screen bg-slate-900 mt-26">
      <AssessmentSidebar />
      
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-6xl mx-auto space-y-6">

          {/* 1️⃣ SCORE SUMMARY CARD - Main Focus */}
          <div className="backdrop-blur-lg bg-gradient-to-br from-white/10 to-white/5 shadow-2xl rounded-2xl p-8 border-2 border-white/20">
            
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-white mb-2">Assessment Results</h1>
              <p className="text-gray-400">{assessmentTitle}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              
              {/* Left: Score Display */}
              <div className="flex flex-col items-center justify-center backdrop-blur-lg bg-white/5 rounded-xl p-6 border border-white/10">
                
                {/* Big Score Badge */}
                <div className="relative mb-4">
                  <div className={`w-40 h-40 rounded-full flex items-center justify-center border-8 ${
                    passed ? 'border-green-500 bg-green-900/30' : 'border-red-500 bg-red-900/30'
                  }`}>
                    <div className="text-center">
                      <div className={`text-5xl font-bold ${passed ? 'text-green-400' : 'text-red-400'}`}>
                        {percentage}%
                      </div>
                    </div>
                  </div>
                  {passed && (
                    <div className="absolute -top-2 -right-2 bg-green-500 rounded-full p-3">
                      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Score Fraction */}
                <div className="text-4xl font-bold text-white mb-3">
                  {score} <span className="text-gray-500">/</span> {totalQuestions}
                </div>

                {/* Status Badge */}
                <div className={`px-6 py-2 rounded-full font-bold text-lg ${
                  passed 
                    ? 'bg-green-600 text-white' 
                    : 'bg-red-600 text-white'
                }`}>
                  {passed ? '✓ PASSED' : '✗ FAILED'}
                </div>

              </div>

              {/* Right: Details */}
              <div className="space-y-4">
                
                <div className="backdrop-blur-lg bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="backdrop-blur-lg bg-indigo-500/20 p-3 rounded-lg border border-indigo-500/30">
                      <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Skill Assessed</p>
                      <p className="text-white font-semibold text-lg">{skill}</p>
                    </div>
                  </div>
                </div>

                <div className="backdrop-blur-lg bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="backdrop-blur-lg bg-blue-500/20 p-3 rounded-lg border border-blue-500/30">
                      <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Attempt Date</p>
                      <p className="text-white font-semibold">{attemptDate}</p>
                    </div>
                  </div>
                </div>

                <div className="backdrop-blur-lg bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="backdrop-blur-lg bg-purple-500/20 p-3 rounded-lg border border-purple-500/30">
                      <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Time Taken</p>
                      <p className="text-white font-semibold">{timeTaken}</p>
                    </div>
                  </div>
                </div>

              </div>

            </div>

          </div>

          <div className="grid md:grid-cols-2 gap-6">

            {/* 2️⃣ PERFORMANCE BREAKDOWN */}
            <div className="backdrop-blur-lg bg-white/5 rounded-xl p-6 border border-white/10">
              
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Performance Breakdown
              </h2>

              <div className="space-y-3">
                
                <div className="flex justify-between items-center p-3 backdrop-blur-lg bg-white/5 rounded-lg border border-white/10">
                  <span className="text-gray-300 font-medium">Total Questions</span>
                  <span className="text-white font-bold text-lg">{totalQuestions}</span>
                </div>

                <div className="flex justify-between items-center p-3 backdrop-blur-lg bg-green-500/20 rounded-lg border border-green-500/30">
                  <span className="text-green-300 font-medium flex items-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Correct Answers
                  </span>
                  <span className="text-green-400 font-bold text-lg">{correctAnswers}</span>
                </div>

                <div className="flex justify-between items-center p-3 backdrop-blur-lg bg-red-500/20 rounded-lg border border-red-500/30">
                  <span className="text-red-300 font-medium flex items-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    Incorrect Answers
                  </span>
                  <span className="text-red-400 font-bold text-lg">{wrongAnswers}</span>
                </div>

                {unanswered > 0 && (
                  <div className="flex justify-between items-center p-3 backdrop-blur-lg bg-yellow-500/20 rounded-lg border border-yellow-500/30">
                    <span className="text-yellow-300 font-medium flex items-center gap-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      Unanswered
                    </span>
                    <span className="text-yellow-400 font-bold text-lg">{unanswered}</span>
                  </div>
                )}

                <div className="flex justify-between items-center p-3 backdrop-blur-lg bg-indigo-500/20 rounded-lg border border-indigo-500/30">
                  <span className="text-indigo-300 font-medium">Passing Score Required</span>
                  <span className="text-indigo-400 font-bold text-lg">{passingScore}%</span>
                </div>

              </div>

            </div>

            {/* 3️⃣ PERFORMANCE INSIGHT */}
            <div className="backdrop-blur-lg bg-white/5 rounded-xl p-6 border border-white/10">
              
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Performance Insight
              </h2>

              <div className={`p-4 rounded-lg border ${
                passed ? 'backdrop-blur-lg bg-green-500/20 border-green-500/30' : 'backdrop-blur-lg bg-red-500/20 border-red-500/30'
              }`}>
                <p className={`text-lg font-semibold ${insight.color} mb-4`}>
                  {insight.message}
                </p>
              </div>

              {/* Progress Visualization */}
              <div className="mt-6 space-y-4">
                <div>
                  <div className="flex justify-between text-sm text-gray-400 mb-2">
                    <span>Accuracy Rate</span>
                    <span className="font-semibold text-white">{percentage}%</span>
                  </div>
                  <div className="w-full backdrop-blur-lg bg-white/10 rounded-full h-3 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all ${
                        passed ? 'bg-gradient-to-r from-green-500 to-green-400' : 'bg-gradient-to-r from-red-500 to-red-400'
                      }`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="backdrop-blur-lg bg-white/5 border border-white/10 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-green-400">{correctAnswers}</div>
                    <div className="text-xs text-gray-400">Correct</div>
                  </div>
                  <div className="backdrop-blur-lg bg-white/5 border border-white/10 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-red-400">{wrongAnswers}</div>
                    <div className="text-xs text-gray-400">Incorrect</div>
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              <div className="mt-6 p-4 backdrop-blur-lg bg-indigo-500/20 border border-indigo-500/30 rounded-lg">
                <h3 className="text-sm font-bold text-indigo-300 mb-2">💡 Recommendation</h3>
                <p className="text-gray-300 text-sm">
                  {passed 
                    ? "Continue practicing to maintain your skills. Try more advanced assessments to challenge yourself."
                    : "Review the incorrect answers below and strengthen your understanding of those concepts before retaking."}
                </p>
              </div>

            </div>

          </div>

          {/* 4️⃣ QUESTION REVIEW SECTION */}
          <div className="backdrop-blur-lg bg-white/5 rounded-xl p-6 border border-white/10">
            
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Question Review
              </h2>
              
              <button
                onClick={() => setShowReview(!showReview)}
                className="flex items-center gap-2 px-4 py-2 backdrop-blur-lg bg-indigo-500/40 border-2 border-indigo-400/50 text-white rounded-lg hover:bg-indigo-500/50 hover:scale-105 transition-all font-semibold"
              >
                {showReview ? 'Hide' : 'Show'} Review
                <svg className={`w-4 h-4 transition-transform ${showReview ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            {showReview && (
              <div className="space-y-4">
                {questionReview.map((q, index) => (
                  <div 
                    key={q.id}
                    className={`p-5 rounded-lg border-2 ${
                      q.isCorrect 
                        ? 'bg-green-900/10 border-green-700' 
                        : q.selectedAnswer 
                        ? 'bg-red-900/10 border-red-700' 
                        : 'bg-yellow-900/10 border-yellow-700'
                    }`}
                  >
                    
                    {/* Question Header */}
                    <div className="flex items-start gap-3 mb-3">
                      <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        q.isCorrect 
                          ? 'bg-green-600 text-white' 
                          : q.selectedAnswer 
                          ? 'bg-red-600 text-white' 
                          : 'bg-yellow-600 text-gray-900'
                      }`}>
                        {q.isCorrect ? '✓' : q.selectedAnswer ? '✗' : '?'}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-white font-semibold text-lg mb-1">
                          Q{index + 1}. {q.question}
                        </h3>
                      </div>
                    </div>

                    {/* Answers */}
                    <div className="ml-11 space-y-2">
                      
                      {q.selectedAnswer && (
                        <div className={`p-3 rounded-lg ${
                          q.isCorrect ? 'bg-green-900/30' : 'bg-red-900/30'
                        }`}>
                          <span className={`text-sm font-semibold ${
                            q.isCorrect ? 'text-green-300' : 'text-red-300'
                          }`}>
                            Your Answer:
                          </span>
                          <p className="text-white mt-1">{q.selectedAnswer}</p>
                        </div>
                      )}

                      {!q.isCorrect && (
                        <div className="p-3 rounded-lg bg-green-900/30">
                          <span className="text-sm font-semibold text-green-300">
                            Correct Answer:
                          </span>
                          <p className="text-white mt-1">{q.correctAnswer}</p>
                        </div>
                      )}

                    </div>

                  </div>
                ))}
              </div>
            )}

          </div>

          {/* 5️⃣ ACTION BUTTONS */}
          <div className="backdrop-blur-lg bg-white/5 rounded-xl p-6 border border-white/10">
            
            <div className="grid md:grid-cols-4 gap-4">
              
              <button
                onClick={() => navigate("/assessment/instructions")}
                className="flex items-center justify-center gap-2 px-6 py-4 backdrop-blur-lg bg-green-500/40 border-2 border-green-400/50 text-white rounded-lg font-bold hover:bg-green-500/50 hover:scale-105 transition-all shadow-lg hover:shadow-xl"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Retake Assessment
              </button>

              <button
                onClick={() => navigate("/assessment")}
                className="flex items-center justify-center gap-2 px-6 py-4 backdrop-blur-lg bg-indigo-500/40 border-2 border-indigo-400/50 text-white rounded-lg font-bold hover:bg-indigo-500/50 hover:scale-105 transition-all shadow-lg hover:shadow-xl"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Back to Dashboard
              </button>

              <button
                disabled
                className="flex items-center justify-center gap-2 px-6 py-4 backdrop-blur-lg bg-white/10 border border-white/20 text-gray-400 rounded-lg font-bold cursor-not-allowed opacity-50"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download Certificate
                <span className="text-xs">(Soon)</span>
              </button>

              <button
                disabled
                className="flex items-center justify-center gap-2 px-6 py-4 backdrop-blur-lg bg-white/10 border border-white/20 text-gray-400 rounded-lg font-bold cursor-not-allowed opacity-50"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Detailed Analytics
                <span className="text-xs">(Soon)</span>
              </button>

            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default ResultPage;
