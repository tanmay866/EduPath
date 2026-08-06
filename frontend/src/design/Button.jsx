import React from 'react';

/**
 * Spec §5 Button.
 *
 * Six variants, each with fixed padding and type. Hover changes background or
 * border colour only — never a shadow, radius or hue shift. Loading swaps the
 * label to a present participle and takes the disabled fill with `cursor: wait`.
 */

const BASE = {
  fontFamily: 'var(--font-sans)',
  borderRadius: 0,
  cursor: 'pointer',
  lineHeight: 1.2,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'background-color 120ms ease, border-color 120ms ease',
  textAlign: 'center',
};

const VARIANTS = {
  primary: {
    background: 'var(--color-ink)',
    color: '#fff',
    border: 'none',
    padding: '13px 26px',
    fontSize: 15,
    fontWeight: 500,
    hover: { background: 'var(--color-ink-soft)' },
  },
  attention: {
    background: 'var(--color-clay)',
    color: '#fff',
    border: 'none',
    padding: '10px 20px',
    fontSize: 14,
    fontWeight: 500,
    hover: { background: 'var(--color-clay-dark)' },
  },
  secondary: {
    background: 'transparent',
    color: 'var(--color-ink)',
    border: '1px solid var(--color-line-btn)',
    padding: '13px 26px',
    fontSize: 15,
    fontWeight: 500,
    // The whole shorthand, not just borderColor: React warns when a style
    // object swaps between the two across renders, and the base sets `border`.
    hover: { border: '1px solid var(--color-ink)' },
  },
  destructive: {
    background: 'transparent',
    color: 'var(--color-clay)',
    border: '1px solid var(--color-clay)',
    padding: '13px 26px',
    fontSize: 15,
    fontWeight: 500,
    hover: { background: 'var(--color-surface-active)' },
  },
  quiet: {
    background: 'none',
    color: 'var(--color-text-3)',
    border: 'none',
    padding: 0,
    fontSize: 13.5,
    fontWeight: 400,
    textDecoration: 'underline',
    hover: { color: 'var(--color-ink)' },
  },
  quietClay: {
    background: 'none',
    color: 'var(--color-clay)',
    border: 'none',
    padding: 0,
    fontSize: 13.5,
    fontWeight: 400,
    textDecoration: 'underline',
    hover: { color: 'var(--color-clay-dark)' },
  },
};

/** Disabled and loading share one fill; only the cursor and label differ.
    The quiet variants have no fill to replace — painting one behind a text
    link reads as a grey highlight — so they only lose their colour. */
const INERT = {
  background: '#DAD7CE',
  color: 'var(--color-text-4)',
  border: 'none',
};

const INERT_QUIET = { color: 'var(--color-text-4)' };

export const Button = ({
  variant = 'primary',
  fullWidth = false,
  loading = false,
  loadingLabel,
  disabled = false,
  children,
  style,
  type = 'button',
  ...rest
}) => {
  const [hovered, setHovered] = React.useState(false);
  const spec = VARIANTS[variant] || VARIANTS.primary;
  const { hover, ...rest_spec } = spec;
  const inert = disabled || loading;

  const composed = {
    ...BASE,
    ...rest_spec,
    // Full-width primaries use 12px vertical padding rather than 13px.
    ...(fullWidth ? { width: '100%', padding: spec.padding.replace('13px', '12px') } : null),
    ...(inert ? (variant === 'quiet' || variant === 'quietClay' ? INERT_QUIET : INERT) : null),
    ...(inert ? { cursor: loading ? 'wait' : 'not-allowed' } : null),
    ...(!inert && hovered ? hover : null),
    ...style,
  };

  return (
    <button
      type={type}
      disabled={inert}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={composed}
      {...rest}
    >
      {loading ? loadingLabel || 'Working…' : children}
    </button>
  );
};

export default Button;
