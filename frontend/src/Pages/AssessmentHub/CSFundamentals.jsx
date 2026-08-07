import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ConfigureStage, InstructionsStage, QuizStage, ResultStage, LoadingStage,
} from './components/QuizStages';
import { savePracticeResult } from '../Services/practiceResultService';
import { API_URL } from '../../config';




/**
 * CS fundamentals — questions served by the EduPath API, run through the
 * shared four-stage flow in components/QuizStages.
 */
const SCREEN = {
  label: 'CS fundamentals',
  title: 'The things every interview comes back to.',
  intro:
    'Data structures, algorithms, operating systems, networks and databases. The questions come from the EduPath catalogue, so the difficulty you pick is the difficulty you get.',
  difficulties: [
    { value: 'Easy', label: 'Easy' },
    { value: 'Medium', label: 'Medium' },
    { value: 'Hard', label: 'Hard' },
  ],
  rules: [
    'You get one minute per question. When the clock runs out the test submits itself.',
    'You can move back and forth and change any answer until you submit.',
    'Unanswered questions count as wrong, so guess rather than leave one blank.',
  ],
};

const CSFundamentals = () => {
  const navigate = useNavigate();

  // Quiz stages: 'configure', 'instructions', 'quiz', 'result'
  const [stage, setStage] = useState('configure');

  // Quiz configuration
  const [quizConfig, setQuizConfig] = useState({
    difficulty: 'Easy',
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
  const fetchQuestions = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = sessionStorage.getItem('token');

      const response = await fetch(
        `${API_URL}/api/cs/questions?difficulty=${quizConfig.difficulty}&limit=${quizConfig.questionCount}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch questions');
      }

      const data = await response.json();

      if (!data.success || !data.data || data.data.length === 0) {
        throw new Error('No questions received');
      }

      setQuestions(data.data);
      setAnswers(new Array(data.data.length).fill(null));
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
    const success = await fetchQuestions();

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
      } else if (userAnswer === question.correctAnswer) {
        correct++;
      } else {
        wrong++;
      }
    });

    const total = questions.length;
    const percentage = Math.round((correct / total) * 100);
    const timeTaken = startTime ? Math.round((Date.now() - startTime) / 1000) : 0;

    const resultData = { total, correct, wrong, unanswered, percentage, timeTaken };
    setResult(resultData);
    setStage('result');

    const reviewData = questions.map((question, index) => ({
      question: question.question,
      isCorrect: answers[index] === question.correctAnswer,
      answer: question.options[question.correctAnswer],
    }));
    savePracticeResult({
      type: 'cs-fundamentals',
      difficulty: quizConfig.difficulty,
      review: reviewData,
      ...resultData,
    }).catch((err) => console.error('Failed to save CS fundamentals result:', err));
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

  // This used to compare against question.answer, a field this shape
  // doesn't have — the real correct answer is options[correctAnswer] — so
  // every row showed as wrong regardless of what was actually picked, even
  // though the score above (compared correctly) was right.
  const review = questions.map((question, i) => ({
    question: question.question,
    isCorrect: answers[i] === question.correctAnswer,
    answer: question.options[question.correctAnswer],
  }));

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
        onDone={() => navigate('/assessment-hub/cs-fundamentals/results')}
      />
    );
  }

  return <LoadingStage label={loading ? 'Loading questions' : 'Loading'} />;
};

export default CSFundamentals;
