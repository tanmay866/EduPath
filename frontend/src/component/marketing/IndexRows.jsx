import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Spec §7 Marketing · index page.
 *
 * Ordinal rows at `padding: 26px 0` with a bottom rule and
 * `grid-template-columns: 90px 1fr` — a mono ordinal beside a Newsreader 30px
 * name and a 15px description. Explicitly not a card grid.
 *
 * Shared by Tracks, How it works and the roadmap explainer, which are the
 * same shape.
 *
 * Narrow-screen behaviour is in index.css: a grid item defaults to
 * `min-width: auto`, so the 30px display heading could not shrink below its
 * own longest word and pushed the row past the viewport — "Cybersecurity
 * Engineer" overflowed a 360px screen on every page using this component.
 */
const IndexRows = ({ rows = [] }) => (
  <div style={{ borderTop: '1px solid var(--color-ink)' }}>
    {rows.map((row, i) => {
      const body = (
        <div
          className="index-row"
          style={{
            display: 'grid',
            gridTemplateColumns: '90px 1fr',
            gap: 16,
            padding: '26px 0',
            borderBottom: '1px solid var(--color-line)',
            alignItems: 'start',
          }}
        >
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-text-4)', paddingTop: 10 }}>
            {row.ordinal || String(i + 1).padStart(2, '0')}
          </span>

          {/* minWidth: 0 lets the column shrink; without it the grid item is
              floored at the heading's min-content width. */}
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
              <h2
                className="index-row__name"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 30,
                  fontWeight: 400,
                  letterSpacing: '-0.02em',
                  lineHeight: 1.15,
                  margin: 0,
                  color: 'var(--color-ink)',
                }}
              >
                {row.name}
              </h2>
              {row.meta && (
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12.5, color: 'var(--color-text-4)', whiteSpace: 'nowrap' }}>
                  {row.meta}
                </span>
              )}
            </div>

            <p style={{ fontSize: 15, lineHeight: 1.65, color: 'var(--color-text-2)', margin: '10px 0 0', maxWidth: 680 }}>
              {row.description}
            </p>

            {row.stack && (
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-text-4)', marginTop: 10 }}>
                {row.stack}
              </div>
            )}
          </div>
        </div>
      );

      return row.to ? (
        <Link key={row.name} to={row.to} style={{ display: 'block', textDecoration: 'none' }}>
          {body}
        </Link>
      ) : (
        <div key={row.name}>{body}</div>
      );
    })}
  </div>
);

export default IndexRows;
