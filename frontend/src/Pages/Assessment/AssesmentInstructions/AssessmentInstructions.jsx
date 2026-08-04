import { useState, useEffect } from 'react';
import { useQuiz } from '../../Context/QuizContext';
import { useNavigate } from 'react-router-dom';
import { startQuiz } from '../../Services/assessmentService';
import {
  Card, CardHeader, Button, Modal, InlineMessage, MicroLabel, type,
} from '../../../design';

/**
 * Spec §7 Instructions.
 *
 * Centred 760px card: a mono header strip, a Newsreader title, a three-cell
 * mono stat row ruled top and bottom, an ordinal rule list, then a footer of a
 * quiet Back beside the primary Start.
 */
const AssessmentInstructions = () => {
  const { assessment: contextAssessment, setTimer, setAssessment } = useQuiz();
  const navigate = useNavigate();
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    if (!token) navigate('/signin');
  }, [navigate]);

  const [quizConfig] = useState({
    difficulty: 'beginner',
    experienceLevel: 'beginner',
    questionCount: 10,
  });

  const assessment = contextAssessment;

  if (!assessment || !assessment.topicId) {
    navigate('/assessment');
    return null;
  }

  const handleStartClick = () => {
    if (!agreedToTerms) return;
    setShowConfirmModal(true);
  };

  const handleConfirmStart = async () => {
    try {
      setLoading(true);
      setError(null);

      const payload = {
        topicId: assessment.topicId,
        difficulty: quizConfig.difficulty,
        experienceLevel: quizConfig.experienceLevel,
        questionCount: quizConfig.questionCount,
      };

      const response = await startQuiz(payload);
      const sessionData = response.data?.data;

      if (sessionData && sessionData.sessionId) {
        localStorage.setItem('sessionId', sessionData.sessionId);
        localStorage.setItem('startTime', Date.now());

        setAssessment({
          ...assessment,
          sessionId: sessionData.sessionId,
          questions: sessionData.questions,
          totalQuestions: sessionData.totalQuestions,
          difficulty: sessionData.difficulty,
          startedAt: sessionData.startedAt,
        });

        // 1 minute per question
        setTimer(quizConfig.questionCount * 60);

        setShowConfirmModal(false);
        navigate('/assessment/quiz');
      }
    } catch (err) {
      console.error('Failed to start quiz:', err);
      setError(err.response?.data?.message || 'Failed to start quiz. Please try again.');
      setShowConfirmModal(false);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { label: 'Questions', value: quizConfig.questionCount },
    { label: 'Time limit', value: `${quizConfig.questionCount} min` },
    { label: 'To pass', value: '60%' },
  ];

  const rules = [
    'Each question has one correct answer. You can change a choice before moving on.',
    'The timer runs from the moment you start and does not pause.',
    'Leaving the page ends the attempt and records what you had answered.',
    'You may retake this assessment as many times as you like.',
  ];

  return (
    <div style={{ background: 'var(--color-paper)', minHeight: '100vh', padding: '48px 32px' }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <Card>
          <CardHeader
            label="Before you begin"
            right={<MicroLabel size={11} color="var(--color-text-4)">{assessment.topicName}</MicroLabel>}
          />

          <div style={{ padding: '32px 34px' }}>
            <h1 style={{ ...type.question, margin: 0, color: 'var(--color-ink)' }}>
              {assessment.topicName} assessment
            </h1>

            {/* Three-cell mono stat row, ruled top and bottom. */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                padding: '14px 0',
                borderTop: '1px solid var(--color-line-soft)',
                borderBottom: '1px solid var(--color-line-soft)',
                margin: '24px 0',
              }}
            >
              {stats.map((s) => (
                <div key={s.label}>
                  <MicroLabel size={10.5} tracking="0.13em" color="var(--color-text-4)" style={{ display: 'block', marginBottom: 8 }}>
                    {s.label}
                  </MicroLabel>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 20, color: 'var(--color-ink)' }}>{s.value}</span>
                </div>
              ))}
            </div>

            <MicroLabel size={10.5} tracking="0.13em" style={{ display: 'block', marginBottom: 16 }}>
              How it works
            </MicroLabel>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {rules.map((rule, i) => (
                <div key={rule} style={{ display: 'grid', gridTemplateColumns: '20px 1fr', gap: 16, alignItems: 'start' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12.5, color: 'var(--color-clay)', paddingTop: 2 }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span style={{ fontSize: 14.5, color: 'var(--color-text-2)', lineHeight: 1.55 }}>{rule}</span>
                </div>
              ))}
            </div>

            <label
              style={{
                display: 'flex', alignItems: 'center', gap: 10, marginTop: 26,
                fontSize: 14, color: 'var(--color-text-2)', cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                style={{ width: 14, height: 14, accentColor: 'var(--color-ink)' }}
              />
              I have read the rules and I am ready to start.
            </label>

            {error && <InlineMessage tone="error" style={{ marginTop: 20 }}>{error}</InlineMessage>}
          </div>

          <div
            style={{
              padding: '18px 34px',
              borderTop: '1px solid var(--color-line)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Button variant="quiet" onClick={() => navigate('/assessment')}>Back</Button>
            <Button onClick={handleStartClick} disabled={!agreedToTerms}>Start assessment</Button>
          </div>
        </Card>
      </div>

      <Modal
        open={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Start the assessment?"
        actions={
          <>
            <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>Cancel</Button>
            <Button onClick={handleConfirmStart} loading={loading} loadingLabel="Starting…">Start</Button>
          </>
        }
      >
        The timer begins immediately and does not pause. You have {quizConfig.questionCount} minutes
        for {quizConfig.questionCount} questions.
      </Modal>
    </div>
  );
};

export default AssessmentInstructions;
