import { useState } from "react";
import { useQuiz } from "../context/QuizContext";
import { useNavigate } from "react-router-dom";
import AssessmentSidebar from "../../component/Assessment/AssessmentSidebar";

const AssessmentInstructions = () => {
  const { assessment: contextAssessment, setTimer, setAssessment } = useQuiz();
  const navigate = useNavigate();
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Static assessment data for demonstration (will be replaced with API data)
  const staticAssessment = {
    title: "Frontend Development Assessment",
    skill: "React.js",
    duration: 30,
    totalQuestions: 10,
    difficulty: "Intermediate",
    assessmentId: "static-001",
  };

  // Use context assessment if available, otherwise use static data
  const assessment = contextAssessment || staticAssessment;

  // Assessment details
  const assessmentDetails = {
    description: "This test evaluates your understanding of core React.js concepts including hooks, state management, component lifecycle, and modern React patterns.",
    passingCriteria: "You must score at least 70% to pass this assessment.",
    attemptLimit: "You can attempt this assessment only once.",
    difficulty: assessment.difficulty || "Intermediate",
    passingScore: "70%",
    attemptsAllowed: 1,
  };

  const handleStartClick = () => {
    if (!agreedToTerms) return;
    setShowConfirmModal(true);
  };

  const handleConfirmStart = () => {
    // If using static data, set it in context first
    if (!contextAssessment) {
      setAssessment({
        ...assessment,
        questions: [], // Will be loaded in quiz
      });
    }
    
    // ⏱ convert minutes → seconds
    setTimer(assessment.duration * 60);
    setShowConfirmModal(false);
    navigate("/assessment/quiz");
  };

  return (
    <div className="flex min-h-screen bg-slate-900 mt-28">
      <AssessmentSidebar />
      <div className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
        <div className="max-w-4xl mx-auto">

          {/* 1️⃣ PAGE HEADER SECTION */}
          <div className="mb-8">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
                  {assessment.title}
                </h1>
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <span className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-900/50 text-indigo-300 rounded-full border border-indigo-700">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                      <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                    </svg>
                    {assessment.skill}
                  </span>
                  <span className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-900/50 text-yellow-300 rounded-full border border-yellow-700">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                    </svg>
                    {assessment.difficulty}
                  </span>
                  <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-900/50 text-blue-300 rounded-full border border-blue-700">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    {assessment.duration} Minutes
                  </span>
                  <span className="inline-flex items-center gap-2 px-3 py-1 bg-green-900/50 text-green-300 rounded-full border border-green-700">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                      <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {assessment.totalQuestions} Questions
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 2️⃣ ASSESSMENT OVERVIEW CARD */}
          <div className="bg-gradient-to-r from-indigo-900/40 to-purple-900/40 border-l-4 border-indigo-500 rounded-lg p-6 mb-6 shadow-lg">
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

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* 3️⃣ RULES & GUIDELINES SECTION */}
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 shadow-lg">
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
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 shadow-lg">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <svg className="w-6 h-6 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
                </svg>
                Assessment Summary
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-700">
                  <span className="text-gray-400 font-medium">Skill</span>
                  <span className="text-white font-semibold">{assessment.skill}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-700">
                  <span className="text-gray-400 font-medium">Questions</span>
                  <span className="text-white font-semibold">{assessment.totalQuestions}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-700">
                  <span className="text-gray-400 font-medium">Duration</span>
                  <span className="text-white font-semibold">{assessment.duration} Minutes</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-700">
                  <span className="text-gray-400 font-medium">Passing Score</span>
                  <span className="text-green-400 font-semibold">{assessmentDetails.passingScore}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-700">
                  <span className="text-gray-400 font-medium">Difficulty</span>
                  <span className="text-yellow-400 font-semibold">{assessmentDetails.difficulty}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-400 font-medium">Attempts Allowed</span>
                  <span className="text-white font-semibold">{assessmentDetails.attemptsAllowed}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 5️⃣ AGREEMENT CHECKBOX */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-6 shadow-lg">
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="flex items-center h-6">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="w-5 h-5 text-indigo-600 bg-gray-700 border-gray-600 rounded focus:ring-indigo-500 focus:ring-2 cursor-pointer"
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
              disabled={!agreedToTerms}
              className={`px-12 py-4 rounded-lg font-bold text-lg transition-all shadow-lg ${
                agreedToTerms
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0"
                  : "bg-gray-700 text-gray-500 cursor-not-allowed"
              }`}
            >
              {agreedToTerms ? "Start Assessment →" : "Accept Terms to Continue"}
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
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-8 max-w-md w-full shadow-2xl transform transition-all">
            <div className="text-center mb-6">
              <div className="mx-auto w-16 h-16 bg-yellow-900/50 rounded-full flex items-center justify-center mb-4 border-2 border-yellow-600">
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
                className="flex-1 px-6 py-3 bg-gray-700 text-gray-300 rounded-lg font-semibold hover:bg-gray-600 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmStart}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg"
              >
                Yes, Start Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssessmentInstructions;
