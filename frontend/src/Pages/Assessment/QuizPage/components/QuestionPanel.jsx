import OptionItem from "./OptionItem";

const QuestionPanel = ({
  currentQuestion,
  currentQuestionIndex,
  isMarked,
  selectedAnswer,
  onSelectOption,
  onMarkForReview,
  onPrevious,
  onNext,
  isFirstQuestion,
  isLastQuestion,
}) => {
  return (
    <div className="col-span-7 bg-slate-800 p-5 rounded-lg shadow-lg border border-white/10">
      <div className="mb-4">
        <div className="flex items-center gap-3 mb-3">
          <span className="bg-indigo-600 border border-indigo-400/50 text-white px-3 py-1.5 rounded-lg font-bold text-base">
            Q{currentQuestionIndex + 1}
          </span>
          {isMarked && (
            <span className="bg-yellow-500 text-gray-900 px-3 py-1 rounded-full text-xs font-bold">
              ⭐ MARKED FOR REVIEW
            </span>
          )}
        </div>
        <h2 className="text-xl text-white font-semibold leading-relaxed">
          {currentQuestion.question}
        </h2>
      </div>

      <div className="mb-4">
        <h3 className="text-gray-400 text-xs font-semibold mb-2 uppercase tracking-wide">
          Choose your answer:
        </h3>
        <div>
          {currentQuestion.options.map((option, index) => (
            <OptionItem
              key={index}
              option={option}
              isSelected={selectedAnswer?.selectedOptionIndex === index}
              onSelect={() => onSelectOption(currentQuestionIndex, index)}
            />
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-white/10">
        <button
          disabled={isFirstQuestion}
          onClick={onPrevious}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-gray-300 border border-white/20 rounded-lg hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-semibold text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Previous
        </button>

        <button
          onClick={onMarkForReview}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
            isMarked 
              ? 'bg-yellow-500 text-gray-900 hover:bg-yellow-400' 
              : 'bg-slate-800 text-gray-300 border border-white/20 hover:bg-slate-700'
          }`}
        >
          <svg className="w-4 h-4" fill={isMarked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
          {isMarked ? 'Unmark' : 'Mark for Review'}
        </button>

        <button
          disabled={isLastQuestion}
          onClick={onNext}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 border-2 border-indigo-400/50 text-white rounded-lg hover:bg-indigo-500 hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-semibold text-sm"
        >
          Next
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default QuestionPanel;
