import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mic,
  MicOff,
  Play,
  Square,
  Volume2,
  VolumeX,
  RotateCcw,
  ChevronRight,
  Award,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Sparkles,
  User,
  Bot
} from 'lucide-react';
import {
  speakInterviewQuestion,
  speakFeedback,
  stopSpeaking as stopVoice,
  isSpeaking as checkSpeaking,
  getCurrentVoice
} from '../../utils/voiceService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const AIMockInterview = () => {
  const navigate = useNavigate();

  // Interview stages: 'setup', 'interview', 'result'
  const [stage, setStage] = useState('setup');

  // Setup state
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);

  // Interview state
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [questionNumber, setQuestionNumber] = useState(1);
  const [previousQuestions, setPreviousQuestions] = useState([]);
  const [answer, setAnswer] = useState('');
  const [results, setResults] = useState([]);
  const [currentFeedback, setCurrentFeedback] = useState(null);

  // Voice state
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  // Loading states
  const [loadingQuestion, setLoadingQuestion] = useState(false);
  const [loadingEvaluation, setLoadingEvaluation] = useState(false);
  const [loadingSummary, setLoadingSummary] = useState(false);

  // Result state
  const [summary, setSummary] = useState(null);

  // Speech recognition ref
  const recognitionRef = useRef(null);

  // Total questions
  const TOTAL_QUESTIONS = 5;

  // Check authentication
  useEffect(() => {
    const token = sessionStorage.getItem('token');
    if (!token) {
      navigate('/signin');
    }
  }, [navigate]);

  // Fetch available roles on mount
  useEffect(() => {
    fetchRoles();
  }, []);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }

        setAnswer(prev => {
          const newText = (prev + finalTranscript).trim();
          return newText || interimTranscript;
        });
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
      };

      recognitionRef.current.onend = () => {
        if (isRecording) {
          recognitionRef.current.start();
        }
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isRecording]);

  // Fetch available roles
  const fetchRoles = async () => {
    try {
      const response = await fetch(`${API_URL}/api/mock-interview/roles`);
      const data = await response.json();
      if (data.success) {
        setRoles(data.data);
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  // Text-to-speech function using Microsoft neural voices
  const speak = (text, isFeedback = false) => {
    if (!voiceEnabled) return;

    const onStart = () => setIsSpeaking(true);
    const onEnd = () => setIsSpeaking(false);

    if (isFeedback) {
      speakFeedback(text, onStart, onEnd).catch(() => setIsSpeaking(false));
    } else {
      speakInterviewQuestion(text, onStart, onEnd).catch(() => setIsSpeaking(false));
    }
  };

  // Stop speaking
  const stopSpeaking = () => {
    stopVoice();
    setIsSpeaking(false);
  };

  // Start recording
  const startRecording = () => {
    if (recognitionRef.current) {
      setAnswer('');
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  // Fetch new question
  const fetchQuestion = async () => {
    setLoadingQuestion(true);
    setCurrentFeedback(null);
    setAnswer('');

    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/mock-interview/question`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          role: selectedRole.name,
          questionNumber,
          previousQuestions
        })
      });

      const data = await response.json();
      if (data.success) {
        setCurrentQuestion(data.data.question);
        setPreviousQuestions(prev => [...prev, data.data.question]);

        // Speak the question
        setTimeout(() => speak(data.data.question), 500);
      }
    } catch (error) {
      console.error('Error fetching question:', error);
    } finally {
      setLoadingQuestion(false);
    }
  };

  // Submit answer for evaluation
  const submitAnswer = async () => {
    if (!answer.trim()) return;

    setLoadingEvaluation(true);
    stopRecording();

    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/mock-interview/evaluate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          question: currentQuestion,
          answer: answer.trim(),
          role: selectedRole.name
        })
      });

      const data = await response.json();
      if (data.success) {
        setCurrentFeedback(data.data);

        // Store result
        setResults(prev => [...prev, {
          question: currentQuestion,
          answer: answer.trim(),
          evaluation: data.data
        }]);

        // Speak feedback
        if (voiceEnabled) {
          const feedbackText = `You scored ${data.data.score} out of 10. ${data.data.feedback}`;
          setTimeout(() => speak(feedbackText, true), 500);
        }
      }
    } catch (error) {
      console.error('Error evaluating answer:', error);
    } finally {
      setLoadingEvaluation(false);
    }
  };

  // Move to next question
  const nextQuestion = () => {
    if (questionNumber >= TOTAL_QUESTIONS) {
      generateSummary();
    } else {
      setQuestionNumber(prev => prev + 1);
      setCurrentFeedback(null);
      setAnswer('');
      fetchQuestion();
    }
  };

  // Generate final summary
  const generateSummary = async () => {
    setLoadingSummary(true);
    setStage('result');

    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/mock-interview/summary`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          results,
          role: selectedRole.name
        })
      });

      const data = await response.json();
      if (data.success) {
        setSummary(data.data);
      }
    } catch (error) {
      console.error('Error generating summary:', error);
    } finally {
      setLoadingSummary(false);
    }
  };

  // Start interview
  const startInterview = () => {
    if (!selectedRole) return;
    setStage('interview');
    setQuestionNumber(1);
    setPreviousQuestions([]);
    setResults([]);
    fetchQuestion();
  };

  // Restart interview
  const restartInterview = () => {
    setStage('setup');
    setSelectedRole(null);
    setQuestionNumber(1);
    setPreviousQuestions([]);
    setResults([]);
    setCurrentQuestion('');
    setAnswer('');
    setCurrentFeedback(null);
    setSummary(null);
  };

  // Handle quit
  const handleQuit = () => {
    if (window.confirm('Are you sure you want to quit? Your progress will be lost.')) {
      stopRecording();
      stopSpeaking();
      navigate('/');
    }
  };

  // Get score color
  const getScoreColor = (score) => {
    if (score >= 8) return 'text-green-400';
    if (score >= 6) return 'text-yellow-400';
    if (score >= 4) return 'text-orange-400';
    return 'text-red-400';
  };

  // Get recommendation color
  const getRecommendationColor = (rec) => {
    switch (rec) {
      case 'STRONG_HIRE': return 'bg-green-500/20 text-green-400 border-green-500/40';
      case 'HIRE': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
      case 'MAYBE': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40';
      default: return 'bg-red-500/20 text-red-400 border-red-500/40';
    }
  };

  // Setup Stage
  if (stage === 'setup') {
    return (
      <div className="min-h-screen bg-black relative pt-28 pb-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-purple-500/20 text-purple-400 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-purple-500/40">
              <Mic size={40} strokeWidth={2} />
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">AI Mock Interview</h1>
            <p className="text-slate-400 text-lg">Practice with AI-powered voice interviews</p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="backdrop-blur-xl bg-slate-900/60 rounded-xl p-4 border border-white/10">
              <div className="text-2xl mb-2">🎤</div>
              <h3 className="text-white font-semibold mb-1">Voice Interview</h3>
              <p className="text-slate-400 text-sm">AI asks questions using natural voice</p>
            </div>
            <div className="backdrop-blur-xl bg-slate-900/60 rounded-xl p-4 border border-white/10">
              <div className="text-2xl mb-2">🎯</div>
              <h3 className="text-white font-semibold mb-1">Real-time Feedback</h3>
              <p className="text-slate-400 text-sm">Get instant AI evaluation of your answers</p>
            </div>
            <div className="backdrop-blur-xl bg-slate-900/60 rounded-xl p-4 border border-white/10">
              <div className="text-2xl mb-2">📊</div>
              <h3 className="text-white font-semibold mb-1">Detailed Analysis</h3>
              <p className="text-slate-400 text-sm">Comprehensive performance summary</p>
            </div>
          </div>

          {/* Role Selection */}
          <div className="backdrop-blur-xl bg-slate-900/60 rounded-2xl shadow-2xl border border-white/10 p-6">
            <h2 className="text-xl font-bold text-white mb-4">Select Interview Role</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {roles.map((role) => (
                <button
                  key={role.id}
                  onClick={() => setSelectedRole(role)}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    selectedRole?.id === role.id
                      ? 'bg-purple-600/30 border-purple-500 ring-2 ring-purple-500/50'
                      : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="text-2xl mb-2">{role.icon}</div>
                  <h3 className="text-white font-semibold mb-1">{role.name}</h3>
                  <p className="text-slate-400 text-sm">{role.description}</p>
                </button>
              ))}
            </div>

            {/* Info */}
            <div className="bg-white/5 rounded-xl p-4 mb-6 border border-white/10">
              <h3 className="text-white font-semibold mb-2">Interview Format</h3>
              <ul className="text-slate-400 text-sm space-y-1">
                <li>• {TOTAL_QUESTIONS} questions per interview</li>
                <li>• AI speaks questions - you respond with voice</li>
                <li>• Real-time transcription of your answers</li>
                <li>• Instant AI feedback after each answer</li>
                <li>• Comprehensive summary at the end</li>
              </ul>
            </div>

            {/* Start Button */}
            <div className="flex gap-4">
              <button
                onClick={() => navigate('/')}
                className="flex-1 px-6 py-3 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={startInterview}
                disabled={!selectedRole}
                className={`flex-1 px-6 py-3 text-white rounded-lg font-semibold transition-all ${
                  selectedRole
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transform hover:scale-[1.02]'
                    : 'bg-slate-700 cursor-not-allowed'
                }`}
              >
                Start Interview
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Interview Stage
  if (stage === 'interview') {
    return (
      <div className="fixed inset-0 bg-black z-50 overflow-auto pt-4 pb-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-500/20 text-purple-400 rounded-xl flex items-center justify-center border border-purple-500/40">
                <Mic size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">{selectedRole?.name} Interview</h1>
                <p className="text-slate-400 text-sm">Question {questionNumber} of {TOTAL_QUESTIONS}</p>
              </div>
            </div>

            {/* Voice Toggle and Quit Button */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setVoiceEnabled(!voiceEnabled);
                  if (isSpeaking) stopSpeaking();
                }}
                className={`p-3 rounded-lg border transition-all ${
                  voiceEnabled
                    ? 'bg-purple-500/20 border-purple-500/40 text-purple-400'
                    : 'bg-white/5 border-white/10 text-slate-400'
                }`}
              >
                {voiceEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
              </button>
              <button
                onClick={handleQuit}
                className="px-4 py-2 bg-red-500/20 border border-red-500/40 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors text-sm font-semibold"
              >
                Quit
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 bg-slate-800 rounded-full mb-6">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
              style={{ width: `${(questionNumber / TOTAL_QUESTIONS) * 100}%` }}
            />
          </div>

          {/* Question Card */}
          <div className="backdrop-blur-xl bg-slate-900/60 rounded-2xl shadow-2xl border border-white/10 p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                <Bot size={20} className="text-purple-400" />
              </div>
              <span className="text-purple-400 font-semibold">AI Interviewer</span>
              {isSpeaking && (
                <div className="flex items-center gap-1 ml-auto">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                  <span className="text-purple-400 text-sm">Speaking...</span>
                </div>
              )}
            </div>

            {loadingQuestion ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
                <span className="text-slate-400 ml-3">Generating question...</span>
              </div>
            ) : (
              <p className="text-white text-lg leading-relaxed">{currentQuestion}</p>
            )}

            {/* Speak Question Button */}
            {currentQuestion && !isSpeaking && voiceEnabled && (
              <button
                onClick={() => speak(currentQuestion)}
                className="mt-4 flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
              >
                <Play size={16} />
                <span className="text-sm">Replay Question</span>
              </button>
            )}
          </div>

          {/* Answer Section */}
          {!currentFeedback && (
            <div className="backdrop-blur-xl bg-slate-900/60 rounded-2xl shadow-2xl border border-white/10 p-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center">
                  <User size={20} className="text-emerald-400" />
                </div>
                <span className="text-emerald-400 font-semibold">Your Answer</span>
              </div>

              {/* Answer Display */}
              <div className="bg-black/30 rounded-xl p-4 mb-4 min-h-[120px] border border-white/5">
                {answer ? (
                  <p className="text-white">{answer}</p>
                ) : (
                  <p className="text-slate-500 italic">
                    {isRecording ? 'Listening... Speak your answer' : 'Click "Start Recording" to answer'}
                  </p>
                )}
              </div>

              {/* Recording Controls */}
              <div className="flex items-center gap-4">
                {!isRecording ? (
                  <button
                    onClick={startRecording}
                    disabled={loadingQuestion}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-lg font-semibold hover:from-emerald-700 hover:to-green-700 transition-all disabled:opacity-50"
                  >
                    <Mic size={20} />
                    Start Recording
                  </button>
                ) : (
                  <button
                    onClick={stopRecording}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg font-semibold hover:from-red-700 hover:to-pink-700 transition-all animate-pulse"
                  >
                    <Square size={20} />
                    Stop Recording
                  </button>
                )}

                {answer && !isRecording && (
                  <button
                    onClick={submitAnswer}
                    disabled={loadingEvaluation}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50"
                  >
                    {loadingEvaluation ? (
                      <>
                        <Loader2 size={20} className="animate-spin" />
                        Evaluating...
                      </>
                    ) : (
                      <>
                        <CheckCircle size={20} />
                        Submit Answer
                      </>
                    )}
                  </button>
                )}

                {answer && !isRecording && (
                  <button
                    onClick={() => setAnswer('')}
                    className="p-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all"
                  >
                    <RotateCcw size={20} />
                  </button>
                )}
              </div>

              {/* Recording Indicator */}
              {isRecording && (
                <div className="mt-4 flex items-center gap-2 text-red-400">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-sm">Recording in progress...</span>
                </div>
              )}
            </div>
          )}

          {/* Feedback Card */}
          {currentFeedback && (
            <div className="backdrop-blur-xl bg-slate-900/60 rounded-2xl shadow-2xl border border-white/10 p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center">
                    <Sparkles size={20} className="text-yellow-400" />
                  </div>
                  <span className="text-yellow-400 font-semibold">AI Feedback</span>
                </div>
                <div className={`text-3xl font-bold ${getScoreColor(currentFeedback.score)}`}>
                  {currentFeedback.score}/10
                </div>
              </div>

              <p className="text-white mb-4">{currentFeedback.feedback}</p>

              {/* Strengths */}
              {currentFeedback.strengths && currentFeedback.strengths.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-green-400 text-sm font-semibold mb-2">Strengths</h4>
                  <div className="flex flex-wrap gap-2">
                    {currentFeedback.strengths.map((s, i) => (
                      <span key={i} className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Improvements */}
              {currentFeedback.improvements && currentFeedback.improvements.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-orange-400 text-sm font-semibold mb-2">Areas to Improve</h4>
                  <div className="flex flex-wrap gap-2">
                    {currentFeedback.improvements.map((s, i) => (
                      <span key={i} className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-sm">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Next Button */}
              <button
                onClick={nextQuestion}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all mt-4"
              >
                {questionNumber >= TOTAL_QUESTIONS ? (
                  <>
                    <Award size={20} />
                    View Results
                  </>
                ) : (
                  <>
                    Next Question
                    <ChevronRight size={20} />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Result Stage
  if (stage === 'result') {
    return (
      <div className="min-h-screen bg-black relative pt-28 pb-8 px-4">
        <div className="max-w-4xl mx-auto">
          {loadingSummary ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-16 h-16 text-purple-400 animate-spin mb-4" />
              <p className="text-slate-400 text-lg">Analyzing your interview performance...</p>
            </div>
          ) : summary ? (
            <>
              {/* Header */}
              <div className="text-center mb-8">
                <div className="w-24 h-24 bg-purple-500/20 text-purple-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-purple-500/40">
                  <Award size={48} />
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">Interview Complete!</h1>
                <p className="text-slate-400">{selectedRole?.name} Interview Summary</p>
              </div>

              {/* Score Card */}
              <div className="backdrop-blur-xl bg-slate-900/60 rounded-2xl shadow-2xl border border-white/10 p-6 mb-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  {/* Overall Score */}
                  <div className="text-center">
                    <div className={`text-6xl font-bold ${getScoreColor(summary.overallScore)}`}>
                      {summary.overallScore}
                    </div>
                    <p className="text-slate-400">Overall Score</p>
                  </div>

                  {/* Recommendation Badge */}
                  <div className={`px-6 py-3 rounded-xl border ${getRecommendationColor(summary.recommendation)}`}>
                    <span className="text-lg font-bold">{summary.recommendation?.replace('_', ' ')}</span>
                  </div>

                  {/* Stats */}
                  <div className="text-center">
                    <div className="text-4xl font-bold text-white">{TOTAL_QUESTIONS}</div>
                    <p className="text-slate-400">Questions Answered</p>
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="backdrop-blur-xl bg-slate-900/60 rounded-2xl shadow-2xl border border-white/10 p-6 mb-6">
                <h2 className="text-xl font-bold text-white mb-4">Performance Summary</h2>
                <p className="text-slate-300 leading-relaxed">{summary.summary}</p>
              </div>

              {/* Strengths & Improvements */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Strengths */}
                <div className="backdrop-blur-xl bg-slate-900/60 rounded-2xl shadow-2xl border border-white/10 p-6">
                  <h3 className="text-lg font-semibold text-green-400 mb-4 flex items-center gap-2">
                    <CheckCircle size={20} />
                    Top Strengths
                  </h3>
                  <ul className="space-y-2">
                    {summary.topStrengths?.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-slate-300">
                        <span className="text-green-400 mt-1">•</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Areas to Improve */}
                <div className="backdrop-blur-xl bg-slate-900/60 rounded-2xl shadow-2xl border border-white/10 p-6">
                  <h3 className="text-lg font-semibold text-orange-400 mb-4 flex items-center gap-2">
                    <XCircle size={20} />
                    Areas to Improve
                  </h3>
                  <ul className="space-y-2">
                    {summary.areasToImprove?.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-slate-300">
                        <span className="text-orange-400 mt-1">•</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Advice */}
              {summary.advice && (
                <div className="backdrop-blur-xl bg-purple-500/10 rounded-2xl shadow-2xl border border-purple-500/30 p-6 mb-6">
                  <h3 className="text-lg font-semibold text-purple-400 mb-2 flex items-center gap-2">
                    <Sparkles size={20} />
                    AI Advice
                  </h3>
                  <p className="text-white">{summary.advice}</p>
                </div>
              )}

              {/* Question Review */}
              <div className="backdrop-blur-xl bg-slate-900/60 rounded-2xl shadow-2xl border border-white/10 p-6 mb-6">
                <h2 className="text-xl font-bold text-white mb-4">Question Review</h2>
                <div className="space-y-4">
                  {results.map((r, i) => (
                    <div key={i} className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-slate-400 text-sm">Question {i + 1}</span>
                        <span className={`font-bold ${getScoreColor(r.evaluation?.score || 0)}`}>
                          {r.evaluation?.score || 0}/10
                        </span>
                      </div>
                      <p className="text-white mb-2">{r.question}</p>
                      <p className="text-slate-400 text-sm">Your answer: {r.answer}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={restartInterview}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-[1.02]"
                >
                  <RotateCcw size={20} />
                  Try Another Interview
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="flex-1 px-6 py-4 bg-white/10 border border-white/20 text-white rounded-xl font-semibold hover:bg-white/20 transition-all"
                >
                  Back to Home
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-20">
              <p className="text-slate-400">Failed to generate summary. Please try again.</p>
              <button
                onClick={restartInterview}
                className="mt-4 px-6 py-3 bg-purple-600 text-white rounded-lg"
              >
                Start Over
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
};

export default AIMockInterview;
