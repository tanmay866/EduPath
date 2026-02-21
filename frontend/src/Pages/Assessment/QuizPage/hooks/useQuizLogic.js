import { toast } from "react-toastify";
import { submitQuiz } from "../../../Services/assessmentService";

export const useQuizLogic = ({
  assessment,
  questions,
  answers,
  setAnswers,
  currentQuestion,
  currentQuestionIndex,
  markedForReview,
  setMarkedForReview,
  quizStarted,
  setQuizStarted,
  setShowStartModal,
  setShowSubmitModal,
  navigate,
}) => {
  const handleSelectOption = (questionIndex, optionIndex) => {
    if (!setAnswers) return;
    const updatedAnswers = [...(answers || [])];

    const existingIndex = updatedAnswers.findIndex((a) => a.questionIndex === questionIndex);

    if (existingIndex !== -1) {
      updatedAnswers[existingIndex] = { questionIndex, selectedOptionIndex: optionIndex };
    } else {
      updatedAnswers.push({ questionIndex, selectedOptionIndex: optionIndex });
    }

    setAnswers(updatedAnswers);
  };

  const selectedAnswer = answers && answers.find((a) => a.questionIndex === currentQuestionIndex);

  const handleMarkForReview = () => {
    if (!setMarkedForReview || currentQuestionIndex === undefined) return;
    if (markedForReview && markedForReview.includes(currentQuestionIndex)) {
      setMarkedForReview(markedForReview.filter((idx) => idx !== currentQuestionIndex));
    } else {
      setMarkedForReview([...(markedForReview || []), currentQuestionIndex]);
    }
  };

  const isMarked = currentQuestionIndex !== undefined && markedForReview && markedForReview.includes(currentQuestionIndex);

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

  const submitQuizToAPI = async () => {
    try {
      const sessionId = assessment.sessionId || localStorage.getItem('sessionId');
      const startTime = localStorage.getItem('startTime');
      const timeTaken = startTime ? Math.floor((Date.now() - parseInt(startTime)) / 1000) : 0;

      // Convert answers to array of option indices
      const answersArray = questions.map((question, index) => {
        const userAnswer = answers.find((a) => a.questionIndex === index);
        return userAnswer ? userAnswer.selectedOptionIndex : null;
      });

      const payload = {
        sessionId: sessionId,
        answers: answersArray,
        timeTaken: timeTaken
      };

      const response = await submitQuiz(payload);
      const resultData = response.data?.data;

      if (resultData && resultData.resultId) {
        // Clear localStorage
        localStorage.removeItem('sessionId');
        localStorage.removeItem('startTime');

        toast.success("Assessment submitted successfully!");
        
        // Navigate to result page
        navigate(`/assessment/result/${resultData.resultId}`);
      }
    } catch (error) {
      console.error('Failed to submit quiz:', error);
      toast.error(error.response?.data?.message || 'Failed to submit quiz');
      throw error;
    }
  };

  const handleConfirmSubmit = async () => {
    setShowSubmitModal(false);

    if (!quizStarted) {
      toast.error("Please start the quiz first");
      return;
    }

    await submitQuizToAPI();
  };

  const handleTimeUp = async () => {
    if (!quizStarted) return;

    toast.warning("Time's up! Submitting your assessment...");
    
    await submitQuizToAPI();
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
