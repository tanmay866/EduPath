/**
 * Shared layout for transactional email — restyled to match the frontend
 * redesign in design_handoff_edupath_redesign/DESIGN_SPEC.md: paper and ink,
 * a serif heading over plain sans body text, square corners, colour reserved
 * for status, and mono reserved for labels and figures rather than prose.
 *
 * Everything is still inline styles on tables, which is what survives across
 * clients — Outlook renders through Word and drops <style> blocks, and Gmail
 * strips <style> when it clips a long message. The only non-inline addition
 * is a progressive-enhancement <style> block that swaps in the real Newsreader
 * / IBM Plex fonts where a client's WebKit or Gecko engine can fetch them
 * (Apple Mail, most webmail); every element still carries its fallback stack
 * inline, so a client that ignores the <style> block still gets the right
 * serif/sans/mono shape, just not the exact family.
 *
 * The logo is built from table cells rather than an image: a linked image is
 * blocked by default in most inboxes until the user clicks "show images", so
 * the mark would be a broken square on first open. Nested tables render
 * immediately, with no network request and nothing to block.
 */

const FONT_DISPLAY = "Georgia, 'Times New Roman', Times, serif";
const FONT_SANS =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";
const FONT_MONO = "'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace";

const COLOR = {
  paper: '#efeeea',
  surface: '#ffffff',
  surfaceField: '#fbfaf7',
  surfaceAttn: '#faf7f0',
  ink: '#12100e',
  line: '#e3e1d9',
  lineSoft: '#efeee8',
  text2: '#4a4740',
  text3: '#6e6b64',
  text4: '#8a867e',
  clay: '#b4491f',
  green: '#2f6b45',
};

/**
 * Progressive font enhancement. Every inline style still names the fallback
 * stack directly, so clients that strip this block lose nothing but the exact
 * typeface.
 */
const FONT_ENHANCEMENT = `
  <style>
    @media screen {
      .ep-display { font-family: 'Newsreader', ${FONT_DISPLAY} !important; }
      .ep-sans { font-family: 'IBM Plex Sans', ${FONT_SANS} !important; }
      .ep-mono { font-family: 'IBM Plex Mono', ${FONT_MONO} !important; }
    }
  </style>
  <link href="https://fonts.googleapis.com/css2?family=Newsreader:opsz,wght@6..72,400;6..72,500&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet" />`;

/**
 * Hidden line that email clients show next to the subject in the inbox list.
 * Without it they pull the first visible words, which is usually the greeting.
 */
const preheaderMarkup = (text) => `
      <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:${COLOR.paper};opacity:0;">${text}</div>`;

/**
 * A single bar of the logo mark: a nested table whose top row is a
 * transparent spacer and whose bottom row is the coloured bar, so its visible
 * height is exact regardless of what the sibling bars in the same outer row
 * are doing. A shared <td height="7"> next to a <td height="15"> would just
 * have its background stretch to match the taller row — this is the
 * table-email workaround for that.
 */
const bar = (height, maxHeight) => `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:4px;"><tr><td width="4" height="${maxHeight - height}" style="font-size:0;line-height:0;">&nbsp;</td></tr><tr><td width="4" height="${height}" bgcolor="#ffffff" style="font-size:0;line-height:0;">&nbsp;</td></tr></table>`;

/** The Logo primitive from the frontend design system, reproduced in tables. */
const logoMark = (size = 28) => `<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td width="${size}" height="${size}" bgcolor="${COLOR.ink}" align="center" valign="middle" style="width:${size}px;height:${size}px;">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
                    <td>${bar(7, 15)}</td>
                    <td width="3"></td>
                    <td>${bar(11, 15)}</td>
                    <td width="3"></td>
                    <td>${bar(15, 15)}</td>
                  </tr></table>
                </td></tr></table>`;

/** Logo mark beside the Newsreader wordmark, exactly as it appears in the app header. */
const wordmark = () => `            <table role="presentation" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td>${logoMark(28)}</td>
                <td width="10"></td>
                <td valign="middle">
                  <span class="ep-display" style="font-family:${FONT_DISPLAY};font-size:24px;font-weight:400;letter-spacing:-0.01em;color:${COLOR.ink};">EduPath</span>
                </td>
              </tr>
            </table>`;

/**
 * @param {Object} options
 * @param {string} options.preheader - inbox preview line
 * @param {string} [options.eyebrow] - mono label in the card's header strip, e.g. "VERIFICATION"
 * @param {string} options.content - inner HTML for the card body
 * @returns {string} complete email document
 */
export const layout = ({ preheader = '', eyebrow = '', content = '' }) => `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="x-apple-disable-message-reformatting" />
  <meta name="color-scheme" content="light" />
  <meta name="supported-color-schemes" content="light" />
  <title>EduPath</title>${FONT_ENHANCEMENT}
</head>
<body style="margin:0;padding:0;background-color:${COLOR.paper};">
${preheaderMarkup(preheader)}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${COLOR.paper};">
    <tr>
      <td align="center" style="padding:48px 16px;">

        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:520px;">
          <tr>
            <td style="padding:0 0 28px 2px;">
${wordmark()}
            </td>
          </tr>

          <tr>
            <td style="background-color:${COLOR.surface};border:1px solid ${COLOR.line};border-radius:0;">
${eyebrow ? `              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding:13px 32px;border-bottom:1px solid ${COLOR.line};"><span class="ep-mono" style="font-family:${FONT_MONO};font-size:10.5px;letter-spacing:0.13em;text-transform:uppercase;color:${COLOR.text3};">${eyebrow}</span></td></tr></table>\n` : ''}              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding:32px 32px 30px 32px;">
${content}
              </td></tr></table>
            </td>
          </tr>

          <tr>
            <td style="padding:26px 4px 0 4px;">
              <span class="ep-sans" style="font-family:${FONT_SANS};font-size:12.5px;line-height:1.6;color:${COLOR.text4};">You received this message because of activity on your EduPath account.</span>
              <br />
              <span class="ep-mono" style="font-family:${FONT_MONO};font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:${COLOR.text4};">&copy; ${new Date().getFullYear()} EDUPATH</span>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>
</html>`;

/** Page heading inside the card — Newsreader, regular weight, ink. */
export const heading = (text) =>
  `              <h1 class="ep-display" style="margin:0 0 16px 0;font-family:${FONT_DISPLAY};font-size:26px;line-height:1.3;font-weight:400;color:${COLOR.ink};letter-spacing:-0.015em;">${text}</h1>`;

/** Body paragraph. */
export const paragraph = (html) =>
  `              <p class="ep-sans" style="margin:0 0 16px 0;font-family:${FONT_SANS};font-size:15px;line-height:1.65;color:${COLOR.text2};">${html}</p>`;

/** Smaller, quieter paragraph for caveats and expiry notes. */
export const subtle = (html) =>
  `              <p class="ep-sans" style="margin:0 0 16px 0;font-family:${FONT_SANS};font-size:13px;line-height:1.6;color:${COLOR.text4};">${html}</p>`;

/**
 * Bulletproof button, styled after the primary Button variant: ink fill,
 * white text, square corners, no shadow. Built as a table because Outlook
 * ignores padding on <a>, which would otherwise collapse it to a bare
 * underlined link.
 */
export const button = (label, url) => `              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 26px 0;">
                <tr>
                  <td align="center" bgcolor="${COLOR.ink}" style="border-radius:0;">
                    <a href="${url}" target="_blank" class="ep-sans" style="display:inline-block;padding:13px 28px;font-family:${FONT_SANS};font-size:15px;font-weight:500;color:#ffffff;text-decoration:none;border-radius:0;">${label}</a>
                  </td>
                </tr>
              </table>`;

/** The verification code, sized to be read and retyped from a phone. */
export const codeBlock = (code) => `              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 22px 0;">
                <tr>
                  <td align="center" bgcolor="${COLOR.surfaceField}" style="border:1px solid ${COLOR.line};border-radius:0;padding:26px 16px;">
                    <span class="ep-mono" style="font-family:${FONT_MONO};font-size:34px;font-weight:600;letter-spacing:10px;color:${COLOR.ink};">${code}</span>
                  </td>
                </tr>
              </table>`;

/** Key/value rows, matching the bordered-group Row pattern on Profile and Settings. */
export const detailRows = (rows) => `              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:4px 0 22px 0;border-top:1px solid ${COLOR.lineSoft};">
${rows
    .map(
      ({ label, value }) => `                <tr>
                  <td class="ep-sans" style="padding:13px 0;border-bottom:1px solid ${COLOR.lineSoft};font-family:${FONT_SANS};font-size:14px;color:${COLOR.text3};width:40%;">${label}</td>
                  <td class="ep-sans" style="padding:13px 0;border-bottom:1px solid ${COLOR.lineSoft};font-family:${FONT_SANS};font-size:14px;color:${COLOR.ink};font-weight:500;">${value}</td>
                </tr>`
    )
    .join('\n')}
              </table>`;

/**
 * Set-apart note for security warnings and "didn't do this?" lines — the
 * surface-attn tone the app uses for a flagged cell, not a coloured alert box.
 */
export const notice = (html) => `              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:4px 0 4px 0;">
                <tr>
                  <td class="ep-sans" bgcolor="${COLOR.surfaceAttn}" style="border:1px solid ${COLOR.line};border-radius:0;padding:15px 18px;font-family:${FONT_SANS};font-size:13px;line-height:1.6;color:${COLOR.text2};">${html}</td>
                </tr>
              </table>`;

/** Long URL fallback for clients that will not render the button. */
export const linkFallback = (url) => `              <p class="ep-sans" style="margin:0 0 4px 0;font-family:${FONT_SANS};font-size:12px;line-height:1.5;color:${COLOR.text4};">If the button does not work, paste this into your browser:</p>
              <p class="ep-mono" style="margin:0 0 16px 0;font-family:${FONT_MONO};font-size:12px;line-height:1.5;color:${COLOR.text2};word-break:break-all;">${url}</p>`;

/**
 * Mono outline chip for a status word — green for a completed/positive state,
 * clay for a destructive one. The email equivalent of the app's Badge.
 */
export const badge = (label, tone = 'green') => {
  const color = tone === 'clay' ? COLOR.clay : COLOR.green;
  return `<span class="ep-mono" style="font-family:${FONT_MONO};font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:${color};border:1px solid ${color};padding:4px 9px;display:inline-block;">${label}</span>`;
};

export default { layout, heading, paragraph, subtle, button, codeBlock, detailRows, notice, linkFallback, badge };
