import React from 'react';
import { Link } from 'react-router-dom';
import StartLink from '../../component/StartLink';
import { useStaggeredReveal } from '../../hooks/useStaggeredReveal';
import { Card, Button, MicroLabel, StatusBox, LabelledBar, type } from '../../design';
import { TRACKS, TRACK_PACE_HOURS, TRACK_PACE_LEVEL } from './tracks';

/**
 * Spec §7 Marketing · landing, following the composition in
 * design_handoff_edupath_redesign/EduPath - New Design.dc.html: a hero holding
 * a live roadmap console, a six-track typographic index, a four-step strip, an
 * outcomes section, an ink quote band and a closing call to action.
 *
 * Sections are divided by rules, never by a change of background, so the page
 * reads as one sheet. The console is a still — it shows the roadmap screen a
 * learner actually gets, so its numbers stay consistent with that screen
 * rather than animating.
 */

const SectionHeading = ({ children, size = 38, style }) => (
  <h2
    style={{
      fontFamily: 'var(--font-display)',
      fontSize: size,
      fontWeight: 400,
      letterSpacing: '-0.025em',
      lineHeight: 1.1,
      margin: 0,
      color: 'var(--color-ink)',
      ...style,
    }}
  >
    {children}
  </h2>
);

const HeroStat = ({ value, label }) => (
  <div>
    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 28, color: 'var(--color-ink)', lineHeight: 1 }}>
      {value}
    </div>
    <div style={{ fontSize: 12.5, color: 'var(--color-text-4)', marginTop: 6 }}>{label}</div>
  </div>
);

/* ── The roadmap console in the hero ────────────────────────────────────── */
const CONSOLE_WEEKS = [38, 52, 44, 70, 61, 80, 47];
// Weeks in the track, for the axis. The chart itself draws a fixed number of
// slots rather than 55 hair-thin ones — the filled share matches progress
// (week 21 of 55) so the picture and the figures agree.
const CONSOLE_TOTAL = 49;
const CONSOLE_SLOTS = 25;

const ConsoleCell = ({ value, unit, label, tone }) => (
  <div style={{ padding: '16px 18px', borderRight: '1px solid var(--color-line)' }}>
    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 23, color: tone || 'var(--color-ink)', lineHeight: 1 }}>
      {value}
      {unit && <span style={{ fontSize: 13, color: 'var(--color-text-4)' }}>{unit}</span>}
    </div>
    <div style={{ fontSize: 11, color: 'var(--color-text-4)', marginTop: 5 }}>{label}</div>
  </div>
);

const ConsoleRow = ({ status, title, tag, tone, current = false }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      padding: current ? '12px 20px' : '11px 0',
      margin: current ? '0 -20px' : 0,
      background: current ? 'var(--color-surface-attn)' : 'transparent',
      borderTop: current ? '1px solid var(--color-line)' : 'none',
      borderBottom: `1px solid ${current ? 'var(--color-line)' : 'var(--color-line-soft)'}`,
    }}
  >
    <StatusBox status={status} size={8} />
    <span style={{ flex: 1, fontSize: 13.5, fontWeight: current ? 600 : 400, color: tone || 'var(--color-ink)' }}>
      {title}
    </span>
    <MicroLabel size={11} tracking="0.06em" color={tone || 'var(--color-green)'}>{tag}</MicroLabel>
  </div>
);

const RoadmapConsole = () => (
  <div className="home-console" style={{ padding: 36, background: 'var(--color-paper)', borderLeft: '1px solid var(--color-line)' }}>
    <Card style={{ border: '1px solid var(--color-line-btn)' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          padding: '14px 20px',
          borderBottom: '1px solid var(--color-line)',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <MicroLabel size={10} tracking="0.12em" color="var(--color-text-4)">Roadmap</MicroLabel>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-ink)' }}>
            MERN Developer · 49 weeks
          </span>
        </span>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color: 'var(--color-green)',
            border: '1px solid var(--color-green)',
            padding: '3px 8px',
          }}
        >
          ON TRACK
        </span>
      </div>

      <div className="home-console__cells" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', borderBottom: '1px solid var(--color-line)' }}>
        {/* The four cells the roadmap screen actually shows. This used to
            display hours-this-week, a day streak and a projected date, none
            of which the product tracks — under a caption claiming it was the
            real screen. */}
        <ConsoleCell value="14" label="total skills" />
        <ConsoleCell value="4" label="completed" />
        <ConsoleCell value="10" label="remaining" tone="var(--color-amber)" />
        <ConsoleCell value="49" label="est. weeks" />
      </div>

      <div style={{ padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 5, height: 88, marginBottom: 8 }}>
          {CONSOLE_WEEKS.map((h, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: `${h}%`,
                background: i === CONSOLE_WEEKS.length - 1 ? 'var(--color-amber)' : 'var(--color-green)',
              }}
            />
          ))}
          {Array.from({ length: CONSOLE_SLOTS - CONSOLE_WEEKS.length }).map((_, i) => (
            <div key={`e${i}`} style={{ flex: 1, height: 2, background: 'var(--color-line)' }} />
          ))}
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            color: 'var(--color-text-4)',
            paddingBottom: 18,
            borderBottom: '1px solid var(--color-line)',
          }}
        >
          <span>W1</span><span>W16</span><span>W32</span><span>W49</span>
        </div>

        {/* Skill names exactly as the MERN template defines them. */}
        <ConsoleRow status="done" title="Node.js Basics" tag="Done" />
        <ConsoleRow status="done" title="ES6+ & Modern JS" tag="Done" />
        <ConsoleRow
          status="current"
          title="Express.js"
          tag="Week 13"
          tone="var(--color-amber)"
          current
        />
        <ConsoleRow status="future" title="Async JS (Promises, async/await)" tag="Week 17" tone="var(--color-text-4)" />
        <ConsoleRow status="future" title="React Basics" tag="Week 20" tone="var(--color-text-4)" />
      </div>
    </Card>

    <p style={{ margin: '14px 0 0', fontSize: 12, lineHeight: 1.55, color: 'var(--color-text-4)' }}>
      A MERN roadmap part-way through, at 10 h/week. The figures are the ones this screen really shows.
    </p>
  </div>
);

/* ── Steps ──────────────────────────────────────────────────────────────── */
const STEPS = [
  {
    kicker: '01 — Assess',
    title: 'Four instruments',
    body: 'A skills quiz at the level you pick, an aptitude test, CS fundamentals and a spoken AI mock interview. The skills quiz is the one your plan is built from.',
  },
  {
    kicker: '02 — Plan',
    title: 'Dependency sorted',
    body: 'Nothing is scheduled before its prerequisite is done, and nothing is scheduled into hours you do not have.',
  },
  {
    kicker: '03 — Apply',
    title: 'Scored, not guessed',
    body: 'Your resume is checked against the job description you paste in, and told what is missing from it.',
  },
  {
    kicker: '04 — Ship',
    title: 'A live URL',
    body: 'Upload a resume and a portfolio site is built from it, then published at a URL you can send someone.',
  },
];

const GAP_REPORT = [
  { label: 'Frontend', value: 88, tone: 'navy' },
  { label: 'Backend', value: 62, tone: 'navy' },
  { label: 'Databases', value: 31, tone: 'clay' },
  { label: 'Testing', value: 18, tone: 'clay' },
];

const OutcomeCard = ({ label, children, note }) => (
  <Card style={{ border: '1px solid var(--color-line-btn)' }}>
    <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--color-line)' }}>
      <MicroLabel size={10} tracking="0.12em" color="var(--color-text-4)">{label}</MicroLabel>
    </div>
    <div style={{ padding: '22px 20px' }}>
      {children}
      <p style={{ margin: '16px 0 0', fontSize: 13, lineHeight: 1.6, color: 'var(--color-text-2)' }}>{note}</p>
    </div>
  </Card>
);

const mern = TRACKS.find((t) => t.name === 'MERN Developer');

const Home = () => {
  // The six roles arrive one after another as the list scrolls in. The rows
  // stay visible if the reveal cannot run, so this can only ever add motion,
  // never remove content.
  const trackListRef = useStaggeredReveal({ selector: '.reveal-row' });

  return (
    <div style={{ background: 'var(--color-surface)' }}>
    {/* ── Hero ── */}
    <section className="home-hero" style={{ display: 'grid', gridTemplateColumns: '1fr 620px', borderBottom: '1px solid var(--color-ink)' }}>
      <div className="home-hero__copy" style={{ padding: '76px 44px 68px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <MicroLabel size={11} tracking="0.14em" color="var(--color-clay)" style={{ display: 'block', marginBottom: 24 }}>
          Assess · Plan · Apply · Ship
        </MicroLabel>

        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 62,
            fontWeight: 300,
            lineHeight: 1.04,
            letterSpacing: '-0.03em',
            color: 'var(--color-ink)',
            margin: '0 0 24px',
          }}
        >
          Your skills, measured.<br />Your path, scheduled.
        </h1>

        <p style={{ margin: '0 0 34px', fontSize: 17, lineHeight: 1.65, color: 'var(--color-text-2)', maxWidth: 460 }}>
          One assessment produces a week-by-week plan and a gap report against the role you want.
          Everything reschedules itself as you finish work.
        </p>

        <div className="home-hero__actions" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Link to="/assessment-hub" style={{ textDecoration: 'none' }}>
            <Button style={{ padding: '15px 26px', fontSize: 14.5 }}>Take the assessment</Button>
          </Link>
          <Link to="/roadmap" style={{ textDecoration: 'none' }}>
            <Button variant="secondary" style={{ padding: '14px 24px', fontSize: 14.5 }}>See a sample roadmap</Button>
          </Link>
        </div>

        <div className="home-hero__stats" style={{ marginTop: 44, paddingTop: 26, borderTop: '1px solid var(--color-line)', display: 'flex', gap: 52 }}>
          <HeroStat value="6" label="role tracks" />
          <HeroStat value="4" label="assessment instruments" />
          <HeroStat value="1" label="click to publish a portfolio" />
        </div>
      </div>

      <RoadmapConsole />
    </section>

    {/* ── Track index ── */}
    <section>
      <div className="home-sectionhead" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '52px 44px 26px', gap: 32 }}>
        <SectionHeading>Six roles. Pick a destination.</SectionHeading>
        <span style={{ fontSize: 13.5, color: 'var(--color-text-2)', maxWidth: 380, textAlign: 'right' }}>
          Not sure? Pick the closest — the tracks are broad, and you can change it in your profile later.
          {/* Weeks fall out of hours per week, so the pace is stated rather
              than a bare number being quoted as if it were fixed. Anything
              already known drops the count — the plan only schedules gaps. */}
          <span style={{ display: 'block', color: 'var(--color-text-4)', marginTop: 6 }}>
            {`Durations assume ${TRACK_PACE_HOURS} h/week from ${TRACK_PACE_LEVEL}. What you already know is not scheduled.`}
          </span>
        </span>
      </div>

      <div ref={trackListRef} style={{ borderTop: '1px solid var(--color-ink)' }}>
        {/* Read-only. Every row used to link to /services, which is the same
            six tracks again at more length — so the list invited a click that
            went nowhere new, and Tracks is already in the top bar for anyone
            who wants the longer version. The arrow went with the link, since
            an arrow that does nothing is the same promise in a smaller font. */}
        {TRACKS.map((track, i) => (
          <div
            key={track.name}
            className="home-track reveal-row"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 32,
              padding: '24px 44px',
              borderBottom: i === TRACKS.length - 1 ? '1px solid var(--color-ink)' : '1px solid var(--color-line)',
            }}
          >
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-text-4)', width: 28 }}>
              {String(i + 1).padStart(2, '0')}
            </span>
            <span
              className="home-track__name"
              style={{
                flex: 1,
                minWidth: 0,
                fontFamily: 'var(--font-display)',
                fontSize: 32,
                fontWeight: 400,
                letterSpacing: '-0.02em',
                color: 'var(--color-ink)',
              }}
            >
              {track.name}
            </span>
            <span className="home-track__stack" style={{ fontSize: 13.5, color: 'var(--color-text-2)', width: 300 }}>{track.stack}</span>
            <span className="home-track__meta" style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--color-text-2)', width: 70, textAlign: 'right' }}>
              {`${track.weeks} wks`}
            </span>
            <span className="home-track__meta" style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--color-text-2)', width: 70, textAlign: 'right' }}>
              {`${track.nodes} nodes`}
            </span>
          </div>
        ))}
      </div>
    </section>

    {/* ── Four steps ── */}
    <section className="home-steps" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', borderBottom: '1px solid var(--color-line)' }}>
      {STEPS.map((step, i) => (
        <div
          key={step.kicker}
          style={{ padding: '40px 32px', borderRight: i === STEPS.length - 1 ? 'none' : '1px solid var(--color-line)' }}
        >
          <MicroLabel size={11} tracking="0.12em" color="var(--color-clay)" style={{ display: 'block', marginBottom: 16 }}>
            {step.kicker}
          </MicroLabel>
          <h3
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 23,
              fontWeight: 400,
              letterSpacing: '-0.02em',
              color: 'var(--color-ink)',
              margin: '0 0 10px',
            }}
          >
            {step.title}
          </h3>
          <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.65, color: 'var(--color-text-2)' }}>{step.body}</p>
        </div>
      ))}
    </section>

    {/* ── What you leave with ── */}
    <section style={{ padding: '56px 44px', background: 'var(--color-paper)' }}>
      <SectionHeading style={{ marginBottom: 8 }}>What you leave with</SectionHeading>
      <p style={{ margin: '0 0 32px', fontSize: 15, color: 'var(--color-text-2)', maxWidth: 520 }}>
        Three artefacts: two you can send someone, and one that tells you whether you are ready to.
      </p>

      <div className="home-outcomes" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
        <OutcomeCard
          label="01 · Resume"
          note="Scored against the description you paste in, so you can see what the parser sees before a person does."
        >
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 16 }}>
            <span style={{ ...type.heroMetric, fontSize: 44, color: 'var(--color-ink)', lineHeight: 1 }}>85</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--color-green)' }}>↑ from 71</span>
          </div>
        </OutcomeCard>

        <OutcomeCard
          label="02 · Portfolio"
          note="Built from your uploaded resume or filled in by hand, published at its own URL, with an optional push to Vercel."
        >
          <div style={{ border: '1px solid var(--color-line)' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 7,
                padding: '8px 10px',
                borderBottom: '1px solid var(--color-line)',
                background: 'var(--color-surface-current)',
              }}
            >
              <StatusBox status="done" size={6} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--color-text-2)' }}>
                edupath.dev/you
              </span>
            </div>
            <div style={{ padding: '14px 12px' }}>
              <div style={{ height: 8, width: '52%', background: 'var(--color-ink)', marginBottom: 8 }} />
              <div style={{ height: 5, width: '78%', background: 'var(--color-line)', marginBottom: 5 }} />
              <div style={{ height: 5, width: '64%', background: 'var(--color-line)', marginBottom: 12 }} />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                <div style={{ height: 30, background: 'var(--color-paper)' }} />
                <div style={{ height: 30, background: 'var(--color-paper)' }} />
                <div style={{ height: 30, background: 'var(--color-paper)' }} />
              </div>
            </div>
          </div>
        </OutcomeCard>

        <OutcomeCard
          label="03 · Gap report"
          note="Where you stand against the role today, redrawn every time you take an assessment."
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
            {GAP_REPORT.map((row) => (
              <LabelledBar
                key={row.label}
                label={row.label}
                value={row.value}
                display={`${row.value}%`}
                max={100}
                tone={row.tone}
              />
            ))}
          </div>
        </OutcomeCard>
      </div>
    </section>

    {/* ── Quote band ── */}
    <section
      style={{
        background: 'var(--color-ink)',
        padding: '64px 44px',
        display: 'grid',
        gridTemplateColumns: '1fr 340px',
        gap: 64,
        alignItems: 'center',
      }}
      className="home-band"
    >
      {/* This band carried a quote attributed to "a learner on the Data
          Science Engineer track, week 14 of 20". There is no such learner —
          the product has no users yet — so it was an invented review
          presented as a real one. It says what the product does instead. */}
      <div>
        <p
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 38,
            fontWeight: 300,
            color: '#fff',
            lineHeight: 1.25,
            letterSpacing: '-0.02em',
            margin: 0,
          }}
        >
          One thing is due at a time, and the plan can say why it comes before the next one.
        </p>
        <p style={{ fontSize: 13.5, color: 'var(--color-dark-text-3)', marginTop: 22, marginBottom: 0 }}>
          Nothing is scheduled before its prerequisite, so the order is arguable rather than arbitrary.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, borderLeft: '1px solid #2A2822', paddingLeft: 32 }}>
        {[
          { value: String(mern.weeks), label: `weeks in the MERN track at ${TRACK_PACE_HOURS} h/week` },
          { value: String(mern.nodes), label: 'nodes, dependency sorted' },
          { value: '11', label: 'portfolio templates' },
        ].map((stat) => (
          <div key={stat.label}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 30, color: '#fff', lineHeight: 1 }}>{stat.value}</div>
            <div style={{ fontSize: 12.5, color: 'var(--color-dark-text-3)', marginTop: 6 }}>{stat.label}</div>
          </div>
        ))}
      </div>
    </section>

    {/* ── Closing ── */}
    <section
      className="home-closing"
      style={{
        padding: '72px 44px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 48,
      }}
    >
      <div>
        <SectionHeading size={44} style={{ fontWeight: 300, letterSpacing: '-0.03em', marginBottom: 12 }}>
          Start with the assessment.
        </SectionHeading>
        <p style={{ margin: 0, fontSize: 16, color: 'var(--color-text-2)' }}>
          Your first roadmap appears on the next screen, and it is free.
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
        <StartLink>
          <Button style={{ padding: '16px 30px', fontSize: 14.5 }}>Begin assessment</Button>
        </StartLink>
        <Link to="/services" style={{ textDecoration: 'none' }}>
          <Button variant="secondary" style={{ padding: '15px 26px', fontSize: 14.5 }}>Browse tracks</Button>
        </Link>
      </div>
    </section>
    </div>
  );
};

export default Home;
