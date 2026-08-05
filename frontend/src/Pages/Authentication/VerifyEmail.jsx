import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { getApiErrorMessage } from '../../utils/passwordPolicy';
import { storeSession } from '../../utils/session';
import { AuthShell, Field, Input, Button, InlineMessage, MicroLabel, type } from '../../design';

const API_URL = import.meta.env.VITE_API_URL;
const RESEND_COOLDOWN_SECONDS = 60;

/**
 * Email verification step.
 *
 * Reached after signup, or from sign-in when the account exists but has not
 * been verified. The address arrives via router state so the user does not have
 * to retype it; if it is missing we send them back rather than guessing.
 *
 * Spec §7 describes this screen with no form — a status label, a paragraph and
 * one action — because it assumes a link-based flow. This build verifies with a
 * six-digit code, so the field stays; everything around it follows the spec.
 */
const VerifyEmail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [message, setMessage] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!email) {
      navigate('/signup', { replace: true });
      return;
    }
    inputRef.current?.focus();
  }, [email, navigate]);

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const id = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  const handleVerify = async (e) => {
    e.preventDefault();

    if (otp.length !== 6) {
      setMessage({ tone: 'error', text: 'Enter the six-digit code from your email.' });
      return;
    }

    setLoading(true);
    setMessage(null);
    try {
      const { data } = await axios.post(`${API_URL}/api/auth/verify-otp`, { email, otp });

      // Same session keys sign-in writes, so the app treats them as fully
      // logged in and they are not bounced back to /signin.
      if (data.token) storeSession(data.token, data.user);

      toast.success(data.message || 'Email verified.');

      // A brand new account has no target role yet, and almost everything
      // personalised is built from it — so ask once, here, rather than on
      // each screen that needs it. Skippable from the page itself.
      navigate(data.user?.profile_complete ? '/' : '/onboarding', { replace: true });
    } catch (error) {
      setMessage({ tone: 'error', text: getApiErrorMessage(error.response?.data, 'Verification failed. Please try again.') });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;

    try {
      const { data } = await axios.post(`${API_URL}/api/auth/resend-otp`, { email });
      setMessage({ tone: 'success', text: data.message || 'A new code is on its way.' });
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (error) {
      setMessage({ tone: 'error', text: getApiErrorMessage(error.response?.data, 'Could not resend the code.') });
    }
  };

  return (
    <AuthShell
      quote="An address you control is what gets you back in when everything else is lost."
      attribution="The EduPath method"
      footLabel="VERIFICATION"
    >
      {/* Spec §7: a mono status label above the heading. */}
      <MicroLabel size={11} tracking="0.14em" color="var(--color-amber)" style={{ display: 'block', marginBottom: 14 }}>
        Pending
      </MicroLabel>

      <h1 style={{ ...type.authHeading, margin: 0, color: 'var(--color-ink)' }}>Verify your email</h1>

      <p style={{ fontSize: 15, color: 'var(--color-text-2)', margin: '14px 0 32px', lineHeight: 1.55 }}>
        We sent a six-digit code to <span style={{ color: 'var(--color-ink)' }}>{email}</span>. It expires in ten minutes.
      </p>

      <form onSubmit={handleVerify} noValidate>
        <Field label="Verification code">
          <Input
            ref={inputRef}
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            value={otp}
            onChange={(e) => { setOtp(e.target.value.replace(/\D/g, '')); setMessage(null); }}
            placeholder="000000"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 22,
              letterSpacing: '0.4em',
              textAlign: 'center',
            }}
          />
        </Field>

        {message && (
          <InlineMessage tone={message.tone} style={{ marginTop: 22 }}>
            {message.text}
          </InlineMessage>
        )}

        <div style={{ marginTop: 26 }}>
          <Button type="submit" fullWidth loading={loading} loadingLabel="Verifying…" disabled={otp.length !== 6}>
            Verify email
          </Button>
        </div>
      </form>

      <div style={{ marginTop: 22, display: 'flex', gap: 18, alignItems: 'center' }}>
        <Button variant="quiet" onClick={handleResend} disabled={cooldown > 0}>
          {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}
        </Button>
        <Link to="/signin" style={{ fontSize: 13.5 }}>Sign in instead</Link>
      </div>

      <p style={{ fontSize: 13, color: 'var(--color-text-4)', marginTop: 26, marginBottom: 0, lineHeight: 1.5 }}>
        If you did not create an account, ignore this — it cannot be used until the code is entered.
      </p>
    </AuthShell>
  );
};

export default VerifyEmail;
