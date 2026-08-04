import React from 'react';

/**
 * Spec §5 Modal.
 *
 * Backdrop rgba(18,16,14,0.55), flat, no blur. Panel is surface with a 1px
 * ink border, max-width 460px, padding 28px 30px. Title Newsreader 26px, body
 * 14.5px text-2, actions right-aligned with a 12px gap.
 */
export const Modal = ({ open, onClose, title, children, actions }) => {
  React.useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', onKey);
    // Stop the page behind from scrolling while the panel is up.
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(18,16,14,0.55)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        zIndex: 50,
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-ink)',
          maxWidth: 460,
          width: '100%',
          padding: '28px 30px',
        }}
      >
        {title && (
          <h2
            style={{
              margin: 0,
              fontFamily: 'var(--font-display)',
              fontSize: 26,
              fontWeight: 400,
              letterSpacing: '-0.015em',
              color: 'var(--color-ink)',
              lineHeight: 1.2,
            }}
          >
            {title}
          </h2>
        )}
        <div style={{ fontSize: 14.5, color: 'var(--color-text-2)', lineHeight: 1.55, marginTop: title ? 14 : 0 }}>
          {children}
        </div>
        {actions && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 26 }}>{actions}</div>
        )}
      </div>
    </div>
  );
};

export default Modal;
