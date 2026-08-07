import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EditorialShell, Button, MicroLabel, StatStrip, type } from '../../design';
import IndexRows from '../../component/marketing/IndexRows';
import { TRACKS, TRACK_PACE_HOURS, TRACK_PACE_LEVEL } from '../Home/tracks';

/**
 * The roadmap explainer, on the §7 marketing index pattern.
 *
 * This was a landing page with a typewriter headline, drifting orbs and
 * colour-coded pills — §4 rules out motion, and §5 rules out the pills. It is
 * now a text page over ordinal rows, funnelling to the generator.
 *
 * The nav sends everyone here, including people who already have a plan, so
 * the actions at the top follow the session: a returning learner is offered
 * their roadmap rather than a pitch for one.
 */
const STEPS = [
  {
    name: 'Tell us where you are',
    description:
      'Your target role, the skills you already have, your experience level and the hours you can give it each week. The last one matters most: a plan sized for time you do not have is a plan you abandon.',
  },
  {
    name: 'The gap becomes a sequence',
    description:
      'Your skills are compared against the target role, and what is missing is sorted so nothing appears before its prerequisite. Each skill gets a week, and each has a small project attached.',
  },
  {
    name: 'Work through it and mark things done',
    description:
      'There is always exactly one current skill. Marking it complete moves everything after it and updates the gap report by category.',
  },
  {
    name: 'Keep every version',
    description:
      'Generated roadmaps are saved to your history. Switch between them or generate a new one when your target changes — the old one does not disappear.',
  },
];

const FIGURES = [
  { label: 'Role tracks', value: 6 },
  { label: 'Experience levels', value: 3 },
  { label: 'Cost', value: 'Free' },
];

const isSignedIn = () => Boolean(sessionStorage.getItem('token'));

const CareerRoadmap = () => {
  const navigate = useNavigate();
  const [signedIn, setSignedIn] = useState(isSignedIn);

  useEffect(() => {
    const read = () => setSignedIn(isSignedIn());
    window.addEventListener('storage', read);
    window.addEventListener('sessionStorageUpdated', read);
    return () => {
      window.removeEventListener('storage', read);
      window.removeEventListener('sessionStorageUpdated', read);
    };
  }, []);

  return (
    <EditorialShell>
      <section style={{ padding: '80px 0 0' }}>
        <MicroLabel size={11} tracking="0.14em" color="var(--color-text-4)" style={{ display: 'block', marginBottom: 16 }}>
          Roadmap
        </MicroLabel>

        <h1 style={{ ...type.marketingHeading, margin: '0 0 20px', maxWidth: 720 }}>
          A schedule, not a reading list.
        </h1>

        <p style={{ ...type.prose, margin: '0 0 32px', maxWidth: 680 }}>
          Tell the generator where you are and where you want to be, and it produces a
          dependency-sorted sequence of skills with a week against each one. Finish something and
          the rest of the schedule moves.
        </p>

        <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
          <Button onClick={() => navigate('/roadmap/plan')}>
            {signedIn ? 'Open my roadmap' : 'Generate a roadmap'}
          </Button>
          <Button
            variant="secondary"
            onClick={() => navigate('/roadmap/plan', { state: { openHistory: true } })}
          >
            My saved roadmaps
          </Button>
        </div>

        {/* The single most useful thing this page can tell someone, and it did
            not say it anywhere: the plan is the whole track until an
            assessment cuts it down. */}
        <p style={{ ...type.prose, margin: '0 0 40px', maxWidth: 680, color: 'var(--color-text-3)' }}>
          Generate one whenever you like — but take the skill assessment first if you can. Anything
          you already score well on is shortened or dropped, which is usually the difference between
          a plan of months and a plan of a year. Without it the generator assumes you are starting
          from the beginning.
        </p>

        <StatStrip items={FIGURES} style={{ marginBottom: 56 }} />

        <MicroLabel size={11} tracking="0.14em" color="var(--color-text-4)" style={{ display: 'block', marginBottom: 8 }}>
          How it works
        </MicroLabel>
        <IndexRows rows={STEPS} />
      </section>

      <section style={{ padding: '56px 0 80px' }}>
        <MicroLabel size={11} tracking="0.14em" color="var(--color-text-4)" style={{ display: 'block', marginBottom: 8 }}>
          Supported roles
        </MicroLabel>

        <IndexRows
          rows={TRACKS.map((track) => ({
            name: track.name,
            description: track.summary,
            stack: track.stack,
            meta: `${track.weeks} WKS`,
          }))}
        />

        {/* Weeks are not a property of a track — they fall out of hours per
            week and experience. Quoted bare, as they were here, they read as
            fixed. The landing page and the tracks index state the same pace
            from the same constants. */}
        <p style={{ fontSize: 13.5, color: 'var(--color-text-4)', margin: '14px 0 0', maxWidth: 680 }}>
          {`Week counts assume ${TRACK_PACE_HOURS} h/week from ${TRACK_PACE_LEVEL}. Fewer hours stretches the plan rather than breaking it, and anything you already know is not scheduled at all.`}
        </p>

        <div style={{ display: 'flex', gap: 12, marginTop: 40, flexWrap: 'wrap' }}>
          {/* Assessing is the recommended order, so it leads here rather than
              sitting second to a button that repeats the one at the top.

              Signed in, the roadmap button is already at the top of the page —
              a second one here would be the same words twice on one screen, so
              the closing action is just the recommended one. */}
          <Button onClick={() => navigate('/assessment-hub')}>Take the skill assessment</Button>
          {!signedIn && (
            <Button variant="secondary" onClick={() => navigate('/roadmap/plan')}>
              Skip and generate a plan
            </Button>
          )}
        </div>
      </section>
    </EditorialShell>
  );
};

export default CareerRoadmap;
