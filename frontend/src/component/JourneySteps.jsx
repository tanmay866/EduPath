import React from 'react';
import { MicroLabel } from '../design';

/**
 * Where you are in creating an account.
 *
 * Signing up is three screens — details, then a code from an email, then the
 * questions the roadmap is built from — and each one used to arrive with no
 * indication that the others existed. Someone who has just handed over a
 * password has no way of knowing whether they are nearly done or have opened
 * something long, and onboarding in particular looks like an interruption
 * rather than the last step of the thing they started.
 *
 * Naming the steps also makes the email step legible. "Verify" on its own
 * reads as an obstacle; seen as the middle of three it reads as progress.
 */
// Not exported: a file mixing a component with a plain value loses fast
// refresh, and nothing outside needs the labels.
const JOURNEY_STEPS = ['Your details', 'Verify email', 'Set up'];

const Step = ({ label, index, current }) => {
  const done = index < current;
  const active = index === current;

  return (
    <li
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        // Only the step in hand is at full strength. Finished steps stay
        // legible rather than greying out, so the list reads as a route
        // travelled rather than as options switched off.
        color: active ? 'var(--color-ink)' : done ? 'var(--color-text-3)' : 'var(--color-text-4)',
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: 18,
          height: 18,
          flexShrink: 0,
          borderRadius: '50%',
          border: `1px solid ${active || done ? 'var(--color-ink)' : 'var(--color-line-btn)'}`,
          background: done ? 'var(--color-ink)' : 'transparent',
          color: 'var(--color-paper-light)',
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          lineHeight: '16px',
          textAlign: 'center',
        }}
      >
        {done ? '✓' : ''}
      </span>
      <MicroLabel size={10.5} tracking="0.11em" color="currentColor">
        {label}
      </MicroLabel>
    </li>
  );
};

/**
 * @param {number} current - zero-based index of the step being shown
 */
const JourneySteps = ({ current, style }) => (
  <nav aria-label="Account setup progress" style={{ marginBottom: 26, ...style }}>
    <ol
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '10px 18px',
        listStyle: 'none',
        margin: 0,
        padding: 0,
      }}
    >
      {JOURNEY_STEPS.map((label, index) => (
        <Step key={label} label={label} index={index} current={current} />
      ))}
    </ol>
    {/* The visual list is decorative repetition for a screen reader, which
        gets one sentence instead of three ambiguous list items. */}
    <p style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap' }}>
      Step {current + 1} of {JOURNEY_STEPS.length}: {JOURNEY_STEPS[current]}
    </p>
  </nav>
);

export default JourneySteps;
