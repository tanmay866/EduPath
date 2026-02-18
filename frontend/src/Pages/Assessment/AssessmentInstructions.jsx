import { useQuiz } from "../context/QuizContext";
import { useNavigate } from "react-router-dom";

const AssessmentInstructions = () => {
  const { assessment, setTimer } = useQuiz();
  const navigate = useNavigate();

  if (!assessment) {
    return <h2>No assessment found</h2>;
  }

  const handleStart = () => {
    // ⏱ convert minutes → seconds
    setTimer(assessment.duration * 60);

    navigate("/assessment/quiz");
  };

  return (
    <div className="max-w-3xl mx-auto p-6">

      <h1 className="text-3xl font-bold mb-4">
        {assessment.title}
      </h1>

      <div className="bg-white shadow-md rounded-lg p-6 space-y-3">

        <p><strong>Skill:</strong> {assessment.skill}</p>
        <p><strong>Duration:</strong> {assessment.duration} minutes</p>
        <p><strong>Total Questions:</strong> {assessment.totalQuestions}</p>

        <div className="mt-4">
          <h2 className="font-semibold mb-2">Rules:</h2>

          <ul className="list-disc ml-6 space-y-1 text-gray-600">
            <li>No tab switching</li>
            <li>Timer auto-submit</li>
            <li>One attempt only</li>
          </ul>
        </div>

        <button
          onClick={handleStart}
          className="mt-6 w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700"
        >
          Start Assessment
        </button>

      </div>
    </div>
  );
};

export default AssessmentInstructions;
