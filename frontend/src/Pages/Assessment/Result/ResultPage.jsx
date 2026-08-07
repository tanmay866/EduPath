import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getQuizResult, retryQuiz } from '../../Services/assessmentService';
import { updateSkillStatus } from '../../Services/roadmapService';
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
  // Skills this pass could settle on the plan, and the ones already ticked
  // from here so the offer disappears as it is taken.
  const [markedSkills, setMarkedSkills] = useState([]);
  const [markingSkill, setMarkingSkill] = useState(null);
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

      {/* The loop that was left open: passing the quiz for a roadmap skill is
          the best evidence the product has that the skill is done, and until
          now ticking it meant going to the plan and doing it by hand. Offered,
          not applied — the learner knows whether they can actually do it. */}
      {passed && (resultData.roadmapSkills || []).filter((s) => !markedSkills.includes(s)).length > 0 && (
        <div style={{ padding: '18px 34px', borderTop: '1px solid var(--color-line)' }}>
          <MicroLabel size={10.5} tracking="0.13em" color="var(--color-text-4)" style={{ display: 'block', marginBottom: 8 }}>
            ON YOUR ROADMAP
          </MicroLabel>
          <p style={{ fontSize: 14.5, color: 'var(--color-text-2)', margin: '0 0 12px', lineHeight: 1.55 }}>
            {`This assessment covers ${(resultData.roadmapSkills || []).filter((s) => !markedSkills.includes(s)).length === 1 ? 'a skill' : 'skills'} still outstanding on your plan. Mark done if you are confident.`}
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {(resultData.roadmapSkills || [])
              .filter((skill) => !markedSkills.includes(skill))
              .map((skill) => (
                <Button
                  key={skill}
                  variant="secondary"
                  style={{ padding: '8px 16px', fontSize: 14 }}
                  disabled={markingSkill === skill}
                  onClick={async () => {
                    setMarkingSkill(skill);
                    try {
                      await updateSkillStatus(skill, 'completed');
                      setMarkedSkills((prev) => [...prev, skill]);
                    } catch {
                      // Left un-ticked rather than shown as done: a failed
                      // write that looked like a success would be worse.
                      setMarkingSkill(null);
                    } finally {
                      setMarkingSkill(null);
                    }
                  }}
                >
                  {markingSkill === skill ? 'Marking…' : `Mark "${skill}" done`}
                </Button>
              ))}
          </div>
        </div>
      )}

      {markedSkills.length > 0 && (
        <div style={{ padding: '14px 34px', borderTop: '1px solid var(--color-line)' }}>
          <p style={{ fontSize: 14, color: 'var(--color-green)', margin: 0 }}>
            {`Marked done on your roadmap: ${markedSkills.join(', ')}.`}
          </p>
        </div>
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
