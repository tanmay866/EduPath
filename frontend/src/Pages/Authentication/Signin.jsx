import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useFormik } from 'formik';
import { toast } from 'react-toastify';
import { forgotPassword } from '../Services/profileService';
import { login } from '../Services/authService';
import { useAuth } from '../Context/useAuth';
import {
  AuthShell, Field, FieldGroup, Input, PasswordInput, Button, InlineMessage, type,
} from '../../design';
import LegalConsent from '../../component/LegalConsent';

const Signin = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  // Where they were trying to go when the guard turned them away. Only
  // in-app paths are honoured — taking a full URL from the query string
  // would let a link sign someone in and then send them off-site.
  const [searchParams] = useSearchParams();
  const requested = searchParams.get('next') || '';
  // One leading slash and no backslash. "//host" is protocol-relative, and
  // some browsers fold "/\\host" into the same thing, so both would send
  // someone off-site the moment they signed in.
  const nextPath = /^\/(?!\/)[^\\]*$/.test(requested) ? requested : '';

  // Server-side failures were reported by toast alone, so the reason a sign-in
  // was refused slid off screen after five seconds and left the form looking
  // untouched. It stays on the form now, next to the fields it is about.
  const [formError, setFormError] = useState('');

  // Set by the expired-token handler when it sends somebody here. Without it
  // the sign-in form appears mid-task with no explanation, which reads as
  // having been signed out at random rather than as a session running out.
  const expired = searchParams.get('expired') === '1';

  const formik = useFormik({
    initialValues: { identifier: '', password: '' },

    validate: (values) => {
      const errors = {};
      if (!values.identifier) errors.identifier = 'Email or Login ID is required';
      if (!values.password) errors.password = 'Password is required';
      return errors;
    },

    onSubmit: async (values, { resetForm }) => {
      setFormError('');

      try {
        const identifier = values.identifier.trim();
        const payload = { password: values.password };

        // detect email or loginId
        if (identifier.includes('@')) {
          payload.email = identifier;
        } else {
          payload.loginId = identifier;
        }

        const res = await login(payload);
        signIn(res.token, res.user);

        toast.success('Signin successful!');
        resetForm();

        // App picks the admin route tree from sessionStorage once, at render,
        // so an in-app navigation would land on the learner tree. This used to
        // navigate, wait a second and then reload; one real navigation does
        // the same job without the flash in between.
        if (res.user.role === 'admin') {
          window.location.assign('/admin');
          return;
        }

        // Signing in used to land on the marketing home page, which is the one
        // place a signed-in user has no reason to be. Straight to the app —
        // or to onboarding first, matching what RequiresProfile would decide.
        // Read from the response rather than from storage: signIn has just
        // written it, but state set during this handler is not visible here.
        const complete = Boolean(res.user?.profile_complete);
        navigate(
          // Finish the trip they started. Onboarding still comes first when
          // the profile is incomplete, and carries the destination onward.
          complete
            ? (nextPath || '/assessment')
            : `/onboarding${nextPath ? `?next=${encodeURIComponent(nextPath)}` : ''}`,
          { replace: true }
        );
      } catch (error) {
        console.error('Signin error:', error);

        // An unverified account is not a dead end — send them to the code step
        // instead of just refusing, otherwise there is no route back in.
        const data = error.response?.data;
        if (data?.requiresVerification) {
          toast.info(data.message || 'Please verify your email to continue.');
          navigate('/verify-email', { state: { email: data.email || values.identifier } });
          return;
        }

        const message = data?.message
          || (error.request ? 'Cannot reach the server. Please make sure the backend is running.' : 'Signin failed. Please try again.');
        setFormError(message);
        toast.error(message);
      }
    },
  });

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    const identifier = formik.values.identifier;

    if (!identifier) {
      toast.error('Please enter your email address');
      return;
    }
    if (!identifier.includes('@')) {
      toast.error('Please enter a valid email address (not Login ID)');
      return;
    }

    try {
      const response = await forgotPassword(identifier);
      toast.success(response.message || 'Password reset email sent successfully! Please check your inbox.');
    } catch (error) {
      toast.error(error.message || 'Failed to send reset email. Please try again.');
    }
  };

  const showError = formik.submitCount > 0;

  return (
    <AuthShell
      quote="A roadmap is only useful if it tells you what to do on Monday."
      attribution="The EduPath method"
    >
      <h1 style={{ ...type.authHeading, margin: 0, color: 'var(--color-ink)' }}>Sign in</h1>

      <p style={{ fontSize: 15, color: 'var(--color-text-3)', margin: '12px 0 32px' }}>
        No account yet? <Link to="/signup">Create one</Link>
      </p>

      {expired && (
        <InlineMessage tone="info" style={{ marginBottom: 22 }}>
          Your session ended, so we signed you out. Sign in to pick up where you left off.
        </InlineMessage>
      )}

      <form onSubmit={formik.handleSubmit} noValidate>
        <FieldGroup>
          <Field label="Email or Login ID" error={showError ? formik.errors.identifier : null}>
            <Input
              name="identifier"
              value={formik.values.identifier}
              onChange={(e) => { setFormError(''); formik.handleChange(e); }}
              onBlur={formik.handleBlur}
              error={Boolean(showError && formik.errors.identifier)}
              autoComplete="username"
              placeholder="you@example.com"
            />
          </Field>

          <Field
            label="Password"
            labelRight={
              <button
                type="button"
                onClick={handleForgotPassword}
                style={{
                  background: 'none', border: 'none', padding: 0, cursor: 'pointer',
                  fontSize: 13, textDecoration: 'underline', color: 'var(--color-text-3)',
                  fontFamily: 'var(--font-sans)',
                }}
              >
                Forgot?
              </button>
            }
            error={showError ? formik.errors.password : null}
          >
            <PasswordInput
              name="password"
              value={formik.values.password}
              onChange={(e) => { setFormError(''); formik.handleChange(e); }}
              onBlur={formik.handleBlur}
              error={Boolean(showError && formik.errors.password)}
              autoComplete="current-password"
              placeholder="Your password"
            />
          </Field>
        </FieldGroup>

        {/* role="status" lives inside InlineMessage, so a screen reader is
            told why the attempt failed rather than only sighted users. */}
        {formError && (
          <InlineMessage tone="error" style={{ marginTop: 22 }}>{formError}</InlineMessage>
        )}
        {!formError && showError && !formik.isValid && (
          <InlineMessage tone="error" style={{ marginTop: 22 }}>
            Check the fields above and try again.
          </InlineMessage>
        )}

        <div style={{ marginTop: 26 }}>
          <Button
            type="submit"
            fullWidth
            loading={formik.isSubmitting}
            loadingLabel="Signing in…"
          >
            Sign in
          </Button>
        </div>
      </form>

      <LegalConsent action="signing in" />
    </AuthShell>
  );
};

export default Signin;
