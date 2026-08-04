import React from 'react';

/**
 * Spec §5 — the small marks that replace icons.
 *
 * The spec allows no icons: "Mono micro-labels and geometric primitives replace
 * them." Everything here is a rectangle, a square or a run of mono text.
 */

/* ── Logo ─────────────────────────────────────────────────────────────────
   Square container filled ink holding three bars at 7 / 11 / 15px in the
   inverse colour. On dark the square is white and the bars are ink. */
export const Logo = ({ size = 28, dark = false }) => (
  <span
    style={{
      width: size,
      height: size,
      background: dark ? '#fff' : 'var(--color-ink)',
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'center',
      gap: 3,
      padding: '6px 5px',
      flexShrink: 0,
    }}
    aria-hidden="true"
  >
    {[7, 11, 15].map((h) => (
      <span
        key={h}
        style={{ width: 4, height: h, background: dark ? 'var(--color-ink)' : '#fff' }}
      />
    ))}
  </span>
);

/** Logo plus wordmark. Wordmark is Newsreader, 11–12px beside the mark. */
export const Wordmark = ({ size = 28, dark = false, label = 'EduPath', labelSize = 24 }) => (
  <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
    <Logo size={size} dark={dark} />
    <span
      style={{
        fontFamily: 'var(--font-display)',
        fontSize: labelSize,
        fontWeight: 400,
        letterSpacing: '-0.01em',
        color: dark ? '#fff' : 'var(--color-ink)',
        lineHeight: 1,
      }}
    >
      {label}
    </span>
  </span>
);

/* ── Micro label ──────────────────────────────────────────────────────────
   Mono caps, 10.5–11px, tracked 0.12–0.14em. The workhorse label of the
   whole system: card headers, stat cells, section headings. */
export const MicroLabel = ({ children, size = 11, tracking = '0.12em', color = 'var(--color-text-3)', as: Tag = 'span', style, ...rest }) => (
  <Tag
    style={{
      fontFamily: 'var(--font-mono)',
      fontSize: size,
      letterSpacing: tracking,
      textTransform: 'uppercase',
      color,
      ...style,
    }}
    {...rest}
  >
    {children}
  </Tag>
);

/* ── Badge ────────────────────────────────────────────────────────────────
   Mono 11px / 0.1em, 4px 8px, 1px solid — border and text the same colour. */
const BADGE_TONES = {
  green: 'var(--color-green)',
  clay: 'var(--color-clay)',
  amber: 'var(--color-amber)',
  muted: 'var(--color-text-4)',
};

export const Badge = ({ children, tone = 'muted' }) => {
  const color = BADGE_TONES[tone] || BADGE_TONES.muted;
  return (
    <span
      style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        letterSpacing: '0.1em',
        padding: '4px 8px',
        border: `1px solid ${color}`,
        color,
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </span>
  );
};

/* ── Status box ───────────────────────────────────────────────────────────
   11px square. Done: filled green. Current: filled amber. Future: transparent
   with a line-btn border. Review lists use a 10px variant with no border. */
export const StatusBox = ({ status = 'future', size = 11 }) => {
  const style = { width: size, height: size, flexShrink: 0, display: 'block' };

  if (status === 'done') {
    Object.assign(style, { background: 'var(--color-green)', border: '1px solid var(--color-green)' });
  } else if (status === 'current') {
    Object.assign(style, { background: 'var(--color-amber)', border: '1px solid var(--color-amber)' });
  } else if (status === 'correct') {
    Object.assign(style, { background: 'var(--color-green)' });
  } else if (status === 'wrong') {
    Object.assign(style, { background: 'var(--color-clay)' });
  } else {
    Object.assign(style, { background: 'transparent', border: '1px solid var(--color-line-btn)' });
  }

  return <span style={style} aria-hidden="true" />;
};

/* ── Progress bar ─────────────────────────────────────────────────────────
   Track 5px inline or 6px feature. Colour carries meaning, so it is named
   rather than derived. No radius, no load animation. */
const BAR_TONES = {
  navy: 'var(--color-navy)',
  green: 'var(--color-green)',
  amber: 'var(--color-amber)',
  clay: 'var(--color-clay)',
  ink: 'var(--color-ink)',
};

export const ProgressBar = ({ value = 0, height = 5, tone = 'navy' }) => {
  const pct = Math.max(0, Math.min(100, Number(value) || 0));
  return (
    <div style={{ height, background: 'var(--color-bar-empty)', width: '100%' }}>
      <div style={{ height, width: `${pct}%`, background: BAR_TONES[tone] || BAR_TONES.navy }} />
    </div>
  );
};

/* ── Avatar ───────────────────────────────────────────────────────────────
   Navy square with white mono initials. Used in the learner header (32px)
   and on the profile screen (60px). Never a circle. */
export const Avatar = ({ initials = '', size = 32, fontSize }) => (
  <span
    style={{
      width: size,
      height: size,
      background: 'var(--color-navy)',
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'var(--font-mono)',
      fontSize: fontSize || Math.round(size * 0.375),
      letterSpacing: '0.06em',
      flexShrink: 0,
    }}
  >
    {String(initials).toUpperCase().slice(0, 2)}
  </span>
);

export default { Logo, Wordmark, MicroLabel, Badge, StatusBox, ProgressBar, Avatar };
