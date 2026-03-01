import { useEffect } from "react";
import API from "../Services/assessmentService";
import { useQuiz } from "../context/QuizContext";
import { useNavigate } from "react-router-dom";
import AssessmentSidebar from "../../component/Assessment/AssessmentSidebar";

const AssessmentDashboard = () => {
  const { setAssessment } = useQuiz();
  const navigate = useNavigate();

  // 📊 Static Performance Data (will be replaced with API later)
  const performanceStats = {
    totalAttempts: 5,
    averageScore: 75,
    highestScore: 90,
    lastAttemptStatus: "Pass",
  };

  // 🎯 Static Available Assessments (will be replaced with API later)
  const availableAssessment = [
    {
      id: "assessment-1",
      title: "Frontend Development Assessment",
      skill: "React.js",
      duration: 30,
      totalQuestions: 10,
      difficultyLevel: "Intermediate",
      isAvailable: true,
    },
    {
      id: "assessment-2",
      title: "Backend Development Assessment",
      skill: "Node.js & Express",
      duration: 45,
      totalQuestions: 15,
      difficultyLevel: "Advanced",
      isAvailable: true,
    },
    {
      id: "assessment-3",
      title: "Database Design Assessment",
      skill: "SQL & MongoDB",
      duration: 35,
      totalQuestions: 12,
      difficultyLevel: "Intermediate",
      isAvailable: true,
    },
  ];

  // 📜 Static Previous Attempts (will be replaced with API later)
  const previousAttempts = [
    {
      id: 1,
      date: "18 Feb 2026",
      score: 8,
      totalQuestions: 10,
      percentage: 80,
      status: "Pass",
    },
    {
      id: 2,
      date: "15 Feb 2026",
      score: 9,
      totalQuestions: 10,
      percentage: 90,
      status: "Pass",
    },
    {
      id: 3,
      date: "12 Feb 2026",
      score: 6,
      totalQuestions: 10,
      percentage: 60,
      status: "Fail",
    },
    {
      id: 4,
      date: "10 Feb 2026",
      score: 7,
      totalQuestions: 10,
      percentage: 70,
      status: "Pass",
    },
    {
      id: 5,
      date: "08 Feb 2026",
      score: 7,
      totalQuestions: 10,
      percentage: 70,
      status: "Pass",
    },
  ];

  const fetchAssessment = async () => {
    try {
      const res = await API.get("/assessment/quiz");
      setAssessment(res.data);
    } catch (error) {
      console.error("Failed to fetch assessment:", error);
    }
  };

  useEffect(() => {
    fetchAssessment();
  }, []);

  const handleStartAssessment = (assessment) => {
    // Set assessment data before navigating
    setAssessment({
      title: assessment.title,
      skill: assessment.skill,
      duration: assessment.duration,
      totalQuestions: assessment.totalQuestions,
      assessmentId: assessment.id,
      questions: [], // Will be loaded in instructions
    });
    navigate("/assessment/instructions");
  };

  return (
    <div className="flex min-h-screen bg-black relative">
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

      <AssessmentSidebar />
      <div className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto relative z-10">
        <div className="max-w-7xl mx-auto">

        {/* 1️⃣ PAGE HEADER SECTION */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                Skill Assessment
              </h1>
              <p className="text-gray-500">
                Test your skills and track your performance
              </p>
            </div>
            <div className="flex gap-2">
              <span className="px-4 py-2 backdrop-blur-lg bg-green-500/20 text-green-400 rounded-full font-semibold text-sm border border-green-500/30">
                Active
              </span>
              <span className="px-4 py-2 backdrop-blur-lg bg-blue-500/20 text-blue-400 rounded-full font-semibold text-sm border border-blue-500/30">
                {performanceStats.totalAttempts} Completed
              </span>
            </div>
          </div>
        </div>

        {/* 2️⃣ PERFORMANCE SUMMARY CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          
          {/* Total Attempts */}
          <div className="backdrop-blur-xl bg-slate-900/60 rounded-xl shadow-xl p-6 border border-white/10 border-l-4 border-l-blue-500 hover:border-l-blue-400 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium mb-1">
                  Total Attempts
                </p>
                <p className="text-3xl font-bold text-white">
                  {performanceStats.totalAttempts}
                </p>
              </div>
              <div className="backdrop-blur-lg bg-blue-500/20 p-3 rounded-full border border-blue-500/30">
                <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Average Score */}
          <div className="backdrop-blur-xl bg-slate-900/60 rounded-xl shadow-xl p-6 border border-white/10 border-l-4 border-l-purple-500 hover:border-l-purple-400 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium mb-1">
                  Average Score
                </p>
                <p className="text-3xl font-bold text-white">
                  {performanceStats.averageScore}%
                </p>
              </div>
              <div className="backdrop-blur-lg bg-purple-500/20 p-3 rounded-full border border-purple-500/30">
                <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Highest Score */}
          <div className="backdrop-blur-xl bg-slate-900/60 rounded-xl shadow-xl p-6 border border-white/10 border-l-4 border-l-yellow-500 hover:border-l-yellow-400 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium mb-1">
                  Highest Score
                </p>
                <p className="text-3xl font-bold text-white">
                  {performanceStats.highestScore}%
                </p>
              </div>
              <div className="backdrop-blur-lg bg-yellow-500/20 p-3 rounded-full border border-yellow-500/30">
                <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Last Attempt Status */}
          <div className="backdrop-blur-xl bg-slate-900/60 rounded-xl shadow-xl p-6 border border-white/10 border-l-4 border-l-green-500 hover:border-l-green-400 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium mb-1">
                  Last Attempt
                </p>
                <p className="text-3xl font-bold text-white">
                  {performanceStats.lastAttemptStatus}
                </p>
              </div>
              <div className="backdrop-blur-lg bg-green-500/20 p-3 rounded-full border border-green-500/30">
                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
            </div>
          </div>

        </div>

        {/* 3️⃣ AVAILABLE ASSESSMENTS CARDS */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">
            Available Assessments
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {availableAssessment.map((assessment) => (
              <div
                key={assessment.id}
                className="backdrop-blur-lg bg-gradient-to-br from-indigo-500/40 to-purple-600/40 rounded-xl shadow-2xl p-6 text-white border border-indigo-400/30 hover:border-indigo-300/50 transition-all hover:scale-105 flex flex-col"
              >
                <h3 className="text-2xl font-bold mb-3">
                  {assessment.title}
                </h3>
                <p className="text-indigo-100 mb-4 text-sm">
                  Evaluate your knowledge and earn certification
                </p>

                <div className="space-y-2 mb-6 flex-grow">
                  <div className="flex items-center gap-2 text-sm">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                      <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">Skill: {assessment.skill}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">Duration: {assessment.duration} minutes</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                      <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">Questions: {assessment.totalQuestions}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                    </svg>
                    <span className="font-medium">Level: {assessment.difficultyLevel}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleStartAssessment(assessment)}
                  className="w-full backdrop-blur-lg bg-white/20 text-white px-6 py-3 rounded-xl font-bold hover:bg-white/30 transition-all shadow-xl hover:shadow-2xl border border-white/30 hover:border-white/50 "
                >
                  Start Assessment →
                </button>
              </div>
            ))}
          </div>

          {availableAssessment.length === 0 && (
            // Empty State
            <div className="backdrop-blur-xl bg-slate-900/60 rounded-xl shadow-xl p-12 text-center border border-white/10">
              <svg className="w-24 h-24 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-xl font-semibold text-white mb-2">
                No Active Assessments Available
              </h3>
              <p className="text-gray-400">
                Check back later for new assessment opportunities
              </p>
            </div>
          )}
        </div>

        {/* 4️⃣ PREVIOUS ATTEMPTS TABLE */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">
            Previous Attempts
          </h2>

          <div className="backdrop-blur-xl bg-slate-900/60 rounded-xl shadow-xl overflow-hidden border border-white/10">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5 border-b-2 border-white/10">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Attempt Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Score
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Percentage
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {previousAttempts.map((attempt) => (
                    <tr key={attempt.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {attempt.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-white">
                        {attempt.score}/{attempt.totalQuestions}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        <div className="flex items-center gap-2">
                          <div className="w-16 backdrop-blur-lg bg-white/10 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                attempt.percentage >= 70 ? "bg-green-500" : "bg-red-500"
                              }`}
                              style={{ width: `${attempt.percentage}%` }}
                            />
                          </div>
                          <span className="font-medium">{attempt.percentage}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full backdrop-blur-lg ${
                            attempt.status === "Pass"
                              ? "bg-green-500/20 text-green-400 border border-green-500/30"
                              : "bg-red-500/20 text-red-400 border border-red-500/30"
                          }`}
                        >
                          {attempt.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() =>
                            navigate("/assessment/result", {
                              state: {
                                score: attempt.score,
                                totalQuestions: attempt.totalQuestions,
                                percentage: attempt.percentage,
                                passed: attempt.status === "Pass",
                                correctAnswers: attempt.score,
                                wrongAnswers: attempt.totalQuestions - attempt.score,
                              },
                            })
                          }
                          className="text-indigo-400 hover:text-indigo-300 font-medium hover:underline"
                        >
                          View Result →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {previousAttempts.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <p>No previous attempts found</p>
              </div>
            )}
          </div>
        </div>

        </div>
      </div>
    </div>
  );
};

export default AssessmentDashboard;
