import React, { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { API_BASE } from '../config';
import { AuthShell, Button, InlineMessage, MicroLabel, type } from '../design';

/**
 * The page the "Stop these emails" link in the Monday email lands on.
 *
 * It unsubscribes on load rather than asking for a confirming click. Someone
 * who followed that link has already decided, and making them press a second
 * button is how a person gives up and reports the mail as spam instead.
 *
 * Acting on load is safe here specifically because the endpoint is a POST.
 * Mail clients and security scanners prefetch links, but they issue GETs — so
 * a scanner opening this page fetches the HTML and nothing happens. If the
 * endpoint accepted GET, every scanned email would unsubscribe its recipient.
 *
 * No sign-in, by design: the signed token in the link is the authorisation,
 * and requiring a password to stop unwanted email is the same failure as the
 * extra click, only worse.
 */
const Unsubscribe = () => {
  const [params] = useSearchParams();
  const [outcome, setOutcome] = useState('working');
  // React 18 mounts effects twice in development. Without this the request
  // fires twice — harmless, since the endpoint is idempotent, but it makes the
  // network tab lie about what the page does.
  const sent = useRef(false);

  const user = params.get('u');
  const token = params.get('t');

  // Derived from the URL rather than set in the effect — a truncated link is
  // knowable at render, and setting it from an effect is a second render for
  // something already in hand.
  const malformed = !user || !token;
  const state = malformed ? 'malformed' : outcome;

  useEffect(() => {
    if (malformed || sent.current) return;
    sent.current = true;

    fetch(`${API_BASE}/unsubscribe/weekly?u=${encodeURIComponent(user)}&t=${encodeURIComponent(token)}`, {
      method: 'POST',
    })
      .then((res) => setOutcome(res.ok ? 'done' : 'failed'))
      .catch(() => setOutcome('failed'));
  }, [malformed, user, token]);

  const body = {
    working: {
      heading: 'Stopping those emails…',
      text: 'One moment.',
    },
    done: {
      heading: 'That is stopped.',
      text: 'You will not get the weekly plan email again. Nothing else has changed — your roadmap, your progress and your account are exactly as they were. You can turn it back on in Settings whenever you like.',
    },
    malformed: {
      heading: 'That link is incomplete.',
      text: 'It may have been cut short by your mail client. Open Settings while signed in and turn the weekly email off there — it does the same thing.',
    },
    failed: {
      heading: 'That did not go through.',
      text: 'Something went wrong reaching us. Try the link again in a moment, or turn the weekly email off in Settings while signed in.',
    },
  }[state];

  return (
    <AuthShell
      quote="Nobody should have to sign in to stop an email."
      attribution="The EduPath method"
      footLabel="EMAIL"
    >
      <MicroLabel size={11} tracking="0.14em" color="var(--color-text-4)" style={{ display: 'block', marginBottom: 16 }}>
        Weekly email
      </MicroLabel>

      <h1 style={{ ...type.authHeading, margin: 0, color: 'var(--color-ink)' }}>{body.heading}</h1>

      <p style={{ fontSize: 15, color: 'var(--color-text-3)', margin: '14px 0 0', lineHeight: 1.6 }}>
        {body.text}
      </p>

      {state === 'failed' && (
        <InlineMessage tone="error" style={{ marginTop: 22 }}>
          The request did not reach EduPath.
        </InlineMessage>
      )}

      {state !== 'working' && (
        <div style={{ display: 'flex', gap: 12, marginTop: 28, flexWrap: 'wrap' }}>
          <Link to="/settings" style={{ textDecoration: 'none' }}>
            <Button variant="secondary">Open Settings</Button>
          </Link>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <Button variant="quiet">Back to EduPath</Button>
          </Link>
        </div>
      )}
    </AuthShell>
  );
};

export default Unsubscribe;
