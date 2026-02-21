import { toast } from "react-toastify";

export const useQuizLogic = ({
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
}) => {
  const handleSelectOption = (questionId, optionIndex) => {
    if (!setAnswers) return;
    const updatedAnswers = [...(answers || [])];

    const existing = updatedAnswers.find((a) => a.questionId === questionId);

    if (existing) {
      existing.selectedOptionIndex = optionIndex;
    } else {
      updatedAnswers.push({ questionId, selectedOptionIndex: optionIndex });
    }

    setAnswers(updatedAnswers);
  };

  const selectedAnswer = answers && answers.find((a) => a.questionId === currentQuestion._id);

  const handleMarkForReview = () => {
    if (!setMarkedForReview) return;
    const questionId = currentQuestion._id;
    if (markedForReview && markedForReview.includes(questionId)) {
      setMarkedForReview(markedForReview.filter((id) => id !== questionId));
    } else {
      setMarkedForReview([...(markedForReview || []), questionId]);
    }
  };

  const isMarked = markedForReview && markedForReview.includes(currentQuestion._id);

  const handleStartQuizClick = () => {
    setShowStartModal(true);
  };

  const handleConfirmStart = () => {
    setShowStartModal(false);
    setQuizStarted(true);
    toast.success("Quiz started! Good luck!");
  };

  const handleCancelStart = () => {
    setShowStartModal(false);
    toast.info("Quiz start cancelled");
  };

  const handleSubmitQuizClick = () => {
    setShowSubmitModal(true);
  };

  const handleConfirmSubmit = () => {
    setShowSubmitModal(false);

    if (!quizStarted) {
      toast.error("Please start the quiz first");
      return;
    }

    let correctCount = 0;
    let wrongCount = 0;

    questions.forEach((question) => {
      const userAnswer = answers.find((a) => a.questionId === question._id);
      if (userAnswer && userAnswer.selectedOptionIndex === question.correctAnswer) {
        correctCount++;
      } else if (userAnswer) {
        wrongCount++;
      }
    });

    const totalQuestions = questions.length;
    const percentage = Math.round((correctCount / totalQuestions) * 100);
    const passed = percentage >= 70;

    toast.success("Assessment submitted successfully!");

    navigate("/assessment/result", {
      state: {
        score: correctCount,
        totalQuestions: totalQuestions,
        percentage: percentage,
        passed: passed,
        correctAnswers: correctCount,
        wrongAnswers: wrongCount,
        unanswered: totalQuestions - answers.length,
      },
    });
  };

  const handleTimeUp = () => {
    if (!quizStarted) return;

    toast.warning("Time's up! Submitting your assessment...");

    let correctCount = 0;
    let wrongCount = 0;

    questions.forEach((question) => {
      const userAnswer = answers.find((a) => a.questionId === question._id);
      if (userAnswer && userAnswer.selectedOptionIndex === question.correctAnswer) {
        correctCount++;
      } else if (userAnswer) {
        wrongCount++;
      }
    });

    const totalQuestions = questions.length;
    const percentage = Math.round((correctCount / totalQuestions) * 100);
    const passed = percentage >= 70;

    toast.success("Assessment submitted successfully!");

    navigate("/assessment/result", {
      state: {
        score: correctCount,
        totalQuestions: totalQuestions,
        percentage: percentage,
        passed: passed,
        correctAnswers: correctCount,
        wrongAnswers: wrongCount,
        unanswered: totalQuestions - answers.length,
      },
    });
  };

  const handleCancelSubmit = () => {
    setShowSubmitModal(false);
    toast.info("Submission cancelled");
  };

  const allAnswered = answers && questions && answers.length === questions.length;

  return {
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
  };
};
