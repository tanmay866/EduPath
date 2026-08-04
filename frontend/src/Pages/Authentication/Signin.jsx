import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useFormik } from 'formik';
import { toast } from 'react-toastify';
import { forgotPassword } from '../Services/profileService';
import API from '../Services/assessmentService';
import { storeSession } from '../../utils/session';
import {
  AuthShell, Field, FieldGroup, Input, PasswordInput, Button, InlineMessage, type,
} from '../../design';

const Signin = () => {
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: { identifier: '', password: '' },

    validate: (values) => {
      const errors = {};
      if (!values.identifier) errors.identifier = 'Email or Login ID is required';
      if (!values.password) errors.password = 'Password is required';
      return errors;
    },

    onSubmit: async (values, { resetForm }) => {
      try {
        const identifier = values.identifier.trim();
        const payload = { password: values.password };

        // detect email or loginId
        if (identifier.includes('@')) {
          payload.email = identifier;
        } else {
          payload.loginId = identifier;
        }

        const res = await API.post('/auth/login', payload);
        storeSession(res.data.token, res.data.user);

        toast.success('Signin successful!');
        resetForm();

        if (res.data.user.role === 'admin') {
          setTimeout(() => {
            navigate('/admin');
            window.location.reload();
          }, 1000);
        } else {
          navigate('/');
        }
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
        toast.error(message);
      }
    },
  });

  useEffect(() => {
    if (formik.submitCount > 0 && !formik.isValid) {
      toast.error('Please fill all required fields correctly');
    }
  }, [formik.submitCount]);

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
      footLabel="LEARNER ACCESS"
    >
      <h1 style={{ ...type.authHeading, margin: 0, color: 'var(--color-ink)' }}>Sign in</h1>

      <p style={{ fontSize: 15, color: 'var(--color-text-3)', margin: '12px 0 32px' }}>
        No account yet? <Link to="/signup">Create one</Link>
      </p>

      <form onSubmit={formik.handleSubmit} noValidate>
        <FieldGroup>
          <Field label="Email or Login ID" error={showError ? formik.errors.identifier : null}>
            <Input
              name="identifier"
              value={formik.values.identifier}
              onChange={formik.handleChange}
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
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={Boolean(showError && formik.errors.password)}
              autoComplete="current-password"
              placeholder="Your password"
            />
          </Field>
        </FieldGroup>

        {showError && !formik.isValid && (
          <InlineMessage tone="error" style={{ marginTop: 22 }}>
            Check the fields above and try again.
          </InlineMessage>
        )}

        <div style={{ marginTop: 26, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Button
            type="submit"
            fullWidth
            loading={formik.isSubmitting}
            loadingLabel="Signing in…"
          >
            Sign in
          </Button>

          <Button variant="secondary" fullWidth onClick={() => navigate('/admin')}>
            Sign in as administrator
          </Button>
        </div>
      </form>

      <p style={{ fontSize: 13, color: 'var(--color-text-4)', marginTop: 26, marginBottom: 0, lineHeight: 1.5 }}>
        By signing in you agree to the terms of use and the privacy policy.
      </p>
    </AuthShell>
  );
};

export default Signin;
