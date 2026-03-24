/**
 * Resume Parser using Groq API (llama-3.3-70b-versatile)
 * Extracts structured JSON from raw resume text
 */

import Groq from 'groq-sdk';

const RESUME_SCHEMA = {
  personal_info: {
    full_name: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    github: '',
    portfolio: ''
  },
  summary: '',
  education: [
    { degree: '', institution: '', year: '', cgpa: '' }
  ],
  skills: {
    technical: [],
    soft: [],
    tools: []
  },
  projects: [
    { title: '', description: '', technologies: [], github_link: '' }
  ],
  experience: [
    { role: '', company: '', duration: '', description: '' }
  ],
  certifications: [],
  achievements: []
};

/**
 * Parse resume text using Groq API and return structured JSON
 * @param {string} resumeText - Raw text extracted from PDF/DOCX
 * @returns {object} Structured resume data
 */
export async function parseResumeWithGroq(resumeText) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('GROQ_API_KEY not set in environment');
  }

  const client = new Groq({ apiKey });

  const prompt = `You are a professional resume parser AI.
Extract all information from the resume text below and return ONLY valid JSON.
Do NOT include any explanation, markdown, or extra text — just raw JSON.
If any field is missing, return an empty string or empty array.
Do not hallucinate data that is not present in the resume.

Return strictly this JSON structure:
${JSON.stringify(RESUME_SCHEMA, null, 2)}

Rules:
- skills.technical: programming languages, frameworks, libraries
- skills.tools: software tools, IDEs, platforms (Git, Docker, etc.)
- skills.soft: communication, leadership, teamwork etc.
- For experience/projects, put full description in the description field
- certifications: array of strings (certification names)
- achievements: array of strings

Resume Text:
${resumeText}`;

  const response = await client.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content: 'You are a resume parser. Respond ONLY with valid JSON. No markdown, no explanation.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: 0,
    max_tokens: 4000,
    response_format: { type: 'json_object' }
  });

  const raw = response.choices[0].message.content.trim();

  // Strip markdown code fences if present
  const cleaned = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/, '').trim();

  const parsed = JSON.parse(cleaned);
  return parsed;
}

/**
 * Map Groq schema → internal portfolio schema used by existing templates
 */
export function mapToPortfolioSchema(groqData) {
  const pi = groqData.personal_info || {};
  const skills = groqData.skills || {};

  // Flatten skills into a single array for templates that expect string[]
  const allSkills = [
    ...(skills.technical || []),
    ...(skills.tools || []),
    ...(skills.soft || [])
  ];

  return {
    name: pi.full_name || '',
    email: pi.email || '',
    phone: pi.phone || '',
    location: pi.location || '',
    linkedin: pi.linkedin || '',
    github: pi.github || '',
    portfolio: pi.portfolio || '',
    title: groqData.experience?.[0]?.role || '',
    about: groqData.summary || '',
    skills: allSkills,
    skillsByCategory: {
      technical: skills.technical || [],
      soft: skills.soft || [],
      tools: skills.tools || []
    },
    education: (groqData.education || []).map(e => ({
      degree: e.degree || '',
      institution: e.institution || '',
      year: e.year || '',
      cgpa: e.cgpa || ''
    })),
    experience: (groqData.experience || []).map(e => ({
      position: e.role || '',
      company: e.company || '',
      duration: e.duration || '',
      description: e.description || ''
    })),
    projects: (groqData.projects || []).map(p => ({
      name: p.title || '',
      description: p.description || '',
      technologies: p.technologies || [],
      link: p.github_link || ''
    })),
    certifications: groqData.certifications || [],
    achievements: groqData.achievements || []
  };
}
