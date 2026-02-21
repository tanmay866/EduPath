const AssessmentCard = ({ assessment, onStart }) => {
  return (
    <div className="backdrop-blur-lg bg-linear-to-br from-indigo-500/40 to-purple-600/40 rounded-xl shadow-2xl p-6 text-white border border-indigo-400/30 hover:border-indigo-300/50 transition-all hover:scale-105 flex flex-col">
      <h3 className="text-2xl font-bold mb-3">
        {assessment.title}
      </h3>
      <p className="text-indigo-100 mb-4 text-sm">
        Evaluate your knowledge and earn certification
      </p>

      <div className="space-y-2 mb-6 grow">
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
        onClick={() => onStart(assessment)}
        className="w-full backdrop-blur-lg bg-white/20 text-white px-6 py-3 rounded-xl font-bold hover:bg-white/30 transition-all shadow-xl hover:shadow-2xl border border-white/30 hover:border-white/50"
      >
        Start Assessment →
      </button>
    </div>
  );
};

export default AssessmentCard;
