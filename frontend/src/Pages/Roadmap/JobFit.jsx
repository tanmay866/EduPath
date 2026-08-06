import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LearnerShell, Card, CardHeader, CardFooterNote, Button, MicroLabel,
  InlineMessage, Badge, Loading, type,
} from '../../design';
import { learnerNav, sessionInitials, sessionName, sessionLoginId } from '../../design/nav';
import { analyseJobPosting } from '../Services/roadmapService';

/**
 * Read a real job posting against the curriculum.
 *
 * The ATS check already parses a posting, but only to score a CV against it —
 * the answer is always "add these words to your resume". This asks the
 * question people actually arrive with: can I do this job, and if not, how far
 * off am I.
 *
 * The number that matters is the last one. "Eleven skills missing" is a list;
 * "twenty-two weeks at the hours you have" is a decision.
 */
const MAX = 20000;

const SkillList = ({ label, skills, tone }) => {
  if (!skills.length) return null;
  return (
    <div style={{ marginTop: 18 }}>
      <MicroLabel size={10.5} tracking="0.13em" color="var(--color-text-4)" style={{ display: 'block', marginBottom: 10 }}>
        {`${label} · ${skills.length}`}
      </MicroLabel>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {skills.map((s) => <Badge key={s} tone={tone}>{s}</Badge>)}
      </div>
    </div>
  );
};

const JobFit = () => {
  const navigate = useNavigate();
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const analyse = async () => {
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await analyseJobPosting(text);
      setResult(res.data);
    } catch (err) {
      setError(err?.message || 'That did not go through. Try again in a moment.');
    } finally {
      setLoading(false);
    }
  };

  const targetRole = sessionStorage.getItem('targetRole') || '';
  const differentTrack = result?.matched_role && targetRole && result.matched_role !== targetRole;

  return (
    <LearnerShell
      sections={learnerNav}
      eyebrow="Learn"
      title="Job fit"
      note={sessionName()}
      initials={sessionInitials()}
      footLabel={sessionLoginId()}
    >
      <Card>
        <CardHeader
          label="Paste a job posting"
          right={
            <MicroLabel size={10.5} color="var(--color-text-4)">
              {`${text.length}/${MAX}`}
            </MicroLabel>
          }
        />
        <div style={{ padding: '20px 24px' }}>
          <p style={{ ...type.body, margin: '0 0 14px', maxWidth: 640 }}>
            The whole advert, requirements and all. It is read against the six tracks to work out
            which one it is, what it asks for, and how much of that you already have.
          </p>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, MAX))}
            rows={10}
            placeholder="Paste the job description here"
            style={{
              width: '100%',
              padding: '13px 14px',
              fontSize: 15,
              fontFamily: 'var(--font-sans)',
              lineHeight: 1.55,
              color: 'var(--color-ink)',
              background: '#fff',
              border: '1px solid var(--color-line-input)',
              borderRadius: 0,
              outline: 'none',
              resize: 'vertical',
            }}
          />

          {error && <InlineMessage tone="error" style={{ marginTop: 16 }}>{error}</InlineMessage>}

          <div style={{ display: 'flex', gap: 12, marginTop: 18, flexWrap: 'wrap' }}>
            <Button onClick={analyse} loading={loading} loadingLabel="Reading…" disabled={text.trim().length < 20}>
              Read this posting
            </Button>
            {text && (
              <Button variant="quiet" onClick={() => { setText(''); setResult(null); setError(''); }}>
                Clear
              </Button>
            )}
          </div>
        </div>
      </Card>

      {loading && <Card><Loading label="Reading the posting" /></Card>}

      {result && !result.matched_role && (
        <Card>
          <CardHeader label="Nothing to match" />
          <div style={{ padding: '22px 24px' }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-ink)' }}>
              This posting does not name any skill EduPath teaches.
            </div>
            <p style={{ ...type.body, margin: '8px 0 0', maxWidth: 620 }}>
              That usually means it is light on specifics, or it is for a field outside the six
              tracks. Saying it matches a track anyway would be a guess dressed up as an answer.
            </p>
          </div>
        </Card>
      )}

      {result?.matched_role && (
        <Card>
          <CardHeader
            label="What this posting needs"
            right={
              <MicroLabel size={10.5} tracking="0.13em" color="var(--color-text-4)">
                {`${Math.round(result.confidence * 100)}% OF THE TRACK`}
              </MicroLabel>
            }
          />

          <div style={{ padding: '22px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
              <span style={{ ...type.cardHeading, color: 'var(--color-ink)' }}>
                {result.matched_role}
              </span>
              {differentTrack && <Badge tone="muted">not your current track</Badge>}
            </div>

            <SkillList label="You already have" skills={result.already_have} tone="green" />
            <SkillList label="Still to learn" skills={result.missing} tone="muted" />

            {/* The figure the whole page exists to produce. */}
            <div
              style={{
                marginTop: 24,
                paddingTop: 18,
                borderTop: '1px solid var(--color-line)',
                display: 'flex',
                alignItems: 'baseline',
                gap: 14,
                flexWrap: 'wrap',
              }}
            >
              {result.missing.length === 0 ? (
                <span style={{ fontSize: 17, fontWeight: 600, color: 'var(--color-green)' }}>
                  You already have everything this posting names.
                </span>
              ) : (
                <>
                  <span style={{ ...type.heroMetric, fontSize: 40, color: 'var(--color-ink)', lineHeight: 1 }}>
                    {result.weeks_to_ready}
                  </span>
                  <span style={{ fontSize: 15.5, color: 'var(--color-text-2)' }}>
                    {`weeks from applying, at the hours on your profile (${result.hours_to_ready}h of study).`}
                  </span>
                </>
              )}
            </div>
          </div>

          <div style={{ padding: '4px 24px 20px', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {differentTrack ? (
              <Button onClick={() => navigate('/profile')}>{`Switch to ${result.matched_role}`}</Button>
            ) : (
              <Button onClick={() => navigate('/roadmap/generate')}>Open my plan</Button>
            )}
            <Button variant="secondary" onClick={() => navigate('/assessment-hub/skill')}>
              Assess these skills
            </Button>
          </div>

          <CardFooterNote>
            {differentTrack
              ? `Your plan is for ${targetRole}. Changing track in Profile builds a plan for this one instead, and keeps the old one in history.`
              : 'Anything you can already do is left out of the estimate. Assessing first usually shortens it further.'}
          </CardFooterNote>
        </Card>
      )}
    </LearnerShell>
  );
};

export default JobFit;
