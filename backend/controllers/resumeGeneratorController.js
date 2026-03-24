import GeneratedResume from '../models/GeneratedResume.js';
import ResumeValidator from '../utils/resumeValidator.js';
import resumeGeneratorService from '../services/resumeGeneratorService.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Generate Resume from User Data
 * POST /api/resume-generator/generate
 */
export const generateResume = async (req, res) => {
  try {
    const { resumeData } = req.body;
    const userId = req.user.id;

    // Validate resume data structure
    const validation = ResumeValidator.validate(resumeData);

    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: 'Resume data validation failed',
        errors: validation.errors
      });
    }

    // Use sanitized data for generation
    const sanitizedData = validation.sanitizedData;

    // Generate DOCX file
    const result = await resumeGeneratorService.generateDOCX(sanitizedData, userId);

    // Get latest version number for this user
    const latestResume = await GeneratedResume.findOne({ userId }).sort({ version: -1 });
    const newVersion = latestResume ? latestResume.version + 1 : 1;

    // Save to database with complete resume data
    const resume = new GeneratedResume({
      userId,
      version: newVersion,
      resumeData: sanitizedData,
      resumeUrl: result.url,
      filename: result.filename,
      format: 'docx'
    });

    await resume.save();

    res.status(201).json({
      success: true,
      message: 'Resume generated successfully',
      data: {
        version: newVersion,
        downloadUrl: result.url,
        filename: result.filename,
        format: 'docx',
        createdAt: resume.createdAt
      }
    });
  } catch (error) {
    console.error('Resume generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Resume generation failed',
      error: error.message
    });
  }
};

/**
 * Download Generated Resume
 * GET /api/resume-generator/download/:filename
 */
export const downloadResume = async (req, res) => {
  try {
    const { filename } = req.params;

    // Security: Validate filename to prevent directory traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid filename'
      });
    }

    const filepath = path.join(__dirname, '../generated', filename);

    res.download(filepath, filename, (err) => {
      if (err) {
        console.error('Download error:', err);
        if (!res.headersSent) {
          res.status(404).json({
            success: false,
            message: 'File not found'
          });
        }
      }
    });
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({
      success: false,
      message: 'Download failed',
      error: error.message
    });
  }
};

/**
 * Get Resume Version History
 * GET /api/resume-generator/history
 */
export const getResumeHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 10, page = 1 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const resumes = await GeneratedResume.find({ userId })
      .sort({ version: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .select('-resumeData');

    const total = await GeneratedResume.countDocuments({ userId });

    res.status(200).json({
      success: true,
      data: {
        resumes,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch resume history',
      error: error.message
    });
  }
};

/**
 * Get Specific Resume Version Data
 * GET /api/resume-generator/version/:version
 */
export const getResumeVersion = async (req, res) => {
  try {
    const userId = req.user.id;
    const { version } = req.params;

    const resume = await GeneratedResume.findOne({ userId, version: parseInt(version) });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume version not found'
      });
    }

    res.status(200).json({
      success: true,
      data: resume
    });
  } catch (error) {
    console.error('Get version error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch resume version',
      error: error.message
    });
  }
};

/**
 * Delete Resume Version
 * DELETE /api/resume-generator/:id
 */
export const deleteResume = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const resume = await GeneratedResume.findOne({ _id: id, userId });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found or unauthorized'
      });
    }

    // Delete physical file
    await resumeGeneratorService.deleteFile(resume.filename);

    // Delete database record
    await GeneratedResume.deleteOne({ _id: id });

    res.status(200).json({
      success: true,
      message: 'Resume deleted successfully'
    });
  } catch (error) {
    console.error('Delete resume error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete resume',
      error: error.message
    });
  }
};
