import { deliver, isApiTransportConfigured } from '../services/emailProvider.js';

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
 * Send welcome email with login credentials
 * 
 * Sent after the account is verified. It deliberately does not contain the
 * password: mail sits unencrypted in inboxes and in the provider's logs, and
 * the user chose the password, so there is nothing to tell them.
 *
 * @param {Object} user - User object
 * @returns {Promise<boolean>} Success status
 */
export const sendWelcomeEmail = async (user) => {
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 30px;
          text-align: center;
          border-radius: 10px 10px 0 0;
        }
        .content {
          background: #f9f9f9;
          padding: 30px;
          border-radius: 0 0 10px 10px;
        }
        .credentials {
          background: white;
          padding: 20px;
          margin: 20px 0;
          border-radius: 8px;
          border-left: 4px solid #667eea;
        }
        .credential-item {
          margin: 10px 0;
          font-size: 16px;
        }
        .credential-label {
          font-weight: bold;
          color: #667eea;
        }
        .credential-value {
          font-family: 'Courier New', monospace;
          background: #f0f0f0;
          padding: 8px 12px;
          border-radius: 4px;
          display: inline-block;
          margin-left: 10px;
        }
        .button {
          display: inline-block;
          padding: 12px 30px;
          background: #667eea;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          margin-top: 20px;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          color: #666;
          font-size: 14px;
        }
        .warning {
          background: #fff3cd;
          border-left: 4px solid #ffc107;
          padding: 15px;
          margin: 20px 0;
          border-radius: 4px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🎓 Welcome to EduPath!</h1>
      </div>
      <div class="content">
        <h2>Hello ${user.firstName} ${user.lastName},</h2>
        <p>Congratulations! Your account has been successfully created on EduPath - Your Autonomous Learning & Career Roadmap Generator.</p>
        
        <div class="credentials">
          <h3>📝 Your Account Details</h3>
          <div class="credential-item">
            <span class="credential-label">Login ID:</span>
            <span class="credential-value">${user.loginId}</span>
          </div>
          <div class="credential-item">
            <span class="credential-label">Email:</span>
            <span class="credential-value">${user.email}</span>
          </div>
        </div>

        <div class="warning">
          <strong>⚠️ Important Security Notice:</strong>
          <p style="margin: 10px 0 0 0;">EduPath will never email you your password, and will never ask for it. If a message claims to, it did not come from us.</p>
        </div>

        <p><strong>What's Next?</strong></p>
        <ul>
          <li>Complete your profile setup</li>
          <li>Select your target career path</li>
          <li>Take skill assessments</li>
          <li>Get your personalized learning roadmap</li>
        </ul>

        <center>
          <a href="${process.env.FRONTEND_URL}/login" class="button">Login to EduPath</a>
        </center>

        <div class="footer">
          <p>If you didn't create this account, please ignore this email or contact our support team.</p>
          <p>&copy; ${new Date().getFullYear()} EduPath. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    email: user.email,
    subject: '🎓 Welcome to EduPath',
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
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .code { font-family: 'Courier New', monospace; font-size: 36px; font-weight: bold; letter-spacing: 10px; color: #667eea; background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea; text-align: center; margin: 25px 0; }
        .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>✉️ Verify your email</h1>
      </div>
      <div class="content">
        <h2>Hello ${user.firstName},</h2>
        <p>Enter this code on EduPath to finish setting up your account:</p>

        <div class="code">${otp}</div>

        <p>The code expires in <strong>${expiryMinutes} minutes</strong>.</p>

        <div class="warning">
          <strong>⚠️ Didn't sign up?</strong>
          <p style="margin: 10px 0 0 0;">Someone may have typed your address by mistake. You can ignore this email — the account cannot be used until this code is entered.</p>
        </div>

        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} EduPath. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

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

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 30px;
          text-align: center;
          border-radius: 10px 10px 0 0;
        }
        .content {
          background: #f9f9f9;
          padding: 30px;
          border-radius: 0 0 10px 10px;
        }
        .button {
          display: inline-block;
          padding: 12px 30px;
          background: #667eea;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          margin-top: 20px;
        }
        .warning {
          background: #f8d7da;
          border-left: 4px solid #dc3545;
          padding: 15px;
          margin: 20px 0;
          border-radius: 4px;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          color: #666;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🔐 Password Reset Request</h1>
      </div>
      <div class="content">
        <h2>Hello ${user.firstName},</h2>
        <p>We received a request to reset your password for your EduPath account.</p>
        
        <p>Click the button below to reset your password:</p>
        
        <center>
          <a href="${resetUrl}" class="button">Reset Password</a>
        </center>

        <p style="margin-top: 20px;">Or copy and paste this link into your browser:</p>
        <p style="background: #f0f0f0; padding: 10px; border-radius: 4px; word-break: break-all;">${resetUrl}</p>

        <div class="warning">
          <strong>⏰ This link will expire in 10 minutes</strong>
          <p style="margin: 10px 0 0 0;">For security reasons, this password reset link is only valid for 10 minutes.</p>
        </div>

        <p><strong>Didn't request this?</strong></p>
        <p>If you didn't request a password reset, please ignore this email. Your password will remain unchanged.</p>

        <div class="footer">
          <p>For security reasons, never share this email with anyone.</p>
          <p>&copy; ${new Date().getFullYear()} EduPath. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    email: user.email,
    subject: '🔐 Password Reset Request - EduPath',
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
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
          color: white;
          padding: 30px;
          text-align: center;
          border-radius: 10px 10px 0 0;
        }
        .content {
          background: #f9f9f9;
          padding: 30px;
          border-radius: 0 0 10px 10px;
        }
        .info-box {
          background: white;
          padding: 20px;
          margin: 20px 0;
          border-radius: 8px;
          border-left: 4px solid #28a745;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          color: #666;
          font-size: 14px;
        }
        .warning {
          background: #fff3cd;
          border-left: 4px solid #ffc107;
          padding: 15px;
          margin: 20px 0;
          border-radius: 4px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>✅ Password Changed Successfully</h1>
      </div>
      <div class="content">
        <h2>Hello ${user.firstName},</h2>
        <p>Your password has been successfully changed.</p>
        
        <div class="info-box">
          <h3>📋 Change Details</h3>
          <p><strong>Account:</strong> ${user.email}</p>
          <p><strong>Login ID:</strong> ${user.loginId}</p>
          <p><strong>Changed at:</strong> ${new Date().toLocaleString()}</p>
        </div>

        <div class="warning">
          <strong>⚠️ Didn't make this change?</strong>
          <p style="margin: 10px 0 0 0;">If you did not change your password, please contact our support team immediately as your account may be compromised.</p>
        </div>

        <div class="footer">
          <p>Thank you for keeping your account secure!</p>
          <p>&copy; ${new Date().getFullYear()} EduPath. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    email: user.email,
    subject: '✅ Password Changed Successfully - EduPath',
    html,
  });
};

export default sendEmail;