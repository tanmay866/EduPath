import pdfParse from 'pdf-parse/lib/pdf-parse.js';
import mammoth from 'mammoth';
import { v4 as uuidv4 } from 'uuid';
import { v2 as cloudinary } from 'cloudinary';
import Portfolio from '../models/Portfolio.js';
import User from '../models/userModel.js';
import { parseResumeWithGroq, mapToPortfolioSchema } from '../services/groqResumeParser.js';
import { generateTemplateHTML } from '../templates/portfolioTemplates.js';

/**
 * Extract text from PDF file
 */
const extractTextFromPDF = async (buffer) => {
  try {
    const data = await pdfParse(buffer);
    return data.text;
  } catch (error) {
    throw new Error(`PDF extraction failed: ${error.message}`);
  }
};

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
    throw new Error('Unsupported file type. Please upload PDF or DOCX files only.');
  }
};

/**
 * Parse resume and extract portfolio details using Groq API
 */
export const parseResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a resume file (PDF or DOCX)'
      });
    }

    console.log('Extracting text from resume...');
    const resumeText = await extractTextFromFile(req.file);

    if (!resumeText || resumeText.trim().length < 50) {
      return res.status(400).json({
        success: false,
        message: 'Could not extract readable text from the file. Please upload a text-based PDF or DOCX.'
      });
    }

    console.log(`Extracted ${resumeText.length} characters. Sending to Groq API...`);
    const groqData = await parseResumeWithGroq(resumeText);
    const portfolioData = mapToPortfolioSchema(groqData);

    res.json({
      success: true,
      message: 'Resume parsed successfully',
      data: portfolioData
    });
  } catch (error) {
    console.error('Resume parsing error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to parse resume',
      error: error.message
    });
  }
};

/**
 * Deploy portfolio - Save to MongoDB and return link
 */
export const deployPortfolio = async (req, res) => {
  try {
    const { portfolioData, template } = req.body;
    const userId = req.user.id;

    if (!portfolioData || !portfolioData.name || !portfolioData.title) {
      return res.status(400).json({
        success: false,
        message: 'Portfolio name and title are required'
      });
    }

    const portfolioId = uuidv4().split('-')[0];

    const user = await User.findById(userId);
    const username = user?.username || '';

    // Upload profile photo to Cloudinary if provided
    let profilePhotoUrl = '';
    if (portfolioData.profilePhoto) {
      try {
        const uploadResult = await cloudinary.uploader.upload(portfolioData.profilePhoto, {
          folder: 'edupath/portfolios',
          public_id: `${userId}_${portfolioId}_profile`
        });
        profilePhotoUrl = uploadResult.secure_url;
      } catch (uploadError) {
        console.error('Cloudinary upload error:', uploadError);
      }
    }

    const portfolio = await Portfolio.create({
      userId,
      portfolioId,
      username,
      template: template || 'template1',
      personalInfo: {
        name: portfolioData.name,
        title: portfolioData.title,
        email: portfolioData.email || '',
        phone: portfolioData.phone || '',
        location: portfolioData.location || '',
        about: portfolioData.about || '',
        github: portfolioData.github || '',
        linkedin: portfolioData.linkedin || '',
        portfolio: portfolioData.portfolio || '',
        profilePhoto: profilePhotoUrl
      },
      experience: portfolioData.experience || [],
      education: portfolioData.education || [],
      skills: portfolioData.skills || [],
      projects: portfolioData.projects || [],
      certifications: portfolioData.certifications || [],
      achievements: portfolioData.achievements || []
    });

    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const portfolioUrl = username
      ? `${baseUrl}/${username}`
      : `${baseUrl}/p/${portfolioId}`;

    res.json({
      success: true,
      message: 'Portfolio deployed successfully',
      portfolioUrl,
      portfolioId,
      username,
      portfolio
    });
  } catch (error) {
    console.error('Portfolio deployment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to deploy portfolio',
      error: error.message
    });
  }
};

/**
 * Get portfolio by ID (for public viewing)
 */
export const getPortfolio = async (req, res) => {
  try {
    const { portfolioId } = req.params;

    console.log('🔍 Fetching portfolio with ID:', portfolioId);

    const portfolio = await Portfolio.findOne({ portfolioId, isPublished: true });

    console.log('📊 Portfolio found:', portfolio ? 'Yes' : 'No');

    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio not found'
      });
    }

    portfolio.views += 1;
    await portfolio.save();

    console.log('✅ Portfolio retrieved successfully');

    res.json({
      success: true,
      portfolio
    });
  } catch (error) {
    console.error('Get portfolio error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch portfolio',
      error: error.message
    });
  }
};

/**
 * Get portfolio by username
 */
export const getPortfolioByUsername = async (req, res) => {
  try {
    const { username } = req.params;

    const portfolio = await Portfolio.findOne({ username: username.toLowerCase(), isPublished: true })
      .sort({ createdAt: -1 });

    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio not found for this username'
      });
    }

    portfolio.views += 1;
    await portfolio.save();

    res.json({
      success: true,
      portfolio
    });
  } catch (error) {
    console.error('Get portfolio by username error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch portfolio',
      error: error.message
    });
  }
};

/**
 * Get user's portfolios
 */
export const getUserPortfolios = async (req, res) => {
  try {
    const userId = req.user.id;

    const portfolios = await Portfolio.find({ userId }).sort({ createdAt: -1 });

    res.json({
      success: true,
      portfolios
    });
  } catch (error) {
    console.error('Get user portfolios error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch portfolios',
      error: error.message
    });
  }
};

/**
 * Update portfolio
 */
export const updatePortfolio = async (req, res) => {
  try {
    const { portfolioId } = req.params;
    const { portfolioData, template } = req.body;
    const userId = req.user.id;

    const portfolio = await Portfolio.findOne({ portfolioId, userId });

    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio not found'
      });
    }

    if (template) portfolio.template = template;
    if (portfolioData) {
      if (portfolioData.name) portfolio.personalInfo.name = portfolioData.name;
      if (portfolioData.title) portfolio.personalInfo.title = portfolioData.title;
      if (portfolioData.email !== undefined) portfolio.personalInfo.email = portfolioData.email;
      if (portfolioData.phone !== undefined) portfolio.personalInfo.phone = portfolioData.phone;
      if (portfolioData.location !== undefined) portfolio.personalInfo.location = portfolioData.location;
      if (portfolioData.about !== undefined) portfolio.personalInfo.about = portfolioData.about;
      if (portfolioData.github !== undefined) portfolio.personalInfo.github = portfolioData.github;
      if (portfolioData.linkedin !== undefined) portfolio.personalInfo.linkedin = portfolioData.linkedin;
      if (portfolioData.experience !== undefined) portfolio.experience = portfolioData.experience;
      if (portfolioData.education !== undefined) portfolio.education = portfolioData.education;
      if (portfolioData.skills !== undefined) portfolio.skills = portfolioData.skills;
      if (portfolioData.projects !== undefined) portfolio.projects = portfolioData.projects;
      if (portfolioData.certifications !== undefined) portfolio.certifications = portfolioData.certifications;
      if (portfolioData.achievements !== undefined) portfolio.achievements = portfolioData.achievements;
    }

    await portfolio.save();

    res.json({
      success: true,
      message: 'Portfolio updated successfully',
      portfolio
    });
  } catch (error) {
    console.error('Update portfolio error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update portfolio',
      error: error.message
    });
  }
};

/**
 * Delete portfolio
 */
export const deletePortfolio = async (req, res) => {
  try {
    const { portfolioId } = req.params;
    const userId = req.user.id;

    const portfolio = await Portfolio.findOneAndDelete({ portfolioId, userId });

    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio not found'
      });
    }

    res.json({
      success: true,
      message: 'Portfolio deleted successfully'
    });
  } catch (error) {
    console.error('Delete portfolio error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete portfolio',
      error: error.message
    });
  }
};

/**
 * Deploy portfolio to Vercel
 */
export const deployToVercel = async (req, res) => {
  try {
    const { portfolioId } = req.params;
    const userId = req.user.id;

    const portfolio = await Portfolio.findOne({ portfolioId, userId });
    if (!portfolio) {
      return res.status(404).json({ success: false, message: 'Portfolio not found' });
    }

    const vercelToken = process.env.VERCEL_TOKEN;
    if (!vercelToken) {
      return res.status(500).json({
        success: false,
        message: 'Vercel token not configured. Add VERCEL_TOKEN to .env'
      });
    }

    const data = {
      name: portfolio.personalInfo?.name || '',
      title: portfolio.personalInfo?.title || '',
      email: portfolio.personalInfo?.email || '',
      phone: portfolio.personalInfo?.phone || '',
      location: portfolio.personalInfo?.location || '',
      about: portfolio.personalInfo?.about || '',
      github: portfolio.personalInfo?.github || '',
      linkedin: portfolio.personalInfo?.linkedin || '',
      portfolio: portfolio.personalInfo?.portfolio || '',
      skills: portfolio.skills || [],
      experience: (portfolio.experience || []).map(e => ({
        position: e.position || '',
        company: e.company || '',
        duration: e.duration || '',
        description: e.description || ''
      })),
      education: (portfolio.education || []).map(e => ({
        degree: e.degree || '',
        institution: e.institution || '',
        year: e.year || '',
        cgpa: e.cgpa || ''
      })),
      projects: (portfolio.projects || []).map(p => ({
        name: p.name || '',
        description: p.description || '',
        technologies: p.technologies || [],
        link: p.link || ''
      })),
      certifications: (portfolio.certifications || []).map(c => typeof c === 'string' ? c : (c?.name || String(c))),
      achievements: (portfolio.achievements || []).map(a => typeof a === 'string' ? a : (a?.title || a?.name || String(a)))
    };

    const htmlContent = generateTemplateHTML(data, portfolio.template || 'template1');

    const rawName = portfolio.username
      ? `${portfolio.username}-portfolio`
      : `portfolio-${portfolio.portfolioId}`;
    const projectName = rawName.toLowerCase().replace(/[^a-z0-9-]/g, '-').substring(0, 100);

    const deployPayload = {
      name: projectName,
      files: [
        {
          file: 'index.html',
          data: htmlContent
        }
      ],
      projectSettings: {
        framework: null
      },
      target: 'production'
    };

    const vercelResponse = await fetch('https://api.vercel.com/v13/deployments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${vercelToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(deployPayload)
    });

    const vercelResult = await vercelResponse.json();

    if (!vercelResponse.ok) {
      return res.status(500).json({
        success: false,
        message: vercelResult.error?.message || 'Failed to deploy to Vercel',
        error: vercelResult
      });
    }

    portfolio.vercelDeployment = {
      deploymentId: vercelResult.id,
      url: `https://${vercelResult.url}`,
      projectId: vercelResult.projectId,
      deployedAt: new Date(),
      status: 'ready'
    };
    await portfolio.save();

    res.json({
      success: true,
      message: 'Portfolio deployed to Vercel successfully!',
      vercelUrl: `https://${vercelResult.url}`,
      deploymentId: vercelResult.id
    });
  } catch (error) {
    console.error('[Vercel Deploy] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to deploy to Vercel: ' + error.message,
      error: error.message
    });
  }
};
