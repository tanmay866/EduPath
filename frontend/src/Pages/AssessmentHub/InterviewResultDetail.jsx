import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getInterviewResult } from '../Services/interviewResultService';
import {
  Card, CardHeader, CardFooterNote, Button, MicroLabel, Loading, Empty, type,
} from '../../design';

const Page = ({ children, width = 760 }) => (
  <div style={{ background: 'var(--color-paper)', minHeight: '100vh', padding: '48px 32px' }}>
    <div style={{ maxWidth: width, margin: '0 auto' }}>{children}</div>
  </div>
);

/** Interview scores run 0–10, not 0–100, so they get their own bands. */
const scoreTone = (score) =>
  score >= 8 ? 'var(--color-green)' : score >= 5 ? 'var(--color-amber)' : 'var(--color-clay)';

const PointList = ({ label, items, tone }) => (
  <div style={{ padding: '22px 34px', borderTop: '1px solid var(--color-line)' }}>
    <MicroLabel size={10.5} tracking="0.13em" style={{ display: 'block', marginBottom: 12 }}>
      {label}
    </MicroLabel>
    {items.map((item, i) => (
      <div key={i} style={{ display: 'grid', gridTemplateColumns: '10px 1fr', gap: 14, marginTop: i ? 10 : 0, alignItems: 'start' }}>
        <span style={{ width: 8, height: 8, marginTop: 7, background: tone, display: 'block' }} />
        <span style={{ fontSize: 14.5, color: 'var(--color-text-2)', lineHeight: 1.55 }}>{item}</span>
      </div>
    ))}
  </div>
);

/**
 * One past mock interview in full. The live post-interview screen only ever
 * showed the aggregate summary — it never re-displayed the per-question
 * feedback once you'd moved past it — so this adds a "Question by question"
 * card below the summary, matching how the other assessment result pages
 * show a full answer review rather than just the final score.
 */
const InterviewResultDetail = () => {
  const { resultId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    if (!token) navigate('/signin');
  }, [navigate]);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        setLoading(true);
        const response = await getInterviewResult(resultId);
        setData(response.data?.data);
        setError(null);
      } catch (err) {
        console.error('Failed to load interview result:', err);
        setError('This interview could not be loaded.');
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [resultId]);

  if (loading) {
    return <Page><Card><Loading label="Loading interview" /></Card></Page>;
  }

  if (error || !data) {
    return (
      <Page>
        <Card>
          <Empty action={<Button onClick={() => navigate('/assessment-hub/mock-interview/results')}>Back to results</Button>}>
            {error || 'This interview could not be loaded.'}
          </Empty>
        </Card>
      </Page>
    );
  }

  return (
    <Page width={1300}>
      <div style={{ marginBottom: 18 }}>
        <Button variant="quiet" onClick={() => navigate('/assessment-hub/mock-interview/results')}>Back to results</Button>
      </div>

      {/* Summary beside the per-question breakdown rather than above it —
          both are tall enough on their own that stacking them ran the page
          a long way down with the sides sitting empty. */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.1fr', gap: 22, alignItems: 'start' }}>
        <Card>
          <CardHeader
            label={data.role || 'Mock interview'}
            right={
              <MicroLabel size={11} tracking="0.1em" color={scoreTone(data.overallScore)}>
                {String(data.recommendation || '').replace(/_/g, ' ')}
              </MicroLabel>
            }
          />

          <div style={{ padding: 34, display: 'flex', gap: 40, alignItems: 'flex-start' }}>
            <div>
              <MicroLabel size={10.5} tracking="0.13em" color="var(--color-text-4)" style={{ display: 'block', marginBottom: 10 }}>
                Overall
              </MicroLabel>
              <span style={{ ...type.heroMetric, fontSize: 68, color: scoreTone(data.overallScore), display: 'block', lineHeight: 1 }}>
                {data.overallScore}
              </span>
            </div>

            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 15, color: 'var(--color-text-2)', lineHeight: 1.6, margin: 0 }}>
                {data.summary}
              </p>
            </div>
          </div>

          {data.topStrengths?.length > 0 && (
            <PointList label="Strengths" items={data.topStrengths} tone="var(--color-green)" />
          )}
          {data.areasToImprove?.length > 0 && (
            <PointList label="Work on" items={data.areasToImprove} tone="var(--color-clay)" />
          )}

          {data.advice && (
            <div style={{ padding: '22px 34px', borderTop: '1px solid var(--color-line)' }}>
              <MicroLabel size={10.5} tracking="0.13em" style={{ display: 'block', marginBottom: 10 }}>
                Before the next one
              </MicroLabel>
              <p style={{ fontSize: 15, color: 'var(--color-text-2)', lineHeight: 1.6, margin: 0 }}>
                {data.advice}
              </p>
            </div>
          )}

          <CardFooterNote>
            {data.createdAt
              ? new Date(data.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
              : ''}
          </CardFooterNote>
        </Card>

        {data.results?.length > 0 && (
          <Card>
            <CardHeader label="Question by question" />
            {data.results.map((r, i) => (
              <div
                key={i}
                style={{
                  padding: '20px 34px',
                  borderBottom: i === data.results.length - 1 ? 'none' : '1px solid var(--color-line-soft)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20 }}>
                  <div style={{ fontSize: 15, color: 'var(--color-ink)', lineHeight: 1.5, flex: 1 }}>
                    {r.question}
                  </div>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 14,
                      color: scoreTone(r.evaluation?.score ?? 0),
                      flexShrink: 0,
                    }}
                  >
                    {`${r.evaluation?.score ?? '—'}/10`}
                  </span>
                </div>
                {r.evaluation?.feedback && (
                  <p style={{ fontSize: 13.5, color: 'var(--color-text-3)', lineHeight: 1.55, margin: '8px 0 0' }}>
                    {r.evaluation.feedback}
                  </p>
                )}
              </div>
            ))}
          </Card>
        )}
      </div>
    </Page>
  );
};

export default InterviewResultDetail;
