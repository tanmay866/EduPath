import React from 'react';

/**
 * Spec §5 — Table, ordinal row, numbered list item.
 *
 * Built on CSS grid rather than <table> because every column width in §7 is
 * given as a grid fraction (`1.4fr 1fr 0.8fr …`).
 */

/**
 * Wraps a table so it scrolls sideways instead of breaking the page.
 *
 * These grids are five columns of learner names, emails and dates; below
 * roughly 640px there is no honest way to show them all at once, and stacking
 * a table into cards loses the column-to-column comparison that is the reason
 * to look at it. So the table keeps its shape and the reader scrolls it,
 * which is what a table on a phone is expected to do.
 */
export const TableScroll = ({ minWidth = 640, children, style }) => (
  <div style={{ overflowX: 'auto', ...style }}>
    <div style={{ minWidth }}>{children}</div>
  </div>
);

/* ── Table ────────────────────────────────────────────────────────────────
   Header: mono 10.5px / 0.12em text-4 at 11px 20px with a line rule beneath.
   Body row: 14–15px 20px, line-soft rule, 14.5px, centred. Numeric and date
   columns are right-aligned in mono. */
/* `align` gives each column's text alignment, so a numeric header lines up
   with the mono figures beneath it. Styling the passed child does nothing —
   TableHead wraps it, and the wrapper is the grid cell that has the width. */
export const TableHead = ({ columns, align = [], children, style }) => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: columns,
      gap: 12,
      padding: '11px 20px',
      borderBottom: '1px solid var(--color-line)',
      alignItems: 'center',
      ...style,
    }}
  >
    {React.Children.map(children, (child, i) => (
      <span
        key={i}
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 10.5,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'var(--color-text-4)',
          textAlign: align[i] || 'left',
        }}
      >
        {child}
      </span>
    ))}
  </div>
);

export const TableRow = ({ columns, children, active = false, style, ...rest }) => {
  const [hovered, setHovered] = React.useState(false);
  const interactive = Boolean(rest.onClick);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'grid',
        gridTemplateColumns: columns,
        gap: 12,
        padding: '15px 20px',
        borderBottom: '1px solid var(--color-line-soft)',
        alignItems: 'center',
        fontSize: 14.5,
        color: 'var(--color-text-2)',
        background: active || (interactive && hovered) ? 'var(--color-surface-active)' : 'transparent',
        cursor: interactive ? 'pointer' : 'default',
        transition: 'background-color 120ms ease',
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
};

/** Right-aligned mono cell — used for every score, count and date. */
export const NumCell = ({ children, tone, size = 13.5, style }) => (
  <span
    style={{
      fontFamily: 'var(--font-mono)',
      fontSize: size,
      textAlign: 'right',
      color: tone || 'var(--color-text-2)',
      ...style,
    }}
  >
    {children}
  </span>
);

/** Right-aligned action cluster with the spec's 8px gap. */
export const ActionCell = ({ children, style }) => (
  <span style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, ...style }}>{children}</span>
);

/* ── Ordinal row ──────────────────────────────────────────────────────────
   A mono ordinal beside a content block. Clay in-app, text-4 editorial.
   Used for action lists, rule lists, service indexes and project lists. */
export const OrdinalRow = ({ ordinal, editorial = false, ordinalWidth = 20, children, right, style }) => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: `${ordinalWidth}px 1fr`,
      gap: 16,
      alignItems: 'start',
      ...style,
    }}
  >
    <span
      style={{
        fontFamily: 'var(--font-mono)',
        fontSize: editorial ? 12 : 12.5,
        color: editorial ? 'var(--color-text-4)' : 'var(--color-clay)',
        paddingTop: 2,
      }}
    >
      {ordinal}
    </span>
    {right ? (
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
        <div style={{ flex: 1 }}>{children}</div>
        {right}
      </div>
    ) : (
      <div>{children}</div>
    )}
  </div>
);

/* ── Numbered list item ───────────────────────────────────────────────────
   Title 15.5px / 500 plus detail 14px text-3, with a right-aligned action. */
export const ListItem = ({ title, detail, action, style }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 16,
      ...style,
    }}
  >
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 15.5, fontWeight: 500, color: 'var(--color-ink)' }}>{title}</div>
      {detail && <div style={{ fontSize: 14, color: 'var(--color-text-3)', marginTop: 4, lineHeight: 1.5 }}>{detail}</div>}
    </div>
    {action}
  </div>
);

export default { TableHead, TableRow, NumCell, ActionCell, OrdinalRow, ListItem };
