import React from 'react';
import { Link } from 'react-router-dom';
import StartLink from '../../component/StartLink';
import { EditorialShell, Button, MicroLabel, type } from '../../design';
import IndexRows from '../../component/marketing/IndexRows';

/**
 * Spec §7 Marketing · index page — how EduPath works, step by step.
 *
 * This route used to be a placeholder reading "Explore our projects and
 * achievements", which described nothing the product does. It now carries the
 * four stages the landing page summarises, at the length they need.
 */
const STAGES = [
  {
    name: 'Assess',
    description:
      'Four instruments rather than one: a skills quiz you set to your own level, an aptitude test, CS fundamentals, and a spoken AI mock interview. The skills quiz is what the roadmap reads — the other three tell you where you stand without changing the plan, including the parts you would rather not know about.',
    stack: 'SKILL QUIZ · APTITUDE · CS FUNDAMENTALS · MOCK INTERVIEW',
    to: '/assessment-hub',
  },
  {
    name: 'Plan',
    description:
      'Your profile becomes a roadmap: every skill in the track, sorted so nothing is scheduled before its prerequisite, sized to the hours you said you have each week. Mark a skill done and everything after it moves. There is always exactly one thing that is current.',
    stack: 'DEPENDENCY SORTED · WEEKLY SCHEDULE · GAP REPORT',
    to: '/roadmap',
  },
  {
    name: 'Apply',
    description:
      'Build a resume from your details, then check it against a real job description. You get a match score and the metrics behind it, so you can see what the parser sees before a person does — and a PDF report you can keep.',
    stack: 'RESUME BUILDER · ATS CHECK · PDF REPORT',
    to: '/ats-analyzer',
  },
  {
    name: 'Ship',
    description:
      'A portfolio site, parsed from a resume you upload or filled in by hand, published at a URL you can put on an application. Deploy it to Vercel in one click if you want an address that outlives your EduPath account.',
    stack: '11 TEMPLATES · ONE-CLICK DEPLOY · PUBLIC URL',
    to: '/portfolio-generator',
  },
];

const Work = () => (
  <EditorialShell>
    <section style={{ padding: '80px 0 0' }}>
      <MicroLabel size={11} tracking="0.14em" color="var(--color-text-4)" style={{ display: 'block', marginBottom: 16 }}>
        How it works
      </MicroLabel>

      <h1 style={{ ...type.marketingHeading, margin: '0 0 20px', maxWidth: 720 }}>
        Four stages, in order, and none of them optional.
      </h1>

      <p style={{ ...type.prose, margin: '0 0 40px', maxWidth: 680 }}>
        You can skip ahead, but the output gets worse. The plan is only as good as the assessment
        under it, and the resume score is only meaningful against a description you actually intend
        to apply to.
      </p>

      <IndexRows rows={STAGES} />
    </section>

    <section style={{ padding: '56px 0 80px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 32, flexWrap: 'wrap' }}>
      <p style={{ ...type.body, margin: 0, maxWidth: 460 }}>
        The whole loop is free. Start at the assessment and your first roadmap appears on the next
        screen.
      </p>
      <div style={{ display: 'flex', gap: 12, flexShrink: 0 }}>
        <StartLink>
          <Button>Start now</Button>
        </StartLink>
        <Link to="/faq" style={{ textDecoration: 'none' }}>
          <Button variant="secondary">Read the FAQ</Button>
        </Link>
      </div>
    </section>
  </EditorialShell>
);

export default Work;
