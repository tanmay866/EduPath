import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState, useCallback } from 'react';
import { getQuizResult, retryQuiz } from '../../Services/assessmentService';
import { updateSkillStatus } from '../../Services/roadmapService';
import ReportControl from '../../../component/ReportControl';
import {
  Card, CardHeader, Button, Loading, Empty, MicroLabel, StatusBox, StatStrip, type,
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

  const fetchResultData = useCallback(async () => {
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
  }, [resultId]);

  useEffect(() => {
    if (resultId) fetchResultData();
    else navigate('/assessment/result');
  }, [resultId, fetchResultData, navigate]);

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
        <Empty action={<Button onClick={() => navigate('/assessment/result')}>Back to results</Button>}>
          {error || 'This result could not be loaded.'}
        </Empty>
      </Card>
    );
  }

  const { confidence, impact, attempts } = resultData;
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
    givenAnswer: a.userAnswer,
    correctAnswer: a.correctAnswer,
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

          {/*
            How firmly the number is known. Four out of five and sixteen out
            of twenty are both 80% and are not the same claim — one more
            question either way moves the first by twenty points. Both used to
            be shown identically.
          */}
          {confidence && (
            <p
              style={{
                fontSize: 13.5,
                color: confidence.reliable ? 'var(--color-text-3)' : 'var(--color-amber)',
                lineHeight: 1.55,
                margin: '14px 0 0',
              }}
            >
              {confidence.note}
              {!confidence.reliable && confidence.interval && (
                <> The true level is somewhere around {confidence.interval.low}–{confidence.interval.high}%.</>
              )}
            </p>
          )}
        </div>
      </div>

      {/*
        What this result actually changed. The topic-to-skill mapping decided
        it and was never shown, so a learner saw a percentage and, out of
        sight, their skill profile moved and their roadmap did or did not get
        shorter.
      */}
      {impact?.summary && (
        <div style={{ padding: '0 34px 26px' }}>
          <div style={{ padding: '16px 18px', background: 'var(--color-surface-attn)', border: '1px solid var(--color-line)' }}>
            <MicroLabel size={10.5} tracking="0.13em" color="var(--color-text-4)" style={{ display: 'block', marginBottom: 8 }}>
              What this changes
            </MicroLabel>
            <p style={{ fontSize: 14.5, color: 'var(--color-text-2)', lineHeight: 1.6, margin: 0 }}>
              {impact.summary}
            </p>
            {(impact.notes || []).map((note) => (
              <p key={note} style={{ fontSize: 13.5, color: 'var(--color-text-3)', lineHeight: 1.55, margin: '8px 0 0' }}>
                {note}
              </p>
            ))}
          </div>
        </div>
      )}

      {/*
        One number with nothing to read it against is the least useful moment
        to show a score. Best is included as well as first, so a bad day does
        not read as having lost the skill.
      */}
      {attempts && (
        <div style={{ padding: '0 34px 26px' }}>
          <MicroLabel size={10.5} tracking="0.13em" color="var(--color-text-4)" style={{ display: 'block', marginBottom: 12 }}>
            {attempts.total} attempts on this topic
          </MicroLabel>
          <StatStrip
            items={[
              { label: attempts.viewing.isFirst ? 'First (this one)' : 'First', value: `${attempts.first.percentage}%` },
              { label: attempts.viewing.isBest ? 'Best (this one)' : 'Best', value: `${attempts.best.percentage}%` },
              { label: attempts.viewing.isLatest ? 'Latest (this one)' : 'Latest', value: `${attempts.latest.percentage}%` },
            ]}
          />
          <p style={{ fontSize: 13.5, color: 'var(--color-text-3)', lineHeight: 1.55, margin: '12px 0 0' }}>
            {attempts.changeFromFirst > 0
              ? `Up ${attempts.changeFromFirst} points since your first attempt.`
              : attempts.changeFromFirst < 0
                ? `Down ${Math.abs(attempts.changeFromFirst)} points from your first attempt — your best is still ${attempts.best.percentage}%.`
                : 'Level with your first attempt.'}
          </p>
        </div>
      )}

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

                {/* These questions are written by a model and can be wrong.
                    Without somewhere to say so, a bad one is scored against
                    the learner and nobody ever finds out it was bad. */}
                <div style={{ marginTop: 6 }}>
                  <ReportControl
                    compact
                    kind="question"
                    label="Report this question"
                    context={{
                      resultId,
                      topic: resultData.topic?.name,
                      difficulty: resultData.difficulty,
                      question: q.question,
                      givenAnswer: q.givenAnswer,
                      correctAnswer: q.correctAnswer,
                    }}
                  />
                </div>
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
        {/* Back to this instrument's own attempts, not the Overview. Landing
            on the whole dashboard after reading one result means finding your
            way back into the list to open the next one. */}
        <Button variant="secondary" onClick={() => navigate('/assessment/result')}>Back to results</Button>
        <Button onClick={handleRetry} loading={retrying} loadingLabel="Starting…">Retake</Button>
      </div>
    </Card>
  );
};

export default ResultPage;
