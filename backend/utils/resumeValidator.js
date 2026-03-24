import SanitizerUtils from './sanitizer.js';

class ResumeValidator {
  static validate(resumeData) {
    const errors = [];

    // Validate personal info
    if (!resumeData.personalInfo || !resumeData.personalInfo.name) {
      errors.push('Personal information: Name is required');
    }

    if (!resumeData.personalInfo?.email) {
      errors.push('Personal information: Email is required');
    }

    // Validate at least one education entry
    if (!resumeData.education || resumeData.education.length === 0) {
      errors.push('At least one education entry is required');
    }

    // Sanitize and clean the data
    const sanitizedData = this.sanitizeResumeData(resumeData);

    return {
      valid: errors.length === 0,
      errors,
      sanitizedData
    };
  }

  static sanitizeResumeData(data) {
    return {
      personalInfo: {
        name: SanitizerUtils.sanitizeText(data.personalInfo?.name || ''),
        email: SanitizerUtils.sanitizeText(data.personalInfo?.email || ''),
        phone: SanitizerUtils.sanitizeText(data.personalInfo?.phone || ''),
        location: SanitizerUtils.sanitizeText(data.personalInfo?.location || ''),
        linkedin: SanitizerUtils.sanitizeUrl(data.personalInfo?.linkedin || ''),
        github: SanitizerUtils.sanitizeUrl(data.personalInfo?.github || ''),
        website: SanitizerUtils.sanitizeUrl(data.personalInfo?.website || '')
      },
      education: (data.education || []).filter(edu => edu.degree).map(edu => ({
        degree: SanitizerUtils.sanitizeText(edu.degree),
        institution: SanitizerUtils.sanitizeText(edu.institution || ''),
        startDate: SanitizerUtils.sanitizeText(edu.startDate || ''),
        endDate: SanitizerUtils.sanitizeText(edu.endDate || ''),
        cgpa: SanitizerUtils.sanitizeText(edu.cgpa || '')
      })),
      experience: (data.experience || []).filter(exp => exp.position).map(exp => ({
        company: SanitizerUtils.sanitizeText(exp.company || ''),
        position: SanitizerUtils.sanitizeText(exp.position),
        location: SanitizerUtils.sanitizeText(exp.location || ''),
        startDate: SanitizerUtils.sanitizeText(exp.startDate || ''),
        endDate: SanitizerUtils.sanitizeText(exp.endDate || ''),
        responsibilities: (exp.responsibilities || []).filter(r => r).map(r => SanitizerUtils.sanitizeText(r))
      })),
      projects: (data.projects || []).filter(proj => proj.title).map(proj => ({
        title: SanitizerUtils.sanitizeText(proj.title),
        description: SanitizerUtils.sanitizeText(proj.description || ''),
        technologies: (proj.technologies || []).filter(t => t).map(t => SanitizerUtils.sanitizeText(t)),
        link: SanitizerUtils.sanitizeUrl(proj.link || '')
      })),
      skills: {
        technical: (data.skills?.technical || []).filter(s => s).map(s => SanitizerUtils.sanitizeText(s)),
        soft: (data.skills?.soft || []).filter(s => s).map(s => SanitizerUtils.sanitizeText(s))
      },
      certifications: (data.certifications || []).filter(cert => cert.name).map(cert => ({
        name: SanitizerUtils.sanitizeText(cert.name),
        issuer: SanitizerUtils.sanitizeText(cert.issuer || ''),
        date: SanitizerUtils.sanitizeText(cert.date || '')
      })),
      achievements: (data.achievements || []).filter(a => a).map(a => SanitizerUtils.sanitizeText(a))
    };
  }
}

export default ResumeValidator;
