import React from 'react';
import { Link } from 'react-router-dom';
import { EditorialShell, MicroLabel, type } from '../../design';

/**
 * What this product stores, why, and how to get rid of it.
 *
 * Written from the schemas rather than from a template. Every collection
 * named here exists in backend/models, every third party named here is one
 * the code actually calls, and the deletion promise was checked by deleting
 * an account and looking for what survived. A privacy policy is the one page
 * where inventing a reassuring sentence is worse than saying nothing.
 *
 * It deliberately does not claim compliance with any particular regime. This
 * is a student project, saying so is more honest than implying a legal review
 * that has not happened, and nobody is helped by a page that asserts GDPR
 * standing it cannot demonstrate.
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

/** Each row is a real collection in backend/models. */
const STORED = [
  {
    what: 'Your account',
    detail:
      'Name, email address, phone number if you give one, and a login ID we generate. Your password is stored only as a hash — it cannot be read back, by us or by anyone who obtains the database.',
  },
  {
    what: 'What you told us you want',
    detail:
      'Target role, experience level, hours per week, preferred learning style, and any skills you list. This is what the roadmap is built from; without it there is nothing to schedule.',
  },
  {
    what: 'Assessments you sit',
    detail:
      'Every quiz attempt with its score, the questions asked and the answer you gave to each. The same for aptitude and CS fundamentals practice, and for mock interviews, which store your answers and the evaluation of them.',
  },
  {
    what: 'Your plans',
    detail:
      'Roadmaps including the ones a newer plan replaced, which skills you have marked done, and which weekly tasks you have ticked.',
  },
  {
    what: 'Documents you make here',
    detail:
      'Resumes you upload or generate, and portfolios you publish. A published portfolio is deliberately public — that is what publishing means — and anyone with the link can read it.',
  },
  {
    what: 'ATS checks',
    detail:
      'The score, the measured dimensions, the keywords found and missing, your resume’s filename and a short excerpt of the job posting. The text of your resume is not kept: it is read, scored and discarded.',
  },
  {
    what: 'Profile picture',
    detail: 'If you upload one, it is stored with Cloudinary rather than on our own servers.',
  },
];

/** Every one of these is called from the codebase. */
const THIRD_PARTIES = [
  ['MongoDB Atlas', 'Hosts the database. Everything above lives there.'],
  ['Cloudinary', 'Stores profile pictures and portfolio images.'],
  ['Brevo', 'Sends email — verification codes, password resets and the weekly plan if you leave it on.'],
  ['Hugging Face', 'Generates quiz questions and evaluates mock interview answers. The topic, difficulty and your answer are sent; your name and email are not.'],
  ['Render', 'Runs the server.'],
  ['Google Fonts', 'Serves the typefaces, which means Google sees the IP address of anyone loading a page.'],
];

const Privacy = () => (
  <EditorialShell>
    <section style={{ padding: '80px 0' }}>
      <MicroLabel size={11} tracking="0.14em" color="var(--color-text-4)" style={{ display: 'block', marginBottom: 16 }}>
        Privacy
      </MicroLabel>

      <h1 style={{ ...type.marketingHeading, margin: '0 0 12px', maxWidth: 720 }}>
        What we keep, and how to remove it.
      </h1>

      <MicroLabel size={11} tracking="0.12em" color="var(--color-text-4)" style={{ display: 'block', marginBottom: 32 }}>
        {`Last updated ${UPDATED}`}
      </MicroLabel>

      <Para>
        EduPath is a student project built at CHARUSAT University. It is not a company, there is no
        advertising on it, and nothing you put into it is sold or shared with anyone for marketing.
        This page lists what is actually stored, which is a shorter list than most products of this
        kind, and a longer one than a page of reassurance would suggest.
      </Para>

      <SubHeading>What is stored</SubHeading>
      <div style={{ maxWidth: 680, borderTop: '1px solid var(--color-line)' }}>
        {STORED.map((row) => (
          <div key={row.what} style={{ padding: '18px 0', borderBottom: '1px solid var(--color-line-soft)' }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-ink)', marginBottom: 6 }}>
              {row.what}
            </div>
            <p style={{ ...type.body, fontSize: 15.5, lineHeight: 1.6, margin: 0, color: 'var(--color-text-2)' }}>
              {row.detail}
            </p>
          </div>
        ))}
      </div>

      <SubHeading>What is not stored</SubHeading>
      <Para>
        No payment details, because nothing here is paid for. No cookies for advertising or
        analytics — your session is held in your browser&rsquo;s session storage and disappears when you
        close the tab. Your resume&rsquo;s text is read to score it and then discarded rather than
        saved. Passwords are never stored in a form anyone can read.
      </Para>

      <SubHeading>Who else sees it</SubHeading>
      <Para>
        Running this requires a handful of services, and each one sees a specific slice:
      </Para>
      <div style={{ maxWidth: 680, borderTop: '1px solid var(--color-line)' }}>
        {THIRD_PARTIES.map(([name, why]) => (
          <div
            key={name}
            style={{
              display: 'flex',
              gap: 20,
              padding: '14px 0',
              borderBottom: '1px solid var(--color-line-soft)',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ width: 150, fontSize: 15.5, fontWeight: 600, color: 'var(--color-ink)' }}>{name}</div>
            <p style={{ ...type.body, fontSize: 15.5, lineHeight: 1.6, margin: 0, flex: 1, minWidth: 240, color: 'var(--color-text-2)' }}>
              {why}
            </p>
          </div>
        ))}
      </div>

      <SubHeading>Deleting your account</SubHeading>
      <Para>
        Settings has a delete option. It asks for your password and your email address, because a
        stolen session should not be enough to destroy an account and there is nothing that undoes
        it. Everything above goes with it in one operation — roadmaps, assessments, interviews,
        practice, ATS checks, resumes, portfolios and the account itself — and the response tells
        you how many of each were removed.
      </Para>
      <Para>
        A published portfolio stops resolving at that point. If you have sent the link to someone,
        send them a new one.
      </Para>

      <SubHeading>Email</SubHeading>
      <Para>
        Verification codes and password resets are sent because you asked for them. The weekly plan
        email is the only one that arrives unprompted, it can be turned off in Settings, and every
        one of them carries an unsubscribe link that works without signing in.
      </Para>

      <SubHeading>How long things are kept</SubHeading>
      <Para>
        Until you delete them. The one exception is an abandoned quiz: a session you start and never
        finish is removed automatically a week after it expires.
      </Para>

      <SubHeading>Asking about any of this</SubHeading>
      <Para>
        Write to{' '}
        <a href="mailto:edupath.developers@gmail.com" style={{ color: 'var(--color-clay)' }}>
          edupath.developers@gmail.com
        </a>
        , or use the <Link to="/contact" style={{ color: 'var(--color-clay)' }}>contact page</Link>.
        This is a small project and the reply comes from a person.
      </Para>

      <Para style={{ color: 'var(--color-text-3)', fontSize: 15.5, marginTop: 40 }}>
        This page describes what the software does. It has not been reviewed by a lawyer and does
        not claim to satisfy any particular data protection regime — saying otherwise would be a
        claim we cannot demonstrate. See the{' '}
        <Link to="/terms" style={{ color: 'var(--color-clay)' }}>terms</Link> for the rest.
      </Para>
    </section>
  </EditorialShell>
);

export default Privacy;
