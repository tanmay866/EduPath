import React, { useState } from 'react';
import { API_BASE } from '../config';
import { Button, InlineMessage } from '../design';

/**
 * A quiet "something is wrong here" control, wherever something can be wrong.
 *
 * It sends the context the screen already has rather than asking the learner
 * to describe which question they meant. That is the whole difference between
 * a report someone can act on and one that needs a reply first.
 *
 * Deliberately small and closed by default. A reporting control that competes
 * with the content is one people click by accident and then ignore.
 */
const ReportControl = ({ kind, context = {}, label = 'Report a problem', compact = false }) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [state, setState] = useState('idle');
  const [error, setError] = useState('');

  const send = async () => {
    setState('sending');
    setError('');
    try {
      const res = await fetch(`${API_BASE}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionStorage.getItem('token')}`,
        },
        body: JSON.stringify({ kind, message, context }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.message || 'That did not send.');
      setState('sent');
    } catch (err) {
      setError(err.message || 'That did not send.');
      setState('idle');
    }
  };

  if (state === 'sent') {
    return (
      <span style={{ fontSize: 13, color: 'var(--color-green)' }}>
        Reported — thank you.
      </span>
    );
  }

  if (!open) {
    return (
      <Button
        variant="quiet"
        style={{ fontSize: compact ? 12.5 : 13.5 }}
        onClick={() => setOpen(true)}
      >
        {label}
      </Button>
    );
  }

  return (
    <div style={{ marginTop: 8, maxWidth: 520 }}>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value.slice(0, 2000))}
        rows={3}
        autoFocus
        placeholder="What is wrong with it?"
        style={{
          width: '100%',
          padding: '10px 12px',
          fontSize: 14,
          fontFamily: 'var(--font-sans)',
          lineHeight: 1.5,
          color: 'var(--color-ink)',
          background: '#fff',
          border: '1px solid var(--color-line-input)',
          borderRadius: 0,
          outline: 'none',
          resize: 'vertical',
        }}
      />

      {error && <InlineMessage tone="error" style={{ marginTop: 8 }}>{error}</InlineMessage>}

      <div style={{ display: 'flex', gap: 10, marginTop: 8, flexWrap: 'wrap' }}>
        <Button
          variant="secondary"
          style={{ padding: '7px 14px', fontSize: 13.5 }}
          disabled={message.trim().length < 4 || state === 'sending'}
          onClick={send}
        >
          {state === 'sending' ? 'Sending…' : 'Send report'}
        </Button>
        <Button variant="quiet" onClick={() => { setOpen(false); setError(''); }}>
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default ReportControl;
