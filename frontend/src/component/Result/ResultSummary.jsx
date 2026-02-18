const ResultSummary = ({
  score,
  totalQuestions,
  percentage,
  correctAnswers,
  wrongAnswers,
  passed,
}) => {
  return (
    <>
      <div className="text-6xl font-bold text-indigo-600 mb-4">
        {score}/{totalQuestions}
      </div>

      <p className="text-xl font-semibold mb-4">{percentage}%</p>

      <div
        className={`inline-block px-6 py-2 rounded-full text-white font-bold mb-6
        ${passed ? "bg-green-500" : "bg-red-500"}`}
      >
        {passed ? "PASS 🎉" : "FAIL"}
      </div>

      <div className="grid grid-cols-2 gap-4 text-lg mb-8">
        <div className="bg-green-100 p-4 rounded-lg">
          ✅ Correct
          <div className="font-bold">{correctAnswers}</div>
        </div>

        <div className="bg-red-100 p-4 rounded-lg">
          ❌ Wrong
          <div className="font-bold">{wrongAnswers}</div>
        </div>
      </div>
    </>
  );
};

export default ResultSummary;
