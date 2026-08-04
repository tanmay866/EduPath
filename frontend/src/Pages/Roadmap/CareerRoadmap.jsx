import React from 'react';
import { useNavigate } from 'react-router-dom';
import { EditorialShell, Button, MicroLabel, StatStrip, type } from '../../design';
import IndexRows from '../../component/marketing/IndexRows';
import { TRACKS } from '../Home/tracks';

/**
 * The roadmap explainer, on the §7 marketing index pattern.
 *
 * This was a landing page with a typewriter headline, drifting orbs and
 * colour-coded pills — §4 rules out motion, and §5 rules out the pills. It is
 * now a text page over ordinal rows, funnelling to the generator.
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

const CareerRoadmap = () => {
  const navigate = useNavigate();

  return (
    <EditorialShell>
      <section style={{ padding: '80px 0 0' }}>
        <MicroLabel size={11} tracking="0.14em" color="var(--color-text-4)" style={{ display: 'block', marginBottom: 16 }}>
          Roadmap
        </MicroLabel>

        <h1 style={{ ...type.marketingHeading, margin: '0 0 20px', maxWidth: 720 }}>
          A dated plan, not a reading list.
        </h1>

        <p style={{ ...type.prose, margin: '0 0 32px', maxWidth: 680 }}>
          Tell the generator where you are and where you want to be, and it produces a
          dependency-sorted sequence of skills with a week against each one. Finish something and
          the rest of the schedule moves.
        </p>

        <div style={{ display: 'flex', gap: 12, marginBottom: 40 }}>
          <Button onClick={() => navigate('/roadmap/generate')}>Generate a roadmap</Button>
          <Button
            variant="secondary"
            onClick={() => navigate('/roadmap/generate', { state: { openHistory: true } })}
          >
            My saved roadmaps
          </Button>
        </div>

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

        <div style={{ display: 'flex', gap: 12, marginTop: 40 }}>
          <Button onClick={() => navigate('/roadmap/generate')}>Start now</Button>
          <Button variant="secondary" onClick={() => navigate('/assessment-hub')}>
            Assess first
          </Button>
        </div>
      </section>
    </EditorialShell>
  );
};

export default CareerRoadmap;
