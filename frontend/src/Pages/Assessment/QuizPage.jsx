import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuiz } from "../context/QuizContext";
import API from "../services/assessmentService";

import QuestionCard from "../../component/Quiz/QuestionCard";
import QuizTimer from "../../component/Quiz/QuizTimer";
import ProgressBar from "../../component/Ui/ProgressBar";

const QuizPage = () => {
  const navigate = useNavigate();

  const {
    assessment,
    answers,
    setAnswers,
    currentQuestionIndex,
    setCurrentQuestionIndex,
    timer,
    setTimer,
  } = useQuiz();

  // 🛑 Redirect if assessment missing (refresh protection)
  useEffect(() => {
    if (!assessment) navigate("/assessment");
  }, [assessment]);

  // 🚫 Prevent page refresh
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () =>
      window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  if (!assessment) return null;

  const questions = assessment.questions;
  const currentQuestion = questions[currentQuestionIndex];

  // ✅ SELECT OPTION
  const handleSelectOption = (questionId, optionIndex) => {
    const updatedAnswers = [...answers];

    const existing = updatedAnswers.find(
      (a) => a.questionId === questionId
    );

    if (existing) {
      existing.selectedOptionIndex = optionIndex;
    } else {
      updatedAnswers.push({ questionId, selectedOptionIndex: optionIndex });
    }

    setAnswers(updatedAnswers);
  };

  const selectedAnswer = answers.find(
    (a) => a.questionId === currentQuestion._id
  );

  // ✅ SUBMIT QUIZ
  const handleSubmitQuiz = async () => {
    const confirmSubmit = window.confirm(
      "Are you sure you want to submit?"
    );

    if (!confirmSubmit) return;

    try {
      const res = await API.post("/assessment/submit", {
        assessmentId: assessment.assessmentId,
        answers,
      });

      navigate("/assessment/result", { state: res.data });

    } catch (error) {
      console.error(error);
      alert("Submission failed");
    }
  };

  const allAnswered = answers.length === questions.length;

  return (
    <div className="grid grid-cols-12 gap-6 p-6">

      {/* LEFT PANEL */}
      <div className="col-span-8 bg-white p-6 rounded-lg shadow">

        {/* 📊 Progress */}
        <ProgressBar
          total={questions.length}
          answered={answers.length}
        />

        <QuestionCard
          question={currentQuestion}
          index={currentQuestionIndex}
          selectedAnswer={selectedAnswer?.selectedOptionIndex}
          handleSelectOption={handleSelectOption}
        />

        {/* NAVIGATION BUTTONS */}
        <div className="flex justify-between mt-6">

          <button
            disabled={currentQuestionIndex === 0}
            onClick={() =>
              setCurrentQuestionIndex((prev) => prev - 1)
            }
            className="px-4 py-2 bg-gray-300 rounded"
          >
            Previous
          </button>

          <button
            disabled={currentQuestionIndex === questions.length - 1}
            onClick={() =>
              setCurrentQuestionIndex((prev) => prev + 1)
            }
            className="px-4 py-2 bg-indigo-600 text-white rounded"
          >
            Next
          </button>

        </div>

      </div>

      {/* RIGHT PANEL */}
      <div className="col-span-4 space-y-6">

        {/* ⏱ TIMER */}
        <QuizTimer
          timer={timer}
          setTimer={setTimer}
          onTimeUp={handleSubmitQuiz}
        />

        {/* QUESTION NAVIGATOR */}
        <div className="bg-white p-4 rounded-lg shadow">

          <h3 className="font-bold mb-3">Questions</h3>

          <div className="grid grid-cols-5 gap-3">

            {questions.map((q, index) => {
              const answered = answers.find(
                (a) => a.questionId === q._id
              );

              return (
                <button
                  key={index}
                  onClick={() => setCurrentQuestionIndex(index)}
                  className={`p-2 rounded text-sm font-bold
                  ${
                    index === currentQuestionIndex
                      ? "bg-indigo-600 text-white"
                      : answered
                      ? "bg-green-500 text-white"
                      : "bg-gray-200"
                  }`}
                >
                  {index + 1}
                </button>
              );
            })}

          </div>

        </div>

        {/* SUBMIT BUTTON */}
        <button
          disabled={!allAnswered}
          onClick={handleSubmitQuiz}
          className={`w-full py-3 rounded-lg font-bold text-white
          ${
            allAnswered
              ? "bg-green-600 hover:bg-green-700"
              : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          Submit Quiz
        </button>

      </div>

    </div>
  );
};

export default QuizPage;
