import PDFDocument from 'pdfkit';

/**
 * The ATS report, as a document that looks like the rest of EduPath.
 *
 * The old one was a different product: bright blue headings, a red circle,
 * rounded grey cards and Helvetica throughout, none of which appears anywhere
 * on the site. It also threw away the analysis it was reporting on — the
 * scorer returns four measured dimensions, the keywords actually missing and
 * fixes with the points each is worth, and the page printed the same four
 * generic tips to everyone regardless. A report that says the same thing
 * whatever it read is not a report.
 *
 * Fonts: the site sets Newsreader for headings, IBM Plex Sans for text and
 * IBM Plex Mono for figures, and loads all three from Google. Embedding them
 * here would mean shipping the font files, so the built-ins stand in and keep
 * the structure: a serif for headings, a sans for prose, a monospace for
 * numbers. The palette, spacing and rules are exact.
 */

// Straight from frontend/src/index.css so the two cannot drift apart.
const INK = '#12100e';
const TEXT_2 = '#4a4740';
const TEXT_3 = '#6e6b64';
const TEXT_4 = '#8a867e';
const LINE = '#e3e1d9';
const LINE_SOFT = '#efeee8';
const CLAY = '#b4491f';
const GREEN = '#2f6b45';
const AMBER = '#b07d11';

const DISPLAY = 'Times-Bold';
const SANS = 'Helvetica';
const SANS_BOLD = 'Helvetica-Bold';
const MONO = 'Courier';
const MONO_BOLD = 'Courier-Bold';

const PAGE = { width: 595.28, height: 841.89 };
const MARGIN = 56;
const CONTENT = PAGE.width - MARGIN * 2;

/** The site scores in three bands; this is the same reading. */
const toneFor = (score) => {
    if (score >= 70) return GREEN;
    if (score >= 45) return AMBER;
    return CLAY;
};

export const generateATSReport = (analysisData = {}, userInfo = {}) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({
                size: 'A4',
                margins: { top: MARGIN, bottom: MARGIN, left: MARGIN, right: MARGIN },
                // Required for switchToPage below, which stamps the footer on
                // every page once the page count is known.
                bufferPages: true,
                info: {
                    Title: 'ATS report — EduPath',
                    Author: 'EduPath',
                },
            });

            const buffers = [];
            doc.on('data', (chunk) => buffers.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(buffers)));
            doc.on('error', reject);

            const score = Math.round(Number(analysisData.score) || 0);
            const tone = toneFor(score);
            let y = MARGIN;

            /** Room left before the bottom margin. */
            const room = () => PAGE.height - MARGIN - y;

            /** Starts a new page when what comes next will not fit. */
            const need = (height) => {
                if (room() < height) {
                    doc.addPage();
                    y = MARGIN;
                }
            };

            /** The site's MicroLabel: small, uppercase, widely tracked. */
            const microLabel = (text, colour = TEXT_4) => {
                doc.font(SANS).fontSize(8).fillColor(colour)
                    .text(String(text).toUpperCase(), MARGIN, y, {
                        characterSpacing: 1.4,
                        width: CONTENT,
                    });
                y = doc.y + 10;
            };

            /** A hairline, the way every card on the site is divided. */
            const rule = (colour = LINE, gap = 16) => {
                doc.moveTo(MARGIN, y).lineTo(MARGIN + CONTENT, y)
                    .lineWidth(0.75).strokeColor(colour).stroke();
                y += gap;
            };

            const heading = (text) => {
                need(70);
                microLabel(text);
                rule(LINE, 14);
            };

            const paragraph = (text, { colour = TEXT_2, size = 10.5, gap = 10 } = {}) => {
                doc.font(SANS).fontSize(size).fillColor(colour)
                    .text(text, MARGIN, y, { width: CONTENT, lineGap: 3.5 });
                y = doc.y + gap;
            };

            // ── Masthead ──────────────────────────────────────────────────
            doc.font(DISPLAY).fontSize(26).fillColor(INK)
                .text('ATS report', MARGIN, y);
            y = doc.y + 4;

            doc.font(SANS).fontSize(10.5).fillColor(TEXT_3)
                .text('How one resume reads against one job posting.', MARGIN, y, { width: CONTENT });
            y = doc.y + 14;

            const generated = new Date().toLocaleDateString('en-GB', {
                day: '2-digit', month: 'long', year: 'numeric',
            });
            doc.font(MONO).fontSize(8.5).fillColor(TEXT_4)
                .text(`${generated}${userInfo.username ? `  ·  ${userInfo.username}` : ''}`, MARGIN, y);
            y = doc.y + 16;
            rule(INK, 26);

            // ── The figure ────────────────────────────────────────────────
            // A continued run leaves doc.y on the line's top rather than
            // below it, so the 52pt figure has to be stepped past by hand or
            // the next line prints through it.
            const figureTop = y;
            doc.font(MONO_BOLD).fontSize(52).fillColor(tone)
                .text(String(score), MARGIN, figureTop, { continued: true, lineBreak: false })
                .font(MONO).fontSize(18).fillColor(TEXT_4)
                .text(' / 100');
            y = figureTop + 62;

            doc.font(DISPLAY).fontSize(15).fillColor(INK)
                .text(analysisData.status || 'Scored', MARGIN, y);
            y = doc.y + 6;

            if (analysisData.message) {
                paragraph(analysisData.message, { colour: TEXT_3, size: 10.5, gap: 22 });
            } else {
                y += 12;
            }

            // ── What the score is made of ─────────────────────────────────
            // The blend was always computed and never shown, so a number
            // arrived with no way to tell which part of it was weak.
            const dimensions = (analysisData.dimensions || []).filter(
                (d) => d && d.score !== null && d.score !== undefined
            );

            if (dimensions.length) {
                heading('What the score is made of');

                dimensions.forEach((d) => {
                    need(34);
                    const value = Math.round(Number(d.score));
                    const barWidth = CONTENT - 190;

                    doc.font(SANS).fontSize(10.5).fillColor(INK)
                        .text(d.label || d.key, MARGIN, y, { width: 150 });

                    // Track, then the filled portion — the site draws
                    // progress the same way.
                    const barY = y + 4;
                    doc.rect(MARGIN + 160, barY, barWidth, 5).fillColor(LINE_SOFT).fill();
                    doc.rect(MARGIN + 160, barY, Math.max(1, barWidth * (value / 100)), 5)
                        .fillColor(toneFor(value)).fill();

                    doc.font(MONO).fontSize(9.5).fillColor(TEXT_3)
                        .text(`${value}`, MARGIN + CONTENT - 24, y, { width: 24, align: 'right' });

                    y += 22;
                });
                y += 10;
            }

            // ── What to change ────────────────────────────────────────────
            // The scorer works out which dimension is weakest and what each
            // fix is worth. The old report replaced all of it with the same
            // four sentences for everybody.
            const fixes = analysisData.fixes || [];

            if (fixes.length) {
                heading('What to change');

                fixes.forEach((fix) => {
                    need(64);

                    doc.font(SANS_BOLD).fontSize(11).fillColor(INK)
                        .text(fix.title || 'Fix', MARGIN, y, { width: CONTENT - 70 });

                    if (typeof fix.points === 'number' && fix.points > 0) {
                        // Arithmetic on the weights, not an estimate — worth
                        // saying plainly.
                        doc.font(MONO).fontSize(9).fillColor(CLAY)
                            .text(`+${fix.points}`, MARGIN + CONTENT - 60, y, {
                                width: 60, align: 'right',
                            });
                    }

                    y = doc.y + 3;
                    paragraph(fix.detail || '', { colour: TEXT_2, size: 10, gap: 14 });
                });
                y += 4;
            }

            // ── The detail behind it ──────────────────────────────────────
            const details = analysisData.details || {};
            const missing = details.keywordsMissing || [];
            const matched = details.keywordsMatched || [];

            if (missing.length || matched.length) {
                heading('Keywords');

                if (missing.length) {
                    doc.font(SANS).fontSize(9.5).fillColor(TEXT_4)
                        .text('Missing', MARGIN, y);
                    y = doc.y + 4;
                    paragraph(missing.join(', '), { colour: CLAY, size: 10.5, gap: 12 });
                }

                if (matched.length) {
                    need(50);
                    doc.font(SANS).fontSize(9.5).fillColor(TEXT_4)
                        .text('Already there', MARGIN, y);
                    y = doc.y + 4;
                    paragraph(matched.join(', '), { colour: GREEN, size: 10.5, gap: 12 });
                }

                if (details.keywordsConsidered) {
                    doc.font(SANS).fontSize(9).fillColor(TEXT_4)
                        .text(
                            `Out of ${details.keywordsConsidered} terms this posting leans on.`,
                            MARGIN, y, { width: CONTENT }
                        );
                    y = doc.y + 16;
                }
            }

            // ── How it was read ───────────────────────────────────────────
            const structure = [];
            if (details.wordCount) structure.push(`${details.wordCount} words`);
            if (details.sectionsFound?.length) {
                structure.push(`sections found: ${details.sectionsFound.join(', ')}`);
            }
            if (details.sectionsMissing?.length) {
                structure.push(`not found: ${details.sectionsMissing.join(', ')}`);
            }
            if (typeof details.statementsTotal === 'number' && details.statementsTotal > 0) {
                structure.push(
                    `${details.statementsQuantified} of ${details.statementsTotal} achievements carry a number`
                );
            }

            if (structure.length) {
                heading('How your resume was read');
                structure.forEach((line) => {
                    need(24);
                    doc.circle(MARGIN + 2, y + 5, 1.6).fillColor(TEXT_4).fill();
                    doc.font(SANS).fontSize(10).fillColor(TEXT_2)
                        .text(line, MARGIN + 12, y, { width: CONTENT - 12, lineGap: 3 });
                    y = doc.y + 8;
                });
                y += 6;
            }

            // ── Footer on every page ──────────────────────────────────────
            const range = doc.bufferedPageRange();
            for (let i = range.start; i < range.start + range.count; i += 1) {
                doc.switchToPage(i);

                // Writing below the bottom margin makes pdfkit start a new
                // page, and a new page needs a footer too — three footer
                // writes across two pages turned into eight pages. Dropping
                // the margin for the duration is how the footer stays on the
                // page it belongs to.
                const bottom = doc.page.margins.bottom;
                doc.page.margins.bottom = 0;

                const footY = PAGE.height - MARGIN + 6;

                doc.moveTo(MARGIN, footY).lineTo(MARGIN + CONTENT, footY)
                    .lineWidth(0.75).strokeColor(LINE).stroke();

                doc.font(SANS).fontSize(8).fillColor(TEXT_4)
                    .text('EduPath', MARGIN, footY + 8, {
                        characterSpacing: 1.2, lineBreak: false,
                    });

                // The measure is a blend of four dimensions against one
                // posting, and saying so is the difference between a number
                // and a verdict.
                doc.font(SANS).fontSize(8).fillColor(TEXT_4)
                    .text('Scored against this posting only', MARGIN, footY + 8, {
                        width: CONTENT, align: 'center', lineBreak: false,
                    });

                doc.font(MONO).fontSize(8).fillColor(TEXT_4)
                    .text(`${i - range.start + 1}/${range.count}`, MARGIN, footY + 8, {
                        width: CONTENT, align: 'right', lineBreak: false,
                    });

                doc.page.margins.bottom = bottom;
            }

            doc.end();
        } catch (error) {
            console.error('PDF Generation Error:', error);
            reject(error);
        }
    });
};

/** A filename that sorts by date and says what it is. */
export const generateReportFilename = (userInfo = {}) => {
    const date = new Date().toISOString().slice(0, 10);
    const who = String(userInfo.username || 'resume')
        .split('@')[0]
        .replace(/[^a-zA-Z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .toLowerCase() || 'resume';
    return `edupath-ats-report-${who}-${date}.pdf`;
};

export default generateATSReport;
