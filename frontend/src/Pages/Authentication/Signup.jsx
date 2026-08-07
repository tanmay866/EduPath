import React, { useState } from 'react';
import { API_BASE } from '../../config';
import { useNavigate, Link } from 'react-router-dom';
import { useFormik } from 'formik';
import axios from 'axios';
import { toast } from 'react-toastify';
import { getPasswordError, getApiErrorMessage, getPasswordRules } from '../../utils/passwordPolicy';
import {
  AuthShell, Field, FieldGroup, Input, PasswordInput, PasswordRequirements, Button, InlineMessage, type,
} from '../../design';
import LegalConsent from '../../component/LegalConsent';

const Signup = () => {
  const navigate = useNavigate();

  // Kept on the form rather than only in a toast, so "that address is already
  // registered" is still readable while you decide what to do about it.
  const [formError, setFormError] = useState('');

  const formik = useFormik({
    // No `role` here. The signup route ignores it now — it used to accept
    // whatever the client sent, including 'admin' — and a field the server
    // must refuse has no business being in the payload.
    initialValues: { firstName: '', lastName: '', email: '', password: '' },

    validate: (values) => {
      const errors = {};
      if (!values.firstName) errors.firstName = 'First name is required';
      if (!values.lastName) errors.lastName = 'Last name is required';
      if (!values.email) {
        errors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
        errors.email = 'Invalid email address';
      }
      const passwordError = getPasswordError(values.password);
      if (passwordError) errors.password = passwordError;
      return errors;
    },

    onSubmit: async (values, { resetForm, setSubmitting }) => {
      setFormError('');

      try {
        const response = await axios.post(`${API_BASE}/auth/signup`, values);

        // The account is not usable until the emailed code is entered, so send
        // the user straight to that step rather than to sign-in.
        toast.success(response.data?.message || 'Account created. Check your email for the code.');
        resetForm();
        navigate('/verify-email', { state: { email: values.email } });
      } catch (error) {
        console.error('Signup error:', error);
        const message = getApiErrorMessage(error.response?.data, 'Signup failed. Please try again.');
        setFormError(message);
        toast.error(message);
      } finally {
        setSubmitting(false);
      }
    },
  });

  const showError = formik.submitCount > 0;
  const err = (name) => (showError ? formik.errors[name] : null);

  return (
    <AuthShell
      quote="Everyone arrives with different gaps. The plan should start where you are."
      attribution="The EduPath method"
      footLabel="NEW ACCOUNT"
    >
      <h1 style={{ ...type.authHeading, margin: 0, color: 'var(--color-ink)' }}>Create account</h1>

      <p style={{ fontSize: 15, color: 'var(--color-text-3)', margin: '12px 0 32px' }}>
        Already registered? <Link to="/signin">Sign in</Link>
      </p>

      <form onSubmit={formik.handleSubmit} noValidate>
        <FieldGroup>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Field label="First name" error={err('firstName')}>
              <Input
                name="firstName"
                value={formik.values.firstName}
                onChange={(e) => { setFormError(''); formik.handleChange(e); }}
                onBlur={formik.handleBlur}
                error={Boolean(err('firstName'))}
                autoComplete="given-name"
              />
            </Field>
            <Field label="Last name" error={err('lastName')}>
              <Input
                name="lastName"
                value={formik.values.lastName}
                onChange={(e) => { setFormError(''); formik.handleChange(e); }}
                onBlur={formik.handleBlur}
                error={Boolean(err('lastName'))}
                autoComplete="family-name"
              />
            </Field>
          </div>

          <Field label="Email" error={err('email')}>
            <Input
              name="email"
              type="email"
              value={formik.values.email}
              onChange={(e) => { setFormError(''); formik.handleChange(e); }}
              onBlur={formik.handleBlur}
              error={Boolean(err('email'))}
              autoComplete="email"
              placeholder="you@example.com"
            />
          </Field>

          <Field label="Password" error={showError && !formik.values.password ? formik.errors.password : null}>
            <PasswordInput
              name="password"
              value={formik.values.password}
              onChange={(e) => { setFormError(''); formik.handleChange(e); }}
              onBlur={formik.handleBlur}
              error={Boolean(err('password'))}
              autoComplete="new-password"
            />
            {/* Rules are listed rather than revealed on failure, so the
                requirement is visible before the first attempt. */}
            <PasswordRequirements rules={getPasswordRules(formik.values.password)} />
          </Field>
        </FieldGroup>

        {formError && (
          <InlineMessage tone="error" style={{ marginTop: 22 }}>{formError}</InlineMessage>
        )}
        {!formError && showError && !formik.isValid && (
          <InlineMessage tone="error" style={{ marginTop: 22 }}>
            Check the fields above and try again.
          </InlineMessage>
        )}

        <div style={{ marginTop: 26 }}>
          <Button type="submit" fullWidth loading={formik.isSubmitting} loadingLabel="Creating account…">
            Create account
          </Button>
        </div>
      </form>

      <p style={{ fontSize: 13, color: 'var(--color-text-4)', marginTop: 26, marginBottom: 0, lineHeight: 1.5 }}>
        We send a six-digit code to confirm your address. The account cannot be used until it is entered.
      </p>

      <LegalConsent action="creating an account" style={{ marginTop: 12 }} />
    </AuthShell>
  );
};

export default Signup;
