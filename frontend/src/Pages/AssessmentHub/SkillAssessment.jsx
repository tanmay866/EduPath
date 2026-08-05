import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardFooterNote, Button, OrdinalRow, MicroLabel, type } from '../../design';

/**
 * A briefing page for the skills assessment — the same shape as §7
 * Instructions: a centred 760px card, a Newsreader heading, the facts as a
 * bordered group, the rules as clay ordinals, and the action in the footer.
 */
const FACTS = [
  { label: 'Format', value: 'Multiple choice' },
  { label: 'Length', value: '10–15 questions' },
  { label: 'Time', value: '20–30 min' },
  { label: 'Pass mark', value: '70%' },
];

const RULES = [
  {
    title: 'The questions are generated for your level',
    detail: 'Repeating a topic rarely gives you the same set twice, so a retake is a real second attempt.',
  },
  {
    title: 'You get an explanation either way',
    detail: 'Every answer comes back with the reasoning, whether you got it right or not.',
  },
  {
    title: 'The result feeds your roadmap',
    detail: 'What you miss becomes a priority in the plan rather than a line in a report you never open.',
  },
];

const SkillAssessment = () => {
  const navigate = useNavigate();

  return (
    <div style={{ background: 'var(--color-paper)', minHeight: '100vh', padding: '48px 32px' }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <div style={{ marginBottom: 18 }}>
          <Button variant="quiet" onClick={() => navigate('/assessment-hub')}>Back to the hub</Button>
        </div>

        <Card>
          <CardHeader label="Skill assessment" />

          <div style={{ padding: '34px 34px 26px' }}>
            <h1 style={{ ...type.cardHeading, margin: 0, color: 'var(--color-ink)' }}>
              Find out where your skills actually are.
            </h1>
            <p style={{ ...type.body, margin: '12px 0 0', maxWidth: 560 }}>
              Questions across the technical domains in your track, generated fresh at the level
              you pick. The score is less important than the breakdown — it is what the roadmap is
              built from.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', borderTop: '1px solid var(--color-line)', borderBottom: '1px solid var(--color-line)' }}>
            {FACTS.map((fact, i) => (
              <div
                key={fact.label}
                style={{ padding: '18px 22px', borderRight: i === FACTS.length - 1 ? 'none' : '1px solid var(--color-line)' }}
              >
                <MicroLabel size={10.5} tracking="0.13em" color="var(--color-text-3)" style={{ display: 'block', marginBottom: 8 }}>
                  {fact.label}
                </MicroLabel>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 15, color: 'var(--color-ink)' }}>
                  {fact.value}
                </span>
              </div>
            ))}
          </div>

          <div style={{ padding: '26px 34px 6px' }}>
            <MicroLabel size={10.5} tracking="0.13em" style={{ display: 'block', marginBottom: 18 }}>
              Before you start
            </MicroLabel>

            {RULES.map((rule, i) => (
              <div key={rule.title} style={{ marginBottom: 20 }}>
                <OrdinalRow ordinal={String(i + 1).padStart(2, '0')}>
                  <div style={{ fontSize: 15.5, fontWeight: 500, color: 'var(--color-ink)' }}>{rule.title}</div>
                  <p style={{ fontSize: 14, color: 'var(--color-text-3)', margin: '4px 0 0', lineHeight: 1.5 }}>
                    {rule.detail}
                  </p>
                </OrdinalRow>
              </div>
            ))}
          </div>

          <div style={{ padding: '18px 34px', borderTop: '1px solid var(--color-line)', display: 'flex', gap: 12 }}>
            <Button onClick={() => navigate('/assessment')}>Start the assessment</Button>
            <Button variant="secondary" onClick={() => navigate('/assessment-hub')}>Not now</Button>
          </div>

          <CardFooterNote>You can leave and retake it as often as you like — every attempt is kept.</CardFooterNote>
        </Card>
      </div>
    </div>
  );
};

export default SkillAssessment;
