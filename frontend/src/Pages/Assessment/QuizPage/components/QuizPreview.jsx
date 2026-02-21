import ConfirmModal from "../../../../component/Comman/ConfirmModal";
import AssessmentSidebar from "../../../../component/Assessment/AssessmentSidebar";
import BackgroundAnimation from "./BackgroundAnimation";

const QuizPreview = ({
  assessment,
  onStartClick,
  onGoBack,
  showStartModal,
  onConfirmStart,
  onCancelStart,
}) => {
  return (
    <div className="flex min-h-screen bg-slate-900 relative">
      <BackgroundAnimation />
      <AssessmentSidebar />
      
      <div className="flex-1 flex items-center justify-center relative z-10 p-4">
        <div className="max-w-3xl w-full">
          <div className="bg-slate-800 border border-white/10 rounded-2xl shadow-2xl p-8">
            <div className="text-center mb-8">
              <div className="inline-block bg-indigo-500/20 p-4 rounded-full mb-4">
                <svg className="w-16 h-16 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">{assessment.title}</h1>
              <p className="text-indigo-400 font-semibold text-lg">Skill: {assessment.skill}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-slate-700/50 p-6 rounded-xl border border-white/10 text-center">
                <div className="bg-blue-500/20 p-3 rounded-full inline-block mb-3">
                  <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-gray-400 text-sm mb-1">Total Questions</p>
                <p className="text-3xl font-bold text-white">{assessment.totalQuestions}</p>
              </div>

              <div className="bg-slate-700/50 p-6 rounded-xl border border-white/10 text-center">
                <div className="bg-purple-500/20 p-3 rounded-full inline-block mb-3">
                  <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-gray-400 text-sm mb-1">Duration</p>
                <p className="text-3xl font-bold text-white">{assessment.duration} min</p>
              </div>

              <div className="bg-slate-700/50 p-6 rounded-xl border border-white/10 text-center">
                <div className="bg-yellow-500/20 p-3 rounded-full inline-block mb-3">
                  <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
                <p className="text-gray-400 text-sm mb-1">Assessment ID</p>
                <p className="text-sm font-bold text-white break-all">{assessment.assessmentId}</p>
              </div>
            </div>

            <div className="bg-slate-700/30 border border-indigo-500/30 p-6 rounded-xl mb-8">
              <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Important Instructions
              </h3>
              <ul className="text-gray-300 text-sm space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-indigo-400 mt-1">•</span>
                  <span>Once you start the quiz, the timer will begin automatically</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-400 mt-1">•</span>
                  <span>You must answer all questions to submit the assessment</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-400 mt-1">•</span>
                  <span>You can mark questions for review and come back to them later</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-400 mt-1">•</span>
                  <span>Do not refresh the page during the assessment</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-400 mt-1">•</span>
                  <span>The quiz will auto-submit when time expires</span>
                </li>
              </ul>
            </div>

            <div className="flex gap-4">
              <button
                onClick={onGoBack}
                className="flex-1 py-3 px-6 bg-slate-700 text-white rounded-xl font-semibold hover:bg-slate-600 transition-all border border-white/20"
              >
                Go Back
              </button>
              <button
                onClick={onStartClick}
                className="flex-1 py-3 px-6 bg-linear-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Start Quiz →
              </button>
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={showStartModal}
        message="Are you ready to start the quiz? Timer will begin immediately."
        onConfirm={onConfirmStart}
        onCancel={onCancelStart}
      />
    </div>
  );
};

export default QuizPreview;
