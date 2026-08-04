/**
 * Shared layout for transactional email.
 *
 * Every template used a <style> block with CSS classes. Outlook renders mail
 * through Word and drops most of that, and Gmail strips <style> when it clips a
 * long message — so the emails degraded to unstyled text for a large share of
 * recipients. Everything here is inline styles on tables, which is what
 * survives across clients.
 *
 * The visual language is deliberately plain: one column, generous whitespace,
 * a single accent colour, no gradients or decorative emoji. That is what makes
 * a message read as a real account notification rather than marketing.
 */

const FONT_STACK =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";

const COLOR = {
  page: '#f4f5f7',
  surface: '#ffffff',
  border: '#e3e5e8',
  heading: '#16191d',
  body: '#3c4149',
  muted: '#6b7280',
  accent: '#4f46e5',
  noticeBg: '#fbfaf5',
  noticeBorder: '#e8e2cf',
  codeBg: '#f6f7f9',
};

/**
 * Hidden line that email clients show next to the subject in the inbox list.
 * Without it they pull the first visible words, which is usually the greeting.
 */
const preheaderMarkup = (text) => `
      <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:${COLOR.page};opacity:0;">${text}</div>`;

/**
 * @param {Object} options
 * @param {string} options.preheader - inbox preview line
 * @param {string} options.content - inner HTML for the card body
 * @returns {string} complete email document
 */
export const layout = ({ preheader = '', content = '' }) => `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="x-apple-disable-message-reformatting" />
  <meta name="color-scheme" content="light" />
  <meta name="supported-color-schemes" content="light" />
  <title>EduPath</title>
</head>
<body style="margin:0;padding:0;background-color:${COLOR.page};">
${preheaderMarkup(preheader)}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${COLOR.page};">
    <tr>
      <td align="center" style="padding:40px 16px;">

        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:520px;">
          <tr>
            <td style="padding:0 0 24px 4px;">
              <span style="font-family:${FONT_STACK};font-size:17px;font-weight:600;color:${COLOR.heading};letter-spacing:-0.2px;">EduPath</span>
            </td>
          </tr>

          <tr>
            <td style="background-color:${COLOR.surface};border:1px solid ${COLOR.border};border-radius:10px;padding:36px 36px 32px 36px;">
${content}
            </td>
          </tr>

          <tr>
            <td style="padding:24px 4px 0 4px;font-family:${FONT_STACK};font-size:12px;line-height:1.6;color:${COLOR.muted};">
              You received this message because of activity on your EduPath account.<br />
              &copy; ${new Date().getFullYear()} EduPath
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>
</html>`;

/** Page heading inside the card. */
export const heading = (text) =>
  `              <h1 style="margin:0 0 16px 0;font-family:${FONT_STACK};font-size:21px;line-height:1.35;font-weight:600;color:${COLOR.heading};letter-spacing:-0.2px;">${text}</h1>`;

/** Body paragraph. */
export const paragraph = (html) =>
  `              <p style="margin:0 0 16px 0;font-family:${FONT_STACK};font-size:15px;line-height:1.65;color:${COLOR.body};">${html}</p>`;

/** Smaller, quieter paragraph for caveats and expiry notes. */
export const subtle = (html) =>
  `              <p style="margin:0 0 16px 0;font-family:${FONT_STACK};font-size:13px;line-height:1.6;color:${COLOR.muted};">${html}</p>`;

/**
 * Bulletproof button. Built as a table because Outlook ignores padding on <a>,
 * which would otherwise collapse it to a bare underlined link.
 */
export const button = (label, url) => `              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 24px 0;">
                <tr>
                  <td align="center" bgcolor="${COLOR.accent}" style="border-radius:6px;">
                    <a href="${url}" target="_blank" style="display:inline-block;padding:12px 26px;font-family:${FONT_STACK};font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:6px;">${label}</a>
                  </td>
                </tr>
              </table>`;

/** The verification code, sized to be read and retyped from a phone. */
export const codeBlock = (code) => `              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 20px 0;">
                <tr>
                  <td align="center" style="background-color:${COLOR.codeBg};border:1px solid ${COLOR.border};border-radius:8px;padding:22px 16px;">
                    <span style="font-family:'SFMono-Regular',Consolas,'Liberation Mono',Menlo,monospace;font-size:32px;font-weight:600;letter-spacing:8px;color:${COLOR.heading};">${code}</span>
                  </td>
                </tr>
              </table>`;

/** Key/value rows, used for account details. */
export const detailRows = (rows) => `              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:4px 0 20px 0;border-top:1px solid ${COLOR.border};">
${rows
    .map(
      ({ label, value }) => `                <tr>
                  <td style="padding:12px 0;border-bottom:1px solid ${COLOR.border};font-family:${FONT_STACK};font-size:14px;color:${COLOR.muted};width:38%;">${label}</td>
                  <td style="padding:12px 0;border-bottom:1px solid ${COLOR.border};font-family:${FONT_STACK};font-size:14px;color:${COLOR.heading};font-weight:500;">${value}</td>
                </tr>`
    )
    .join('\n')}
              </table>`;

/** Set-apart note for security warnings and "didn't do this?" lines. */
export const notice = (html) => `              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:4px 0 4px 0;">
                <tr>
                  <td style="background-color:${COLOR.noticeBg};border:1px solid ${COLOR.noticeBorder};border-radius:8px;padding:14px 16px;font-family:${FONT_STACK};font-size:13px;line-height:1.6;color:${COLOR.body};">${html}</td>
                </tr>
              </table>`;

/** Long URL fallback for clients that will not render the button. */
export const linkFallback = (url) => `              <p style="margin:0 0 4px 0;font-family:${FONT_STACK};font-size:12px;line-height:1.5;color:${COLOR.muted};">If the button does not work, paste this into your browser:</p>
              <p style="margin:0 0 16px 0;font-family:${FONT_STACK};font-size:12px;line-height:1.5;color:${COLOR.accent};word-break:break-all;">${url}</p>`;

export default { layout, heading, paragraph, subtle, button, codeBlock, detailRows, notice, linkFallback };
