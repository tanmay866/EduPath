import createTransporter from '../config/mailConfig.js';

/**
 * Email transport selection.
 *
 * Render blocks outbound SMTP (ports 25/465/587) to stop its IPs being used for
 * spam, so nodemailer connections to smtp.gmail.com never complete there — every
 * email in production failed on a connection timeout while working fine locally.
 *
 * When BREVO_API_KEY is set we send over Brevo's HTTPS API, which is not
 * blocked. Without it we fall back to SMTP, so local development keeps working
 * against Gmail with no extra setup.
 *
 * Brevo was chosen over Resend because it verifies a single sender address
 * (a plain Gmail account is enough) rather than requiring a domain you can add
 * DNS records to.
 */

const BREVO_ENDPOINT = 'https://api.brevo.com/v3/smtp/email';
const REQUEST_TIMEOUT_MS = 15000;

export const isApiTransportConfigured = () => Boolean(process.env.BREVO_API_KEY);

/**
 * Brevo only accepts a sender address you have verified with them. EMAIL_FROM
 * is not reused because it points at a domain this project does not own; the
 * authenticated mailbox in EMAIL_USER is the address that can actually be
 * verified.
 */
const sender = () => ({
  name: process.env.BREVO_FROM_NAME || 'EduPath',
  email: process.env.BREVO_FROM_EMAIL || process.env.EMAIL_USER,
});

const sendViaBrevo = async ({ to, subject, html }) => {
  const response = await fetch(BREVO_ENDPOINT, {
    method: 'POST',
    headers: {
      'api-key': process.env.BREVO_API_KEY,
      'Content-Type': 'application/json',
      accept: 'application/json',
    },
    body: JSON.stringify({
      sender: sender(),
      to: [{ email: to }],
      subject,
      htmlContent: html,
    }),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  const body = await response.text();

  if (!response.ok) {
    let detail = body.slice(0, 200);
    try {
      detail = JSON.parse(body).message || detail;
    } catch {
      // non-JSON error body; the raw text is more useful than nothing
    }
    throw new Error(`Brevo rejected the message (${response.status}): ${detail}`);
  }

  return JSON.parse(body).messageId;
};

const sendViaSmtp = async ({ to, subject, html }) => {
  const transporter = createTransporter();
  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html,
  });
  return info.messageId;
};

/**
 * Deliver one email through whichever transport is configured.
 *
 * @param {Object} message
 * @param {string} message.to - recipient address
 * @param {string} message.subject
 * @param {string} message.html
 * @returns {Promise<string>} provider message id
 */
export const deliver = async (message) =>
  (isApiTransportConfigured() ? sendViaBrevo : sendViaSmtp)(message);

export default { deliver, isApiTransportConfigured };
