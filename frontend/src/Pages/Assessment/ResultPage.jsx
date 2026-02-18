import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";

const ResultPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  // 🛑 Redirect if no result data (refresh protection)
  useEffect(() => {
    if (!state) navigate("/assessment");
  }, []);

  if (!state) return null;

  const {
    score,
    totalQuestions,
    percentage,
    passed,
    correctAnswers,
    wrongAnswers,
  } = state;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">

      <div className="bg-white shadow-xl rounded-2xl p-10 w-full max-w-2xl text-center">

        <h1 className="text-3xl font-bold mb-6">
          Assessment Result
        </h1>

        {/* 🎯 SCORE */}
        <div className="text-6xl font-bold text-indigo-600 mb-4">
          {score}/{totalQuestions}
        </div>

        {/* 📊 PERCENTAGE */}
        <p className="text-xl font-semibold mb-4">
          {percentage}%
        </p>

        {/* ✅ PASS / ❌ FAIL */}
        <div
          className={`inline-block px-6 py-2 rounded-full text-white font-bold mb-6
          ${passed ? "bg-green-500" : "bg-red-500"}`}
        >
          {passed ? "PASS 🎉" : "FAIL"}
        </div>

        {/* 📈 SUMMARY */}
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

        {/* 🔁 ACTION BUTTONS */}
        <div className="flex justify-center gap-4">

          <button
            onClick={() => navigate("/assessment")}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700"
          >
            Go to Dashboard
          </button>

          {/* OPTIONAL RETAKE */}
          <button
            onClick={() => navigate("/assessment/instructions")}
            className="px-6 py-3 bg-gray-300 rounded-lg font-bold hover:bg-gray-400"
          >
            Retake
          </button>

        </div>

      </div>

    </div>
  );
};

export default ResultPage;
