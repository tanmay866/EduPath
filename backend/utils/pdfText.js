import { createRequire } from 'module';

/**
 * PDF text extraction.
 *
 * pdf-parse hands the buffer straight to pdf.js v1.x, which reads the underlying
 * ArrayBuffer without honouring byteOffset. Node allocates small Buffers as
 * views into a shared 8KB pool, so a Buffer whose byteOffset is not zero made
 * pdf.js read neighbouring memory instead of the file — surfacing as
 * "bad XRef entry" or "Invalid number", and occasionally as a corrupt PDF
 * parsing "successfully".
 *
 * Because the offset depends on unrelated allocations, the same file could
 * parse on one request and fail on the next, which looked like one bad upload
 * poisoning the endpoint for everyone.
 *
 * new Uint8Array(buffer) copies into a dedicated, zero-offset buffer.
 */

const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse/lib/pdf-parse.js');

/**
 * Extract text from a PDF buffer.
 * @param {Buffer} buffer - raw PDF bytes
 * @returns {Promise<string>} extracted text
 * @throws {Error} if the PDF cannot be parsed
 */
export const extractTextFromPDF = async (buffer) => {
  try {
    const data = await pdfParse(new Uint8Array(buffer));
    return data.text;
  } catch (error) {
    throw new Error(`PDF extraction failed: ${error.message}`);
  }
};

export default extractTextFromPDF;
