import React from 'react';
import { Link } from 'react-router-dom';
import { EditorialShell, MicroLabel, type } from '../../design';

/**
 * The terms, kept to what is true of this product.
 *
 * No arbitration clause, no governing-law section, no indemnity — this is a
 * student project with no company behind it, and boilerplate lifted from a
 * commercial template would be asserting relationships that do not exist.
 * What is here is the part that genuinely matters to someone using it: the
 * scores are estimates, the AI-written questions can be wrong, a published
 * portfolio is public, and the account can be closed from either side.
 */
const UPDATED = '7 August 2026';

const Para = ({ children, style }) => (
  <p style={{ ...type.body, fontSize: 17, lineHeight: 1.65, maxWidth: 680, margin: '0 0 20px', ...style }}>
    {children}
  </p>
);

const SubHeading = ({ children }) => (
  <h2
    style={{
      fontFamily: 'var(--font-display)',
      fontSize: 25,
      fontWeight: 500,
      letterSpacing: '-0.01em',
      color: 'var(--color-ink)',
      margin: '44px 0 16px',
    }}
  >
    {children}
  </h2>
);

const Terms = () => (
  <EditorialShell>
    <section style={{ padding: '80px 0' }}>
      <MicroLabel size={11} tracking="0.14em" color="var(--color-text-4)" style={{ display: 'block', marginBottom: 16 }}>
        Terms
      </MicroLabel>

      <h1 style={{ ...type.marketingHeading, margin: '0 0 12px', maxWidth: 720 }}>
        What you can expect, and what you cannot.
      </h1>

      <MicroLabel size={11} tracking="0.12em" color="var(--color-text-4)" style={{ display: 'block', marginBottom: 32 }}>
        {`Last updated ${UPDATED}`}
      </MicroLabel>

      <Para>
        EduPath is a student project built at CHARUSAT University. Using it means accepting what
        follows. It is short because there is not much to say: nothing here is paid for, nothing is
        sold, and the honest limits of the product matter more than a page of clauses.
      </Para>

      <SubHeading>Your account</SubHeading>
      <Para>
        One account per person, with a real email address, because that address is how a password
        reset reaches you. Keep the password to yourself — anyone holding it can read everything in
        the account and delete all of it. Tell us if you think someone else has it.
      </Para>

      <SubHeading>What the scores actually mean</SubHeading>
      <Para>
        Every number this product produces is an estimate, and it is worth being plain about how
        each one is arrived at. A roadmap&rsquo;s week count is arithmetic on the hours a curriculum
        assumes and the hours you said you have; it is not a prediction about you. An ATS score
        measures one resume against one job posting using four weighted dimensions — a different
        posting gives a different number, and no employer&rsquo;s real system is being consulted. A
        quiz score reflects the questions you happened to be asked.
      </Para>
      <Para>
        None of it is a qualification, a certification, or evidence of competence to show an
        employer. It is a tool for deciding what to study next.
      </Para>

      <SubHeading>Questions and feedback are generated</SubHeading>
      <Para>
        Quiz questions and mock interview evaluations come from a language model. It gets things
        wrong: a question can be badly worded, an answer marked correct can be arguable, and
        feedback on an interview answer is an opinion rather than a verdict. Treat it as practice.
        Where the roadmap itself is concerned no model is involved — the plan is built by ordinary
        code from a fixed curriculum, which is why the same inputs always produce the same plan.
      </Para>

      <SubHeading>What you upload</SubHeading>
      <Para>
        Your resume and the contents of your portfolio stay yours. Uploading them gives permission
        to process them for the thing you asked for — scoring a resume, publishing a portfolio —
        and nothing else. Do not upload anything that is not yours to upload, and do not put
        someone else&rsquo;s personal details into a portfolio you publish.
      </Para>

      <SubHeading>Publishing a portfolio</SubHeading>
      <Para>
        A published portfolio is public. It sits at a readable address anyone can open without an
        account, and it can be indexed by search engines like any other public page. That is the
        point of publishing; it is worth knowing before you put a phone number on one. Deleting the
        portfolio, or your account, stops the address resolving.
      </Para>

      <SubHeading>Fair use</SubHeading>
      <Para>
        Do not attempt to break the service, work around its limits, scrape it, or use it to store
        or distribute anything unlawful. Automated request limits exist and are there to keep the
        thing standing up for everyone else.
      </Para>

      <SubHeading>Availability</SubHeading>
      <Para>
        This runs on free hosting. It sleeps when idle, the first request after a quiet period is
        slow, and it can be down without warning or notice. There is no uptime commitment and there
        is no support obligation. Keep your own copy of anything you would be sorry to lose.
      </Para>

      <SubHeading>Ending it</SubHeading>
      <Para>
        You can delete your account at any time from Settings, and everything goes with it. An
        account may be closed from this side if it is being used to attack the service or to
        distribute something unlawful.
      </Para>

      <SubHeading>Changes</SubHeading>
      <Para>
        These terms can change as the product does. The date at the top says when they last did.
        Nothing here reaches back and changes what already happened to data you have already
        deleted.
      </Para>

      <Para style={{ color: 'var(--color-text-3)', fontSize: 15.5, marginTop: 40 }}>
        No lawyer has reviewed this page, and it deliberately carries no governing-law, arbitration
        or indemnity clauses — a student project asserting them would be describing a company that
        does not exist. What is stored and how to remove it is set out in the{' '}
        <Link to="/privacy" style={{ color: 'var(--color-clay)' }}>privacy policy</Link>. Questions
        go to{' '}
        <a href="mailto:edupath.developers@gmail.com" style={{ color: 'var(--color-clay)' }}>
          edupath.developers@gmail.com
        </a>
        .
      </Para>
    </section>
  </EditorialShell>
);

export default Terms;
