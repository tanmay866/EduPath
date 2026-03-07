import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuiz } from "../../context/QuizContext";
import { fetchQuizTopics, startQuiz } from "../../Services/assessmentService";
import { useQuizLogic } from "./hooks/useQuizLogic";
import QuizLayout from "./components/QuizLayout";

const QuizPage = () => {
  const navigate = useNavigate();
  
  // Quiz stages: 'configure', 'instructions', 'quiz'
  const [stage, setStage] = useState('configure');
  
  const [quizStarted, setQuizStarted] = useState(false);
  const [showStartModal, setShowStartModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Topics for dropdown
  const [topics, setTopics] = useState([]);
  const [loadingTopics, setLoadingTopics] = useState(true);

  // Quiz configuration
  const [quizConfig, setQuizConfig] = useState({
    topicId: '',
    topicName: '',
    topicIcon: '',
    difficulty: 'beginner',
    experienceLevel: 'beginner',
    questionCount: 10
  });

  // Terms agreement
  const [agreedToTerms, setAgreedToTerms] = useState(false);

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
    setAssessment,
  } = useQuiz() || {};

  // Load topics on mount
  useEffect(() => {
    loadTopics();
  }, []);

  const loadTopics = async () => {
    try {
      setLoadingTopics(true);
      const response = await fetchQuizTopics();
      setTopics(response.data?.data || []);
    } catch (err) {
      console.error('Failed to load topics:', err);
      setError('Failed to load topics');
    } finally {
      setLoadingTopics(false);
    }
  };

  const handleTopicChange = (e) => {
    const selectedTopic = topics.find(t => t._id === e.target.value);
    if (selectedTopic) {
      setQuizConfig({
        ...quizConfig,
        topicId: selectedTopic._id,
        topicName: selectedTopic.name,
        topicIcon: selectedTopic.icon
      });
    }
  };

  const handleConfigureNext = () => {
    if (!quizConfig.topicId) {
      alert('Please select a topic');
      return;
    }
    setStage('instructions');
  };

  const handleStartQuizFromInstructions = async () => {
    if (!agreedToTerms) {
      alert('Please accept the terms and conditions');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const payload = {
        topicId: quizConfig.topicId,
        difficulty: quizConfig.difficulty,
        experienceLevel: quizConfig.experienceLevel,
        questionCount: quizConfig.questionCount
      };

      const response = await startQuiz(payload);
      const sessionData = response.data?.data;

      if (sessionData && sessionData.sessionId) {
        localStorage.setItem('sessionId', sessionData.sessionId);
        localStorage.setItem('startTime', Date.now());

        setAssessment({
          topicId: quizConfig.topicId,
          topicName: quizConfig.topicName,
          topicIcon: quizConfig.topicIcon,
          sessionId: sessionData.sessionId,
          questions: sessionData.questions,
          totalQuestions: sessionData.totalQuestions,
          difficulty: sessionData.difficulty,
          startedAt: sessionData.startedAt
        });

        setTimer(quizConfig.questionCount * 60);
        setStage('quiz');
        setQuizStarted(true);
      }
    } catch (err) {
      console.error('Failed to start quiz:', err);
      setError(err.response?.data?.message || 'Failed to start quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const assessment = contextAssessment;
  const questions = assessment?.questions || [];
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
    currentQuestionIndex,
    markedForReview,
    setMarkedForReview,
    quizStarted,
    setQuizStarted,
    setShowStartModal,
    setShowSubmitModal,
    navigate,
  });

  useEffect(() => {
    if (stage === 'quiz' && assessment && assessment.questions && assessment.questions[currentQuestionIndex] && setVisitedQuestions) {
      if (visitedQuestions && !visitedQuestions.includes(currentQuestionIndex)) {
        setVisitedQuestions([...visitedQuestions, currentQuestionIndex]);
      }
    }
  }, [currentQuestionIndex, assessment, stage]);

  useEffect(() => {
    if (!quizStarted || stage !== 'quiz') return;

    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [quizStarted, stage]);

  // Stage 1: Configuration Form
  if (stage === 'configure') {
    return (
      <div className="min-h-screen bg-black relative flex items-center justify-center py-4 px-4">
        <div className="max-w-2xl w-full mx-auto relative z-10">
          <div className="backdrop-blur-xl bg-slate-900/60 rounded-2xl shadow-2xl border border-white/10 p-6">
            <div className="text-center mb-5">
              <h1 className="text-3xl font-bold text-white mb-1">Configure Your Quiz</h1>
              <p className="text-slate-300 text-sm">Customize your assessment experience</p>
            </div>

            {loadingTopics ? (
              <div className="text-center py-12">
                <svg className="animate-spin h-12 w-12 mx-auto text-indigo-500" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-slate-300 mt-4">Loading topics...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Topic Selection */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Select Topic *
                  </label>
                  <select
                    value={quizConfig.topicId}
                    onChange={handleTopicChange}
                    className="w-full px-4 py-3 bg-[#1a1f2e] border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="" className="bg-[#1a1f2e] text-white">Choose a topic...</option>
                    {topics.map((topic) => (
                      <option key={topic._id} value={topic._id} className="bg-[#1a1f2e] text-white">
                        {topic.icon} {topic.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Difficulty Level */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Difficulty Level
                  </label>
                  <select
                    value={quizConfig.difficulty}
                    onChange={(e) => setQuizConfig({ ...quizConfig, difficulty: e.target.value })}
                    className="w-full px-4 py-3 bg-[#1a1f2e] border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="beginner" className="bg-[#1a1f2e] text-white">Beginner</option>
                    <option value="intermediate" className="bg-[#1a1f2e] text-white">Intermediate</option>
                    <option value="advanced" className="bg-[#1a1f2e] text-white">Advanced</option>
                  </select>
                </div>

                {/* Experience Level */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Experience Level
                  </label>
                  <select
                    value={quizConfig.experienceLevel}
                    onChange={(e) => setQuizConfig({ ...quizConfig, experienceLevel: e.target.value })}
                    className="w-full px-4 py-3 bg-[#1a1f2e] border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="beginner" className="bg-[#1a1f2e] text-white">Beginner (0-1 years)</option>
                    <option value="intermediate" className="bg-[#1a1f2e] text-white">Intermediate (1-3 years)</option>
                    <option value="advanced" className="bg-[#1a1f2e] text-white">Advanced (3-5 years)</option>
                    <option value="expert" className="bg-[#1a1f2e] text-white">Expert (5+ years)</option>
                  </select>
                </div>

                {/* Number of Questions */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Number of Questions
                  </label>
                  <select
                    value={quizConfig.questionCount}
                    onChange={(e) => setQuizConfig({ ...quizConfig, questionCount: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 bg-[#1a1f2e] border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="5" className="bg-[#1a1f2e] text-white">5 Questions</option>
                    <option value="10" className="bg-[#1a1f2e] text-white">10 Questions</option>
                    <option value="15" className="bg-[#1a1f2e] text-white">15 Questions</option>
                    <option value="20" className="bg-[#1a1f2e] text-white">20 Questions</option>
                  </select>
                </div>

                {/* Buttons */}
                <div className="flex gap-4 pt-2">
                  <button
                    onClick={() => navigate('/assessment')}
                  className="flex-1 px-6 py-3 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfigureNext}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all transform hover:scale-[1.02] shadow-lg"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Stage 2: Instructions & Quiz Details
  if (stage === 'instructions') {
    return (
      <div className="min-h-screen bg-black relative flex items-center justify-center py-4 px-4">
        <div className="max-w-4xl w-full mx-auto relative z-10">
          <div className="backdrop-blur-xl bg-slate-900/60 rounded-2xl shadow-2xl border border-white/10 p-5">
            {/* Header */}
            <div className="text-center mb-4">
              <div className="text-4xl mb-1">{quizConfig.topicIcon}</div>
              <h1 className="text-2xl font-bold text-white mb-0.5">{quizConfig.topicName}</h1>
              <p className="text-slate-300 text-sm">Assessment Details</p>
            </div>

            {/* Quiz Details */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
              <div className="bg-white/5 rounded-lg p-3 text-center">
                <div className="text-xl mb-1">📝</div>
                <div className="text-slate-400 text-xs">Questions</div>
                <div className="text-white font-bold text-lg">{quizConfig.questionCount}</div>
              </div>
              <div className="bg-white/5 rounded-lg p-3 text-center">
                <div className="text-xl mb-1">⏱️</div>
                <div className="text-slate-400 text-xs">Duration</div>
                <div className="text-white font-bold text-lg">{quizConfig.questionCount * 1} min</div>
              </div>
              <div className="bg-white/5 rounded-lg p-3 text-center">
                <div className="text-xl mb-1">📊</div>
                <div className="text-slate-400 text-xs">Difficulty</div>
                <div className="text-white font-bold text-lg capitalize">{quizConfig.difficulty}</div>
              </div>
              <div className="bg-white/5 rounded-lg p-3 text-center">
                <div className="text-xl mb-1">👤</div>
                <div className="text-slate-400 text-xs">Experience</div>
                <div className="text-white font-bold text-lg capitalize">{quizConfig.experienceLevel}</div>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-4 mb-3">
              <h2 className="text-base font-semibold text-white mb-2">Instructions</h2>
              <ul className="space-y-1.5 text-slate-300 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Read each question carefully before answering</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  <span>You can mark questions for review and come back later</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Once submitted, you cannot change your answers</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  <span>The timer will start when you click "Start Quiz"</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-500">⚠</span>
                  <span>Do not refresh the page or the quiz will be lost</span>
                </li>
              </ul>
            </div>

            {/* Terms Agreement */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-3 mb-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-indigo-600 bg-slate-700 border-slate-600 rounded focus:ring-indigo-500 focus:ring-2"
                />
                <span className="text-slate-300 text-sm">
                  I agree to the terms and conditions. I understand that this quiz is timed and must be completed in one session.
                </span>
              </label>
            </div>

            {/* Action Buttons */}
            {error && (
              <div className="mb-4 p-4 bg-red-500/10 border border-red-500 rounded-lg text-red-500">
                {error}
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={() => setStage('configure')}
                  className="flex-1 px-6 py-3 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 transition-colors"
                    disabled={loading}
              >
                Back
              </button>
              <button
                onClick={handleStartQuizFromInstructions}
                disabled={!agreedToTerms || loading}
                className={`flex-1 px-6 py-3 text-white rounded-lg font-semibold text-base transition-all transform shadow-lg ${
                  !agreedToTerms || loading
                    ? 'bg-slate-600 cursor-not-allowed'
                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 hover:scale-[1.02]'
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Starting Quiz...
                  </span>
                ) : (
                  '🚀 Start Quiz'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Stage 3: Quiz Active
  if (stage === 'quiz' && quizStarted) {
    if (!assessment || !questions.length) {
      return (
        <div className="flex min-h-screen bg-black items-center justify-center">
          <div className="text-center">
            <div className="text-red-500 text-xl mb-4">Quiz not found</div>
            <button
              onClick={() => navigate("/assessment")}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Back to Assessments
            </button>
          </div>
        </div>
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
  }

  // Fallback
  return (
    <div className="flex min-h-screen bg-black items-center justify-center">
      <div className="text-white text-xl">Loading...</div>
    </div>
  );
};

export default QuizPage;

