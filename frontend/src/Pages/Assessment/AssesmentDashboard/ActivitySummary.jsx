import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardFooterNote, Button, MicroLabel } from '../../../design';

/**
 * The rest of the product, on the page called Overview.
 *
 * The Overview covered assessments and the roadmap — two of the six things a
 * learner can do here. Mock interviews, coding practice, the resume and the
 * portfolio were each an island: you could finish a mock interview and
 * nothing outside that screen would ever mention it again.
 *
 * One line each, and the honest line when a thing has not been started. The
 * point is to say what exists and what does not, not to reproduce four
 * screens on a fifth.
 */
const ago = (iso) => {
  if (!iso) return null;
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 14) return `${days} days ago`;
  if (days < 60) return `${Math.round(days / 7)} weeks ago`;
  return `${Math.round(days / 30)} months ago`;
};

const Row = ({ label, state, detail, cta, to, last }) => {
  const navigate = useNavigate();
  return (
    <div
      style={{
        padding: '14px 24px',
        borderBottom: last ? 'none' : '1px solid var(--color-line-soft)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        flexWrap: 'wrap',
      }}
    >
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--color-ink)' }}>{label}</div>
        <p style={{ fontSize: 14, color: 'var(--color-text-3)', margin: '3px 0 0', lineHeight: 1.5 }}>
          {state}
          {detail && (
            <span style={{ color: 'var(--color-text-4)' }}>{` · ${detail}`}</span>
          )}
        </p>
      </div>
      <Button
        variant="secondary"
        style={{ flexShrink: 0, padding: '8px 16px', fontSize: 13.5 }}
        onClick={() => navigate(to)}
      >
        {cta}
      </Button>
    </div>
  );
};

const ActivitySummary = ({ activity }) => {
  if (!activity) return null;

  const { interview, practice, resume, portfolio, ats } = activity;

  const rows = [
    {
      label: 'Mock interview',
      state: interview.count
        ? `Last scored ${interview.lastScore}/10${interview.lastRole ? ` as ${interview.lastRole}` : ''}`
        : 'Not tried yet',
      detail: interview.count
        ? `${interview.count} ${interview.count === 1 ? 'interview' : 'interviews'} · ${ago(interview.lastAt)}`
        : null,
      cta: interview.count ? 'Again' : 'Try one',
      to: '/assessment-hub/mock-interview',
    },
    {
      label: 'Practice questions',
      state: practice.sessions
        ? `${practice.correct} of ${practice.attempted} correct`
        : 'Not tried yet',
      detail: practice.sessions
        ? `${practice.accuracy}% · ${ago(practice.lastAt)}`
        : null,
      cta: practice.sessions ? 'Again' : 'Try some',
      to: '/assessment-hub',
    },
    {
      label: 'ATS check',
      state: ats?.count
        ? `Last scored ${Math.round(ats.lastScore)}/100`
        : 'Not run yet',
      detail: ats?.count
        ? `${ats.count} ${ats.count === 1 ? 'check' : 'checks'} · ${ago(ats.lastAt)}`
        : null,
      cta: ats?.count ? 'Open' : 'Check one',
      to: '/ats-analyzer',
    },
    {
      label: 'Resume',
      state: resume.versions
        ? `${resume.versions} ${resume.versions === 1 ? 'version' : 'versions'} saved`
        : 'Not built yet',
      detail: resume.versions ? ago(resume.lastAt) : null,
      cta: resume.versions ? 'Open' : 'Build one',
      to: '/resume-builder',
    },
    {
      label: 'Portfolio',
      state: portfolio.exists ? 'Created' : 'Not created yet',
      detail: portfolio.exists
        ? [portfolio.username || null, ago(portfolio.lastAt)].filter(Boolean).join(' · ')
        : null,
      cta: portfolio.exists ? 'Open' : 'Create one',
      to: '/portfolio-generator',
    },
  ];

  return (
    <Card>
      <CardHeader
        label="Everything else"
        right={
          <MicroLabel size={10.5} tracking="0.13em" color="var(--color-text-4)">
            {`${rows.filter((r) => !r.state.startsWith('Not')).length} OF ${rows.length} STARTED`}
          </MicroLabel>
        }
      />
      {rows.map((r, i) => (
        <Row key={r.label} {...r} last={i === rows.length - 1} />
      ))}
      <CardFooterNote>
        Your assessments and roadmap are above. This is the rest of what your account has.
      </CardFooterNote>
    </Card>
  );
};

export default ActivitySummary;
