import { createContext, useContext, useState } from "react";

const QuizContext = createContext();

export const QuizProvider = ({ children }) => {
  const [assessment, setAssessment] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timer, setTimer] = useState(0);

  const submitQuiz = () => {
    console.log("Submit quiz");
  };

  return (
    <QuizContext.Provider
      value={{
        assessment,
        setAssessment,
        answers,
        setAnswers,
        currentQuestionIndex,
        setCurrentQuestionIndex,
        timer,
        setTimer,
        submitQuiz,
      }}
    >
      {children}
    </QuizContext.Provider>
  );
};

export const useQuiz = () => useContext(QuizContext);
