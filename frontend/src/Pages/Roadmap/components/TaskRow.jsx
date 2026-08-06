import React from 'react';

/**
 * One tickable task.
 *
 * The marker fills rather than gaining a checkmark — §5 has none — and it is
 * the same 8px square the password rules use to mean satisfied, so "done"
 * looks the same everywhere in the product.
 */
const TaskRow = ({ task, ticked, onToggle, first = false }) => (
  <button
    type="button"
    onClick={onToggle}
    aria-pressed={ticked}
    style={{
      display: 'grid',
      gridTemplateColumns: '10px 1fr',
      gap: 12,
      marginTop: first ? 4 : 9,
      alignItems: 'start',
      width: '100%',
      textAlign: 'left',
      background: 'none',
      border: 'none',
      padding: 0,
      cursor: 'pointer',
      font: 'inherit',
    }}
  >
    <span
      style={{
        width: 8,
        height: 8,
        marginTop: 6,
        display: 'block',
        background: ticked ? 'var(--color-green)' : 'transparent',
        border: ticked ? 'none' : '1px solid var(--color-line-btn)',
        transition: 'background-color 120ms ease',
      }}
    />
    <span
      style={{
        fontSize: 14,
        lineHeight: 1.5,
        color: ticked ? 'var(--color-text-4)' : 'var(--color-text-2)',
        textDecoration: ticked ? 'line-through' : 'none',
      }}
    >
      {task}
    </span>
  </button>
);

export default TaskRow;
