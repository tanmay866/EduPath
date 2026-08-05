import React, { useState } from 'react';
import { API_BASE } from '../../config';
import {
  EditorialShell, Button, Field, FieldGroup, Input, InlineMessage, MicroLabel, type,
} from '../../design';

/**
 * Spec §7 Marketing · contact.
 *
 * `1fr 1fr`: a Newsreader 44px heading with a mono contact block on the left;
 * the form, an inline message bar and a full-width primary on the right.
 */
const MAX_MESSAGE = 500;

const DETAILS = [
  {
    label: 'Address',
    lines: ['CHARUSAT University', 'Changa, Anand', 'Gujarat — 388421'],
  },
  {
    label: 'Phone',
    lines: ['+91 9313928398'],
    href: 'tel:+919313928398',
  },
  {
    label: 'Email',
    lines: ['edupath.developers@gmail.com'],
    href: 'mailto:edupath.developers@gmail.com',
  },
];

const Contact = () => {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Only the message is constrained, and only to the length the field
    // advertises. The name used to be stripped to [a-zA-Z\s] and the phone to
    // digits, which deleted characters as they were typed with nothing said:
    // O'Brien became OBrien, Anne-Marie became AnneMarie, José became Jos, and
    // a name written in Devanagari or Chinese disappeared altogether. The API
    // accepts all of them, so the field had no business refusing them.
    if (name === 'message' && value.length > MAX_MESSAGE) return;

    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear a validation error as soon as the field is touched, rather than
    // leaving it on screen while it is being corrected.
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSent(false);

    if (!formData.name || !formData.email || !formData.message) {
      setError('Please fill in your name, email and message');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/contact/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setSent(true);
        setFormData({ name: '', email: '', phone: '', message: '' });
      } else {
        setError(data.message || 'Failed to send message');
      }
    } catch {
      setError('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <EditorialShell>
      <section style={{ padding: '80px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'start' }}>
        {/* Left — who you are writing to */}
        <div>
          <MicroLabel size={11} tracking="0.14em" color="var(--color-text-4)" style={{ display: 'block', marginBottom: 16 }}>
            Contact
          </MicroLabel>

          <h1 style={{ ...type.marketingHeading, margin: '0 0 20px' }}>
            Tell us what is broken, or what is missing.
          </h1>

          <p style={{ ...type.prose, margin: '0 0 40px', maxWidth: 460 }}>
            Bug reports, questions about a roadmap, or a track you wish existed — all of it reaches
            the people who built this. Include what you were doing when something went wrong and we
            will get there faster.
          </p>

          <div style={{ borderTop: '1px solid var(--color-ink)' }}>
            {DETAILS.map((detail) => (
              <div key={detail.label} style={{ padding: '18px 0', borderBottom: '1px solid var(--color-line)' }}>
                <MicroLabel size={10.5} tracking="0.13em" color="var(--color-text-4)" style={{ display: 'block', marginBottom: 8 }}>
                  {detail.label}
                </MicroLabel>

                {detail.href ? (
                  <a
                    href={detail.href}
                    style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--color-ink)', textDecoration: 'none' }}
                  >
                    {detail.lines[0]}
                  </a>
                ) : (
                  detail.lines.map((line) => (
                    <div key={line} style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--color-ink)', lineHeight: 1.7 }}>
                      {line}
                    </div>
                  ))
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right — the form */}
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field label="Your name">
              <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
                autoComplete="name"
                placeholder="Tanmay Patel"
              />
            </Field>

            <Field label="Email">
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
                placeholder="you@example.com"
              />
            </Field>

            <Field label="Phone" help="Optional — only if you would rather we called.">
              <Input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                autoComplete="tel"
                inputMode="tel"
                maxLength={24}
                placeholder="+91 93139 28398"
              />
            </Field>

            <Field
              label="Message"
              labelRight={
                <MicroLabel size={10.5} color="var(--color-text-4)">
                  {`${formData.message.length}/${MAX_MESSAGE}`}
                </MicroLabel>
              }
            >
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={8}
                maxLength={MAX_MESSAGE}
                placeholder="What happened, and what you expected instead"
                style={{
                  width: '100%',
                  padding: '13px 14px',
                  fontSize: 15,
                  fontFamily: 'var(--font-sans)',
                  lineHeight: 1.55,
                  color: 'var(--color-ink)',
                  background: '#fff',
                  border: '1px solid var(--color-line-input)',
                  borderRadius: 0,
                  outline: 'none',
                  resize: 'vertical',
                }}
              />
            </Field>

            {/* Announced, not just shown — the outcome of a submit is the one
                thing on this page a screen reader has to be told about. */}
            <div role="status" aria-live="polite">
              {error && <InlineMessage tone="error">{error}</InlineMessage>}
              {sent && (
                <InlineMessage tone="success">
                  Message sent. We reply to the address you gave us, usually within a day or two.
                </InlineMessage>
              )}
            </div>

            <Button type="submit" fullWidth loading={loading} loadingLabel="Sending…">
              Send message
            </Button>
          </FieldGroup>
        </form>
      </section>
    </EditorialShell>
  );
};

export default Contact;
