const SubmitSection = ({ allAnswered, answeredCount, totalQuestions, onSubmit }) => {
  return (
    <button
      disabled={!allAnswered}
      onClick={onSubmit}
      className={`w-full py-3 rounded-lg font-bold text-white text-base transition-all ${
        allAnswered
          ? "bg-green-600 border-2 border-green-400/50 hover:bg-green-500 hover:shadow-xl transform hover:scale-105"
          : "bg-slate-800 border border-white/20 cursor-not-allowed opacity-50"
      }`}
    >
      {allAnswered ? '✓ Submit Assessment' : `Answer All Questions (${answeredCount}/${totalQuestions})`}
    </button>
  );
};

export default SubmitSection;
