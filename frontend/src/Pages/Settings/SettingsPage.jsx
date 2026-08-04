import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { changePassword, deleteAccount } from '../Services/profileService';
import { getPasswordError, getApiErrorMessage, getPasswordRules } from '../../utils/passwordPolicy';
import {
  LearnerShell, Card, CardHeader, Button, Field, FieldGroup, PasswordInput, Input,
  PasswordRequirements, InlineMessage, MicroLabel, Modal,
} from '../../design';
import { learnerNav, sessionInitials, sessionName, sessionLoginId } from '../../design/nav';

/**
 * Spec §7 Settings (security).
 *
 * Password change sits on its own on the left — it's the one card here with
 * real content (three fields, a requirements checklist). Session and the
 * danger zone are both a single row apiece, so they stack on the right
 * instead of running the page all the way down a single centred column with
 * paper spare on both sides. Session is the row that used to live as a quiet
 * link in the marketing header for anyone signed in; the danger zone carries
 * a clay header label and a destructive button that opens the modal.
 */
const SettingsPage = () => {
  const navigate = useNavigate();

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Sign out state
  const [showSignOutModal, setShowSignOutModal] = useState(false);

  // Account deletion state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleSignOut = () => {
    sessionStorage.clear();
    // App.jsx picks admin vs. learner routes by reading sessionStorage
    // directly at render time, not through React state, so a plain
    // navigate() wouldn't re-run that check — see design/shells.jsx's
    // SignOut for the same reasoning. A hard reload does.
    window.location.href = '/signin';
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    setPasswordError('');

    try {
      await deleteAccount(deletePassword);

      // The account no longer exists, so the stored token is dead. Clear it
      // before navigating or the next protected request 404s on a ghost user.
      sessionStorage.clear();
      navigate('/', { replace: true });
    } catch (err) {
      setShowDeleteModal(false);
      setPasswordError(getApiErrorMessage(err, 'Could not delete your account.'));
      setTimeout(() => setPasswordError(''), 4000);
    } finally {
      setDeleteLoading(false);
    }
  };

  useEffect(() => {
    // Check if user is logged in
    const email = sessionStorage.getItem('email');
    if (!email) {
      navigate('/signin');
      return;
    }
  }, [navigate]);

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordError('');
    setPasswordMessage('');

    // Validation
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordError('All fields are required');
      setTimeout(() => setPasswordError(''), 3000);
      setPasswordLoading(false);
      return;
    }

    const newPasswordError = getPasswordError(passwordData.newPassword);
    if (newPasswordError) {
      setPasswordError(newPasswordError);
      setTimeout(() => setPasswordError(''), 3000);
      setPasswordLoading(false);
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      setTimeout(() => setPasswordError(''), 3000);
      setPasswordLoading(false);
      return;
    }

    try {
      const response = await changePassword(passwordData);
      if (response.success) {
        // Update token in sessionStorage
        if (response.token) {
          sessionStorage.setItem('token', response.token);
        }
        setPasswordMessage(response.message || 'Password changed');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setTimeout(() => setPasswordMessage(''), 3000);
      }
    } catch (err) {
      setPasswordError(getApiErrorMessage(err, 'Failed to change password'));
      setTimeout(() => setPasswordError(''), 3000);
    } finally {
      setPasswordLoading(false);
    }
  };

  const canDelete = deleteConfirm === 'DELETE' && Boolean(deletePassword);

  return (
    <LearnerShell
      sections={learnerNav}
      eyebrow="Account"
      title="Settings"
      note={sessionName()}
      initials={sessionInitials()}
      footLabel={sessionLoginId()}
    >
      <div style={{ maxWidth: 1100, margin: '0 auto', width: '100%' }}>
        <div style={{ marginBottom: 18 }}>
          <Button variant="quiet" onClick={() => navigate('/profile')}>Back to profile</Button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22, alignItems: 'start' }}>
          {/* Left — change password, the one card here with real content */}
          <Card>
            <CardHeader label="Change password" />

            <form onSubmit={handleChangePassword}>
              <div style={{ padding: '22px 24px' }}>
                <FieldGroup>
                  <Field label="Current password">
                    <PasswordInput
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      placeholder="Your current password"
                      autoComplete="current-password"
                    />
                  </Field>

                  <Field label="New password">
                    <PasswordInput
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      placeholder="Your new password"
                      autoComplete="new-password"
                    />
                    <PasswordRequirements rules={getPasswordRules(passwordData.newPassword)} />
                  </Field>

                  <Field label="Confirm new password">
                    <PasswordInput
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      placeholder="Repeat the new password"
                      autoComplete="new-password"
                    />
                  </Field>

                  {passwordError && <InlineMessage tone="error">{passwordError}</InlineMessage>}
                  {passwordMessage && <InlineMessage tone="success">{passwordMessage}</InlineMessage>}
                </FieldGroup>
              </div>

              <div style={{ padding: '18px 24px', borderTop: '1px solid var(--color-line)' }}>
                <Button type="submit" loading={passwordLoading} loadingLabel="Updating…">
                  Update password
                </Button>
              </div>
            </form>
          </Card>

          {/* Right — session and the danger zone, each a single row, stacked */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
            <Card>
              <CardHeader label="Session" />

              <div
                style={{
                  padding: '17px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 24,
                }}
              >
                <div>
                  <div style={{ fontSize: 15.5, fontWeight: 500, color: 'var(--color-ink)' }}>
                    Sign out
                  </div>
                  <p style={{ fontSize: 14, color: 'var(--color-text-3)', margin: '4px 0 0', lineHeight: 1.5 }}>
                    Ends your session on this device. You will need your password to get back in.
                  </p>
                </div>

                <Button
                  variant="secondary"
                  style={{ flexShrink: 0, padding: '10px 20px', fontSize: 14 }}
                  onClick={() => setShowSignOutModal(true)}
                >
                  Sign out
                </Button>
              </div>
            </Card>

            <Card>
              <CardHeader
                label={
                  <MicroLabel size={10.5} tracking="0.13em" color="var(--color-clay)">
                    Danger zone
                  </MicroLabel>
                }
              />

              <div
                style={{
                  padding: '17px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 24,
                }}
              >
                <div>
                  <div style={{ fontSize: 15.5, fontWeight: 500, color: 'var(--color-clay)' }}>
                    Delete this account
                  </div>
                  <p style={{ fontSize: 14, color: 'var(--color-text-3)', margin: '4px 0 0', lineHeight: 1.5 }}>
                    Removes your roadmaps, quiz results, resumes and portfolios. Portfolio sites you have
                    already deployed stay online and must be taken down separately.
                  </p>
                </div>

                <Button
                  variant="destructive"
                  style={{ flexShrink: 0, padding: '10px 20px', fontSize: 14 }}
                  onClick={() => { setShowDeleteModal(true); setDeletePassword(''); setDeleteConfirm(''); }}
                >
                  Delete
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <Modal
        open={showSignOutModal}
        onClose={() => setShowSignOutModal(false)}
        title="Sign out?"
        actions={
          <>
            <Button variant="secondary" onClick={() => setShowSignOutModal(false)}>Stay signed in</Button>
            <Button onClick={handleSignOut}>Sign out</Button>
          </>
        }
      >
        You will need your password to get back in. Nothing you have saved is removed.
      </Modal>

      {/* Two independent confirmations: the password proves it is really them,
          typing DELETE proves the click was deliberate. */}
      <Modal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete your account?"
        actions={
          <>
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)} disabled={deleteLoading}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              loading={deleteLoading}
              loadingLabel="Deleting…"
              disabled={!canDelete}
            >
              Delete forever
            </Button>
          </>
        }
      >
        <p style={{ margin: '0 0 20px' }}>
          Everything tied to this account is erased immediately. There is no way to recover it.
        </p>

        <FieldGroup>
          <Field label="Confirm your password">
            <PasswordInput
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              placeholder="Your password"
              autoComplete="current-password"
            />
          </Field>

          <Field label="Type DELETE to confirm">
            <Input
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder="DELETE"
              style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.1em' }}
            />
          </Field>
        </FieldGroup>
      </Modal>
    </LearnerShell>
  );
};

export default SettingsPage;
