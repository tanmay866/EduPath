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
    try { stopRecording(); } catch (e) { console.error(e) }
    try { stopSpeaking(); } catch (e) { console.error(e) }
    restartInterview();
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
      <div className="min-h-screen bg-black w-full relative pt-32 pb-12 px-8 flex flex-col justify-center overflow-hidden">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 relative z-10 items-center h-full max-h-[600px]">
          
          {/* Left Column: Branding (Spans 5 Columns) */}
          <div className="lg:col-span-5 flex flex-col justify-center h-full">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-6 w-max">
              <Mic size={16} className="animate-pulse" />
              <span className="text-xs font-bold tracking-widest uppercase">Voice Enabled AI Engine</span>
            </div>
            
            <h1 className="text-4xl lg:text-5xl font-black text-white mb-5 leading-[1.1] tracking-tight">
              Master Your <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">Next Interview</span>
            </h1>
            
            <p className="text-slate-400 text-lg mb-8 font-light max-w-md leading-relaxed hidden md:block">
              Practice real scenarios with our AI-powered voice engine. Get instant, personalized feedback to secure your dream role.
            </p>

            <div className="space-y-4 hidden md:block">
              {[
                { icon: "🎤", title: "Voice Interview", desc: "AI asks questions using natural voice" },
                { icon: "🎯", title: "Real-time Feedback", desc: "Instant evaluation of your answers" },
                { icon: "📊", title: "Detailed Analysis", desc: "Comprehensive performance summary" }
              ].map((f, i) => (
                <div key={i} className="flex items-center gap-4 group">
                  <div className="w-12 h-12 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-center text-xl group-hover:bg-white/[0.05] group-hover:-translate-y-0.5 transition-all">
                    {f.icon}
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-sm tracking-wide mb-1">{f.title}</h3>
                    <p className="text-slate-500 text-xs">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Interactive Role Selection (Spans 7 Columns) */}
          <div className="lg:col-span-7 backdrop-blur-3xl bg-[#090b14]/70 rounded-[2rem] border border-white/5 shadow-2xl p-6 lg:p-8 relative flex flex-col h-full max-h-[550px]">
            
            <div className="flex items-center justify-between mb-6 shrink-0">
              <h2 className="text-2xl font-bold text-white">Select Your Role</h2>
              <span className="px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/5 text-[11px] uppercase tracking-wider font-bold text-slate-400">
                5 Questions
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 flex-1 overflow-y-auto pr-2 custom-scrollbar mask-fade-y pb-2">
              {roles.map((role) => (
                <button
                  key={role.id}
                  onClick={() => setSelectedRole(role)}
                  className={`p-4 rounded-2xl border text-left transition-all duration-300 ease-out group flex flex-col justify-center relative overflow-hidden ${
                    selectedRole?.id === role.id
                      ? 'bg-gradient-to-br from-indigo-500/10 to-violet-500/10 border-indigo-500/50 shadow-[0_0_30px_rgba(99,102,241,0.15)] ring-1 ring-indigo-500/30 scale-[0.98]'
                      : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04] hover:border-white/10'
                  }`}
                >
                  {selectedRole?.id === role.id && (
                    <div className="absolute -right-6 -top-6 w-24 h-24 bg-indigo-500/20 blur-xl rounded-full pointer-events-none" />
                  )}
                  <div className="relative z-10 w-full">
                    <div className="text-2xl lg:text-3xl mb-2 group-hover:scale-110 group-hover:-rotate-3 transition-transform origin-left">{role.icon}</div>
                    <h3 className="text-white font-bold text-sm lg:text-base mb-1">{role.name}</h3>
                    <p className={`text-[10px] lg:text-[11px] font-medium leading-relaxed line-clamp-2 ${selectedRole?.id === role.id ? 'text-indigo-200' : 'text-slate-500'}`}>
                      {role.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            <div className="pt-5 mt-4 border-t border-white/5 flex gap-4 shrink-0">
              <button
                onClick={() => navigate('/')}
                className="px-6 py-3 rounded-xl font-bold bg-white/5 text-slate-300 hover:bg-white/10 text-sm transition-all w-28"
              >
                Back
              </button>
              <button
                onClick={startInterview}
                disabled={!selectedRole}
                className={`flex-1 flex items-center justify-between px-6 md:px-8 py-3 rounded-xl font-bold text-sm transition-all duration-500 group ${
                  selectedRole
                    ? 'bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/40'
                    : 'bg-white/5 border border-white/5 text-slate-500 cursor-not-allowed'
                }`}
              >
                <span className="text-sm tracking-wide">
                  {selectedRole ? 'Commence Interview' : 'Select a Role'}
                </span>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors duration-300 ${selectedRole ? 'bg-white/20' : 'bg-transparent'}`}>
                  <Play size={14} className={`${selectedRole ? 'fill-white text-white' : 'text-slate-500'} ${selectedRole ? 'translate-x-[1px]' : ''}`} />
                </div>
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
      <div className="min-h-screen bg-black relative pt-32 pb-12 px-6 flex flex-col items-center overflow-hidden">
        <div className="max-w-7xl w-full mx-auto relative z-10 flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-indigo-500/10 text-indigo-400 rounded-2xl flex items-center justify-center border border-indigo-500/20 shadow-[0_0_30px_rgba(99,102,241,0.1)] shrink-0">
                <Mic size={28} strokeWidth={1.5} />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight mb-1">{selectedRole?.name} Interview</h1>
                <p className="text-indigo-400/80 text-sm font-medium">Question {questionNumber} of {TOTAL_QUESTIONS}</p>
              </div>
            </div>

            {/* Voice Toggle and Quit Button */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setVoiceEnabled(!voiceEnabled);
                  if (isSpeaking) stopSpeaking();
                }}
                className={`p-3.5 rounded-xl transition-all duration-300 ${voiceEnabled
                    ? 'bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.1)]'
                    : 'bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10'
                  }`}
              >
                {voiceEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
              </button>
              <button
                onClick={handleQuit}
                className="px-5 py-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl hover:bg-rose-500/20 transition-colors text-sm font-bold"
              >
                Quit
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-1.5 bg-white/5 rounded-full mb-10 overflow-hidden backdrop-blur-sm">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full transition-all duration-700 ease-out shadow-[0_0_15px_rgba(99,102,241,0.5)]"
              style={{ width: `${(questionNumber / TOTAL_QUESTIONS) * 100}%` }}
            />
          </div>

          {/* Split Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 w-full items-start">
            {/* Question Card */}
          <div className="backdrop-blur-3xl bg-[#090b14]/70 rounded-[2rem] shadow-2xl border border-white/5 p-8 mb-6 relative overflow-hidden">
            {isSpeaking && (
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 animate-pulse" />
            )}
            
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/20 rounded-full flex items-center justify-center">
                <Bot size={24} className="text-indigo-400" />
              </div>
              <span className="text-indigo-400 font-bold uppercase tracking-widest text-xs">AI Interviewer</span>
              {isSpeaking && (
                <div className="flex items-center gap-1.5 ml-auto bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              )}
            </div>

            {loadingQuestion ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-10 h-10 text-indigo-400 animate-spin mb-4" />
                <span className="text-slate-400 font-medium tracking-wide">Formulating next question...</span>
              </div>
            ) : (
              <p className="text-white text-xl md:text-2xl leading-relaxed font-light">{currentQuestion}</p>
            )}

            {/* Speak Question Button */}
            {currentQuestion && !isSpeaking && voiceEnabled && (
              <button
                onClick={() => speak(currentQuestion)}
                className="mt-8 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-indigo-400 transition-colors border border-white/5 text-sm font-medium"
              >
                <Play size={14} />
                <span>Replay Audio</span>
              </button>
            )}
          </div>

          {/* Answer Section */}
          {!currentFeedback && (
            <div className="backdrop-blur-3xl bg-[#090b14]/70 rounded-[2rem] shadow-2xl border border-white/5 p-8 mb-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center">
                    <User size={24} className="text-emerald-400" />
                  </div>
                  <span className="text-emerald-400 font-bold uppercase tracking-widest text-xs">Your Answer</span>
                </div>
                {isRecording && (
                  <div className="flex items-center gap-2 text-rose-400 bg-rose-500/10 px-3 py-1.5 rounded-full border border-rose-500/20">
                    <div className="w-2 h-2 bg-rose-500 rounded-full animate-ping" />
                    <span className="text-xs font-bold tracking-widest uppercase">Recording</span>
                  </div>
                )}
              </div>

              {/* Answer Display */}
              <div className={`rounded-2xl p-6 mb-8 min-h-[160px] border transition-all duration-300 ${isRecording ? 'bg-indigo-500/5 border-indigo-500/30 shadow-[inset_0_0_20px_rgba(99,102,241,0.05)]' : 'bg-black/40 border-white/5'}`}>
                {answer ? (
                  <p className="text-white text-lg leading-relaxed">{answer}</p>
                ) : (
                  <p className="text-slate-500 font-light flex items-center justify-center h-full text-center">
                    {isRecording ? 'Listening carefully... speak your answer' : 'Click "Start Recording" when you are ready to answer'}
                  </p>
                )}
              </div>

              {/* Recording Controls */}
              <div className="flex flex-wrap items-center gap-4">
                {!isRecording ? (
                  <button
                    onClick={startRecording}
                    disabled={loadingQuestion}
                    className="flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-indigo-500 to-violet-500 text-white rounded-xl font-bold shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0 w-full sm:w-auto"
                  >
                    <Mic size={20} />
                    <span>Start Recording</span>
                  </button>
                ) : (
                  <button
                    onClick={stopRecording}
                    className="flex items-center justify-center gap-3 px-8 py-4 bg-rose-500 text-white rounded-xl font-bold hover:bg-rose-600 shadow-xl shadow-rose-500/20 transition-all animate-pulse w-full sm:w-auto"
                  >
                    <Square size={20} className="fill-white" />
                    <span>Stop Recording</span>
                  </button>
                )}

                {answer && !isRecording && (
                  <div className="flex gap-3 w-full sm:w-auto mt-4 sm:mt-0">
                    <button
                      onClick={submitAnswer}
                      disabled={loadingEvaluation}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500 hover:text-white rounded-xl font-bold transition-all disabled:opacity-50"
                    >
                      {loadingEvaluation ? (
                        <>
                          <Loader2 size={20} className="animate-spin" />
                          <span>Evaluating...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle size={20} />
                          <span>Submit Answer</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => setAnswer('')}
                      className="px-4 py-4 bg-white/5 border border-white/10 text-white rounded-xl hover:bg-white/10 transition-all focus:outline-none"
                      title="Clear answer and try again"
                    >
                      <RotateCcw size={20} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Feedback Card */}
          {currentFeedback && (
            <div className="backdrop-blur-3xl bg-[#090b14]/70 rounded-[2rem] shadow-2xl border border-white/5 p-8 mb-12">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-8 border-b border-white/5">
                <div className="flex items-center gap-4 mb-4 md:mb-0">
                  <div className="w-14 h-14 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(234,179,8,0.1)]">
                    <Sparkles size={28} className="text-yellow-400" />
                  </div>
                  <span className="text-white text-xl font-bold tracking-tight">Feedback Analysis</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-slate-400 font-medium text-sm">Rating</span>
                  <div className={`px-4 py-2 rounded-xl border font-bold text-2xl ${getScoreColor(currentFeedback.score)} border-current bg-white/[0.02]`}>
                    {currentFeedback.score}/10
                  </div>
                </div>
              </div>

              <div className="prose prose-invert max-w-none text-slate-300 mb-8 font-light text-lg leading-relaxed">
                <p>{currentFeedback.feedback}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Strengths */}
                {currentFeedback.strengths && currentFeedback.strengths.length > 0 && (
                  <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-6">
                    <h4 className="text-emerald-400 text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                       <CheckCircle size={16} /> Key Strengths
                    </h4>
                    <ul className="space-y-3">
                      {currentFeedback.strengths.map((s, i) => (
                        <li key={i} className="flex gap-3 text-slate-300 text-sm items-start">
                          <span className="text-emerald-500 mt-1">•</span> <span className="leading-relaxed">{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Improvements */}
                {currentFeedback.improvements && currentFeedback.improvements.length > 0 && (
                  <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-6">
                    <h4 className="text-amber-400 text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                       <XCircle size={16} /> Areas to Detail
                    </h4>
                    <ul className="space-y-3">
                      {currentFeedback.improvements.map((s, i) => (
                        <li key={i} className="flex gap-3 text-slate-300 text-sm items-start">
                          <span className="text-amber-500 mt-1">•</span> <span className="leading-relaxed">{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Next Button */}
              <button
                onClick={nextQuestion}
                className="w-full flex items-center justify-center gap-2 px-8 py-5 bg-gradient-to-r from-indigo-500 to-violet-500 text-white rounded-xl font-bold hover:shadow-xl hover:shadow-indigo-500/25 hover:-translate-y-0.5 transition-all"
              >
                {questionNumber >= TOTAL_QUESTIONS ? (
                  <>
                    <Award size={20} />
                    View Final Results
                  </>
                ) : (
                  <>
                    Proceed to Next Question
                    <ChevronRight size={20} />
                  </>
                )}
              </button>
            </div>
          )}
          </div>
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
