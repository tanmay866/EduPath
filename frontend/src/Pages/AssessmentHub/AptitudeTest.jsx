import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ConfigureStage, InstructionsStage, QuizStage, ResultStage, LoadingStage,
} from './components/QuizStages';


/**
 * Aptitude test — logical reasoning drawn from a public question bank, run
 * through the shared four-stage flow in components/QuizStages.
 */
const SCREEN = {
  label: 'Aptitude',
  title: 'Reasoning under a clock.',
  intro:
    'Questions come from a public aptitude bank rather than being generated, so the difficulty is fixed and the same set can come round again. It measures how you think, not what you have memorised.',
  difficulties: [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' },
  ],
  rules: [
    'You get one minute per question. When the clock runs out the test submits itself.',
    'You can move back and forth and change any answer until you submit.',
    'Unanswered questions count as wrong, so guess rather than leave one blank.',
    'Results from this test are not written to your quiz history.',
  ],
};

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
  const [showSubmitModal, setShowSubmitModal] = useState(false);

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
      setError('Please confirm you have read the rules');
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


  const answeredCount = answers.filter((a) => a !== null && a !== undefined).length;

  const review = questions.map((question, i) => {
    const chosen = answers[i];
    const chosenText = chosen === null || chosen === undefined ? null : question.options[chosen];
    return {
      question: question.question,
      isCorrect: chosenText === question.answer,
      answer: question.answer,
    };
  });

  if (stage === 'configure') {
    return (
      <ConfigureStage
        label={SCREEN.label}
        title={SCREEN.title}
        intro={SCREEN.intro}
        difficulties={SCREEN.difficulties}
        difficulty={quizConfig.difficulty}
        onDifficultyChange={(v) => setQuizConfig({ ...quizConfig, difficulty: v })}
        questionCount={quizConfig.questionCount}
        onQuestionCountChange={(v) => setQuizConfig({ ...quizConfig, questionCount: v })}
        loading={loading}
        error={error}
        onStart={() => { setError(null); setStage('instructions'); }}
        onBack={() => navigate('/assessment-hub')}
      />
    );
  }

  if (stage === 'instructions') {
    return (
      <InstructionsStage
        label={SCREEN.label}
        title="Before you begin"
        facts={[
          { label: 'Questions', value: quizConfig.questionCount },
          { label: 'Time', value: `${quizConfig.questionCount} min` },
          { label: 'Pass mark', value: '70%' },
        ]}
        rules={SCREEN.rules}
        agreed={agreedToTerms}
        onAgreedChange={setAgreedToTerms}
        onBegin={handleStartQuiz}
        onBack={() => setStage('configure')}
        loading={loading}
      />
    );
  }

  if (stage === 'quiz' && questions.length > 0) {
    return (
      <QuizStage
        label={SCREEN.label}
        question={questions[currentQuestionIndex]}
        index={currentQuestionIndex}
        total={questions.length}
        selected={selectedAnswer}
        onSelect={handleSelectOption}
        clock={formatTime(timer)}
        answers={answers}
        answeredCount={answeredCount}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onSubmit={() => setShowSubmitModal(true)}
        showSubmitModal={showSubmitModal}
        onConfirmSubmit={() => { setShowSubmitModal(false); handleSubmit(); }}
        onCancelSubmit={() => setShowSubmitModal(false)}
        onQuestionSelect={(i) => { setCurrentQuestionIndex(i); setSelectedAnswer(answers[i]); }}
      />
    );
  }

  if (stage === 'result' && result) {
    return (
      <ResultStage
        label={SCREEN.label}
        result={result}
        review={review}
        formatTime={formatTime}
        onRetry={handleRestart}
        onDone={() => navigate('/assessment-hub')}
      />
    );
  }

  return <LoadingStage label={loading ? 'Loading questions' : 'Loading'} />;
};

export default AptitudeTest;
