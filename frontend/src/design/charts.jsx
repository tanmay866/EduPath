import React from 'react';

/**
 * Spec §5 — Bar chart and share chart.
 *
 * Plain rectangles only. No axes, gridlines, tooltips or animation, and only
 * the first, middle and last bars carry a label.
 */

/* ── Bar chart ────────────────────────────────────────────────────────────
   220px tall, flex-end, 10px gap. Navy, with the final bar clay when it marks
   the present. */
export const BarChart = ({ data = [], height = 220, markLast = false, tone = 'navy', maxBarWidth = 90 }) => {
  const max = Math.max(...data.map((d) => Number(d.value) || 0), 1);
  const labelled = new Set([0, Math.floor((data.length - 1) / 2), data.length - 1]);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height, justifyContent: 'flex-start' }}>
        {data.map((d, i) => {
          const isLast = i === data.length - 1;
          const fill = markLast && isLast ? 'var(--color-clay)' : `var(--color-${tone})`;
          return (
            <div
              key={d.label ?? i}
              title={`${d.label}: ${d.value}`}
              style={{
                flex: 1,
                // Without a cap, one or two data points stretch into slabs the
                // width of the card, which reads as a filled bar rather than a
                // chart with little in it.
                maxWidth: maxBarWidth,
                height: `${((Number(d.value) || 0) / max) * 100}%`,
                background: fill,
                minHeight: 2,
              }}
            />
          );
        })}
      </div>
      <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
        {data.map((d, i) => (
          <span
            key={d.label ?? i}
            style={{
              flex: 1,
              maxWidth: maxBarWidth,
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              color: 'var(--color-text-4)',
              textAlign: i === 0 ? 'left' : i === data.length - 1 ? 'right' : 'center',
            }}
          >
            {labelled.has(i) ? d.label : ''}
          </span>
        ))}
      </div>
    </div>
  );
};

/* ── Share chart ──────────────────────────────────────────────────────────
   Blocks in a 2px-gap row, each width set to its share of the total, 42px
   tall, with a mono label and value beneath. */
const SHARE_TONES = ['var(--color-navy)', 'var(--color-navy-2)', 'var(--color-clay)'];

export const ShareChart = ({ data = [] }) => {
  const total = data.reduce((sum, d) => sum + (Number(d.value) || 0), 0) || 1;

  return (
    <div>
      <div style={{ display: 'flex', gap: 2 }}>
        {data.map((d, i) => (
          <div
            key={d.label ?? i}
            style={{
              width: `${((Number(d.value) || 0) / total) * 100}%`,
              height: 42,
              background: SHARE_TONES[i % SHARE_TONES.length],
            }}
          />
        ))}
      </div>
      <div style={{ display: 'flex', gap: 2, marginTop: 10 }}>
        {data.map((d, i) => (
          <div key={d.label ?? i} style={{ width: `${((Number(d.value) || 0) / total) * 100}%` }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-text-4)' }}>
              {d.label}
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13.5, color: 'var(--color-ink)', marginTop: 3 }}>
              {d.display ?? d.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/** Labelled horizontal bar — the ATS breakdown and roadmap gap report.
    `value` sets the fill and must stay numeric; `display` is what the mono
    figure prints, so a caller can show "72%" without the bar reading NaN. */
export const LabelledBar = ({ label, value, display, max = 100, tone = 'navy', style }) => (
  <div style={style}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
      <span style={{ fontSize: 13.5, color: 'var(--color-text-2)' }}>{label}</span>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12.5, color: 'var(--color-text-3)' }}>{display ?? value}</span>
    </div>
    <div style={{ height: 5, background: 'var(--color-bar-empty)' }}>
      <div style={{ height: 5, width: `${Math.min(100, ((Number(value) || 0) / max) * 100)}%`, background: `var(--color-${tone})` }} />
    </div>
  </div>
);

export default { BarChart, ShareChart, LabelledBar };
