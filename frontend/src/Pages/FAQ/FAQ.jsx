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
    category: 'Your role',
    items: [
      {
        q: 'What is a target role, and why does everything ask for it?',
        a: 'It is the job you are working towards, and it decides three things at once: what the roadmap schedules, what the mock interview asks you about, and which topics are suggested first in the skill assessment. You choose it once during setup and nothing asks you again.',
      },
      {
        q: 'Can I change my role later?',
        a: 'Profile → Target role, at any time. Results and roadmaps are stored per role, so switching starts a clean plan for the new track and leaves the old one untouched. Switch back and your previous progress is still there.',
      },
      {
        q: 'Why only six roles?',
        a: 'Each one has a real curriculum behind it — every skill, its prerequisites, an hour estimate and links to work from. A role without that would produce a plan with nothing in it, so we would rather offer six that work than twenty that do not.',
      },
      {
        q: 'What if none of the six is exactly my job title?',
        a: 'Pick the closest. The tracks are broad — "MERN Developer" covers most JavaScript web work, "Data Science Engineer" covers analysis and reporting. The assessment then narrows the plan to what you personally are missing, which matters more than the label.',
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
        q: 'There are four of them — do they all do the same thing?',
        a: 'No, and only some feed the plan. The Skill Assessment is the one that shapes your roadmap. Aptitude and CS Fundamentals are general reasoning and core computer science, deliberately not tied to a role, so they are practice rather than planning input. The mock interview scores how well you explain your work, which is reported beside your roadmap rather than folded into it.',
      },
      {
        q: 'What does the mock interview actually do?',
        a: 'It asks five questions for your role, one at a time, and you answer by speaking or typing. Each answer is scored out of ten with what worked and what to fix, and the whole session ends with an overall score and a recommendation. The questions change every time.',
      },
      {
        q: 'Does a bad score make my roadmap worse?',
        a: 'It makes it more useful. What you get wrong is what gets scheduled first and given the most time, so a low score is information rather than a penalty. Scoring well on a topic shortens or removes it from the plan.',
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
        q: 'Why is my roadmap so long?',
        a: 'Because it is measured in your hours, not in calendar time. A full track from scratch is a few hundred hours of study, so at ten hours a week that is most of a year — the same material at twenty hours a week is half that. Anything you already score well on is shortened or dropped entirely, so a plan built after a few assessments is usually much shorter than the full track.',
      },
      {
        q: 'What is the weekly plan?',
        a: 'The roadmap broken into weeks. Each one lists the skills it covers, the hours it assumes, specific tasks to work through, and sometimes a small project to apply what you have just learned. A week is marked done once every skill it covers is complete.',
      },
      {
        q: 'Does the learning style setting change anything?',
        a: 'Yes — it changes the tasks in each week. Reading works through documentation and written summaries, video follows a walkthrough and then rebuilds it unaided, projects build and extend something small, and mixed balances the three. Every style ends the week with a self-assessment.',
      },
      {
        q: 'How reliable is the AI?',
        a: 'It depends which part. The roadmap itself is not AI — the order comes from a fixed dependency graph and the timings from your available hours, so it is repeatable and can always be explained. Quiz questions, the mock interview and resume parsing do use language models, which makes them specific to you and occasionally wrong. Treat those as a well-informed starting point rather than a verdict, and tell us when one is off.',
      },
      {
        q: 'I took an assessment after generating my plan. Does it update itself?',
        a: 'Not on its own, but it tells you. The roadmap shows a notice when you have been assessed since it was built, with a button to rebuild it around your latest results.',
      },
      {
        q: 'Can I generate a new one?',
        a: 'Yes, at any time. Regenerating replaces the plan for your current role only — plans for other roles are kept — and your previous roadmaps stay in the history sidebar, so replacing one does not lose it.',
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
        q: 'Is my portfolio public?',
        a: 'Yes — publishing gives it a public URL that anyone with the link can open, which is the point of having one. Nothing else in your account is public: your scores, roadmaps and assessment history are only ever visible to you.',
      },
      {
        q: 'Why do I have to verify my email?',
        a: 'Because it is the only way back into the account if you forget your password, and the only address a deletion notice can reach. Until the code is entered the account cannot be used at all.',
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
      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 14,
          color: open ? 'var(--color-ink)' : 'var(--color-text-3)',
          flexShrink: 0,
          transition: 'color 120ms ease',
        }}
        aria-hidden="true"
      >
        {open ? '−' : '+'}
      </span>
    </button>

    {/* The answer used to be mounted and unmounted, so it appeared and
        vanished instantly — there is nothing for a transition to animate
        between when the element does not exist.

        It stays in the DOM now and the wrapper animates from 0fr to 1fr,
        which resolves to the answer's own height without anyone having to
        measure it or hard-code a max-height that would clip a long one.
        §5 caps state changes at 120ms; opening reveals a paragraph rather
        than recolouring a border, and at that speed it reads as a flicker,
        so this one runs longer. Reduced motion removes it entirely via the
        global rule in index.css. */}
    <div
      style={{
        display: 'grid',
        gridTemplateRows: open ? '1fr' : '0fr',
        transition: 'grid-template-rows 200ms cubic-bezier(0.3, 0, 0.2, 1)',
      }}
    >
      <div style={{ overflow: 'hidden' }}>
        <p
          style={{
            fontSize: 15,
            lineHeight: 1.65,
            color: 'var(--color-text-2)',
            margin: 0,
            paddingBottom: 20,
            maxWidth: 680,
            // Fades slightly behind the height so the text does not appear
            // to slide up out of the row above it.
            opacity: open ? 1 : 0,
            transition: 'opacity 160ms ease',
          }}
        >
          {a}
        </p>
      </div>
    </div>
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
