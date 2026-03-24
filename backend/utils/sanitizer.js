/**
 * LaTeX and Data Sanitization Utilities
 * Escapes special characters for LaTeX compilation
 */

class SanitizerUtils {
  /**
   * Escape LaTeX special characters
   */
  static escapeLaTeX(text) {
    if (!text || typeof text !== 'string') return '';

    const specialChars = {
      '&': '\\&',
      '%': '\\%',
      '$': '\\$',
      '#': '\\#',
      '_': '\\_',
      '{': '\\{',
      '}': '\\}',
      '~': '\\textasciitilde{}',
      '^': '\\textasciicircum{}',
      '\\': '\\textbackslash{}'
    };

    return text.replace(/[&%$#_{}~^\\]/g, (char) => specialChars[char] || char);
  }

  /**
   * Sanitize URL for LaTeX
   */
  static sanitizeURL(url) {
    if (!url || typeof url !== 'string') return '';
    return url.replace(/%/g, '\\%').replace(/#/g, '\\#');
  }

  /**
   * Sanitize complete resume data for LaTeX
   */
  static sanitizeForLaTeX(data) {
    const sanitized = JSON.parse(JSON.stringify(data));

    if (sanitized.personalInfo) {
      sanitized.personalInfo.name = this.escapeLaTeX(sanitized.personalInfo.name);
      sanitized.personalInfo.phone = this.escapeLaTeX(sanitized.personalInfo.phone);
      sanitized.personalInfo.location = this.escapeLaTeX(sanitized.personalInfo.location);

      if (sanitized.personalInfo.linkedin) {
        sanitized.personalInfo.linkedin = this.sanitizeURL(sanitized.personalInfo.linkedin);
      }
      if (sanitized.personalInfo.github) {
        sanitized.personalInfo.github = this.sanitizeURL(sanitized.personalInfo.github);
      }
    }

    if (Array.isArray(sanitized.education)) {
      sanitized.education = sanitized.education.map(edu => ({
        ...edu,
        degree: this.escapeLaTeX(edu.degree),
        institution: this.escapeLaTeX(edu.institution),
        startDate: this.escapeLaTeX(edu.startDate),
        endDate: this.escapeLaTeX(edu.endDate),
        cgpa: edu.cgpa ? this.escapeLaTeX(edu.cgpa) : ''
      }));
    }

    if (Array.isArray(sanitized.experience)) {
      sanitized.experience = sanitized.experience.map(exp => ({
        ...exp,
        position: this.escapeLaTeX(exp.position),
        company: this.escapeLaTeX(exp.company),
        startDate: this.escapeLaTeX(exp.startDate),
        endDate: this.escapeLaTeX(exp.endDate),
        responsibilities: (exp.responsibilities || []).map(r => this.escapeLaTeX(r))
      }));
    }

    if (Array.isArray(sanitized.projects)) {
      sanitized.projects = sanitized.projects.map(proj => ({
        ...proj,
        title: this.escapeLaTeX(proj.title),
        description: this.escapeLaTeX(proj.description),
        technologies: (proj.technologies || []).map(t => this.escapeLaTeX(t)),
        link: proj.link ? this.sanitizeURL(proj.link) : ''
      }));
    }

    if (sanitized.skills) {
      const sanitizedSkills = {};
      for (const [category, skillList] of Object.entries(sanitized.skills)) {
        const sanitizedCategory = this.escapeLaTeX(category);
        if (Array.isArray(skillList)) {
          sanitizedSkills[sanitizedCategory] = skillList.map(s => this.escapeLaTeX(s));
        } else {
          sanitizedSkills[sanitizedCategory] = this.escapeLaTeX(skillList);
        }
      }
      sanitized.skills = sanitizedSkills;
    }

    if (Array.isArray(sanitized.certifications)) {
      sanitized.certifications = sanitized.certifications.map(cert => ({
        name: this.escapeLaTeX(cert.name),
        issuer: this.escapeLaTeX(cert.issuer),
        date: this.escapeLaTeX(cert.date)
      }));
    }

    if (Array.isArray(sanitized.achievements)) {
      sanitized.achievements = sanitized.achievements.map(a => this.escapeLaTeX(a));
    }

    return sanitized;
  }

  /**
   * General text sanitization
   */
  static sanitizeText(text) {
    if (!text || typeof text !== 'string') return '';

    return text
      .trim()
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  /**
   * URL-specific sanitization
   */
  static sanitizeUrl(url) {
    if (!url || typeof url !== 'string') return '';

    url = url.trim();
    url = url.replace(/[\x00-\x1F\x7F]/g, '');

    if (/^https?:\/\//i.test(url)) {
      return url;
    }

    url = url.replace(/^(https?:)+/i, '');

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return 'https://' + url.replace(/^\/+/, '');
    }

    return url;
  }

  /**
   * Truncate text to specified length
   */
  static truncate(text, maxLength = 500) {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  }

  /**
   * Remove potentially dangerous characters from filename
   */
  static sanitizeFilename(filename) {
    return filename.replace(/[^a-zA-Z0-9._-]/g, '_');
  }
}

export default SanitizerUtils;
