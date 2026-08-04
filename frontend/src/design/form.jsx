import React from 'react';
import { MicroLabel } from './primitives';

/**
 * Spec §5 — Field, password visibility control, password requirements,
 * inline message, toggle, stepper, segmented filter.
 */

/* ── Field ────────────────────────────────────────────────────────────────
   Mono 11px / 0.12em text-3 label, then an input at 13px 14px with a
   line-input border. Focus takes an ink border, error a clay one. Help text
   sits below at 13px text-4. Groups are stacked with a 20px gap. */
export const FieldLabel = ({ children, right }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
    <MicroLabel size={11} tracking="0.12em">{children}</MicroLabel>
    {right}
  </div>
);

export const Input = React.forwardRef(({ error = false, admin = false, style, ...rest }, ref) => {
  const [focused, setFocused] = React.useState(false);

  return (
    <input
      ref={ref}
      onFocus={(e) => { setFocused(true); rest.onFocus?.(e); }}
      onBlur={(e) => { setFocused(false); rest.onBlur?.(e); }}
      style={{
        width: '100%',
        padding: '13px 14px',
        fontSize: 15,
        fontFamily: 'var(--font-sans)',
        color: 'var(--color-ink)',
        background: admin ? 'var(--color-surface-field)' : '#fff',
        border: `1px solid ${error ? 'var(--color-clay)' : focused ? 'var(--color-ink)' : 'var(--color-line-input)'}`,
        borderRadius: 0,
        outline: 'none',
        transition: 'border-color 120ms ease',
        ...style,
      }}
      {...rest}
    />
  );
});
Input.displayName = 'Input';

export const Field = ({ label, labelRight, error, help, children, style }) => (
  <div style={style}>
    {label && <FieldLabel right={labelRight}>{label}</FieldLabel>}
    {children}
    {help && <p style={{ margin: '8px 0 0', fontSize: 13, color: 'var(--color-text-4)' }}>{help}</p>}
    {error && typeof error === 'string' && (
      <p style={{ margin: '8px 0 0', fontSize: 13, color: 'var(--color-clay)' }}>{error}</p>
    )}
  </div>
);

/** Stacked fields — the spec's 20px group gap. */
export const FieldGroup = ({ children, gap = 20, style }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap, ...style }}>{children}</div>
);

/* ── Password visibility control ──────────────────────────────────────────
   A quiet mono SHOW / HIDE in text-3, 14px from the field's right edge and
   vertically centred. Explicitly not an icon. */
export const PasswordInput = React.forwardRef(({ error = false, admin = false, style, ...rest }, ref) => {
  const [visible, setVisible] = React.useState(false);

  return (
    <div style={{ position: 'relative' }}>
      <Input
        ref={ref}
        type={visible ? 'text' : 'password'}
        error={error}
        admin={admin}
        style={{ paddingRight: 62, ...style }}
        {...rest}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        tabIndex={-1}
        style={{
          position: 'absolute',
          right: 14,
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'none',
          border: 'none',
          padding: 0,
          cursor: 'pointer',
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          letterSpacing: '0.1em',
          color: 'var(--color-text-3)',
        }}
      >
        {visible ? 'HIDE' : 'SHOW'}
      </button>
    </div>
  );
});
PasswordInput.displayName = 'PasswordInput';

/* ── Password requirements ────────────────────────────────────────────────
   A column of 13.5px rows with an 8px gap. Each row is an 8px square plus
   the rule text. Met turns the square green and the text text-2. The spec is
   explicit that there are no checkmarks. */
export const PasswordRequirements = ({ rules = [], style }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12, ...style }}>
    {rules.map((rule) => (
      <div key={rule.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span
          style={{
            width: 8,
            height: 8,
            flexShrink: 0,
            background: rule.met ? 'var(--color-green)' : 'transparent',
            border: rule.met ? 'none' : '1px solid var(--color-line-btn)',
          }}
        />
        <span style={{ fontSize: 13.5, color: rule.met ? 'var(--color-text-2)' : 'var(--color-text-4)' }}>
          {rule.label}
        </span>
      </div>
    ))}
  </div>
);

/* ── Inline message ───────────────────────────────────────────────────────
   Full-width bar above the form action. White, hairline border in the tone
   colour, text in the same colour. Not a toast, not a tinted pill. */
export const InlineMessage = ({ tone = 'error', children, style }) => {
  if (!children) return null;
  const color = tone === 'success' ? 'var(--color-green)' : 'var(--color-clay)';

  return (
    <div
      role="status"
      style={{
        padding: '11px 14px',
        border: `1px solid ${color}`,
        background: '#fff',
        color,
        fontSize: 14,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/* ── Toggle ───────────────────────────────────────────────────────────────
   46 × 24px track with a 18px knob. Off: white track, line-btn knob, knob
   left. On: green track, white knob, knob right. */
export const Toggle = ({ checked = false, onChange, label, style }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    onClick={() => onChange?.(!checked)}
    style={{
      width: 46,
      height: 24,
      border: '1px solid var(--color-line-btn)',
      padding: 2,
      background: checked ? 'var(--color-green)' : '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: checked ? 'flex-end' : 'flex-start',
      cursor: 'pointer',
      borderRadius: 0,
      flexShrink: 0,
      transition: 'background-color 120ms ease',
      ...style,
    }}
  >
    <span style={{ width: 18, height: 18, background: checked ? '#fff' : 'var(--color-line-btn)', display: 'block' }} />
  </button>
);

/* ── Stepper ──────────────────────────────────────────────────────────────
   − / value / + with collapsed borders: the middle cell drops its left and
   right borders so the row reads as one control. */
export const Stepper = ({ value = 0, onChange, min = 0, max = 99, suffix = '', style }) => {
  const cell = {
    border: '1px solid var(--color-line-btn)',
    background: '#fff',
    padding: '8px 12px',
    cursor: 'pointer',
    fontFamily: 'var(--font-mono)',
    fontSize: 14,
    color: 'var(--color-ink)',
    lineHeight: 1,
    borderRadius: 0,
  };

  return (
    <div style={{ display: 'flex', alignItems: 'stretch', ...style }}>
      <button type="button" style={cell} onClick={() => onChange?.(Math.max(min, value - 1))} aria-label="Decrease">−</button>
      <span
        style={{
          ...cell,
          cursor: 'default',
          padding: '8px 16px',
          borderLeft: 'none',
          borderRight: 'none',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {value}{suffix}
      </span>
      <button type="button" style={cell} onClick={() => onChange?.(Math.min(max, value + 1))} aria-label="Increase">+</button>
    </div>
  );
};

/* ── Segmented filter ─────────────────────────────────────────────────────
   Buttons in a row with -1px left margins so their borders collapse.
   Selected is ink on white; unselected is text-3 on white. */
export const SegmentedFilter = ({ options = [], value, onChange, size = 'sm', style }) => {
  const pad = size === 'lg' ? '8px 14px' : '6px 12px';
  const fontSize = size === 'lg' ? 13 : 12.5;

  return (
    <div style={{ display: 'flex', ...style }}>
      {options.map((opt, i) => {
        const val = opt.value ?? opt;
        const label = opt.label ?? opt;
        const selected = val === value;
        return (
          <button
            key={val}
            type="button"
            onClick={() => onChange?.(val)}
            style={{
              padding: pad,
              fontSize,
              fontFamily: 'var(--font-sans)',
              border: '1px solid var(--color-line)',
              marginLeft: i === 0 ? 0 : -1,
              background: selected ? 'var(--color-ink)' : '#fff',
              color: selected ? '#fff' : 'var(--color-text-3)',
              cursor: 'pointer',
              borderRadius: 0,
              whiteSpace: 'nowrap',
              transition: 'background-color 120ms ease',
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
};

export default {
  Field, FieldLabel, FieldGroup, Input, PasswordInput, PasswordRequirements,
  InlineMessage, Toggle, Stepper, SegmentedFilter,
};
