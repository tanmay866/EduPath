import { useEffect, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useQuiz } from "../../Context/useQuiz";
import { fetchQuizTopics, startQuiz } from "../../Services/assessmentService";
import { useQuizLogic } from "./hooks/useQuizLogic";
import QuizLayout from "./components/QuizLayout";
import {
  Card, CardHeader, Button, Field, FieldGroup, InlineMessage, Loading, Empty, MicroLabel, type,
} from "../../../design";

// Native selects have no spec entry; these borrow the Field input treatment so
// they sit level with the text inputs beside them.
const SELECT_STYLE = {
  width: '100%',
  padding: '13px 14px',
  fontSize: 15,
  fontFamily: 'var(--font-sans)',
  color: 'var(--color-ink)',
  background: '#fff',
  border: '1px solid var(--color-line-input)',
  borderRadius: 0,
  outline: 'none',
};

const QuizPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Check authentication on component mount
  useEffect(() => {
    const token = sessionStorage.getItem('token');
    if (!token) {
      navigate('/signin');
      return;
    }
  }, [navigate]);

  // Quiz stages: 'configure', 'instructions', 'quiz'
  const [stage, setStage] = useState('configure');

  const [quizStarted, setQuizStarted] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Topics for dropdown
  const [topics, setTopics] = useState([]);
  const [loadingTopics, setLoadingTopics] = useState(true);
  const [topicQuery, setTopicQuery] = useState('');

  // Quiz configuration
  const [quizConfig, setQuizConfig] = useState({
    topicId: '',
    topicName: '',
    topicIcon: '',
    difficulty: 'beginner',
    experienceLevel: 'beginner',
    questionCount: 10
  });

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

  const loadTopics = useCallback(async () => {
    try {
      setLoadingTopics(true);
      const response = await fetchQuizTopics();
      const list = response.data?.data || [];
      setTopics(list);

      // Arriving from a roadmap skill: preselect the topic that covers it so
      // the learner is not asked to find it again in a list of 54.
      const wanted = location.state?.topicId;
      if (wanted) {
        const match = list.find((t) => String(t._id) === String(wanted));
        if (match) {
          setQuizConfig((prev) => ({
            ...prev,
            topicId: match._id,
            topicName: match.name,
            topicIcon: match.icon,
          }));
        }
      }
    } catch (err) {
      console.error('Failed to load topics:', err);
      setError('Failed to load topics');
    } finally {
      setLoadingTopics(false);
    }
  }, [location.state]);

  // Load topics on mount, and again if the learner arrives here from a
  // different roadmap skill — the preselection above reads location.state, so
  // a function captured on first render would preselect the topic from the
  // journey before this one.
  useEffect(() => {
    loadTopics();
  }, [loadTopics]);

  // The catalogue went from 29 topics to 54 when every curriculum skill got
  // one of its own, and scanning that many options in a dropdown is not
  // reading, it is hunting. Narrowing happens above the list rather than
  // replacing it: the grouping by role is the useful default and a search
  // that discarded it would be a worse starting point.
  const topicMatches = (topic) => {
    const term = topicQuery.trim().toLowerCase();
    if (!term) return true;
    // The current choice always stays in the list. Filtering it out leaves a
    // select whose value matches no option, which reads as having lost it.
    if (topic._id === quizConfig.topicId) return true;
    return String(topic.name || '').toLowerCase().includes(term);
  };

  // The API marks which topics suit the user's target role; the split is kept
  // here so the select can group them without reordering the source list.
  const recommendedTopics = topics.filter((t) => t.recommended).filter(topicMatches);
  const otherTopics = topics.filter((t) => !t.recommended).filter(topicMatches);
  const matchCount = recommendedTopics.length + otherTopics.length;

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
      setError('Please choose a topic first');
      return;
    }
    setError(null);
    setStage('instructions');
  };

  const handleStartQuizFromInstructions = async () => {
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
    setShowSubmitModal,
    navigate,
  });

  // Records that the current question has been seen.
  //
  // The update is functional so this reads the list React holds rather than
  // the one captured when the effect was created — the previous version
  // closed over `visitedQuestions` while leaving it out of the dependencies,
  // so a question visited after any other write to the list could be appended
  // to a stale copy and silently drop the entries in between.
  useEffect(() => {
    if (stage !== 'quiz' || !setVisitedQuestions) return;
    if (!assessment?.questions?.[currentQuestionIndex]) return;

    setVisitedQuestions((prev = []) =>
      prev.includes(currentQuestionIndex) ? prev : [...prev, currentQuestionIndex]
    );
  }, [currentQuestionIndex, assessment, stage, setVisitedQuestions]);

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
      <div style={{ background: 'var(--color-paper)', minHeight: '100vh', padding: '48px 32px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <Card>
            <CardHeader label="Configure assessment" />
            <div style={{ padding: '32px 34px' }}>
              <h1 style={{ ...type.question, margin: 0, color: 'var(--color-ink)' }}>
                Set up your assessment
              </h1>

              {loadingTopics ? (
                <Loading />
              ) : (
                <FieldGroup style={{ marginTop: 26 }}>
                  {/* Grouped, not filtered: the topics that matter for your
                      track come first, but every topic stays selectable. */}
                  <Field
                    label="Topic"
                    help={
                      recommendedTopics.length > 0
                        ? `Suggested for ${sessionStorage.getItem('targetRole')}. You can pick any topic.`
                        : undefined
                    }
                  >
                    {/* Only once the list is long enough to be worth
                        narrowing. On a short list a search box is one more
                        thing to read past. */}
                    {topics.length > 15 && (
                      <input
                        type="search"
                        value={topicQuery}
                        onChange={(e) => setTopicQuery(e.target.value)}
                        placeholder={`Filter ${topics.length} topics`}
                        style={{ ...SELECT_STYLE, marginBottom: 8, padding: '11px 14px', fontSize: 14 }}
                      />
                    )}

                    <select
                      value={quizConfig.topicId}
                      onChange={handleTopicChange}
                      style={SELECT_STYLE}
                    >
                      <option value="">Choose a topic…</option>
                      {recommendedTopics.length > 0 && (
                        <optgroup label="For your role">
                          {recommendedTopics.map((topic) => (
                            <option key={topic._id} value={topic._id}>{topic.name}</option>
                          ))}
                        </optgroup>
                      )}
                      <optgroup label={recommendedTopics.length > 0 ? 'All other topics' : 'All topics'}>
                        {otherTopics.map((topic) => (
                          <option key={topic._id} value={topic._id}>{topic.name}</option>
                        ))}
                      </optgroup>
                    </select>
                    {topicQuery.trim() && matchCount === 0 && (
                      <div style={{ fontSize: 13.5, color: 'var(--color-text-3)', marginTop: 6 }}>
                        {`No topic matches "${topicQuery.trim()}".`}
                      </div>
                    )}
                  </Field>

                  <Field label="Difficulty">
                    <select
                      value={quizConfig.difficulty}
                      onChange={(e) => setQuizConfig({ ...quizConfig, difficulty: e.target.value })}
                      style={SELECT_STYLE}
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </Field>

                  <Field label="Experience level">
                    <select
                      value={quizConfig.experienceLevel}
                      onChange={(e) => setQuizConfig({ ...quizConfig, experienceLevel: e.target.value })}
                      style={SELECT_STYLE}
                    >
                      <option value="beginner">Beginner (0-1 years)</option>
                      <option value="intermediate">Intermediate (1-3 years)</option>
                      <option value="advanced">Advanced (3+ years)</option>
                    </select>
                  </Field>

                  <Field label="Questions">
                    <select
                      value={quizConfig.questionCount}
                      onChange={(e) => setQuizConfig({ ...quizConfig, questionCount: Number(e.target.value) })}
                      style={SELECT_STYLE}
                    >
                      <option value={5}>5 questions</option>
                      <option value={10}>10 questions</option>
                      <option value={15}>15 questions</option>
                      <option value={20}>20 questions</option>
                    </select>
                  </Field>
                </FieldGroup>
              )}

              {error && <InlineMessage tone="error" style={{ marginTop: 20 }}>{error}</InlineMessage>}
            </div>

            <div style={{ padding: '18px 34px', borderTop: '1px solid var(--color-line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Button variant="quiet" onClick={() => navigate('/assessment')}>Back</Button>
              <Button onClick={handleConfigureNext} disabled={!quizConfig.topicId}>Continue</Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Stage 2: Instructions & Quiz Details
  if (stage === 'instructions') {
    return (
      <div style={{ background: 'var(--color-paper)', minHeight: '100vh', padding: '48px 32px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <Card>
            <CardHeader label="Before you begin" />
            <div style={{ padding: '32px 34px' }}>
              <h1 style={{ ...type.question, margin: 0, color: 'var(--color-ink)' }}>Ready to start</h1>

              <div className="grid-sm-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', padding: '14px 0', borderTop: '1px solid var(--color-line-soft)', borderBottom: '1px solid var(--color-line-soft)', margin: '24px 0' }}>
                {[
                  { label: 'Questions', value: quizConfig.questionCount },
                  { label: 'Time limit', value: `${quizConfig.questionCount} min` },
                  { label: 'To pass', value: '70%' },
                ].map((s) => (
                  <div key={s.label}>
                    <MicroLabel size={10.5} tracking="0.13em" color="var(--color-text-4)" style={{ display: 'block', marginBottom: 8 }}>{s.label}</MicroLabel>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 20, color: 'var(--color-ink)' }}>{s.value}</span>
                  </div>
                ))}
              </div>

              <MicroLabel size={10.5} tracking="0.13em" style={{ display: 'block', marginBottom: 16 }}>How it works</MicroLabel>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  'Each question has one correct answer. You can change a choice before moving on.',
                  'The timer runs from the moment you start and does not pause.',
                  'Leaving the page ends the attempt and records what you had answered.',
                  'You may retake this assessment as many times as you like.',
                ].map((rule, i) => (
                  <div key={rule} style={{ display: 'grid', gridTemplateColumns: '20px 1fr', gap: 16, alignItems: 'start' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12.5, color: 'var(--color-clay)', paddingTop: 2 }}>{String(i + 1).padStart(2, '0')}</span>
                    <span style={{ fontSize: 14.5, color: 'var(--color-text-2)', lineHeight: 1.55 }}>{rule}</span>
                  </div>
                ))}
              </div>

              {error && <InlineMessage tone="error" style={{ marginTop: 20 }}>{error}</InlineMessage>}
            </div>

            <div style={{ padding: '18px 34px', borderTop: '1px solid var(--color-line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Button variant="quiet" onClick={() => setStage('configure')}>Back</Button>
              <Button onClick={handleStartQuizFromInstructions} loading={loading} loadingLabel="Starting…">Start assessment</Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Stage 3: Quiz Active
  if (stage === 'quiz' && quizStarted) {
    if (!assessment || !questions.length) {
      return (
        <div style={{ background: 'var(--color-paper)', minHeight: '100vh', padding: '48px 32px' }}>
          <div style={{ maxWidth: 760, margin: '0 auto' }}>
            <Card>
              <Empty action={<Button onClick={() => navigate('/assessment')}>Back to assessments</Button>}>
                This assessment could not be loaded.
              </Empty>
            </Card>
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
    <div style={{ background: 'var(--color-paper)', minHeight: '100vh', padding: '48px 32px' }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <Card><Loading /></Card>
      </div>
    </div>
  );
};

export default QuizPage;

