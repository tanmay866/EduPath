import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuiz } from "../../context/QuizContext";
import { staticAssessment } from "./data/staticQuizData";
import { useQuizLogic } from "./hooks/useQuizLogic";
import QuizPreview from "./components/QuizPreview";
import QuizLayout from "./components/QuizLayout";

const QuizPage = () => {
  const navigate = useNavigate();
  const [quizStarted, setQuizStarted] = useState(false);
  const [showStartModal, setShowStartModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  const {
    assessment: contextAssessment,
    answers = [],
    setAnswers,
    currentQuestionIndex = 0,
    setCurrentQuestionIndex,
    timer = 0,
    setTimer,
    markedForReview = [],
    setMarkedForReview,
    visitedQuestions = [],
    setVisitedQuestions,
  } = useQuiz() || {};

  const assessment = contextAssessment || staticAssessment;
  const questions = assessment.questions;
  const currentQuestion = questions[currentQuestionIndex];

  const {
    handleSelectOption,
    selectedAnswer,
    handleMarkForReview,
    isMarked,
    handleStartQuizClick,
    handleConfirmStart,
    handleCancelStart,
    handleSubmitQuizClick,
    handleConfirmSubmit,
    handleTimeUp,
    handleCancelSubmit,
    allAnswered,
  } = useQuizLogic({
    assessment,
    questions,
    answers,
    setAnswers,
    currentQuestion,
    markedForReview,
    setMarkedForReview,
    quizStarted,
    setQuizStarted,
    setShowStartModal,
    setShowSubmitModal,
    navigate,
  });

  useEffect(() => {
    if (!assessment) navigate("/assessment");
  }, [assessment]);

  useEffect(() => {
    if (assessment && quizStarted && timer === 0) {
      setTimer(assessment.duration * 60);
    }
  }, [assessment, quizStarted]);

  useEffect(() => {
    if (assessment && assessment.questions && assessment.questions[currentQuestionIndex] && setVisitedQuestions) {
      const questionId = assessment.questions[currentQuestionIndex]._id;
      if (visitedQuestions && !visitedQuestions.includes(questionId)) {
        setVisitedQuestions([...visitedQuestions, questionId]);
      }
    }
  }, [currentQuestionIndex, assessment]);

  useEffect(() => {
    if (!quizStarted) return;

    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [quizStarted]);

  if (!assessment) return null;

  if (!quizStarted) {
    return (
      <QuizPreview
        assessment={assessment}
        onStartClick={handleStartQuizClick}
        onGoBack={() => navigate("/assessment")}
        showStartModal={showStartModal}
        onConfirmStart={handleConfirmStart}
        onCancelStart={handleCancelStart}
      />
    );
  }

  return (
    <QuizLayout
      assessment={assessment}
      currentQuestionIndex={currentQuestionIndex}
      currentQuestion={currentQuestion}
      questions={questions}
      isMarked={isMarked}
      selectedAnswer={selectedAnswer}
      timer={timer}
      setTimer={setTimer}
      answers={answers}
      visitedQuestions={visitedQuestions}
      markedForReview={markedForReview}
      allAnswered={allAnswered}
      showSubmitModal={showSubmitModal}
      onSelectOption={handleSelectOption}
      onMarkForReview={handleMarkForReview}
      onPrevious={() => setCurrentQuestionIndex((prev) => prev - 1)}
      onNext={() => setCurrentQuestionIndex((prev) => prev + 1)}
      onQuestionSelect={setCurrentQuestionIndex}
      onTimeUp={handleTimeUp}
      onSubmitClick={handleSubmitQuizClick}
      onConfirmSubmit={handleConfirmSubmit}
      onCancelSubmit={handleCancelSubmit}
      setCurrentQuestionIndex={setCurrentQuestionIndex}
    />
  );
};

export default QuizPage;

