import React from 'react';
import { MicroLabel } from './primitives';

/**
 * Spec §5 — Card, Stat strip, Ink panel, Ruled grid, Loading, Empty.
 */

/* ── Card ─────────────────────────────────────────────────────────────────
   bg surface, 1px solid line. The optional header strip carries a mono
   micro-label, and may hold a second label or a quiet action right-aligned. */
export const Card = ({ children, style, ...rest }) => (
  <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-line)', ...style }} {...rest}>
    {children}
  </div>
);

export const CardHeader = ({ label, right, style }) => (
  <div
    style={{
      padding: '13px 20px',
      borderBottom: '1px solid var(--color-line)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      // Several headers carry a segmented filter on the right, which is wider
      // than a phone leaves beside a label. It drops to its own line.
      flexWrap: 'wrap',
      ...style,
    }}
  >
    {typeof label === 'string' ? <MicroLabel>{label}</MicroLabel> : label}
    {right}
  </div>
);

/** The 13.5px text-4 line some cards close with — a count or a rule. */
export const CardFooterNote = ({ children, style }) => (
  <div
    style={{
      padding: '14px 20px',
      borderTop: '1px solid var(--color-line-soft)',
      fontSize: 13.5,
      color: 'var(--color-text-4)',
      ...style,
    }}
  >
    {children}
  </div>
);

/* ── Stat strip ───────────────────────────────────────────────────────────
   One card divided into N equal cells, each with a right rule. A cell is a
   mono micro-label above a baseline row: mono 30px value plus either a mono
   14px suffix or a mono 12.5px delta (green positive, clay negative). */
export const StatStrip = ({ items = [], cellPadding = '18px 22px', style }) => (
  <div
    className="grid-sm-2"
    style={{
      background: 'var(--color-surface)',
      border: '1px solid var(--color-line)',
      display: 'grid',
      gridTemplateColumns: `repeat(${items.length || 1}, 1fr)`,
      ...style,
    }}
  >
    {items.map((item, i) => (
      <div
        key={item.label}
        style={{
          padding: cellPadding,
          borderRight: i === items.length - 1 ? 'none' : '1px solid var(--color-line)',
        }}
      >
        <MicroLabel size={10.5} tracking="0.13em" color="var(--color-text-3)" style={{ display: 'block', marginBottom: 10 }}>
          {item.label}
        </MicroLabel>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 7 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 30, letterSpacing: '-0.02em', color: 'var(--color-ink)' }}>
            {item.value}
          </span>
          {item.suffix && (
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--color-text-4)' }}>{item.suffix}</span>
          )}
          {item.delta && (
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 12.5,
                color: String(item.delta).trim().startsWith('-') ? 'var(--color-clay)' : 'var(--color-green)',
              }}
            >
              {item.delta}
            </span>
          )}
        </div>
      </div>
    ))}
  </div>
);

/* ── Ink panel ────────────────────────────────────────────────────────────
   One per screen at most. Mono micro-label in text-4, Newsreader 26–34px in
   white, body 14.5px in dark-text-2. */
export const InkPanel = ({ label, title, children, titleSize = 26, style }) => (
  <div style={{ background: 'var(--color-ink)', padding: 22, ...style }}>
    {label && (
      <MicroLabel size={10.5} tracking="0.13em" color="var(--color-dark-text-3)" style={{ display: 'block', marginBottom: 12 }}>
        {label}
      </MicroLabel>
    )}
    {title && (
      <div
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: titleSize,
          fontWeight: 400,
          letterSpacing: '-0.015em',
          color: '#fff',
          lineHeight: 1.2,
          marginBottom: children ? 10 : 0,
        }}
      >
        {title}
      </div>
    )}
    {children && <div style={{ fontSize: 14.5, lineHeight: 1.55, color: 'var(--color-dark-text-2)' }}>{children}</div>}
  </div>
);

/* ── Ruled grid ───────────────────────────────────────────────────────────
   Card grids that should read as one ruled sheet: the 1px gap on a container
   coloured `line` is what draws the rules between cells. */
export const RuledGrid = ({ columns = 2, children, style }) => (
  <div
    className="grid-sm-2"
    style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${columns}, 1fr)`,
      gap: 1,
      background: 'var(--color-line)',
      border: '1px solid var(--color-line)',
      ...style,
    }}
  >
    {children}
  </div>
);

export const RuledCell = ({ children, attn = false, style }) => (
  <div style={{ background: attn ? 'var(--color-surface-attn)' : 'var(--color-surface)', ...style }}>{children}</div>
);

/* ── Loading / empty ──────────────────────────────────────────────────────
   Loading keeps the card chrome and swaps the content for a mono label. No
   spinner, no shimmer. Empty names what will appear and offers one action. */
export const Loading = ({ label = 'Loading', style }) => (
  <div style={{ padding: '40px 20px', textAlign: 'center', ...style }}>
    <MicroLabel size={11} tracking="0.13em" color="var(--color-text-4)">
      {label}
    </MicroLabel>
  </div>
);

export const Empty = ({ children, action, style }) => (
  <div style={{ padding: '40px 20px', textAlign: 'center', ...style }}>
    <p style={{ fontSize: 15.5, color: 'var(--color-text-2)', margin: 0, marginBottom: action ? 20 : 0 }}>{children}</p>
    {action}
  </div>
);

export default { Card, CardHeader, CardFooterNote, StatStrip, InkPanel, RuledGrid, RuledCell, Loading, Empty };
