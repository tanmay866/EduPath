import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { extractTextFromPDF } from '../utils/pdfText.js';
import mammoth from 'mammoth';
import { generateATSReport, generateReportFilename } from '../services/pdfReportGenerator.js';
import AtsAnalysis from '../models/AtsAnalysis.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Extract text from DOCX file
 */
const extractTextFromDOCX = async (buffer) => {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } catch (error) {
    throw new Error(`DOCX extraction failed: ${error.message}`);
  }
};

/**
 * Extract text from uploaded file based on type
 */
const extractTextFromFile = async (file) => {
  const fileBuffer = file.buffer;
  const fileType = file.mimetype;

  if (fileType === 'application/pdf') {
    return await extractTextFromPDF(fileBuffer);
  } else if (
    fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    fileType === 'application/msword'
  ) {
    return await extractTextFromDOCX(fileBuffer);
  } else {
    throw new Error('Unsupported file type. Please upload PDF or DOCX files.');
  }
};

/**
 * Analyze resume using the Python ATS scorer.
 */
export const analyzeResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a resume file (PDF or DOCX)'
      });
    }

    const resumeText = await extractTextFromFile(req.file);

    if (!resumeText || resumeText.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Could not extract text from the uploaded file'
      });
    }

    const jobDescription = req.body.jobDescription || '';

    if (!jobDescription.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Job description is required'
      });
    }

    // Path to Python script
    const pythonScript = path.join(__dirname, '../services/atsScorer.py');

    console.log('Executing ATS analysis...');

    const pythonPath = process.env.PYTHON_PATH || 'python';

    const python = spawn(pythonPath, [pythonScript, resumeText, jobDescription], {
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';

    python.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    python.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    // Wait for Python process to complete
    try {
      await new Promise((resolve, reject) => {
        python.on('close', (code) => {
          if (code !== 0) {
            console.error('Python stderr:', stderr);
            reject(new Error(`Python process exited with code ${code}: ${stderr}`));
          } else {
            resolve();
          }
        });

        python.on('error', (error) => {
          console.error('Failed to start Python:', error);
          reject(new Error('Failed to execute ATS analysis. Make sure Python is installed.'));
        });

        // Set timeout
        setTimeout(() => {
          python.kill();
          reject(new Error('ATS analysis timeout'));
        }, 60000);
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to execute ATS analysis',
        error: stderr || error.toString()
      });
    }

    // Parse Python output
    let result;
    try {
      result = JSON.parse(stdout);
    } catch (parseError) {
      console.error('Failed to parse Python output:', stdout);
      return res.status(500).json({
        success: false,
        message: 'Failed to parse ATS analysis results',
        error: parseError.message
      });
    }

    if (!result.success) {
      console.error('ATS analysis returned error:', result.error);
      return res.status(500).json({
        success: false,
        message: result.error || 'ATS analysis failed'
      });
    }

    console.log('ATS analysis completed successfully. Score:', result.score);

    // Keep it. Every other assessment here is kept, and this one lived only
    // in page state — a refresh threw away the upload, the wait and the
    // result, and took the download button with it.
    //
    // The analysis is stored, not the inputs: the resume text is the most
    // personal thing this product handles and is not needed to show a result
    // again. A failure to save must not fail the analysis the learner is
    // looking at, so it is reported and stepped over.
    let savedId = null;
    try {
      const saved = await AtsAnalysis.create({
        userId: req.user._id,
        score: result.score,
        status: result.status,
        similarity: result.similarity,
        method: result.method,
        message: result.message,
        dimensions: result.dimensions || [],
        fixes: result.fixes || [],
        details: result.details || {},
        resumeName: req.file?.originalname || '',
        jobExcerpt: jobDescription.trim().slice(0, 240),
      });
      savedId = saved._id;
    } catch (saveError) {
      console.error('Could not save ATS analysis:', saveError.message);
    }

    return res.status(200).json({
      success: true,
      message: 'Resume analyzed successfully',
      data: { ...result, analysisId: savedId }
    });

  } catch (error) {
    console.error('ATS Analysis Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to analyze resume',
      error: error.message
    });
  }
};

/**
 * Generate and download ATS analysis PDF report
 */
export const generateReport = async (req, res) => {
  try {
    const { analysisData } = req.body;

    if (!analysisData) {
      return res.status(400).json({
        success: false,
        message: 'Analysis data is required to generate report'
      });
    }

    // Validate required analysis data fields
    if (typeof analysisData.score === 'undefined') {
      return res.status(400).json({
        success: false,
        message: 'Invalid analysis data - missing score'
      });
    }

    console.log('Generating PDF report for ATS analysis...');

    // Get user info from token if available
    const userInfo = req.user ? {
      username: req.user.username || req.user.email || 'user',
      email: req.user.email
    } : {};

    // Generate PDF
    const pdfBuffer = await generateATSReport(analysisData, userInfo);
    const filename = generateReportFilename(userInfo);

    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    console.log('PDF report generated successfully:', filename);

    // Send PDF buffer
    res.send(pdfBuffer);

  } catch (error) {
    console.error('PDF Report Generation Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate PDF report',
      error: error.message
    });
  }
};

/**
 * GET /api/ats/latest — the most recent run, so the page survives a refresh.
 *
 * Returns 200 with null rather than 404 when there is nothing yet: a learner
 * who has not analysed anything is an ordinary state, not a missing page.
 */
export const getLatestAnalysis = async (req, res) => {
  try {
    const latest = await AtsAnalysis.findOne({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({ success: true, data: latest || null });
  } catch (error) {
    console.error('getLatestAnalysis error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

/**
 * PATCH /api/ats/:analysisId/applied — which fixes have been ticked off.
 *
 * The checklist was page state too, so it forgot what had been ticked on
 * every refresh, which is worse than not offering the checkbox.
 */
export const updateAppliedFixes = async (req, res) => {
  try {
    const { appliedFixes } = req.body;
    if (!Array.isArray(appliedFixes)) {
      return res.status(400).json({
        success: false,
        message: 'appliedFixes must be an array of fix ids.',
      });
    }

    const updated = await AtsAnalysis.findOneAndUpdate(
      { _id: req.params.analysisId, userId: req.user._id },
      { $set: { appliedFixes: appliedFixes.map(String).slice(0, 20) } },
      { new: true }
    ).lean();

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Analysis not found.' });
    }

    return res.status(200).json({ success: true, data: { appliedFixes: updated.appliedFixes } });
  } catch (error) {
    console.error('updateAppliedFixes error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};
