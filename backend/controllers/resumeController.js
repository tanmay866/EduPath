import Resume from '../models/Resume.js';
import cloudinary from '../config/cloudinaryConfig.js';

// @desc    Upload resume to Cloudinary
// @route   POST /api/resume/upload
// @access  Private
export const uploadResume = async (req, res) => {
  try {
    const { fileName, fileSize, fileType, fileData } = req.body;

    // Validate required fields
    if (!fileName || !fileSize || !fileType || !fileData) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Validate file size (max 5MB)
    if (fileSize > 5 * 1024 * 1024) {
      return res.status(400).json({
        success: false,
        message: 'File size must be less than 5MB'
      });
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    if (!allowedTypes.includes(fileType)) {
      return res.status(400).json({
        success: false,
        message: 'Only PDF and Word documents are allowed'
      });
    }

    // Upload to Cloudinary
    // For PDFs, use 'image' type with format 'pdf' for better browser compatibility
    const isPdf = fileType === 'application/pdf';
    
    const uploadResult = await cloudinary.uploader.upload(fileData, {
      folder: 'edupath/resumes',
      resource_type: isPdf ? 'image' : 'raw',
      format: isPdf ? 'pdf' : undefined,
      public_id: `${req.user.id}_${Date.now()}`,
      overwrite: true,
      type: 'upload',
      access_mode: 'public',
      flags: isPdf ? 'attachment' : undefined
    });

    // Save resume info to database
    const resume = await Resume.create({
      userId: req.user.id,
      fileName,
      fileSize,
      fileType,
      cloudinaryUrl: uploadResult.secure_url,
      cloudinaryPublicId: uploadResult.public_id
    });

    res.status(201).json({
      success: true,
      message: 'Resume uploaded successfully',
      data: {
        id: resume._id,
        fileName: resume.fileName,
        fileSize: resume.fileSize,
        fileType: resume.fileType,
        cloudinaryUrl: resume.cloudinaryUrl,
        uploadDate: resume.uploadDate
      }
    });

  } catch (error) {
    console.error('Upload resume error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload resume'
    });
  }
};

// @desc    Get all user resumes
// @route   GET /api/resume
// @access  Private
export const getResumes = async (req, res) => {
  try {
    const resumes = await Resume.find({ userId: req.user.id })
      .sort({ uploadDate: -1 })
      .select('-cloudinaryPublicId');

    res.status(200).json({
      success: true,
      count: resumes.length,
      data: resumes
    });

  } catch (error) {
    console.error('Get resumes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch resumes'
    });
  }
};

// @desc    Delete resume
// @route   DELETE /api/resume/:id
// @access  Private
export const deleteResume = async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }

    // Check if resume belongs to user
    if (resume.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this resume'
      });
    }

    // Delete from Cloudinary
    const isPdf = resume.fileType === 'application/pdf';
    await cloudinary.uploader.destroy(resume.cloudinaryPublicId, {
      resource_type: isPdf ? 'image' : 'raw'
    });

    // Delete from database
    await Resume.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Resume deleted successfully'
    });

  } catch (error) {
    console.error('Delete resume error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete resume'
    });
  }
};
