import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getQuizResult, retryQuiz } from '../../Services/assessmentService';
import {
  Card, CardHeader, Button, Loading, Empty, MicroLabel, StatusBox, type,
} from '../../../design';

/**
 * Spec §7 Result.
 *
 * Top block: a mono label above a mono 68px figure, beside a Newsreader verdict
 * and a consequence sentence. Then one row per answer — a 10px green or clay
 * square, the question, and the explanation. Footer: primary plus secondary.
 */
const ResultPage = () => {
  const { resultId } = useParams();
  const navigate = useNavigate();
  const [resultData, setResultData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    if (!token) navigate('/signin');
  }, [navigate]);

  useEffect(() => {
    if (resultId) fetchResultData();
    else navigate('/assessment');
  }, [resultId]);

  const fetchResultData = async () => {
    try {
      setLoading(true);
      const response = await getQuizResult(resultId);
      setResultData(response.data?.data);
    } catch (err) {
      console.error('Failed to fetch result:', err);
      setError('Failed to load quiz result');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = async () => {
    try {
      setRetrying(true);
      const response = await retryQuiz(resultId);
      const sessionData = response.data?.data;
      if (sessionData?.sessionId) {
        localStorage.setItem('sessionId', sessionData.sessionId);
        localStorage.setItem('startTime', Date.now());
        navigate('/assessment/quiz');
      }
    } catch (err) {
      console.error('Failed to retry quiz:', err);
      setError('Failed to start retry. Please try again.');
    } finally {
      setRetrying(false);
    }
  };

  const page = (children) => (
    <div style={{ background: 'var(--color-paper)', minHeight: '100vh', padding: '48px 32px' }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>{children}</div>
    </div>
  );

  if (loading) return page(<Card><Loading /></Card>);

  if (error || !resultData) {
    return page(
      <Card>
        <Empty action={<Button onClick={() => navigate('/assessment')}>Back to overview</Button>}>
          {error || 'This result could not be loaded.'}
        </Empty>
      </Card>
    );
  }

  const percentage = resultData.percentage || Math.round((resultData.score / resultData.totalQuestions) * 100);
  const passed = percentage >= 70;
  const correctAnswers = resultData.correctAnswers;
  const wrongAnswers = resultData.incorrectAnswers || (resultData.totalQuestions - correctAnswers);
  const attemptDate = new Date(resultData.completedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  const questionReview = resultData.detailedAnswers?.map((a, i) => ({
    id: i + 1,
    question: a.question,
    isCorrect: a.isCorrect,
    explanation: a.explanation,
  })) || [];

  const verdict = passed
    ? percentage >= 80 ? 'Strong pass' : 'Passed'
    : 'Below the pass mark';

  const consequence = passed
    ? `You answered ${correctAnswers} of ${resultData.totalQuestions} correctly. This result feeds straight into your roadmap.`
    : `You answered ${correctAnswers} of ${resultData.totalQuestions} correctly and needed 70%. The ${wrongAnswers} you missed become roadmap priorities.`;

  return page(
    <Card>
      <CardHeader
        label={resultData.topic?.name || 'Assessment'}
        right={<MicroLabel size={11} color="var(--color-text-4)">{attemptDate}</MicroLabel>}
      />

      {/* Top block: hero figure beside the verdict. */}
      <div style={{ padding: 34, display: 'flex', gap: 40, alignItems: 'flex-start' }}>
        <div>
          <MicroLabel size={10.5} tracking="0.13em" color="var(--color-text-4)" style={{ display: 'block', marginBottom: 10 }}>
            Score
          </MicroLabel>
          <span
            style={{
              ...type.heroMetric,
              fontSize: 68,
              color: passed ? 'var(--color-green)' : 'var(--color-clay)',
              display: 'block',
              lineHeight: 1,
            }}
          >
            {percentage}
          </span>
        </div>

        <div style={{ flex: 1 }}>
          <h1 style={{ ...type.question, margin: 0, color: 'var(--color-ink)' }}>{verdict}</h1>
          <p style={{ fontSize: 15, color: 'var(--color-text-2)', lineHeight: 1.6, margin: '12px 0 0' }}>
            {consequence}
          </p>
        </div>
      </div>

      {questionReview.length > 0 && (
        <>
          <div style={{ padding: '0 34px' }}>
            <MicroLabel
              size={10.5}
              tracking="0.13em"
              style={{ display: 'block', paddingBottom: 14, borderBottom: '1px solid var(--color-line-soft)' }}
            >
              Answer review
            </MicroLabel>
          </div>

          {questionReview.map((q, i) => (
            <div
              key={q.id}
              style={{
                padding: '16px 34px',
                borderBottom: i === questionReview.length - 1 ? 'none' : '1px solid var(--color-line-soft)',
                display: 'grid',
                gridTemplateColumns: '10px 1fr',
                gap: 16,
                alignItems: 'start',
              }}
            >
              <span style={{ paddingTop: 6 }}>
                <StatusBox status={q.isCorrect ? 'correct' : 'wrong'} size={10} />
              </span>
              <div>
                <div style={{ fontSize: 15, color: 'var(--color-ink)', lineHeight: 1.5 }}>{q.question}</div>
                {q.explanation && (
                  <p style={{ fontSize: 13.5, color: 'var(--color-text-3)', lineHeight: 1.55, margin: '6px 0 0' }}>
                    {q.explanation}
                  </p>
                )}
              </div>
            </div>
          ))}
        </>
      )}

      <div
        style={{
          padding: '18px 34px',
          borderTop: '1px solid var(--color-line)',
          display: 'flex',
          gap: 12,
          justifyContent: 'flex-end',
        }}
      >
        <Button variant="secondary" onClick={() => navigate('/assessment')}>Back to overview</Button>
        <Button onClick={handleRetry} loading={retrying} loadingLabel="Starting…">Retake</Button>
      </div>
    </Card>
  );
};

export default ResultPage;
