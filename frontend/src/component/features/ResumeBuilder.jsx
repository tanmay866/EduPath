import { useState, useEffect } from 'react';
import { API_BASE } from '../../config';
import { useNavigate } from 'react-router-dom';
import {
  LearnerShell, Card, CardHeader, CardFooterNote, Button, Field, Input,
  InlineMessage, MicroLabel, type,
} from '../../design';
import { learnerNav, sessionInitials, sessionName, sessionLoginId } from '../../design/nav';

/**
 * Spec §7 Resume & ATS — the resume half.
 *
 * `1.5fr 1fr`: the form on the left, the document card on the right —
 * Newsreader 26px name, a 13px text-3 contact line, then sections under a
 * `1px solid ink` rule, each a mono 10px / 0.13em label above 13–13.5px
 * content. Experience entries are a 13.5px/600 role with a mono year
 * right-aligned, then bullets. Below the card, a two-up primary + secondary.
 *
 * The document card renders from `resumeData` rather than only after a
 * generate call, so the right column shows the resume being written instead of
 * sitting blank until the DOCX comes back.
 */

// Kept outside the component so typing does not remount the input each render.
const InputField = ({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  error = '',
  helperText = '',
  maxLength = null,
  textarea = false,
  multiline = false,
  rows = 3,
  showLabel = true,
}) => (
  <Field
    label={showLabel && label ? `${label}${required ? ' *' : ''}` : undefined}
    error={error}
    help={!error && helperText ? helperText : undefined}
    labelRight={
      maxLength ? (
        <MicroLabel size={10.5} color="var(--color-text-4)">
          {`${(value || '').length}/${maxLength}`}
        </MicroLabel>
      ) : undefined
    }
  >
    {textarea || multiline ? (
      <textarea
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        maxLength={maxLength}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: '13px 14px',
          fontSize: 15,
          fontFamily: 'var(--font-sans)',
          lineHeight: 1.55,
          color: 'var(--color-ink)',
          background: '#fff',
          border: `1px solid ${error ? 'var(--color-clay)' : 'var(--color-line-input)'}`,
          borderRadius: 0,
          outline: 'none',
          resize: 'vertical',
        }}
      />
    ) : (
      <Input
        type={type}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        maxLength={maxLength}
        placeholder={placeholder}
        error={Boolean(error)}
      />
    )}
  </Field>
);

/* ── Document card ────────────────────────────────────────────────────────
   The spec's right column. Sections only appear once they hold something, so
   an empty resume shows the name block rather than seven empty headings. */
const DocSection = ({ label, children }) => (
  <div style={{ borderTop: '1px solid var(--color-ink)', paddingTop: 14, marginTop: 22 }}>
    <MicroLabel size={10} tracking="0.13em" color="var(--color-text-4)" style={{ display: 'block', marginBottom: 10 }}>
      {label}
    </MicroLabel>
    <div style={{ fontSize: 13.5, lineHeight: 1.55, color: 'var(--color-text-2)' }}>{children}</div>
  </div>
);

const DocEntry = ({ title, meta, year, lines = [] }) => (
  <div style={{ marginBottom: 14 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
      <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--color-ink)' }}>{title}</span>
      {year && (
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, color: 'var(--color-text-4)', whiteSpace: 'nowrap' }}>
          {year}
        </span>
      )}
    </div>
    {meta && <div style={{ fontSize: 13, color: 'var(--color-text-3)', marginTop: 2 }}>{meta}</div>}
    {lines.filter(Boolean).map((line, i) => (
      <div key={i} style={{ display: 'flex', gap: 8, marginTop: 5 }}>
        <span style={{ color: 'var(--color-text-4)' }}>·</span>
        <span style={{ fontSize: 13 }}>{line}</span>
      </div>
    ))}
  </div>
);

const dateRange = (start, end) => [start, end].filter(Boolean).join('–');
const clean = (list = []) => list.filter((v) => String(v || '').trim());

const ResumeDocument = ({ data }) => {
  const p = data.personalInfo || {};
  const contact = clean([p.email, p.phone, p.location]).join('  ·  ');
  const links = clean([p.linkedin, p.github, p.website]).join('  ·  ');

  const education = (data.education || []).filter((e) => e.degree || e.institution);
  const experience = (data.experience || []).filter((e) => e.position || e.company);
  const projects = (data.projects || []).filter((e) => e.title || e.description);
  const technical = clean(data.skills?.technical);
  const soft = clean(data.skills?.soft);
  const certifications = (data.certifications || []).filter((c) => c.name);
  const achievements = clean(data.achievements);

  return (
    <div style={{ padding: 26 }}>
      <div
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 26,
          fontWeight: 400,
          letterSpacing: '-0.015em',
          lineHeight: 1.15,
          color: 'var(--color-ink)',
        }}
      >
        {p.name || 'Your name'}
      </div>
      {contact && <div style={{ fontSize: 13, color: 'var(--color-text-3)', marginTop: 8 }}>{contact}</div>}
      {links && <div style={{ fontSize: 13, color: 'var(--color-text-3)', marginTop: 3 }}>{links}</div>}

      {experience.length > 0 && (
        <DocSection label="Experience">
          {experience.map((exp, i) => (
            <DocEntry
              key={i}
              title={exp.position || 'Role'}
              meta={clean([exp.company, exp.location]).join(' · ')}
              year={dateRange(exp.startDate, exp.endDate)}
              lines={exp.responsibilities}
            />
          ))}
        </DocSection>
      )}

      {education.length > 0 && (
        <DocSection label="Education">
          {education.map((edu, i) => (
            <DocEntry
              key={i}
              title={edu.degree || 'Degree'}
              meta={clean([edu.institution, edu.cgpa && `CGPA ${edu.cgpa}`]).join(' · ')}
              year={dateRange(edu.startDate, edu.endDate)}
            />
          ))}
        </DocSection>
      )}

      {projects.length > 0 && (
        <DocSection label="Projects">
          {projects.map((proj, i) => (
            <DocEntry
              key={i}
              title={proj.title || 'Project'}
              meta={clean(proj.technologies).join(' · ')}
              lines={[proj.description]}
            />
          ))}
        </DocSection>
      )}

      {(technical.length > 0 || soft.length > 0) && (
        <DocSection label="Skills">
          {technical.length > 0 && <div>{technical.join(' · ')}</div>}
          {soft.length > 0 && (
            <div style={{ marginTop: technical.length ? 6 : 0, color: 'var(--color-text-3)' }}>{soft.join(' · ')}</div>
          )}
        </DocSection>
      )}

      {certifications.length > 0 && (
        <DocSection label="Certifications">
          {certifications.map((cert, i) => (
            <DocEntry key={i} title={cert.name} meta={cert.issuer} year={cert.date} />
          ))}
        </DocSection>
      )}

      {achievements.length > 0 && (
        <DocSection label="Achievements">
          {achievements.map((a, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, marginTop: i ? 5 : 0 }}>
              <span style={{ color: 'var(--color-text-4)' }}>·</span>
              <span>{a}</span>
            </div>
          ))}
        </DocSection>
      )}
    </div>
  );
};

/* A form section: the card chrome plus its optional "add another" action. */
const Section = ({ label, onAdd, addLabel, children }) => (
  <Card>
    <CardHeader
      label={label}
      right={onAdd && <Button variant="quietClay" onClick={onAdd}>{addLabel}</Button>}
    />
    <div style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>{children}</div>
  </Card>
);

/* One repeated entry inside a section, with its own remove control. */
const Entry = ({ ordinal, onRemove, children }) => (
  <div style={{ borderTop: ordinal > 1 ? '1px solid var(--color-line-soft)' : 'none', paddingTop: ordinal > 1 ? 20 : 0 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
      <MicroLabel size={10.5} tracking="0.13em" color="var(--color-clay)">
        {String(ordinal).padStart(2, '0')}
      </MicroLabel>
      {onRemove && <Button variant="quiet" onClick={onRemove}>Remove</Button>}
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>{children}</div>
  </div>
);

const TWO_UP = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 };

function ResumeBuilder() {
  const navigate = useNavigate();

  const [format, setFormat] = useState('pdf');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [generatedResumeUrl, setGeneratedResumeUrl] = useState('');
  // The backend converts by filename so it can scope the lookup to this user.
  const [generatedFilename, setGeneratedFilename] = useState('');
  const [errors, setErrors] = useState({});

  // Check authentication on component mount
  useEffect(() => {
    const token = sessionStorage.getItem('token');
    if (!token) {
      navigate('/signin');
      return;
    }
  }, [navigate]);

  const [resumeData, setResumeData] = useState({
    personalInfo: {
      name: '',
      email: '',
      phone: '',
      location: '',
      linkedin: '',
      github: '',
      website: ''
    },
    education: [
      {
        degree: '',
        institution: '',
        startDate: '',
        endDate: '',
        cgpa: ''
      }
    ],
    experience: [
      {
        company: '',
        position: '',
        location: '',
        startDate: '',
        endDate: '',
        responsibilities: ['']
      }
    ],
    projects: [
      {
        title: '',
        description: '',
        technologies: [''],
        link: ''
      }
    ],
    skills: {
      technical: [''],
      soft: ['']
    },
    certifications: [
      {
        name: '',
        issuer: '',
        date: ''
      }
    ],
    achievements: ['']
  });

  // Validation functions
  const validateName = (name) => {
    const nameRegex = /^[a-zA-Z\s.'-]+$/;
    if (!name) return 'Name is required';
    if (name.length < 2) return 'Name must be at least 2 characters';
    if (name.length > 50) return 'Name must be less than 50 characters';
    if (!nameRegex.test(name)) return 'Name can only contain letters, spaces, dots, hyphens and apostrophes';
    return '';
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return 'Email is required';
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    if (email.length > 100) return 'Email must be less than 100 characters';
    return '';
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^[+]?[\d\s\-()]{10,20}$/;
    if (!phone) return 'Phone number is required';
    if (!phoneRegex.test(phone)) return 'Please enter a valid phone number';
    return '';
  };

  const validateLocation = (location) => {
    const locationRegex = /^[a-zA-Z0-9\s,.\-']+$/;
    if (location && !locationRegex.test(location)) return 'Location contains invalid characters';
    if (location && location.length > 100) return 'Location must be less than 100 characters';
    return '';
  };

  const validateURL = (url, type = 'URL') => {
    if (!url) return '';
    try {
      const validUrl = new URL(url.startsWith('http') ? url : `https://${url}`);

      if (type === 'LinkedIn') {
        if (!validUrl.hostname.includes('linkedin.com')) {
          return 'Please enter a valid LinkedIn URL';
        }
      } else if (type === 'GitHub') {
        if (!validUrl.hostname.includes('github.com')) {
          return 'Please enter a valid GitHub URL';
        }
      }

      if (url.length > 200) return `${type} must be less than 200 characters`;
      return '';
    } catch {
      return `Please enter a valid ${type} URL`;
    }
  };

  const validateText = (text, fieldName, minLength = 0, maxLength = 500) => {
    if (!text && minLength > 0) return `${fieldName} is required`;
    if (text && text.length < minLength) return `${fieldName} must be at least ${minLength} characters`;
    if (text && text.length > maxLength) return `${fieldName} must be less than ${maxLength} characters`;
    return '';
  };

  const validateYear = (year) => {
    if (!year) return '';
    const yearRegex = /^(19|20)\d{2}$|^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(19|20)\d{2}$|^Present$|^Current$/i;
    if (!yearRegex.test(year)) return 'Please enter a valid year (e.g., 2023) or "Present"';
    return '';
  };

  const validateGPA = (gpa) => {
    if (!gpa) return '';
    const gpaRegex = /^\d+(\.\d{1,2})?$/;
    if (!gpaRegex.test(gpa)) return 'Please enter a valid GPA (e.g., 3.8)';
    const gpaNum = parseFloat(gpa);
    if (gpaNum < 0 || gpaNum > 10) return 'GPA must be between 0 and 10';
    return '';
  };

  // Input formatters
  const formatNameInput = (value) => {
    return value.replace(/[^a-zA-Z\s.'-]/g, '').slice(0, 50);
  };

  const formatPhoneInput = (value) => {
    return value.replace(/[^\d\s+\-()]/g, '').slice(0, 20);
  };

  const formatLocationInput = (value) => {
    return value.replace(/[^a-zA-Z0-9\s,.\-']/g, '').slice(0, 100);
  };

  const formatTextInput = (value, maxLength = 500) => {
    return value.slice(0, maxLength);
  };

  const formatYearInput = (value) => {
    return value.replace(/[^a-zA-Z0-9\s]/g, '').slice(0, 20);
  };

  const formatGPAInput = (value) => {
    return value.replace(/[^\d.]/g, '').slice(0, 5);
  };

  const setFieldError = (section, field, index, error) => {
    const errorKey = index !== undefined ? `${section}.${index}.${field}` : `${section}.${field}`;
    setErrors(prev => ({
      ...prev,
      [errorKey]: error
    }));
  };

  const getFieldError = (section, field, index, subIndex) => {
    let errorKey;
    if (subIndex !== undefined) {
      // For nested arrays like experience.responsibilities
      errorKey = `${section}.${index}.${field}.${subIndex}`;
    } else if (index !== undefined) {
      errorKey = `${section}.${index}.${field}`;
    } else {
      errorKey = `${section}.${field}`;
    }
    return errors[errorKey] || '';
  };

  const handlePersonalInfoChange = (field, value) => {
    let formattedValue = value;
    let error = '';

    // Format input based on field type
    switch (field) {
      case 'name':
        formattedValue = formatNameInput(value);
        error = validateName(formattedValue);
        break;
      case 'email':
        formattedValue = value.slice(0, 100);
        error = validateEmail(formattedValue);
        break;
      case 'phone':
        formattedValue = formatPhoneInput(value);
        error = validatePhone(formattedValue);
        break;
      case 'location':
        formattedValue = formatLocationInput(value);
        error = validateLocation(formattedValue);
        break;
      case 'linkedin':
        formattedValue = value.slice(0, 200);
        error = validateURL(formattedValue, 'LinkedIn');
        break;
      case 'github':
        formattedValue = value.slice(0, 200);
        error = validateURL(formattedValue, 'GitHub');
        break;
      case 'website':
        formattedValue = value.slice(0, 200);
        error = validateURL(formattedValue, 'Website');
        break;
      default:
        break;
    }

    setFieldError('personalInfo', field, undefined, error);
    setResumeData({
      ...resumeData,
      personalInfo: { ...resumeData.personalInfo, [field]: formattedValue }
    });
  };

  const handleEducationChange = (index, field, value) => {
    let formattedValue = value;
    let error = '';

    switch (field) {
      case 'degree':
        formattedValue = formatTextInput(value, 200);
        error = validateText(formattedValue, 'Degree', 2, 200);
        break;
      case 'institution':
        formattedValue = formatTextInput(value, 200);
        error = validateText(formattedValue, 'Institution', 2, 200);
        break;
      case 'startDate':
      case 'endDate':
        formattedValue = formatYearInput(value);
        error = validateYear(formattedValue);
        break;
      case 'cgpa':
        formattedValue = formatGPAInput(value);
        error = validateGPA(formattedValue);
        break;
      default:
        break;
    }

    setFieldError('education', field, index, error);
    const newEducation = [...resumeData.education];
    newEducation[index][field] = formattedValue;
    setResumeData({ ...resumeData, education: newEducation });
  };

  const addEducation = () => {
    setResumeData({
      ...resumeData,
      education: [...resumeData.education, { degree: '', institution: '', startDate: '', endDate: '', cgpa: '' }]
    });
  };

  const removeEducation = (index) => {
    const newEducation = resumeData.education.filter((_, i) => i !== index);
    setResumeData({ ...resumeData, education: newEducation });
  };

  const handleExperienceChange = (index, field, value) => {
    let formattedValue = value;
    let error = '';

    switch (field) {
      case 'position':
        formattedValue = formatTextInput(value, 100);
        error = validateText(formattedValue, 'Position', 2, 100);
        break;
      case 'company':
        formattedValue = formatTextInput(value, 100);
        error = validateText(formattedValue, 'Company', 2, 100);
        break;
      case 'location':
        formattedValue = formatLocationInput(value);
        error = validateLocation(formattedValue);
        break;
      case 'startDate':
      case 'endDate':
        formattedValue = formatYearInput(value);
        error = validateYear(formattedValue);
        break;
      default:
        break;
    }

    setFieldError('experience', field, index, error);
    const newExperience = [...resumeData.experience];
    newExperience[index][field] = formattedValue;
    setResumeData({ ...resumeData, experience: newExperience });
  };

  const handleResponsibilityChange = (expIndex, respIndex, value) => {
    const formattedValue = formatTextInput(value, 300);
    const error = validateText(formattedValue, 'Responsibility', 5, 300);

    setFieldError('experience', `responsibilities.${respIndex}`, expIndex, error);
    const newExperience = [...resumeData.experience];
    newExperience[expIndex].responsibilities[respIndex] = formattedValue;
    setResumeData({ ...resumeData, experience: newExperience });
  };

  const addResponsibility = (expIndex) => {
    const newExperience = [...resumeData.experience];
    newExperience[expIndex].responsibilities.push('');
    setResumeData({ ...resumeData, experience: newExperience });
  };

  const addExperience = () => {
    setResumeData({
      ...resumeData,
      experience: [...resumeData.experience, { company: '', position: '', location: '', startDate: '', endDate: '', responsibilities: [''] }]
    });
  };

  const removeExperience = (index) => {
    const newExperience = resumeData.experience.filter((_, i) => i !== index);
    setResumeData({ ...resumeData, experience: newExperience });
  };

  const handleProjectChange = (index, field, value) => {
    let formattedValue = value;
    let error = '';

    switch (field) {
      case 'title':
        formattedValue = formatTextInput(value, 100);
        error = validateText(formattedValue, 'Project title', 3, 100);
        break;
      case 'description':
        formattedValue = formatTextInput(value, 500);
        error = validateText(formattedValue, 'Description', 0, 500);
        break;
      case 'link':
        formattedValue = value.slice(0, 200);
        error = validateURL(formattedValue, 'Project link');
        break;
      default:
        break;
    }

    setFieldError('projects', field, index, error);
    const newProjects = [...resumeData.projects];
    newProjects[index][field] = formattedValue;
    setResumeData({ ...resumeData, projects: newProjects });
  };

  const handleTechnologyChange = (projIndex, techIndex, value) => {
    const formattedValue = formatTextInput(value, 50);
    const error = validateText(formattedValue, 'Technology', 0, 50);

    setFieldError('projects', `technologies.${techIndex}`, projIndex, error);
    const newProjects = [...resumeData.projects];
    newProjects[projIndex].technologies[techIndex] = formattedValue;
    setResumeData({ ...resumeData, projects: newProjects });
  };

  const addTechnology = (projIndex) => {
    const newProjects = [...resumeData.projects];
    newProjects[projIndex].technologies.push('');
    setResumeData({ ...resumeData, projects: newProjects });
  };

  const addProject = () => {
    setResumeData({
      ...resumeData,
      projects: [...resumeData.projects, { title: '', description: '', technologies: [''], link: '' }]
    });
  };

  const removeProject = (index) => {
    const newProjects = resumeData.projects.filter((_, i) => i !== index);
    setResumeData({ ...resumeData, projects: newProjects });
  };

  const handleSkillChange = (type, index, value) => {
    const formattedValue = formatTextInput(value, 50);
    const error = validateText(formattedValue, 'Skill', 0, 50);

    setFieldError('skills', `${type}.${index}`, undefined, error);
    const newSkills = { ...resumeData.skills };
    newSkills[type][index] = formattedValue;
    setResumeData({ ...resumeData, skills: newSkills });
  };

  const addSkill = (type) => {
    const newSkills = { ...resumeData.skills };
    newSkills[type].push('');
    setResumeData({ ...resumeData, skills: newSkills });
  };

  const handleCertificationChange = (index, field, value) => {
    let formattedValue = value;
    let error = '';

    switch (field) {
      case 'name':
        formattedValue = formatTextInput(value, 150);
        error = validateText(formattedValue, 'Certification name', 3, 150);
        break;
      case 'issuer':
        formattedValue = formatTextInput(value, 100);
        error = validateText(formattedValue, 'Issuer', 0, 100);
        break;
      case 'date':
        formattedValue = formatYearInput(value);
        error = validateYear(formattedValue);
        break;
      default:
        break;
    }

    setFieldError('certifications', field, index, error);
    const newCertifications = [...resumeData.certifications];
    newCertifications[index][field] = formattedValue;
    setResumeData({ ...resumeData, certifications: newCertifications });
  };

  const addCertification = () => {
    setResumeData({
      ...resumeData,
      certifications: [...resumeData.certifications, { name: '', issuer: '', date: '' }]
    });
  };

  const removeCertification = (index) => {
    const newCertifications = resumeData.certifications.filter((_, i) => i !== index);
    setResumeData({ ...resumeData, certifications: newCertifications });
  };

  const handleAchievementChange = (index, value) => {
    const formattedValue = formatTextInput(value, 200);
    const error = validateText(formattedValue, 'Achievement', 5, 200);

    setFieldError('achievements', index.toString(), undefined, error);
    const newAchievements = [...resumeData.achievements];
    newAchievements[index] = formattedValue;
    setResumeData({ ...resumeData, achievements: newAchievements });
  };

  const addAchievement = () => {
    setResumeData({
      ...resumeData,
      achievements: [...resumeData.achievements, '']
    });
  };

  const convertWordToPDF = async (filename) => {
    // Conversion runs on the backend: the FreeConvert API key used to be inlined
    // here, which shipped it to every browser that loaded this bundle.
    const token = sessionStorage.getItem('token');
    const response = await fetch(`${API_BASE}/resume-generator/convert-to-pdf`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ filename })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'PDF conversion failed');
    }

    return data.data.pdfUrl;
  };

  const validateForm = () => {
    const newErrors = {};
    let hasErrors = false;

    // Validate personal info
    const personalErrors = {
      name: validateName(resumeData.personalInfo.name),
      email: validateEmail(resumeData.personalInfo.email),
      phone: validatePhone(resumeData.personalInfo.phone),
      location: validateLocation(resumeData.personalInfo.location),
      linkedin: validateURL(resumeData.personalInfo.linkedin, 'LinkedIn'),
      github: validateURL(resumeData.personalInfo.github, 'GitHub'),
      website: validateURL(resumeData.personalInfo.website, 'Website'),
    };

    Object.keys(personalErrors).forEach(field => {
      if (personalErrors[field]) {
        newErrors[`personalInfo.${field}`] = personalErrors[field];
        hasErrors = true;
      }
    });

    // Validate education
    resumeData.education.forEach((edu, index) => {
      const eduErrors = {
        degree: validateText(edu.degree, 'Degree', 2, 200),
        institution: validateText(edu.institution, 'Institution', 2, 200),
        startDate: validateYear(edu.startDate),
        endDate: validateYear(edu.endDate),
        cgpa: validateGPA(edu.cgpa),
      };

      Object.keys(eduErrors).forEach(field => {
        if (eduErrors[field]) {
          newErrors[`education.${index}.${field}`] = eduErrors[field];
          hasErrors = true;
        }
      });
    });

    // Validate experience
    resumeData.experience.forEach((exp, expIndex) => {
      const expErrors = {
        position: validateText(exp.position, 'Position', 2, 100),
        company: validateText(exp.company, 'Company', 2, 100),
        location: validateLocation(exp.location),
        startDate: validateYear(exp.startDate),
        endDate: validateYear(exp.endDate),
      };

      Object.keys(expErrors).forEach(field => {
        if (expErrors[field]) {
          newErrors[`experience.${expIndex}.${field}`] = expErrors[field];
          hasErrors = true;
        }
      });

      // Validate responsibilities
      exp.responsibilities.forEach((resp, respIndex) => {
        const respError = validateText(resp, 'Responsibility', 5, 300);
        if (respError) {
          newErrors[`experience.${expIndex}.responsibilities.${respIndex}`] = respError;
          hasErrors = true;
        }
      });
    });

    // Validate projects
    resumeData.projects.forEach((proj, index) => {
      const projErrors = {
        title: validateText(proj.title, 'Project title', 3, 100),
        description: validateText(proj.description, 'Description', 0, 500),
        link: validateURL(proj.link, 'Project link'),
      };

      Object.keys(projErrors).forEach(field => {
        if (projErrors[field]) {
          newErrors[`projects.${index}.${field}`] = projErrors[field];
          hasErrors = true;
        }
      });
    });

    setErrors(newErrors);
    return !hasErrors;
  };

  const handleGenerateResume = async () => {
    // Validate form before generating
    if (!validateForm()) {
      setMessage('Please fix the errors in the form before generating the resume.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const token = sessionStorage.getItem('token');

      // Always generate DOCX from backend first
      setMessage('Generating resume...');
      const response = await fetch(`${API_BASE}/resume-generator/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ resumeData })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to generate resume');
      }

      // Now downloadUrl is a full Cloudinary URL, no need to prepend localhost
      const docxUrl = data.data.downloadUrl;
      setGeneratedResumeUrl(docxUrl);
      setGeneratedFilename(data.data.filename);

      setShowPreview(true);
      setMessage('Resume generated successfully! Review your information and download when ready.');

    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!generatedResumeUrl) return;

    try {
      setLoading(true);
      setMessage('Preparing download...');

      if (format === 'pdf') {
        setMessage('Converting to PDF... This may take a moment.');
        const pdfUrl = await convertWordToPDF(generatedFilename);

        const pdfResponse = await fetch(pdfUrl);
        const pdfBlob = await pdfResponse.blob();

        const downloadUrl = window.URL.createObjectURL(pdfBlob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `resume_${Date.now()}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);

        setMessage('PDF downloaded successfully!');
      } else {
        window.open(generatedResumeUrl, '_blank');
        setMessage('DOCX downloaded successfully!');
      }
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditResume = () => {
    setShowPreview(false);
    setGeneratedResumeUrl('');
    setGeneratedFilename('');
    setMessage('');
  };

  const isError = /fail|error|fix the errors|not |unable/i.test(message);

  return (
    <LearnerShell
      sections={learnerNav}
      eyebrow="Build"
      title={showPreview ? 'Resume preview' : 'Resume'}
      note={sessionName()}
      initials={sessionInitials()}
      footLabel={sessionLoginId()}
    >
      {message && (
        <InlineMessage tone={isError ? 'error' : 'success'}>{message}</InlineMessage>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 22, alignItems: 'start' }}>
        {/* Left — the form, or the download controls once a file exists. */}
        {showPreview ? (
          <Card>
            <CardHeader label="Ready to download" />
            <div style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
              <p style={{ ...type.body, margin: 0 }}>
                Your resume has been generated. Check the document on the right, then choose a
                format and download it.
              </p>

              <Field label="Format">
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '13px 14px',
                    fontSize: 15,
                    fontFamily: 'var(--font-sans)',
                    color: 'var(--color-ink)',
                    background: '#fff',
                    border: '1px solid var(--color-line-input)',
                    borderRadius: 0,
                    outline: 'none',
                  }}
                >
                  <option value="pdf">PDF</option>
                  <option value="docx">DOCX</option>
                </select>
              </Field>

              {generatedFilename && (
                <div style={{ borderTop: '1px solid var(--color-line-soft)', paddingTop: 14 }}>
                  <MicroLabel size={10.5} tracking="0.13em" color="var(--color-text-4)" style={{ display: 'block', marginBottom: 6 }}>
                    File
                  </MicroLabel>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12.5, color: 'var(--color-text-2)', wordBreak: 'break-all' }}>
                    {generatedFilename}
                  </span>
                </div>
              )}
            </div>

            <div style={{ padding: '18px 24px', borderTop: '1px solid var(--color-line)', display: 'flex', gap: 12 }}>
              <Button onClick={handleDownload} loading={loading} loadingLabel="Preparing…">
                {`Download ${format.toUpperCase()}`}
              </Button>
              <Button variant="secondary" onClick={handleEditResume}>Keep editing</Button>
            </div>

            <CardFooterNote>
              PDF is converted from the DOCX, so it can take a few seconds longer.
            </CardFooterNote>
          </Card>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
            {/* Personal information */}
            <Section label="Personal information">
              <InputField
                label="Full name"
                required
                value={resumeData.personalInfo.name}
                onChange={(v) => handlePersonalInfoChange('name', v)}
                error={getFieldError('personalInfo', 'name')}
                placeholder="Tanmay Patel"
                maxLength={60}
              />

              <div style={TWO_UP}>
                <InputField
                  label="Email"
                  type="email"
                  required
                  value={resumeData.personalInfo.email}
                  onChange={(v) => handlePersonalInfoChange('email', v)}
                  error={getFieldError('personalInfo', 'email')}
                  placeholder="you@example.com"
                />
                <InputField
                  label="Phone"
                  required
                  value={resumeData.personalInfo.phone}
                  onChange={(v) => handlePersonalInfoChange('phone', v)}
                  error={getFieldError('personalInfo', 'phone')}
                  placeholder="9313928398"
                />
              </div>

              <InputField
                label="Location"
                value={resumeData.personalInfo.location}
                onChange={(v) => handlePersonalInfoChange('location', v)}
                error={getFieldError('personalInfo', 'location')}
                placeholder="Ahmedabad, Gujarat"
              />

              <div style={TWO_UP}>
                <InputField
                  label="LinkedIn"
                  value={resumeData.personalInfo.linkedin}
                  onChange={(v) => handlePersonalInfoChange('linkedin', v)}
                  error={getFieldError('personalInfo', 'linkedin')}
                  placeholder="linkedin.com/in/you"
                />
                <InputField
                  label="GitHub"
                  value={resumeData.personalInfo.github}
                  onChange={(v) => handlePersonalInfoChange('github', v)}
                  error={getFieldError('personalInfo', 'github')}
                  placeholder="github.com/you"
                />
              </div>

              <InputField
                label="Website"
                value={resumeData.personalInfo.website}
                onChange={(v) => handlePersonalInfoChange('website', v)}
                error={getFieldError('personalInfo', 'website')}
                placeholder="yoursite.com"
              />
            </Section>

            {/* Education */}
            <Section label="Education" onAdd={addEducation} addLabel="Add education">
              {resumeData.education.map((edu, index) => (
                <Entry
                  key={index}
                  ordinal={index + 1}
                  onRemove={resumeData.education.length > 1 ? () => removeEducation(index) : undefined}
                >
                  <InputField
                    label="Degree"
                    value={edu.degree}
                    onChange={(v) => handleEducationChange(index, 'degree', v)}
                    error={getFieldError('education', 'degree', index)}
                    placeholder="B.E. Computer Engineering"
                  />
                  <InputField
                    label="Institution"
                    value={edu.institution}
                    onChange={(v) => handleEducationChange(index, 'institution', v)}
                    error={getFieldError('education', 'institution', index)}
                    placeholder="Gujarat Technological University"
                  />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20 }}>
                    <InputField
                      label="Start year"
                      value={edu.startDate}
                      onChange={(v) => handleEducationChange(index, 'startDate', v)}
                      error={getFieldError('education', 'startDate', index)}
                      placeholder="2022"
                    />
                    <InputField
                      label="End year"
                      value={edu.endDate}
                      onChange={(v) => handleEducationChange(index, 'endDate', v)}
                      error={getFieldError('education', 'endDate', index)}
                      placeholder="2026"
                    />
                    <InputField
                      label="CGPA"
                      value={edu.cgpa}
                      onChange={(v) => handleEducationChange(index, 'cgpa', v)}
                      error={getFieldError('education', 'cgpa', index)}
                      placeholder="8.4"
                    />
                  </div>
                </Entry>
              ))}
            </Section>

            {/* Experience */}
            <Section label="Experience" onAdd={addExperience} addLabel="Add experience">
              {resumeData.experience.map((exp, index) => (
                <Entry
                  key={index}
                  ordinal={index + 1}
                  onRemove={resumeData.experience.length > 1 ? () => removeExperience(index) : undefined}
                >
                  <div style={TWO_UP}>
                    <InputField
                      label="Position"
                      value={exp.position}
                      onChange={(v) => handleExperienceChange(index, 'position', v)}
                      error={getFieldError('experience', 'position', index)}
                      placeholder="Full Stack Developer"
                    />
                    <InputField
                      label="Company"
                      value={exp.company}
                      onChange={(v) => handleExperienceChange(index, 'company', v)}
                      error={getFieldError('experience', 'company', index)}
                      placeholder="Acme Ltd"
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20 }}>
                    <InputField
                      label="Location"
                      value={exp.location}
                      onChange={(v) => handleExperienceChange(index, 'location', v)}
                      error={getFieldError('experience', 'location', index)}
                      placeholder="Ahmedabad"
                    />
                    <InputField
                      label="Start year"
                      value={exp.startDate}
                      onChange={(v) => handleExperienceChange(index, 'startDate', v)}
                      error={getFieldError('experience', 'startDate', index)}
                      placeholder="2024"
                    />
                    <InputField
                      label="End year"
                      value={exp.endDate}
                      onChange={(v) => handleExperienceChange(index, 'endDate', v)}
                      error={getFieldError('experience', 'endDate', index)}
                      placeholder="2026"
                    />
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <MicroLabel size={11} tracking="0.12em">Responsibilities</MicroLabel>
                      <Button variant="quietClay" onClick={() => addResponsibility(index)}>Add line</Button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {exp.responsibilities.map((resp, respIndex) => (
                        <InputField
                          key={respIndex}
                          showLabel={false}
                          textarea
                          rows={2}
                          value={resp}
                          onChange={(v) => handleResponsibilityChange(index, respIndex, v)}
                          error={getFieldError('experience', 'responsibilities', index, respIndex)}
                          placeholder="What you did, and what changed because of it"
                        />
                      ))}
                    </div>
                  </div>
                </Entry>
              ))}
            </Section>

            {/* Projects */}
            <Section label="Projects" onAdd={addProject} addLabel="Add project">
              {resumeData.projects.map((proj, index) => (
                <Entry
                  key={index}
                  ordinal={index + 1}
                  onRemove={resumeData.projects.length > 1 ? () => removeProject(index) : undefined}
                >
                  <InputField
                    label="Title"
                    value={proj.title}
                    onChange={(v) => handleProjectChange(index, 'title', v)}
                    error={getFieldError('projects', 'title', index)}
                    placeholder="EduPath"
                  />
                  <InputField
                    label="Description"
                    textarea
                    rows={3}
                    maxLength={500}
                    value={proj.description}
                    onChange={(v) => handleProjectChange(index, 'description', v)}
                    error={getFieldError('projects', 'description', index)}
                    placeholder="What it does and what you built"
                  />

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <MicroLabel size={11} tracking="0.12em">Technologies</MicroLabel>
                      <Button variant="quietClay" onClick={() => addTechnology(index)}>Add one</Button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {proj.technologies.map((tech, techIndex) => (
                        <InputField
                          key={techIndex}
                          showLabel={false}
                          value={tech}
                          onChange={(v) => handleTechnologyChange(index, techIndex, v)}
                          placeholder="React"
                        />
                      ))}
                    </div>
                  </div>

                  <InputField
                    label="Link"
                    value={proj.link}
                    onChange={(v) => handleProjectChange(index, 'link', v)}
                    error={getFieldError('projects', 'link', index)}
                    placeholder="github.com/you/edupath"
                  />
                </Entry>
              ))}
            </Section>

            {/* Skills */}
            <Section label="Skills">
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <MicroLabel size={11} tracking="0.12em">Technical</MicroLabel>
                  <Button variant="quietClay" onClick={() => addSkill('technical')}>Add one</Button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {resumeData.skills.technical.map((skill, index) => (
                    <InputField
                      key={index}
                      showLabel={false}
                      value={skill}
                      onChange={(v) => handleSkillChange('technical', index, v)}
                      placeholder="JavaScript"
                    />
                  ))}
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <MicroLabel size={11} tracking="0.12em">Soft</MicroLabel>
                  <Button variant="quietClay" onClick={() => addSkill('soft')}>Add one</Button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {resumeData.skills.soft.map((skill, index) => (
                    <InputField
                      key={index}
                      showLabel={false}
                      value={skill}
                      onChange={(v) => handleSkillChange('soft', index, v)}
                      placeholder="Communication"
                    />
                  ))}
                </div>
              </div>
            </Section>

            {/* Certifications */}
            <Section label="Certifications" onAdd={addCertification} addLabel="Add certification">
              {resumeData.certifications.map((cert, index) => (
                <Entry
                  key={index}
                  ordinal={index + 1}
                  onRemove={resumeData.certifications.length > 1 ? () => removeCertification(index) : undefined}
                >
                  <InputField
                    label="Name"
                    value={cert.name}
                    onChange={(v) => handleCertificationChange(index, 'name', v)}
                    error={getFieldError('certifications', 'name', index)}
                    placeholder="AWS Certified Cloud Practitioner"
                  />
                  <div style={TWO_UP}>
                    <InputField
                      label="Issuer"
                      value={cert.issuer}
                      onChange={(v) => handleCertificationChange(index, 'issuer', v)}
                      error={getFieldError('certifications', 'issuer', index)}
                      placeholder="Amazon Web Services"
                    />
                    <InputField
                      label="Year"
                      value={cert.date}
                      onChange={(v) => handleCertificationChange(index, 'date', v)}
                      error={getFieldError('certifications', 'date', index)}
                      placeholder="2026"
                    />
                  </div>
                </Entry>
              ))}
            </Section>

            {/* Achievements */}
            <Section label="Achievements" onAdd={addAchievement} addLabel="Add achievement">
              {resumeData.achievements.map((achievement, index) => (
                <InputField
                  key={index}
                  showLabel={false}
                  value={achievement}
                  onChange={(v) => handleAchievementChange(index, v)}
                  placeholder="Won the 2026 university hackathon"
                />
              ))}
            </Section>
          </div>
        )}

        {/* Right — the document card, then the two-up action row. */}
        <div style={{ position: 'sticky', top: 26 }}>
          <Card>
            <CardHeader
              label="Document"
              right={
                <MicroLabel size={10.5} tracking="0.13em" color="var(--color-text-4)">
                  {showPreview ? 'GENERATED' : 'DRAFT'}
                </MicroLabel>
              }
            />
            <div style={{ maxHeight: 'calc(100vh - 220px)', overflowY: 'auto' }}>
              <ResumeDocument data={resumeData} />
            </div>
          </Card>

          {!showPreview && (
            <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
              <Button onClick={handleGenerateResume} loading={loading} loadingLabel="Generating…">
                Generate resume
              </Button>
              <Button variant="secondary" onClick={() => navigate('/ats-analyzer')}>
                Run ATS check
              </Button>
            </div>
          )}
        </div>
      </div>
    </LearnerShell>
  );
}

export default ResumeBuilder;
