import { deliver, isApiTransportConfigured } from '../services/emailProvider.js';
import {
  layout,
  heading,
  paragraph,
  subtle,
  button,
  codeBlock,
  detailRows,
  notice,
  linkFallback,
  badge,
  escapeHtml,
  bulletList,
} from './emailLayout.js';

/**
 * Send email utility function
 * 
 * @param {Object} options - Email options
 * @param {string} options.email - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - Email HTML content
 * @returns {Promise<boolean>} Success status
 */
const sendEmail = async (options) => {
  try {
    await deliver({
      to: options.email,
      subject: options.subject,
      html: options.html,
    });

    console.log(`✅ Email sent to ${options.email} via ${isApiTransportConfigured() ? 'Brevo' : 'SMTP'}`);
    return true;
  } catch (error) {
    console.error(`❌ Email sending failed: ${error.message}`);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

/**
 * Send welcome email
 *
 * Sent after the account is verified. It deliberately does not contain the
 * password: mail sits unencrypted in inboxes and in the provider's logs, and
 * the user chose the password, so there is nothing to tell them.
 *
 * @param {Object} user - User object
 * @returns {Promise<boolean>} Success status
 */
export const sendWelcomeEmail = async (user) => {
  const html = layout({
    preheader: `Your EduPath account is ready, ${user.firstName}.`,
    eyebrow: 'Welcome',
    content: [
      heading('Your account is ready'),
      paragraph(`Hi ${user.firstName}, your email is verified and your EduPath account is active.`),
      detailRows([
        { label: 'Login ID', value: user.loginId },
        { label: 'Email', value: user.email },
      ]),
      paragraph('To get started, complete your profile and pick a target role &mdash; that is what your roadmap and skill assessments are built from.'),
      button('Open EduPath', `${process.env.FRONTEND_URL}/profile`),
      notice('EduPath will never email you your password, and will never ask for it. If a message claims to, it did not come from us.'),
    ].join('\n'),
  });

  return await sendEmail({
    email: user.email,
    subject: 'Welcome to EduPath',
    html,
  });
};

/**
 * Send the 6-digit email verification code.
 *
 * @param {Object} user - User object
 * @param {string} otp - the plain 6-digit code (only the hash is stored)
 * @param {number} expiryMinutes - how long the code stays valid
 * @returns {Promise<boolean>} Success status
 */
export const sendVerificationEmail = async (user, otp, expiryMinutes = 10) => {
  const html = layout({
    preheader: `${otp} is your EduPath verification code.`,
    eyebrow: 'Verify your email',
    content: [
      heading('Verify your email address'),
      paragraph(`Hi ${user.firstName}, enter this code in EduPath to finish setting up your account.`),
      codeBlock(otp),
      subtle(`This code expires in ${expiryMinutes} minutes.`),
      notice('If you did not create an EduPath account, you can ignore this email. The account cannot be used until this code is entered.'),
    ].join('\n'),
  });

  return await sendEmail({
    email: user.email,
    subject: `${otp} is your EduPath verification code`,
    html,
  });
};

/**
 * Send password reset email
 *
 * @param {Object} user - User object
 * @param {string} resetToken - Reset token
 * @returns {Promise<boolean>} Success status
 */
export const sendPasswordResetEmail = async (user, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

  const html = layout({
    preheader: 'Reset your EduPath password. This link expires in 10 minutes.',
    eyebrow: 'Password reset',
    content: [
      heading('Reset your password'),
      paragraph(`Hi ${user.firstName}, we received a request to reset the password for your EduPath account.`),
      button('Reset password', resetUrl),
      subtle('This link expires in 10 minutes and can only be used once.'),
      linkFallback(resetUrl),
      notice('If you did not request this, you can ignore this email &mdash; your password will not change.'),
    ].join('\n'),
  });

  return await sendEmail({
    email: user.email,
    subject: 'Reset your EduPath password',
    html,
  });
};

/**
 * Send password change confirmation email
 *
 * @param {Object} user - User object
 * @returns {Promise<boolean>} Success status
 */
export const sendPasswordChangeEmail = async (user) => {
  const html = layout({
    preheader: 'Your EduPath password was changed.',
    eyebrow: 'Account security',
    content: [
      heading('Your password was changed'),
      `              <p style="margin:0 0 18px 0;">${badge('Changed', 'green')}</p>`,
      paragraph(`Hi ${user.firstName}, the password for your EduPath account was changed successfully.`),
      subtle(`Changed on ${new Date().toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' })}.`),
      notice('If this was not you, reset your password immediately and contact us. Someone else may have access to your account.'),
      button('Go to EduPath', `${process.env.FRONTEND_URL}/signin`),
    ].join('\n'),
  });

  return await sendEmail({
    email: user.email,
    subject: 'Your EduPath password was changed',
    html,
  });
};

/**
 * Confirm that an account was deleted.
 *
 * Partly a courtesy, mostly a safeguard: if someone else deleted the account,
 * this is the only notice the owner will ever get, and it has to reach an
 * address that no longer exists in our records.
 *
 * @param {Object} user - snapshot taken before the record was removed
 * @param {Object} [removed] - counts per collection, for the summary
 * @returns {Promise<boolean>} Success status
 */
export const sendAccountDeletedEmail = async (user, removed = {}) => {
  const LABELS = {
    roadmaps: 'Roadmaps',
    skillGaps: 'Skill assessments',
    quizSessions: 'Quiz sessions',
    quizResults: 'Quiz results',
    practiceResults: 'Aptitude & CS fundamentals results',
    interviewResults: 'Mock interview results',
    progressLogs: 'Progress records',
    portfolios: 'Portfolios',
    resumes: 'Uploaded resumes',
    generatedResumes: 'Generated resumes',
  };

  const rows = Object.entries(removed)
    .filter(([, count]) => count > 0)
    .map(([key, count]) => ({ label: LABELS[key] || key, value: String(count) }));

  const content = [
    heading('Your account has been deleted'),
    `              <p style="margin:0 0 18px 0;">${badge('Deleted', 'clay')}</p>`,
    paragraph(`Hi ${user.firstName}, your EduPath account has been permanently deleted, along with everything stored in it. Nothing is kept, and this cannot be undone.`),
  ];

  if (rows.length) {
    content.push(paragraph('Removed with your account:'), detailRows(rows));
  }

  content.push(
    subtle('Portfolio sites you deployed are hosted separately and stay online. You will need to remove those from your hosting provider yourself.'),
    paragraph('Thank you for the time you spent building here. If you ever want to start again, you are welcome back &mdash; a new account takes a minute.'),
    button('Create a new account', `${process.env.FRONTEND_URL}/signup`),
    notice(`If you did not delete this account, reply to this email or contact us at ${process.env.EMAIL_USER} straight away &mdash; it would mean someone else had access to it.`)
  );

  return await sendEmail({
    email: user.email,
    subject: 'Your EduPath account has been deleted',
    html: layout({
      preheader: 'Your EduPath account and its data have been permanently removed.',
      eyebrow: 'Account deleted',
      content: content.join('\n'),
    }),
  });
};

/**
 * The Monday email: the week the learner is on, and its tasks.
 *
 * Deliberately narrow. It says what to do this week and links to it — no
 * digest of everything, no streak, no scores. A weekly mail that reproduces
 * the dashboard gets filtered; one that answers a single question gets opened.
 *
 * Only sent to someone who asked for it and has an unfinished plan, so the
 * copy can assume both rather than hedging.
 *
 * @param {Object} user
 * @param {Object} week - the current weekly_plan entry
 * @param {Object} meta - { targetRole, weekCount, doneCount, unsubscribeUrl }
 */
export const sendWeeklyPlanEmail = async (user, week, meta = {}) => {
  const tasks = week.tasks || [];
  const ticked = new Set((week.completed_tasks || []).map(Number));
  // What is left, not everything. A task ticked last week reappearing as
  // homework reads as the product not paying attention.
  const remaining = tasks.filter((_, i) => !ticked.has(i));

  const covers = (week.skills || []).join(', ');
  const title = covers || `Week ${week.week_number}`;
  const openUrl = `${process.env.FRONTEND_URL}/assessment`;

  const html = layout({
    preheader: `Week ${week.week_number}: ${title} — ${remaining.length} ${remaining.length === 1 ? 'task' : 'tasks'} left.`,
    eyebrow: `Week ${week.week_number} of ${meta.weekCount}`,
    content: [
      heading(title),
      paragraph(`Hi ${escapeHtml(user.firstName)}, this is where you are on ${escapeHtml(meta.targetRole || 'your track')}.`),
      bulletList(remaining),
      button('Open this week', openUrl),
      subtle(
        `${meta.doneCount} of ${meta.weekCount} weeks done.`
        + (week.estimated_hours ? ` About ${week.estimated_hours} hours planned.` : '')
      ),
      linkFallback(openUrl),
      meta.unsubscribeUrl
        ? subtle(`Not useful? <a href="${meta.unsubscribeUrl}" style="color:#3A3733;">Stop these emails</a> — your plan stays exactly as it is.`)
        : '',
    ].filter(Boolean).join('\n'),
  });

  return await sendEmail({
    email: user.email,
    subject: `Week ${week.week_number}: ${title}`,
    html,
  });
};

export default sendEmail;
