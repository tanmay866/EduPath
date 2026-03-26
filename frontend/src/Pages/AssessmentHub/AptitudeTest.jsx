import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PuzzleIcon, CheckCircle, Clock, Award, XCircle, RotateCcw } from 'lucide-react';

const AptitudeTest = () => {
  const navigate = useNavigate();

  // Quiz stages: 'configure', 'instructions', 'quiz', 'result'
  const [stage, setStage] = useState('configure');

  // Quiz configuration
  const [quizConfig, setQuizConfig] = useState({
    difficulty: 'beginner',
    questionCount: 5
  });

  // Terms agreement
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Quiz state
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Timer state
  const [timer, setTimer] = useState(0);
  const [startTime, setStartTime] = useState(null);

  // Result state
  const [result, setResult] = useState(null);

  // Authentication check
  useEffect(() => {
    const token = sessionStorage.getItem('token');
    if (!token) {
      navigate('/signin');
    }
  }, [navigate]);

  // Timer effect
  useEffect(() => {
    if (stage !== 'quiz' || timer <= 0) return;

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [stage, timer]);

  // Fetch questions from API
  const fetchQuestions = async (count) => {
    setLoading(true);
    setError(null);

    try {
      const fetchedQuestions = [];

      for (let i = 0; i < count; i++) {
        const response = await fetch('https://aptitude-gold.vercel.app/Random');
        if (!response.ok) {
          throw new Error('Failed to fetch question');
        }
        const data = await response.json();
        fetchedQuestions.push({
          id: i,
          question: data.question,
          options: data.options,
          answer: data.answer
        });
      }

      setQuestions(fetchedQuestions);
      setAnswers(new Array(count).fill(null));
      return true;
    } catch (err) {
      console.error('Error fetching questions:', err);
      setError('Failed to load questions. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Handle starting the quiz
  const handleStartQuiz = async () => {
    if (!agreedToTerms) {
      alert('Please accept the terms and conditions');
      return;
    }

    setLoading(true);
    const success = await fetchQuestions(quizConfig.questionCount);

    if (success) {
      setTimer(quizConfig.questionCount * 60); // 1 minute per question
      setStartTime(Date.now());
      setStage('quiz');
    }
    setLoading(false);
  };

  // Handle answer selection
  const handleSelectOption = (optionIndex) => {
    setSelectedAnswer(optionIndex);
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = optionIndex;
    setAnswers(newAnswers);
  };

  // Handle next question
  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(answers[currentQuestionIndex + 1]);
    }
  };

  // Handle previous question
  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setSelectedAnswer(answers[currentQuestionIndex - 1]);
    }
  };

  // Handle time up
  const handleTimeUp = () => {
    calculateResult();
  };

  // Handle submit
  const handleSubmit = () => {
    calculateResult();
  };

  // Calculate result
  const calculateResult = () => {
    let correct = 0;
    let wrong = 0;
    let unanswered = 0;

    questions.forEach((question, index) => {
      const userAnswer = answers[index];
      if (userAnswer === null) {
        unanswered++;
      } else {
        const selectedOption = question.options[userAnswer];
        if (selectedOption === question.answer) {
          correct++;
        } else {
          wrong++;
        }
      }
    });

    const total = questions.length;
    const percentage = Math.round((correct / total) * 100);
    const timeTaken = startTime ? Math.round((Date.now() - startTime) / 1000) : 0;

    setResult({
      total,
      correct,
      wrong,
      unanswered,
      percentage,
      timeTaken
    });
    setStage('result');
  };

  // Handle restart
  const handleRestart = () => {
    setStage('configure');
    setQuestions([]);
    setAnswers([]);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setResult(null);
    setAgreedToTerms(false);
    setTimer(0);
    setStartTime(null);
  };

  // Format timer
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Configure Stage
  if (stage === 'configure') {
    return (
      <div className="min-h-screen bg-black relative flex items-center justify-center pt-28 pb-8 px-4">
        <div className="max-w-2xl w-full mx-auto relative z-10">
          <div className="backdrop-blur-xl bg-slate-900/60 rounded-2xl shadow-2xl border border-white/10 p-6">
            <div className="text-center mb-5">
              <div className="w-16 h-16 bg-cyan-500/20 text-cyan-400 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-cyan-500/40">
                <PuzzleIcon size={32} strokeWidth={2} />
              </div>
              <h1 className="text-3xl font-bold text-white mb-1">Configure Your Quiz</h1>
              <p className="text-slate-300 text-sm">Customize your aptitude test experience</p>
            </div>

            <div className="space-y-4">
              {/* Difficulty Level */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Difficulty Level
                </label>
                <select
                  value={quizConfig.difficulty}
                  onChange={(e) => setQuizConfig({ ...quizConfig, difficulty: e.target.value })}
                  className="w-full px-4 py-3 bg-[#1a1f2e] border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="beginner" className="bg-[#1a1f2e] text-white">Beginner</option>
                  <option value="intermediate" className="bg-[#1a1f2e] text-white">Intermediate</option>
                  <option value="advanced" className="bg-[#1a1f2e] text-white">Advanced</option>
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
                  className="w-full px-4 py-3 bg-[#1a1f2e] border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="5" className="bg-[#1a1f2e] text-white">5 Questions</option>
                  <option value="10" className="bg-[#1a1f2e] text-white">10 Questions</option>
                  <option value="15" className="bg-[#1a1f2e] text-white">15 Questions</option>
                </select>
              </div>

              {/* Buttons */}
              <div className="flex gap-4 pt-2">
                <button
                  onClick={() => navigate('/assessment-hub')}
                  className="flex-1 px-6 py-3 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setStage('instructions')}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg hover:from-cyan-700 hover:to-blue-700 transition-all transform hover:scale-[1.02] shadow-lg"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Instructions Stage
  if (stage === 'instructions') {
    return (
      <div className="min-h-screen bg-black relative flex items-center justify-center pt-28 pb-8 px-4">
        <div className="max-w-4xl w-full mx-auto relative z-10">
          <div className="backdrop-blur-xl bg-slate-900/60 rounded-2xl shadow-2xl border border-white/10 p-5">
            {/* Header */}
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-cyan-500/20 text-cyan-400 rounded-2xl flex items-center justify-center mx-auto mb-2 border border-cyan-500/40">
                <PuzzleIcon size={32} strokeWidth={2} />
              </div>
              <h1 className="text-2xl font-bold text-white mb-0.5">Aptitude Test</h1>
              <p className="text-slate-300 text-sm">Assessment Details</p>
            </div>

            {/* Quiz Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              <div className="bg-white/5 rounded-lg p-3 text-center">
                <div className="text-xl mb-1">📝</div>
                <div className="text-slate-400 text-xs">Questions</div>
                <div className="text-white font-bold text-lg">{quizConfig.questionCount}</div>
              </div>
              <div className="bg-white/5 rounded-lg p-3 text-center">
                <div className="text-xl mb-1">⏱️</div>
                <div className="text-slate-400 text-xs">Duration</div>
                <div className="text-white font-bold text-lg">{quizConfig.questionCount} min</div>
              </div>
              <div className="bg-white/5 rounded-lg p-3 text-center">
                <div className="text-xl mb-1">📊</div>
                <div className="text-slate-400 text-xs">Difficulty</div>
                <div className="text-white font-bold text-lg capitalize">{quizConfig.difficulty}</div>
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
                  <span>You can navigate between questions freely</span>
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
                  className="mt-0.5 w-4 h-4 text-cyan-600 bg-slate-700 border-slate-600 rounded focus:ring-cyan-500 focus:ring-2"
                />
                <span className="text-slate-300 text-sm">
                  I agree to the terms and conditions. I understand that this quiz is timed and must be completed in one session.
                </span>
              </label>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-4 bg-red-500/10 border border-red-500 rounded-lg text-red-500">
                {error}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={() => setStage('configure')}
                className="flex-1 px-6 py-3 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 transition-colors"
                disabled={loading}
              >
                Back
              </button>
              <button
                onClick={handleStartQuiz}
                disabled={!agreedToTerms || loading}
                className={`flex-1 px-6 py-3 text-white rounded-lg font-semibold text-base transition-all transform shadow-lg ${
                  !agreedToTerms || loading
                    ? 'bg-slate-600 cursor-not-allowed'
                    : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 hover:scale-[1.02]'
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading Questions...
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

  // Quiz Stage
  if (stage === 'quiz') {
    const currentQuestion = questions[currentQuestionIndex];
    const isLowTime = timer < 60; // Less than 1 minute

    return (
      <div className="fixed inset-0 bg-black z-50 overflow-auto pt-4 pb-8 px-4">
        <div className="max-w-6xl w-full mx-auto relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-cyan-500/20 text-cyan-400 rounded-xl flex items-center justify-center border border-cyan-500/40">
                <PuzzleIcon size={20} strokeWidth={2} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Aptitude Test</h1>
                <p className="text-slate-400 text-sm">Question {currentQuestionIndex + 1} of {questions.length}</p>
              </div>
            </div>

            {/* Timer */}
            <div className={`px-4 py-2 rounded-lg border ${isLowTime ? 'bg-red-900/50 border-red-500/50 animate-pulse' : 'bg-slate-800/50 border-white/10'}`}>
              <div className="flex items-center gap-2">
                <Clock size={18} className={isLowTime ? 'text-red-400' : 'text-cyan-400'} />
                <span className={`font-mono text-lg font-bold ${isLowTime ? 'text-red-400' : 'text-white'}`}>
                  {formatTime(timer)}
                </span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 bg-slate-800 rounded-full mb-6">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-10 gap-4">
            {/* Question Panel */}
            <div className="lg:col-span-7">
              <div className="backdrop-blur-xl bg-slate-900/60 rounded-2xl shadow-2xl border border-white/10 p-6">
                {/* Question */}
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-white leading-relaxed">
                    {currentQuestion?.question}
                  </h2>
                </div>

                {/* Options */}
                <div className="space-y-3">
                  {currentQuestion?.options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleSelectOption(index)}
                      className={`w-full p-4 rounded-xl border text-left transition-all duration-200 ${
                        selectedAnswer === index
                          ? 'bg-cyan-600/30 border-cyan-500 text-white'
                          : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                          selectedAnswer === index
                            ? 'bg-cyan-500 text-white'
                            : 'bg-slate-700 text-slate-300'
                        }`}>
                          {String.fromCharCode(65 + index)}
                        </div>
                        <span className="flex-1">{option}</span>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Navigation Buttons */}
                <div className="flex gap-4 mt-6">
                  <button
                    onClick={handlePrevious}
                    disabled={currentQuestionIndex === 0}
                    className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${
                      currentQuestionIndex === 0
                        ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                        : 'bg-white/10 border border-white/20 text-white hover:bg-white/20'
                    }`}
                  >
                    Previous
                  </button>
                  {currentQuestionIndex === questions.length - 1 ? (
                    <button
                      onClick={handleSubmit}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all transform hover:scale-[1.02] shadow-lg"
                    >
                      Submit Quiz
                    </button>
                  ) : (
                    <button
                      onClick={handleNext}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg font-semibold hover:from-cyan-700 hover:to-blue-700 transition-all transform hover:scale-[1.02] shadow-lg"
                    >
                      Next
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Navigator Panel */}
            <div className="lg:col-span-3">
              <div className="backdrop-blur-xl bg-slate-900/60 rounded-2xl shadow-2xl border border-white/10 p-4">
                <h3 className="text-sm font-semibold text-slate-300 mb-3">Question Navigator</h3>
                <div className="grid grid-cols-5 gap-2">
                  {questions.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setCurrentQuestionIndex(index);
                        setSelectedAnswer(answers[index]);
                      }}
                      className={`w-10 h-10 rounded-lg text-sm font-bold transition-all ${
                        currentQuestionIndex === index
                          ? 'bg-cyan-500 text-white ring-2 ring-cyan-400 ring-offset-2 ring-offset-slate-900'
                          : answers[index] !== null
                            ? 'bg-green-600 text-white'
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>

                {/* Legend */}
                <div className="mt-4 space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-cyan-500" />
                    <span className="text-slate-400">Current</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-green-600" />
                    <span className="text-slate-400">Answered</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-slate-700" />
                    <span className="text-slate-400">Not Answered</span>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  onClick={handleSubmit}
                  className="w-full mt-4 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg"
                >
                  Submit Quiz
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Result Stage
  if (stage === 'result' && result) {
    const getGrade = () => {
      if (result.percentage >= 90) return { grade: 'A+', color: 'text-green-400', bg: 'bg-green-500/20' };
      if (result.percentage >= 80) return { grade: 'A', color: 'text-green-400', bg: 'bg-green-500/20' };
      if (result.percentage >= 70) return { grade: 'B', color: 'text-cyan-400', bg: 'bg-cyan-500/20' };
      if (result.percentage >= 60) return { grade: 'C', color: 'text-yellow-400', bg: 'bg-yellow-500/20' };
      if (result.percentage >= 50) return { grade: 'D', color: 'text-orange-400', bg: 'bg-orange-500/20' };
      return { grade: 'F', color: 'text-red-400', bg: 'bg-red-500/20' };
    };

    const gradeInfo = getGrade();

    return (
      <div className="min-h-screen bg-black relative flex items-center justify-center pt-28 pb-8 px-4">
        {/* Background Effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-2xl w-full mx-auto relative z-10">
          <div className="backdrop-blur-xl bg-slate-900/60 rounded-3xl shadow-2xl border border-white/10 p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className={`w-24 h-24 ${gradeInfo.bg} rounded-full flex items-center justify-center mx-auto mb-4 border border-white/20`}>
                <Award size={48} className={gradeInfo.color} />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">Quiz Completed!</h1>
              <p className="text-slate-300">Here's how you performed</p>
            </div>

            {/* Score Circle */}
            <div className="flex justify-center mb-8">
              <div className={`w-40 h-40 ${gradeInfo.bg} rounded-full flex flex-col items-center justify-center border-4 ${gradeInfo.color.replace('text-', 'border-')}`}>
                <span className={`text-5xl font-bold ${gradeInfo.color}`}>{result.percentage}%</span>
                <span className="text-slate-400 text-sm">Accuracy</span>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white/5 rounded-xl p-4 text-center border border-white/10">
                <div className="text-2xl font-bold text-white">{result.total}</div>
                <div className="text-slate-400 text-sm">Total Questions</div>
              </div>
              <div className="bg-green-500/10 rounded-xl p-4 text-center border border-green-500/20">
                <div className="text-2xl font-bold text-green-400 flex items-center justify-center gap-1">
                  <CheckCircle size={20} />
                  {result.correct}
                </div>
                <div className="text-slate-400 text-sm">Correct</div>
              </div>
              <div className="bg-red-500/10 rounded-xl p-4 text-center border border-red-500/20">
                <div className="text-2xl font-bold text-red-400 flex items-center justify-center gap-1">
                  <XCircle size={20} />
                  {result.wrong}
                </div>
                <div className="text-slate-400 text-sm">Wrong</div>
              </div>
              <div className="bg-white/5 rounded-xl p-4 text-center border border-white/10">
                <div className="text-2xl font-bold text-slate-300">{result.unanswered}</div>
                <div className="text-slate-400 text-sm">Unanswered</div>
              </div>
            </div>

            {/* Score Summary */}
            <div className="bg-white/5 rounded-xl p-6 border border-white/10 mb-8">
              <h3 className="text-lg font-semibold text-white mb-4">Performance Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Score</span>
                  <span className="text-white font-bold">{result.correct} / {result.total}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Accuracy</span>
                  <span className="text-white font-bold">{result.percentage}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Grade</span>
                  <span className={`font-bold ${gradeInfo.color}`}>{gradeInfo.grade}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Time Taken</span>
                  <span className="text-white font-bold">{Math.floor(result.timeTaken / 60)}m {result.timeTaken % 60}s</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleRestart}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl font-semibold hover:from-cyan-700 hover:to-blue-700 transition-all transform hover:scale-[1.02] shadow-lg"
              >
                <RotateCcw size={20} />
                Try Again
              </button>
              <button
                onClick={() => navigate('/assessment-hub')}
                className="flex-1 px-6 py-4 bg-white/10 border border-white/20 text-white rounded-xl font-semibold hover:bg-white/20 transition-all"
              >
                Back to Hub
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Fallback
  return (
    <div className="flex min-h-screen bg-black items-center justify-center">
      <div className="text-white text-xl">Loading...</div>
    </div>
  );
};

export default AptitudeTest;
