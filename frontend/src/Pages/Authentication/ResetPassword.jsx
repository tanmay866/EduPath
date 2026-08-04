import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { resetPassword } from '../Services/profileService';
import { getPasswordError, getApiErrorMessage, getPasswordRules } from '../../utils/passwordPolicy';
import {
  AuthShell, Field, FieldGroup, PasswordInput, PasswordRequirements, Button, InlineMessage, type,
} from '../../design';

const ResetPassword = () => {
  const navigate = useNavigate();
  const { token } = useParams();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [formData, setFormData] = useState({ password: '', confirmPassword: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setMessage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.password || !formData.confirmPassword) {
      setMessage({ tone: 'error', text: 'Both fields are required.' });
      setLoading(false);
      return;
    }

    const passwordError = getPasswordError(formData.password);
    if (passwordError) {
      setMessage({ tone: 'error', text: passwordError });
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setMessage({ tone: 'error', text: 'Passwords do not match.' });
      setLoading(false);
      return;
    }

    try {
      const response = await resetPassword(token, formData);

      if (response.success) {
        if (response.token) sessionStorage.setItem('token', response.token);
        toast.success(response.message || 'Password reset successful.');
        setTimeout(() => navigate('/signin'), 1500);
      }
    } catch (error) {
      setMessage({ tone: 'error', text: getApiErrorMessage(error, 'Failed to reset password. The link may have expired.') });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      quote="A password you had to write down was never protecting anything."
      attribution="The EduPath method"
      footLabel="PASSWORD RESET"
    >
      <h1 style={{ ...type.authHeading, margin: 0, color: 'var(--color-ink)' }}>Set a new password</h1>

      <p style={{ fontSize: 15, color: 'var(--color-text-3)', margin: '12px 0 32px' }}>
        Remembered it? <Link to="/signin">Sign in</Link>
      </p>

      <form onSubmit={handleSubmit} noValidate>
        <FieldGroup>
          <Field label="New password">
            <PasswordInput
              name="password"
              value={formData.password}
              onChange={handleChange}
              autoComplete="new-password"
            />
            <PasswordRequirements rules={getPasswordRules(formData.password)} />
          </Field>

          <Field label="Confirm new password">
            <PasswordInput
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              autoComplete="new-password"
              error={Boolean(formData.confirmPassword) && formData.confirmPassword !== formData.password}
            />
          </Field>
        </FieldGroup>

        {message && (
          <InlineMessage tone={message.tone} style={{ marginTop: 22 }}>
            {message.text}
          </InlineMessage>
        )}

        <div style={{ marginTop: 26 }}>
          <Button type="submit" fullWidth loading={loading} loadingLabel="Saving…">
            Save new password
          </Button>
        </div>
      </form>

      <p style={{ fontSize: 13, color: 'var(--color-text-4)', marginTop: 26, marginBottom: 0, lineHeight: 1.5 }}>
        This link can be used once and expires ten minutes after it was sent.
      </p>
    </AuthShell>
  );
};

export default ResetPassword;
