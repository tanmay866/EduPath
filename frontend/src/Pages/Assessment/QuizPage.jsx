import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuiz } from "../context/QuizContext";
import API from "../Services/assessmentService";
import AssessmentSidebar from "../../component/Assessment/AssessmentSidebar";

import OptionItem from "../../component/Quiz/OptionItem";
import QuizTimer from "../../component/Quiz/QuizTimer";

const QuizPage = () => {
  const navigate = useNavigate();

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

  // 📦 STATIC QUIZ DATA (for testing without backend)
  const staticAssessment = {
    assessmentId: "static-quiz-001",
    title: "Frontend Development Assessment",
    skill: "React.js",
    duration: 30,
    totalQuestions: 10,
    questions: [
      {
        _id: "q1",
        question: "What is React?",
        options: [
          "A JavaScript library for building user interfaces",
          "A server-side framework",
          "A database management system",
          "A CSS preprocessor"
        ],
        correctAnswer: 0
      },
      {
        _id: "q2",
        question: "Which hook is used to manage state in functional components?",
        options: [
          "useEffect",
          "useState",
          "useContext",
          "useReducer"
        ],
        correctAnswer: 1
      },
      {
        _id: "q3",
        question: "What does JSX stand for?",
        options: [
          "JavaScript XML",
          "Java Syntax Extension",
          "JavaScript Extension",
          "Java XML"
        ],
        correctAnswer: 0
      },
      {
        _id: "q4",
        question: "Which method is used to create components in React?",
        options: [
          "React.createComponent()",
          "React.component()",
          "function or class",
          "React.makeComponent()"
        ],
        correctAnswer: 2
      },
      {
        _id: "q5",
        question: "What is the virtual DOM?",
        options: [
          "A copy of the real DOM kept in memory",
          "A new browser API",
          "A CSS framework",
          "A database structure"
        ],
        correctAnswer: 0
      },
      {
        _id: "q6",
        question: "Which hook is used for side effects in React?",
        options: [
          "useState",
          "useEffect",
          "useCallback",
          "useMemo"
        ],
        correctAnswer: 1
      },
      {
        _id: "q7",
        question: "What is prop drilling in React?",
        options: [
          "Passing data through multiple layers of components",
          "Creating new props",
          "Deleting props",
          "Updating props automatically"
        ],
        correctAnswer: 0
      },
      {
        _id: "q8",
        question: "Which of the following is true about React keys?",
        options: [
          "Keys should be unique among siblings",
          "Keys can be random numbers",
          "Keys are not important",
          "Keys should always be index"
        ],
        correctAnswer: 0
      },
      {
        _id: "q9",
        question: "What is the purpose of useContext hook?",
        options: [
          "To manage state",
          "To access React Context",
          "To create side effects",
          "To optimize performance"
        ],
        correctAnswer: 1
      },
      {
        _id: "q10",
        question: "Which lifecycle method is equivalent to useEffect with empty dependency array?",
        options: [
          "componentDidUpdate",
          "componentWillMount",
          "componentDidMount",
          "componentWillUnmount"
        ],
        correctAnswer: 2
      }
    ]
  };

  const assessment = contextAssessment || staticAssessment;

  // 🛑 Redirect if assessment missing (refresh protection)
//   useEffect(() => {
//     if (!assessment) navigate("/assessment");
//   }, [assessment]);
  // ⏱ Initialize timer from assessment duration
  useEffect(() => {
    if (assessment && timer === 0) {
      setTimer(assessment.duration * 60); // Convert minutes to seconds
    }
  }, [assessment]);
  // � Track visited questions
  useEffect(() => {
    if (assessment && assessment.questions && assessment.questions[currentQuestionIndex] && setVisitedQuestions) {
      const questionId = assessment.questions[currentQuestionIndex]._id;
      if (visitedQuestions && !visitedQuestions.includes(questionId)) {
        setVisitedQuestions([...visitedQuestions, questionId]);
      }
    }
  }, [currentQuestionIndex, assessment]);

  // �🚫 Prevent page refresh
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
    if (!setAnswers) return;
    const updatedAnswers = [...(answers || [])];

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

  const selectedAnswer = answers && answers.find(
    (a) => a.questionId === currentQuestion._id
  );

  // 🔖 MARK FOR REVIEW
  const handleMarkForReview = () => {
    if (!setMarkedForReview) return;
    const questionId = currentQuestion._id;
    if (markedForReview && markedForReview.includes(questionId)) {
      setMarkedForReview(markedForReview.filter(id => id !== questionId));
    } else {
      setMarkedForReview([...(markedForReview || []), questionId]);
    }
  };

  const isMarked = markedForReview && markedForReview.includes(currentQuestion._id);

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

  const allAnswered = answers && questions && answers.length === questions.length;

  const minutes = Math.floor(timer / 60);
  const seconds = timer % 60;

  return (
    <div className="flex min-h-screen bg-black relative">
      {/* Live Moving Background Animations */}
      <div className="animated-bg">
        {/* Moving Shapes */}
        <div className="moving-shape shape-1"></div>
        <div className="moving-shape shape-2"></div>
        <div className="moving-shape shape-3"></div>
        <div className="moving-shape shape-4"></div>
        <div className="moving-shape shape-5"></div>
        <div className="moving-shape shape-6"></div>
        <div className="moving-shape shape-7"></div>
        <div className="moving-shape shape-8"></div>
        
        {/* Rotating Center Gradient */}
        <div className="rotating-gradient"></div>
        
        {/* Floating Particles */}
        <div className="floating-particle" style={{top: '5%', left: '15%', animationDelay: '0s'}}></div>
        <div className="floating-particle" style={{top: '8%', left: '85%', animationDelay: '2s'}}></div>
        <div className="floating-particle" style={{top: '12%', left: '50%', animationDelay: '1.5s'}}></div>
        <div className="floating-particle" style={{top: '15%', left: '20%', animationDelay: '0s'}}></div>
        <div className="floating-particle" style={{top: '25%', left: '70%', animationDelay: '1s'}}></div>
        <div className="floating-particle" style={{top: '45%', left: '10%', animationDelay: '2s'}}></div>
        <div className="floating-particle" style={{top: '55%', left: '85%', animationDelay: '1.5s'}}></div>
        <div className="floating-particle" style={{top: '75%', left: '30%', animationDelay: '0.5s'}}></div>
        <div className="floating-particle" style={{top: '65%', left: '60%', animationDelay: '2.5s'}}></div>
        <div className="floating-particle" style={{top: '35%', left: '50%', animationDelay: '3s'}}></div>
        <div className="floating-particle" style={{top: '85%', left: '75%', animationDelay: '1.2s'}}></div>
      </div>

      <AssessmentSidebar />
      
      <div className="flex-1 flex flex-col relative z-10">
        
        {/* 📝 MAIN CONTENT AREA */}
        <div className="flex-1 p-4 overflow-auto">
          <div className="max-w-7xl mx-auto space-y-8">
            
            {/* 🎯 TOP HEADER BAR */}
            <div className="backdrop-blur-xl bg-slate-900/60 border border-white/10 px-4 py-3 rounded-lg sticky top-4 z-10">
              <div className="flex items-center justify-between">
                
                {/* Left: Assessment Info */}
                <div className="flex items-center gap-6">
                  <div>
                    <h1 className="text-lg font-bold text-white">{assessment.title}</h1>
                    <p className="text-xs text-gray-400">
                      Skill: <span className="text-indigo-400 font-semibold">{assessment.skill}</span>
                    </p>
                  </div>
                </div>

                {/* Center: Progress */}
                <div className="text-center">
                  <p className="text-xs text-gray-400">Question Progress</p>
                  <p className="text-base font-bold text-white">
                    {currentQuestionIndex + 1} of {questions.length}
                  </p>
                </div>

              </div>
            </div>

            <div className="grid grid-cols-10 gap-4">

            {/* LEFT PANEL - Question Section (70%) */}
            <div className="col-span-7 backdrop-blur-xl bg-slate-900/60 p-5 rounded-lg shadow-lg border border-white/10">

              {/* Question Number & Text */}
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

              {/* Options */}
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
                      onSelect={() => handleSelectOption(currentQuestion._id, index)}
                    />
                  ))}
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-white/10">

                <button
                  disabled={currentQuestionIndex === 0}
                  onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-gray-300 border border-white/20 rounded-lg hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-semibold text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous
                </button>

                <button
                  onClick={handleMarkForReview}
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
                  disabled={currentQuestionIndex === questions.length - 1}
                  onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 border-2 border-indigo-400/50 text-white rounded-lg hover:bg-indigo-500 hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-semibold text-sm"
                >
                  Next
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

              </div>

            </div>

            {/* RIGHT PANEL - Control Panel (30%) */}
            <div className="col-span-3 space-y-4">

              {/* ⏱ TIMER */}
              <QuizTimer
                timer={timer}
                setTimer={setTimer}
                onTimeUp={handleSubmitQuiz}
              />

              {/* QUESTION NAVIGATOR */}
              <div className="backdrop-blur-xl bg-slate-900/60 p-4 rounded-lg shadow-lg border border-white/10">

                <h3 className="font-bold mb-3 text-white text-xs uppercase tracking-wide">Question Navigator</h3>

                <div className="grid grid-cols-5 gap-2 mb-3">

                  {questions.map((q, index) => {
                    const answered = answers && answers.find((a) => a.questionId === q._id);
                    const visited = visitedQuestions && visitedQuestions.includes(q._id);
                    const marked = markedForReview && markedForReview.includes(q._id);

                    let bgColor = 'bg-slate-800 border border-white/20 text-gray-400'; // Not visited
                    if (marked) bgColor = 'bg-yellow-500 text-gray-900'; // Marked for review
                    else if (answered) bgColor = 'bg-green-600 border border-green-500/50 text-green-400'; // Answered
                    else if (visited) bgColor = 'bg-blue-600 border border-blue-500/50 text-blue-400'; // Visited

                    return (
                      <button
                        key={index}
                        onClick={() => setCurrentQuestionIndex(index)}
                        className={`p-1.5 rounded text-xs font-bold transition-all hover:scale-110 ${bgColor}
                        ${index === currentQuestionIndex ? 'ring-2 ring-white ring-offset-1 ring-offset-slate-900' : ''}`}
                      >
                        {index + 1}
                      </button>
                    );
                  })}

                </div>

                {/* Legend */}
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-slate-800 border border-white/20 rounded"></div>
                    <span className="text-gray-400">Not Visited</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-600 border border-blue-500/50 rounded"></div>
                    <span className="text-gray-300">Visited</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-600 border border-green-500/50 rounded"></div>
                    <span className="text-gray-300">Answered</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                    <span className="text-gray-300">Marked for Review</span>
                  </div>
                </div>

              </div>

              {/* SUBMIT BUTTON */}
              <button
                disabled={!allAnswered}
                onClick={handleSubmitQuiz}
                className={`w-full py-3 rounded-lg font-bold text-white text-base transition-all ${
                  allAnswered
                    ? "bg-green-600 border-2 border-green-400/50 hover:bg-green-500 hover:shadow-xl transform hover:scale-105"
                    : "bg-slate-800 border border-white/20 cursor-not-allowed opacity-50"
                }`}
              >
                {allAnswered ? '✓ Submit Assessment' : `Answer All Questions (${answers?.length || 0}/${questions?.length || 0})`}
              </button>

            </div>

          </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default QuizPage;
