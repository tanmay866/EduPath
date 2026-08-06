/**
 * Shared layout for transactional email — restyled to match the frontend
 * redesign in design_handoff_edupath_redesign/DESIGN_SPEC.md: paper and ink,
 * a serif heading over plain sans body text, square corners, colour reserved
 * for status, and mono reserved for labels and figures rather than prose.
 *
 * Everything is still inline styles on tables, which is what survives across
 * clients — Outlook renders through Word and drops <style> blocks, and Gmail
 * strips <style> when it clips a long message.
 *
 * Two non-inline additions ride along in <head>:
 *
 * 1. A progressive-enhancement font block that swaps in the real Newsreader /
 *    IBM Plex fonts where a client's engine can fetch them (Apple Mail, most
 *    webmail); every element still carries its fallback stack inline, so a
 *    client that ignores the block still gets the right serif/sans/mono shape.
 *
 * 2. A dark-mode override block. The Gmail Android/iOS app repaints colours it
 *    judges "light" or "dark" on its own — regardless of the color-scheme meta
 *    tag below, which it does not honour — and tags whatever it touched with a
 *    data-ogsc/data-ogsb attribute. The app has no dark variant of this design,
 *    so every colour token here is pinned back to its light value under both
 *    that Gmail hook and the standard prefers-color-scheme media query (Apple
 *    Mail, Outlook, other clients that ask nicely instead of repainting
 *    unasked). This covers the card, borders, text and badges.
 *
 * The logo mark is plain table cells (an ink bgcolor holding white bgcolor
 * bars) and is not part of that override. Two attempts at protecting it from
 * Gmail's dark mode — the data-ogsc hook above, then swapping it for a hosted
 * image, on the theory that Gmail repaints backgrounds and text but not a
 * raster image's pixels — both failed to fix it in the actual Gmail app. It
 * is back to the original table cells rather than carrying a fix that does
 * not work.
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
  white: '#ffffff',
  line: '#e3e1d9',
  lineSoft: '#efeee8',
  text2: '#4a4740',
  text3: '#6e6b64',
  text4: '#8a867e',
  clay: '#b4491f',
  green: '#2f6b45',
};

/**
 * Progressive font enhancement plus the dark-mode pin, in one block. Every
 * inline style still names its real value directly, so a client that strips
 * this whole block loses only the exact typeface and its dark-mode
 * protection — never legibility, since the inline values are a complete,
 * correct light-mode design on their own.
 */
const HEAD_STYLE = `
  <style>
    @media screen {
      .ep-display { font-family: 'Newsreader', ${FONT_DISPLAY} !important; }
      .ep-sans { font-family: 'IBM Plex Sans', ${FONT_SANS} !important; }
      .ep-mono { font-family: 'IBM Plex Mono', ${FONT_MONO} !important; }
    }
    [data-ogsc] .ep-bg-paper, [data-ogsb] .ep-bg-paper { background-color: ${COLOR.paper} !important; }
    [data-ogsc] .ep-bg-surface, [data-ogsb] .ep-bg-surface { background-color: ${COLOR.surface} !important; }
    [data-ogsc] .ep-bg-surface-field, [data-ogsb] .ep-bg-surface-field { background-color: ${COLOR.surfaceField} !important; }
    [data-ogsc] .ep-bg-surface-attn, [data-ogsb] .ep-bg-surface-attn { background-color: ${COLOR.surfaceAttn} !important; }
    [data-ogsc] .ep-bg-ink, [data-ogsb] .ep-bg-ink { background-color: ${COLOR.ink} !important; }
    [data-ogsc] .ep-border-line, [data-ogsb] .ep-border-line { border-color: ${COLOR.line} !important; }
    [data-ogsc] .ep-border-line-soft, [data-ogsb] .ep-border-line-soft { border-color: ${COLOR.lineSoft} !important; }
    [data-ogsc] .ep-text-ink { color: ${COLOR.ink} !important; }
    [data-ogsc] .ep-text-2 { color: ${COLOR.text2} !important; }
    [data-ogsc] .ep-text-3 { color: ${COLOR.text3} !important; }
    [data-ogsc] .ep-text-4 { color: ${COLOR.text4} !important; }
    [data-ogsc] .ep-text-white { color: ${COLOR.white} !important; }
    [data-ogsc] .ep-badge-green { color: ${COLOR.green} !important; border-color: ${COLOR.green} !important; }
    [data-ogsc] .ep-badge-clay { color: ${COLOR.clay} !important; border-color: ${COLOR.clay} !important; }

    @media (prefers-color-scheme: dark) {
      .ep-bg-paper { background-color: ${COLOR.paper} !important; }
      .ep-bg-surface { background-color: ${COLOR.surface} !important; }
      .ep-bg-surface-field { background-color: ${COLOR.surfaceField} !important; }
      .ep-bg-surface-attn { background-color: ${COLOR.surfaceAttn} !important; }
      .ep-bg-ink { background-color: ${COLOR.ink} !important; }
      .ep-border-line { border-color: ${COLOR.line} !important; }
      .ep-border-line-soft { border-color: ${COLOR.lineSoft} !important; }
      .ep-text-ink { color: ${COLOR.ink} !important; }
      .ep-text-2 { color: ${COLOR.text2} !important; }
      .ep-text-3 { color: ${COLOR.text3} !important; }
      .ep-text-4 { color: ${COLOR.text4} !important; }
      .ep-text-white { color: ${COLOR.white} !important; }
      .ep-badge-green { color: ${COLOR.green} !important; border-color: ${COLOR.green} !important; }
      .ep-badge-clay { color: ${COLOR.clay} !important; border-color: ${COLOR.clay} !important; }
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
 * The Logo primitive from the frontend design system: an ink square holding
 * three ascending white bars, built as nested tables (no images).
 *
 * Known issue, not fixed here: the Gmail Android/iOS app repaints `bgcolor`
 * in dark mode using its own heuristic that treats "near black" and "near
 * white" as the two ends of the same scale, so the ink square and the white
 * bars both get pulled toward the same dark value and the mark disappears.
 * Neither a data-ogsc override nor swapping this for a hosted image fixed
 * that in practice, so this is back to the plain table version rather than
 * carrying a fix that did not work.
 */
const bar = (height, maxHeight) =>
  `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:4px;"><tr><td width="4" height="${maxHeight - height}" style="font-size:0;line-height:0;">&nbsp;</td></tr><tr><td width="4" height="${height}" bgcolor="#ffffff" style="font-size:0;line-height:0;">&nbsp;</td></tr></table>`;

const logoMark = (size = 28) =>
  `<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td width="${size}" height="${size}" bgcolor="${COLOR.ink}" align="center" valign="middle" style="width:${size}px;height:${size}px;">
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
                  <span class="ep-display ep-text-ink" style="font-family:${FONT_DISPLAY};font-size:24px;font-weight:400;letter-spacing:-0.01em;color:${COLOR.ink};">EduPath</span>
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
  <title>EduPath</title>${HEAD_STYLE}
</head>
<body style="margin:0;padding:0;background-color:${COLOR.paper};">
${preheaderMarkup(preheader)}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${COLOR.paper}" class="ep-bg-paper" style="background-color:${COLOR.paper};">
    <tr>
      <td align="center" style="padding:48px 16px;">

        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:520px;">
          <tr>
            <td style="padding:0 0 28px 2px;">
${wordmark()}
            </td>
          </tr>

          <tr>
            <td bgcolor="${COLOR.surface}" class="ep-bg-surface ep-border-line" style="background-color:${COLOR.surface};border:1px solid ${COLOR.line};border-radius:0;">
${eyebrow ? `              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td class="ep-border-line" style="padding:13px 32px;border-bottom:1px solid ${COLOR.line};"><span class="ep-mono ep-text-3" style="font-family:${FONT_MONO};font-size:10.5px;letter-spacing:0.13em;text-transform:uppercase;color:${COLOR.text3};">${eyebrow}</span></td></tr></table>\n` : ''}              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding:32px 32px 30px 32px;">
${content}
              </td></tr></table>
            </td>
          </tr>

          <tr>
            <td style="padding:26px 4px 0 4px;">
              <span class="ep-sans ep-text-4" style="font-family:${FONT_SANS};font-size:12.5px;line-height:1.6;color:${COLOR.text4};">You received this message because of activity on your EduPath account.</span>
              <br />
              <span class="ep-mono ep-text-4" style="font-family:${FONT_MONO};font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:${COLOR.text4};">&copy; ${new Date().getFullYear()} EDUPATH</span>
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
  `              <h1 class="ep-display ep-text-ink" style="margin:0 0 16px 0;font-family:${FONT_DISPLAY};font-size:26px;line-height:1.3;font-weight:400;color:${COLOR.ink};letter-spacing:-0.015em;">${text}</h1>`;

/** Body paragraph. */
export const paragraph = (html) =>
  `              <p class="ep-sans ep-text-2" style="margin:0 0 16px 0;font-family:${FONT_SANS};font-size:15px;line-height:1.65;color:${COLOR.text2};">${html}</p>`;

/** Smaller, quieter paragraph for caveats and expiry notes. */
export const subtle = (html) =>
  `              <p class="ep-sans ep-text-4" style="margin:0 0 16px 0;font-family:${FONT_SANS};font-size:13px;line-height:1.6;color:${COLOR.text4};">${html}</p>`;

/**
 * Bulletproof button, styled after the primary Button variant: ink fill,
 * white text, square corners, no shadow. Built as a table because Outlook
 * ignores padding on <a>, which would otherwise collapse it to a bare
 * underlined link.
 */
export const button = (label, url) => `              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 26px 0;">
                <tr>
                  <td align="center" bgcolor="${COLOR.ink}" class="ep-bg-ink" style="background-color:${COLOR.ink};border-radius:0;">
                    <a href="${url}" target="_blank" class="ep-sans ep-text-white" style="display:inline-block;padding:13px 28px;font-family:${FONT_SANS};font-size:15px;font-weight:500;color:${COLOR.white};text-decoration:none;border-radius:0;">${label}</a>
                  </td>
                </tr>
              </table>`;

/** The verification code, sized to be read and retyped from a phone. */
export const codeBlock = (code) => `              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 22px 0;">
                <tr>
                  <td align="center" bgcolor="${COLOR.surfaceField}" class="ep-bg-surface-field ep-border-line" style="background-color:${COLOR.surfaceField};border:1px solid ${COLOR.line};border-radius:0;padding:26px 16px;">
                    <span class="ep-mono ep-text-ink" style="font-family:${FONT_MONO};font-size:34px;font-weight:600;letter-spacing:10px;color:${COLOR.ink};">${code}</span>
                  </td>
                </tr>
              </table>`;

/** Key/value rows, matching the bordered-group Row pattern on Profile and Settings. */
export const detailRows = (rows) => `              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="ep-border-line-soft" style="margin:4px 0 22px 0;border-top:1px solid ${COLOR.lineSoft};">
${rows
    .map(
      ({ label, value }) => `                <tr>
                  <td class="ep-sans ep-text-3 ep-border-line-soft" style="padding:13px 0;border-bottom:1px solid ${COLOR.lineSoft};font-family:${FONT_SANS};font-size:14px;color:${COLOR.text3};width:40%;">${label}</td>
                  <td class="ep-sans ep-text-ink ep-border-line-soft" style="padding:13px 0;border-bottom:1px solid ${COLOR.lineSoft};font-family:${FONT_SANS};font-size:14px;color:${COLOR.ink};font-weight:500;">${value}</td>
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
                  <td class="ep-sans ep-bg-surface-attn ep-border-line ep-text-2" bgcolor="${COLOR.surfaceAttn}" style="background-color:${COLOR.surfaceAttn};border:1px solid ${COLOR.line};border-radius:0;padding:15px 18px;font-family:${FONT_SANS};font-size:13px;line-height:1.6;color:${COLOR.text2};">${html}</td>
                </tr>
              </table>`;

/** Long URL fallback for clients that will not render the button. */
export const linkFallback = (url) => `              <p class="ep-sans ep-text-4" style="margin:0 0 4px 0;font-family:${FONT_SANS};font-size:12px;line-height:1.5;color:${COLOR.text4};">If the button does not work, paste this into your browser:</p>
              <p class="ep-mono ep-text-2" style="margin:0 0 16px 0;font-family:${FONT_MONO};font-size:12px;line-height:1.5;color:${COLOR.text2};word-break:break-all;">${url}</p>`;

/**
 * Mono outline chip for a status word — green for a completed/positive state,
 * clay for a destructive one. The email equivalent of the app's Badge.
 */
export const badge = (label, tone = 'green') => {
  const color = tone === 'clay' ? COLOR.clay : COLOR.green;
  const cls = tone === 'clay' ? 'ep-badge-clay' : 'ep-badge-green';
  return `<span class="ep-mono ${cls}" style="font-family:${FONT_MONO};font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:${color};border:1px solid ${color};padding:4px 9px;display:inline-block;">${label}</span>`;
};

/**
 * Escapes text that came from anywhere but this file.
 *
 * Skill names, role names and generated task text all end up in these
 * templates. None of it is attacker-controlled today, but an apostrophe or an
 * ampersand in a track name should not be able to break the markup, and the
 * cost of being careful here is nothing.
 */
export const escapeHtml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

/** A bulleted list. Tables rather than <ul>, like everything else here. */
export const bulletList = (items = []) => {
  if (!items.length) return '';
  const rows = items
    .map(
      (item) =>
        `                <tr><td class="ep-sans ep-text-2" style="padding:0 0 9px 0;font-family:${FONT_SANS};font-size:15px;line-height:1.55;color:${COLOR.text2};">&bull;&nbsp;&nbsp;${escapeHtml(item)}</td></tr>`
    )
    .join('\n');
  return `              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:4px 0 22px 0;">
${rows}
              </table>`;
};

export default { layout, heading, paragraph, subtle, button, codeBlock, detailRows, notice, linkFallback, badge, escapeHtml, bulletList };
