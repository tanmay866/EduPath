import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Logo, Wordmark, MicroLabel, Avatar } from './primitives';

/**
 * Spec §6 — Auth, learner, admin and editorial shells, plus the footer.
 */

/* ── Auth shell ───────────────────────────────────────────────────────────
   1fr 1fr at 100vh. Left ink panel: logo top, a Newsreader 44px pull quote
   with attribution, a mono label pinned at the bottom. Right paper-light with
   a centred 380px column. */
export const AuthShell = ({ quote, attribution, footLabel = 'EDUPATH', children }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '100vh' }}>
    <div
      style={{
        background: 'var(--color-ink)',
        padding: 48,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
      className="max-lg:hidden"
    >
      <Link to="/" style={{ textDecoration: 'none', width: 'fit-content' }}>
        <Wordmark dark size={28} labelSize={24} />
      </Link>

      <div style={{ maxWidth: 420 }}>
        <p
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 44,
            fontWeight: 400,
            letterSpacing: '-0.02em',
            lineHeight: 1.12,
            color: '#fff',
            margin: 0,
          }}
        >
          {quote}
        </p>
        {attribution && (
          <p style={{ fontSize: 14, color: 'var(--color-dark-text-3)', marginTop: 20, marginBottom: 0 }}>
            {attribution}
          </p>
        )}
      </div>

      <MicroLabel size={11} tracking="0.14em" color="var(--color-dark-text-3)">
        {footLabel}
      </MicroLabel>
    </div>

    <div
      style={{
        background: 'var(--color-paper-light)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 32px',
      }}
    >
      <div style={{ width: '100%', maxWidth: 380 }}>{children}</div>
    </div>
  </div>
);

/* ── Learner shell ────────────────────────────────────────────────────────
   230px sidebar on surface, content on paper-warm. The 3px left border on nav
   items exists in both states — transparent when inactive — so nothing shifts
   when selection moves. */
const NavItem = ({ to, children, dark = false, end = false }) => (
  <NavLink
    to={to}
    /* Without `end`, a parent path such as /admin stays lit on every child
       route, so two items read as selected at once. */
    end={end}
    style={({ isActive }) => ({
      display: 'block',
      width: '100%',
      textAlign: 'left',
      padding: dark ? '11px 24px' : '10px 24px',
      fontSize: dark ? 14.5 : 15,
      fontFamily: 'var(--font-sans)',
      textDecoration: 'none',
      borderLeft: `3px solid ${isActive ? 'var(--color-clay)' : 'transparent'}`,
      background: isActive ? (dark ? 'var(--color-ink-soft)' : 'var(--color-surface-active)') : 'transparent',
      color: isActive ? (dark ? '#fff' : 'var(--color-ink)') : dark ? 'var(--color-dark-text-3)' : 'var(--color-text-2)',
      fontWeight: isActive ? 600 : 400,
      transition: 'background-color 120ms ease',
    })}
  >
    {children}
  </NavLink>
);

const SignOut = ({ dark = false }) => (
  <button
    type="button"
    onClick={() => {
      sessionStorage.clear();
      // App.jsx decides between the admin routes and the learner routes with
      // a plain `if` at the top of its render, read straight from
      // sessionStorage rather than through React state. A client-side
      // navigate() does not re-run that check, so from the admin side it
      // leaves the admin route tree mounted — whose catch-all route matches
      // any path, including /signin — and the screen never actually changes.
      // The hard reload forces App to re-evaluate the (now-cleared) role.
      window.location.href = '/signin';
    }}
    style={{
      background: 'none',
      border: 'none',
      padding: 0,
      cursor: 'pointer',
      fontSize: 13.5,
      textDecoration: 'underline',
      color: dark ? 'var(--color-dark-text-2)' : 'var(--color-text-3)',
      fontFamily: 'var(--font-sans)',
    }}
  >
    Sign out
  </button>
);

export const LearnerShell = ({ sections = [], eyebrow, title, note, initials, footLabel, children }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '230px 1fr', minHeight: '100vh' }}>
    <aside
      style={{
        background: 'var(--color-surface)',
        borderRight: '1px solid var(--color-line)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ padding: 24, borderBottom: '1px solid var(--color-line)' }}>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <Wordmark size={26} labelSize={22} />
        </Link>
      </div>

      <nav style={{ flex: 1 }}>
        {sections.map((section) => (
          <div key={section.label}>
            <MicroLabel
              size={10.5}
              tracking="0.14em"
              color="var(--color-text-4)"
              style={{ display: 'block', padding: '22px 0 8px 24px' }}
            >
              {section.label}
            </MicroLabel>
            {section.items.map((item) => (
              <NavItem key={item.to} to={item.to} end={item.end}>{item.label}</NavItem>
            ))}
          </div>
        ))}
      </nav>

      {/* The label names who is signed in rather than repeating a nav section
          heading, which would print "Account" twice in the same column. */}
      <div style={{ marginTop: 'auto', borderTop: '1px solid var(--color-line)', padding: 24 }}>
        <MicroLabel size={10.5} tracking="0.14em" color="var(--color-text-4)" style={{ display: 'block', marginBottom: 10, wordBreak: 'break-all' }}>
          {footLabel || 'Signed in'}
        </MicroLabel>
        <SignOut />
      </div>
    </aside>

    <div style={{ background: 'var(--color-paper-warm)', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
      <header
        style={{
          background: 'var(--color-surface)',
          borderBottom: '1px solid var(--color-line)',
          padding: '18px 32px',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: 20,
        }}
      >
        <div>
          {eyebrow && (
            <MicroLabel size={10.5} tracking="0.14em" color="var(--color-text-4)" style={{ display: 'block', marginBottom: 7 }}>
              {eyebrow}
            </MicroLabel>
          )}
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 30,
              fontWeight: 400,
              letterSpacing: '-0.015em',
              lineHeight: 1.1,
              margin: 0,
              color: 'var(--color-ink)',
            }}
          >
            {title}
          </h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {note && <span style={{ fontSize: 13.5, color: 'var(--color-text-3)' }}>{note}</span>}
          {initials && <Avatar initials={initials} size={32} fontSize={12} />}
        </div>
      </header>

      <main style={{ padding: '26px 32px', display: 'flex', flexDirection: 'column', gap: 22, flex: 1, minWidth: 0 }}>
        {children}
      </main>
    </div>
  </div>
);

/* ── Admin shell ──────────────────────────────────────────────────────────
   218px ink sidebar. Header carries a mono chip and a quiet action rather
   than the learner header's note and avatar. */
export const AdminShell = ({ items = [], title, chip, action, children }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '218px 1fr', minHeight: '100vh' }}>
    <aside style={{ background: 'var(--color-ink)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '26px 24px' }}>
        <Wordmark dark size={26} labelSize={22} />
      </div>

      <nav style={{ flex: 1 }}>
        {items.map((item) => (
          <NavItem key={item.to} to={item.to} end={item.end} dark>{item.label}</NavItem>
        ))}
      </nav>

      <div style={{ padding: '24px' }}>
        <SignOut dark />
      </div>
    </aside>

    <div style={{ background: 'var(--color-paper-warm)', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
      <header
        style={{
          background: 'var(--color-surface)',
          borderBottom: '1px solid var(--color-line)',
          padding: '20px 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 20,
        }}
      >
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 30,
            fontWeight: 400,
            letterSpacing: '-0.015em',
            lineHeight: 1.1,
            margin: 0,
            color: 'var(--color-ink)',
          }}
        >
          {title}
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {chip && (
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11.5,
                border: '1px solid var(--color-line-btn)',
                padding: '7px 11px',
                color: 'var(--color-text-3)',
              }}
            >
              {chip}
            </span>
          )}
          {action}
        </div>
      </header>

      <main style={{ padding: '26px 32px', display: 'flex', flexDirection: 'column', gap: 22, flex: 1, minWidth: 0 }}>
        {children}
      </main>
    </div>
  </div>
);

/* ── Editorial shell ──────────────────────────────────────────────────────
   Marketing and public pages: paper, centred 1100px, 80px 32px sections
   divided by rules rather than by background change. */
export const EditorialShell = ({ children, maxWidth = 1100, style }) => (
  <div style={{ background: 'var(--color-paper)', minHeight: '100vh', ...style }}>
    <div style={{ maxWidth, margin: '0 auto', padding: '0 32px' }}>{children}</div>
  </div>
);

export const EditorialSection = ({ eyebrow, heading, children, first = false, style }) => (
  <section
    style={{
      padding: '80px 0',
      borderTop: first ? 'none' : '1px solid var(--color-line)',
      ...style,
    }}
  >
    {eyebrow && (
      <MicroLabel size={11} tracking="0.14em" color="var(--color-text-4)" style={{ display: 'block', marginBottom: 16 }}>
        {eyebrow}
      </MicroLabel>
    )}
    {heading && (
      <h2
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 44,
          fontWeight: 400,
          letterSpacing: '-0.02em',
          lineHeight: 1.1,
          margin: 0,
          marginBottom: children ? 32 : 0,
          color: 'var(--color-ink)',
        }}
      >
        {heading}
      </h2>
    )}
    {children}
  </section>
);

/* ── Footer ───────────────────────────────────────────────────────────────
   Ink panel, 48px 32px, inner 1100px. Logo left, link columns right, a mono
   copyright line under a #2A2822 rule. */
export const SiteFooter = ({ columns = [] }) => (
  <footer style={{ background: 'var(--color-ink)', padding: '48px 32px' }}>
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 48, flexWrap: 'wrap' }}>
        <Wordmark dark size={28} labelSize={24} />

        <div style={{ display: 'flex', gap: 64, flexWrap: 'wrap' }}>
          {columns.map((col) => (
            <div key={col.heading}>
              <MicroLabel size={10.5} tracking="0.14em" color="var(--color-dark-text-3)" style={{ display: 'block', marginBottom: 14 }}>
                {col.heading}
              </MicroLabel>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      style={{ fontSize: 14, color: 'var(--color-dark-text-2)', textDecoration: 'none' }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-dark-text-2)'; }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div style={{ borderTop: '1px solid #2A2822', marginTop: 40, paddingTop: 20 }}>
        <MicroLabel size={11} tracking="0.12em" color="var(--color-dark-text-3)">
          © {new Date().getFullYear()} EduPath
        </MicroLabel>
      </div>
    </div>
  </footer>
);

export default { AuthShell, LearnerShell, AdminShell, EditorialShell, EditorialSection, SiteFooter };
