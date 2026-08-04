/**
 * Spec §7 Public portfolio.
 *
 * Editorial shell, single column at 860px, `padding: 64px 32px 80px`. A
 * masthead — Newsreader 56px name, a 15px summary, a mono contact run joined
 * by `·` — closed by a `1px solid ink` rule. Then entries rather than cards:
 * `28px 0` with a bottom rule, `90px 1fr`, a mono ordinal beside a Newsreader
 * 30px name, a 15px description, a mono stack line and quiet links.
 *
 * The other ten templates are themes the learner chooses; this one is what the
 * spec asks a published EduPath portfolio to look like, so it is the default.
 * It deliberately uses the design tokens directly — a portfolio built from
 * this template is an EduPath page, not a coloured one.
 */

const clean = (list = []) => list.filter((v) => String(v || '').trim());

const Ordinal = ({ children }) => (
  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-text-4)', paddingTop: 8 }}>
    {children}
  </span>
);

const Entry = ({ ordinal, name, meta, description, stack, links = [] }) => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: '90px 1fr',
      gap: 16,
      padding: '28px 0',
      borderBottom: '1px solid var(--color-line)',
      alignItems: 'start',
    }}
  >
    <Ordinal>{ordinal}</Ordinal>

    <div>
      <h3
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 30,
          fontWeight: 400,
          letterSpacing: '-0.015em',
          lineHeight: 1.15,
          margin: 0,
          color: 'var(--color-ink)',
        }}
      >
        {name}
      </h3>

      {meta && <div style={{ fontSize: 14, color: 'var(--color-text-3)', marginTop: 6 }}>{meta}</div>}

      {description && (
        <p style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--color-text-2)', margin: '10px 0 0' }}>
          {description}
        </p>
      )}

      {stack && (
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-text-4)', marginTop: 10 }}>
          {stack}
        </div>
      )}

      {links.length > 0 && (
        <div style={{ display: 'flex', gap: 18, marginTop: 12 }}>
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: 13.5, color: 'var(--color-text-3)', textDecoration: 'underline' }}
            >
              {link.label}
            </a>
          ))}
        </div>
      )}
    </div>
  </div>
);

const Section = ({ label, children }) => (
  <section style={{ marginTop: 48 }}>
    <span
      style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 10.5,
        letterSpacing: '0.13em',
        textTransform: 'uppercase',
        color: 'var(--color-text-4)',
      }}
    >
      {label}
    </span>
    <div style={{ marginTop: 6, borderTop: '1px solid var(--color-ink)' }}>{children}</div>
  </section>
);

const ord = (i) => String(i + 1).padStart(2, '0');

function TemplateEditorial({ data = {} }) {
  const contact = clean([data.email, data.phone, data.location]).join('  ·  ');
  const links = clean([data.github, data.linkedin, data.portfolio]);
  const skills = clean(data.skills);
  const experience = (data.experience || []).filter((e) => e.position || e.company);
  const projects = (data.projects || []).filter((p) => p.name || p.description);
  const education = (data.education || []).filter((e) => e.degree || e.institution);
  const certifications = clean(data.certifications);
  const achievements = clean(data.achievements);

  return (
    <div style={{ background: 'var(--color-paper)', minHeight: '100vh' }}>
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '64px 32px 80px' }}>
        {/* Masthead */}
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 56,
            fontWeight: 400,
            letterSpacing: '-0.02em',
            lineHeight: 1.05,
            margin: 0,
            color: 'var(--color-ink)',
          }}
        >
          {data.name || 'Your name'}
        </h1>

        {(data.title || data.about) && (
          <p style={{ fontSize: 15, lineHeight: 1.65, color: 'var(--color-text-2)', margin: '16px 0 0', maxWidth: 640 }}>
            {data.about || data.title}
          </p>
        )}

        {contact && (
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.1em', color: 'var(--color-text-3)', marginTop: 18 }}>
            {contact}
          </div>
        )}

        {links.length > 0 && (
          <div style={{ display: 'flex', gap: 18, marginTop: 12 }}>
            {links.map((href) => (
              <a
                key={href}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: 13.5, color: 'var(--color-text-3)', textDecoration: 'underline' }}
              >
                {href.replace(/^https?:\/\//, '').replace(/\/$/, '')}
              </a>
            ))}
          </div>
        )}

        <div style={{ borderTop: '1px solid var(--color-ink)', marginTop: 32 }} />

        {experience.length > 0 && (
          <Section label="Experience">
            {experience.map((exp, i) => (
              <Entry
                key={i}
                ordinal={ord(i)}
                name={exp.position || exp.company}
                // Without a position the company becomes the heading, so it
                // must not also appear in the line beneath it.
                meta={clean([exp.position ? exp.company : null, exp.duration]).join('  ·  ')}
                description={exp.description}
              />
            ))}
          </Section>
        )}

        {projects.length > 0 && (
          <Section label="Projects">
            {projects.map((proj, i) => (
              <Entry
                key={i}
                ordinal={ord(i)}
                name={proj.name}
                description={proj.description}
                stack={clean(proj.technologies).join(' · ')}
                links={proj.link ? [{ href: proj.link, label: 'View project' }] : []}
              />
            ))}
          </Section>
        )}

        {education.length > 0 && (
          <Section label="Education">
            {education.map((edu, i) => (
              <Entry
                key={i}
                ordinal={ord(i)}
                name={edu.degree || edu.institution}
                meta={clean([edu.institution, edu.year, edu.cgpa && `CGPA ${edu.cgpa}`]).join('  ·  ')}
              />
            ))}
          </Section>
        )}

        {skills.length > 0 && (
          <Section label="Skills">
            <div style={{ padding: '28px 0', borderBottom: '1px solid var(--color-line)' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, lineHeight: 1.9, color: 'var(--color-text-2)' }}>
                {skills.join('  ·  ')}
              </div>
            </div>
          </Section>
        )}

        {certifications.length > 0 && (
          <Section label="Certifications">
            {certifications.map((cert, i) => (
              <Entry key={i} ordinal={ord(i)} name={cert} />
            ))}
          </Section>
        )}

        {achievements.length > 0 && (
          <Section label="Achievements">
            {achievements.map((item, i) => (
              <Entry key={i} ordinal={ord(i)} name={item} />
            ))}
          </Section>
        )}

        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            letterSpacing: '0.13em',
            textTransform: 'uppercase',
            color: 'var(--color-text-4)',
            marginTop: 48,
          }}
        >
          {`${data.name || 'Portfolio'} · Built with EduPath`}
        </div>
      </div>
    </div>
  );
}

export default TemplateEditorial;
