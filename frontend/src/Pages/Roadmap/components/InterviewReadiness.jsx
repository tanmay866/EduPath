import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardFooterNote, Button, MicroLabel, type } from '../../../design';

/**
 * Where the mock interview score lands outside its own results page.
 *
 * The interview measures readiness for the role as a whole, not competence in
 * a particular skill — its output is prose, not skill names — so it is shown
 * as a role-level signal rather than folded into the roadmap's skill list,
 * which would mean inventing a mapping the data does not support.
 *
 * Scoped to the role the plan is for: a score earned while targeting another
 * track says nothing about readiness for this one.
 */
const scoreTone = (score) =>
  score >= 8 ? 'var(--color-green)' : score >= 5 ? 'var(--color-amber)' : 'var(--color-clay)';

const InterviewReadiness = ({ latest, role, loading }) => {
  const navigate = useNavigate();

  if (loading) return null;

  if (!latest) {
    return (
      <Card>
        <CardHeader label="Interview readiness" />
        <div style={{ padding: '20px 22px' }}>
          <p style={{ fontSize: 14.5, color: 'var(--color-text-2)', lineHeight: 1.55, margin: '0 0 16px' }}>
            {role
              ? `You have not sat a mock interview for ${role} yet. It scores how you explain your work, which the roadmap cannot measure.`
              : 'A mock interview scores how you explain your work, which the roadmap cannot measure.'}
          </p>
          <Button onClick={() => navigate('/assessment-hub/mock-interview')}>Take one</Button>
        </div>
      </Card>
    );
  }

  const score = latest.overallScore ?? 0;
  const weak = score < 6;

  return (
    <Card>
      <CardHeader
        label="Interview readiness"
        right={
          <MicroLabel size={10.5} tracking="0.1em" color={scoreTone(score)}>
            {String(latest.recommendation || '').replace(/_/g, ' ')}
          </MicroLabel>
        }
      />

      <div style={{ padding: '20px 22px', display: 'flex', alignItems: 'baseline', gap: 14 }}>
        <span style={{ ...type.heroMetric, fontSize: 42, color: scoreTone(score), lineHeight: 1 }}>
          {score}
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--color-text-4)' }}>/10</span>
        <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: 11.5, color: 'var(--color-text-4)' }}>
          {latest.createdAt
            ? new Date(latest.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
            : ''}
        </span>
      </div>

      <div style={{ padding: '0 22px 20px' }}>
        <p style={{ fontSize: 14, color: 'var(--color-text-3)', lineHeight: 1.55, margin: '0 0 14px' }}>
          {weak
            ? 'Worth another attempt once you have worked through more of the plan — the questions change each time.'
            : 'Sit another when you have covered more of the plan; the questions change each time.'}
        </p>
        <Button
          variant={weak ? 'attention' : 'secondary'}
          onClick={() => navigate('/assessment-hub/mock-interview')}
        >
          {weak ? 'Try again' : 'Interview again'}
        </Button>
      </div>

      <CardFooterNote>Measures how you explain your work, not whether a skill is ticked off.</CardFooterNote>
    </Card>
  );
};

export default InterviewReadiness;
