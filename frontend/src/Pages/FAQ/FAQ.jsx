import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { EditorialShell, Button, MicroLabel, type } from '../../design';

/**
 * Spec §7 Marketing · FAQ.
 *
 * Accordion rows separated by a bottom rule. The question is a 17px/500
 * full-row button at `padding: 20px 0` with a mono + / − at the right in 14px
 * text-3 — no chevron and no rotation, since §5 rules out both. The answer is
 * 15px text-2 with `padding-bottom: 20px` in a 680px measure.
 */
const SECTIONS = [
  {
    category: 'General',
    items: [
      {
        q: 'What is EduPath?',
        a: 'A career development platform that assesses where your skills are today, turns that into a dated learning roadmap, then helps you produce a resume and portfolio from the work you finish along the way.',
      },
      {
        q: 'Who is it for?',
        a: 'Students, recent graduates and working developers who know roughly what role they want but not what to study on Sunday night.',
      },
      {
        q: 'Is it free?',
        a: 'Yes. Assessments, roadmaps, the ATS check, the resume builder and the portfolio publisher are all free to use.',
      },
    ],
  },
  {
    category: 'Assessments',
    items: [
      {
        q: 'How does the assessment work?',
        a: 'You pick a topic and the questions are generated for that subject and level. Answers are scored immediately, and every question comes back with an explanation whether you got it right or not.',
      },
      {
        q: 'Can I retake one?',
        a: 'As often as you like. Every attempt is stored separately, so the history shows whether you are actually improving rather than only what you scored last.',
      },
      {
        q: 'How long does one take?',
        a: 'Most are 10 to 15 questions and run between five and fifteen minutes. There is a timer, and the quiz submits itself when it runs out.',
      },
      {
        q: 'Are the questions the same every time?',
        a: 'No. They are generated per session, so repeating a topic rarely gives you the same set twice.',
      },
    ],
  },
  {
    category: 'Roadmaps',
    items: [
      {
        q: 'What is in a roadmap?',
        a: 'Every skill in your chosen track, sorted so nothing appears before its prerequisite, with a week against each one sized to the hours you said you have. Marking a skill done reschedules everything after it.',
      },
      {
        q: 'How reliable is the AI?',
        a: 'The questions, roadmaps and resume feedback come from large language models, which makes them specific to you and occasionally wrong. Treat the output as a well-informed starting point, not a verdict — and tell us when it is off.',
      },
      {
        q: 'Can I generate a new one?',
        a: 'Yes, at any time. Your previous roadmaps stay in the history sidebar, so replacing one does not lose it.',
      },
    ],
  },
  {
    category: 'Account and privacy',
    items: [
      {
        q: 'How do I reset a forgotten password?',
        a: 'Use "Forgot password" on the sign-in page. A reset link goes to your registered address and is valid for a limited time.',
      },
      {
        q: 'How do I change my password?',
        a: 'Settings → Change password. You need your current password, and the new one has to meet the rules shown under the field.',
      },
      {
        q: 'Is my data safe?',
        a: 'Passwords are hashed rather than stored, and nothing is sold on. What we hold is your account, your attempts, your roadmaps and anything you have generated.',
      },
      {
        q: 'Can I delete my account?',
        a: 'Yes, from Settings. Deletion is immediate, not queued — your roadmaps, results, resumes and portfolios go with it. Portfolio sites you have already deployed are hosted separately and stay online until you take them down yourself.',
      },
    ],
  },
];

const Row = ({ q, a, open, onToggle }) => (
  <div style={{ borderBottom: '1px solid var(--color-line)' }}>
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        gap: 24,
        padding: '20px 0',
        background: 'none',
        border: 'none',
        borderRadius: 0,
        cursor: 'pointer',
        textAlign: 'left',
        fontFamily: 'var(--font-sans)',
        fontSize: 17,
        fontWeight: 500,
        color: 'var(--color-ink)',
      }}
    >
      <span>{q}</span>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--color-text-3)', flexShrink: 0 }}>
        {open ? '−' : '+'}
      </span>
    </button>

    {open && (
      <p style={{ fontSize: 15, lineHeight: 1.65, color: 'var(--color-text-2)', margin: 0, paddingBottom: 20, maxWidth: 680 }}>
        {a}
      </p>
    )}
  </div>
);

const FAQ = () => {
  const [openKey, setOpenKey] = useState('0-0');

  return (
    <EditorialShell>
      <section style={{ padding: '80px 0 0' }}>
        <MicroLabel size={11} tracking="0.14em" color="var(--color-text-4)" style={{ display: 'block', marginBottom: 16 }}>
          FAQ
        </MicroLabel>

        <h1 style={{ ...type.marketingHeading, margin: '0 0 40px', maxWidth: 720 }}>
          Questions people actually ask.
        </h1>

        {SECTIONS.map((section, si) => (
          <div key={section.category} style={{ marginBottom: 40 }}>
            <MicroLabel size={11} tracking="0.14em" color="var(--color-text-4)" style={{ display: 'block', marginBottom: 8 }}>
              {section.category}
            </MicroLabel>

            <div style={{ borderTop: '1px solid var(--color-ink)' }}>
              {section.items.map((item, ii) => {
                const key = `${si}-${ii}`;
                return (
                  <Row
                    key={key}
                    q={item.q}
                    a={item.a}
                    open={openKey === key}
                    onToggle={() => setOpenKey(openKey === key ? null : key)}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </section>

      <section style={{ padding: '0 0 80px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 32 }}>
        <p style={{ ...type.body, margin: 0, maxWidth: 460 }}>
          Not answered here? The contact form reaches a person, not a queue.
        </p>
        <Link to="/contact" style={{ textDecoration: 'none', flexShrink: 0 }}>
          <Button>Ask us</Button>
        </Link>
      </section>
    </EditorialShell>
  );
};

export default FAQ;
