const QuizHeader = ({ assessment, currentQuestionIndex, totalQuestions }) => {
  return (
    <div className="bg-slate-800 border border-white/10 px-4 py-3 rounded-lg sticky top-4 z-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div>
            <h1 className="text-lg font-bold text-white">{assessment.title}</h1>
            <p className="text-xs text-gray-400">
              Skill: <span className="text-indigo-400 font-semibold">{assessment.skill}</span>
            </p>
          </div>
        </div>

        <div className="text-center">
          <p className="text-xs text-gray-400">Question Progress</p>
          <p className="text-base font-bold text-white">
            {currentQuestionIndex + 1} of {totalQuestions}
          </p>
        </div>
      </div>
    </div>
  );
};

export default QuizHeader;
