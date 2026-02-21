import QuizTimer from "./QuizTimer";

const QuizNavigator = ({
  timer,
  setTimer,
  onTimeUp,
  questions,
  answers,
  visitedQuestions,
  markedForReview,
  currentQuestionIndex,
  onQuestionSelect,
}) => {
  return (
    <div className="col-span-3 space-y-4">
      <QuizTimer
        timer={timer}
        setTimer={setTimer}
        onTimeUp={onTimeUp}
      />

      <div className="bg-slate-800 p-4 rounded-lg shadow-lg border border-white/10">
        <h3 className="font-bold mb-3 text-white text-xs uppercase tracking-wide">Question Navigator</h3>

        <div className="grid grid-cols-5 gap-2 mb-3">
          {questions.map((q, index) => {
            const answered = answers && answers.find((a) => a.questionIndex === index);
            const visited = visitedQuestions && visitedQuestions.includes(index);
            const marked = markedForReview && markedForReview.includes(index);

            let bgColor = 'bg-slate-800 border border-white/20 text-gray-400';
            if (marked) bgColor = 'bg-yellow-500 text-gray-900';
            else if (answered) bgColor = 'bg-green-600 border border-green-500/50 text-white';
            else if (visited) bgColor = 'bg-blue-600 border border-blue-500/50 text-white';

            return (
              <button
                key={index}
                onClick={() => onQuestionSelect(index)}
                className={`p-1.5 rounded text-xs font-bold transition-all hover:scale-110 ${bgColor}
                ${index === currentQuestionIndex ? 'ring-2 ring-white ring-offset-1 ring-offset-slate-900' : ''}`}
              >
                {index + 1}
              </button>
            );
          })}
        </div>

        <div className="space-y-1.5 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-slate-800 border border-white/20 rounded"></div>
            <span className="text-gray-400">Not Visited</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-600 border border-blue-500/50 rounded"></div>
            <span className="text-gray-300">Visited</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-600 border border-green-500/50 rounded"></div>
            <span className="text-gray-300">Answered</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
            <span className="text-gray-300">Marked for Review</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizNavigator;
