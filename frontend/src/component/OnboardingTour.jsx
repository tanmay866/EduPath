import React, { useState } from 'react';
import { Modal, Button, MicroLabel } from '../design';

/**
 * The one-time orientation shown on the assessment hub.
 *
 * It deliberately does not narrate what is already on screen — the hub and the
 * overview both already say that assessments feed the roadmap. These are the
 * things nothing else explains: that one role drives three different features,
 * which assessments follow it and which do not, that results are kept per role,
 * and that the Build section is a separate thing entirely.
 *
 * Built on the design system's Modal rather than a tour library: the visual
 * language here is specific, and anchored spotlights would need stable targets
 * across components that would break quietly whenever a layout moved.
 */
const STEPS = [
  {
    title: 'One role drives everything',
    body: (
      <>
        Your target role decides what the roadmap schedules, what the mock interview
        asks you, and which topics are suggested first. You pick it once — change it
        any time under <strong>Profile → Target role</strong>.
      </>
    ),
  },
  {
    title: 'Four assessments, two follow your role',
    body: (
      <>
        The <strong>Skill Assessment</strong> and <strong>AI Mock Interview</strong> are
        built around your role. <strong>Aptitude</strong> and <strong>CS Fundamentals</strong> are
        not, on purpose — reasoning and core computer science are the same whichever
        track you are on.
      </>
    ),
  },
  {
    title: 'Results become your plan',
    body: (
      <>
        What you get wrong is what the roadmap schedules first, so a low score is
        useful rather than embarrassing. Results are stored per role — switching
        tracks starts a fresh plan and keeps the old one for when you come back.
      </>
    ),
  },
  {
    title: 'Build is for when you are ready to apply',
    body: (
      <>
        <strong>Resume</strong>, <strong>ATS check</strong> and <strong>Portfolio</strong> in
        the sidebar sit outside the learning path. Nothing there depends on finishing
        your roadmap, so you can use them whenever you need them.
      </>
    ),
  },
];

const OnboardingTour = ({ open, onDismiss }) => {
  const [step, setStep] = useState(0);

  if (!open) return null;

  const isLast = step === STEPS.length - 1;
  const current = STEPS[step];

  // Any exit counts as done — dismissing with Escape or the backdrop and then
  // being asked again on the next visit would be nagging, not helpful.
  const finish = () => {
    setStep(0);
    onDismiss();
  };

  return (
    <Modal
      open={open}
      onClose={finish}
      title={current.title}
      actions={
        <>
          <Button variant="quiet" onClick={finish}>
            {isLast ? 'Close' : 'Skip'}
          </Button>
          {step > 0 && (
            <Button variant="secondary" onClick={() => setStep((s) => s - 1)}>
              Back
            </Button>
          )}
          <Button onClick={() => (isLast ? finish() : setStep((s) => s + 1))}>
            {isLast ? 'Got it' : 'Next'}
          </Button>
        </>
      }
    >
      <p style={{ margin: 0 }}>{current.body}</p>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 22 }}>
        {STEPS.map((s, i) => (
          <span
            key={s.title}
            style={{
              width: 22,
              height: 3,
              background: i <= step ? 'var(--color-ink)' : 'var(--color-line)',
              display: 'block',
            }}
          />
        ))}
        <MicroLabel size={10.5} tracking="0.13em" color="var(--color-text-4)" style={{ marginLeft: 6 }}>
          {`${step + 1} / ${STEPS.length}`}
        </MicroLabel>
      </div>
    </Modal>
  );
};

export default OnboardingTour;
