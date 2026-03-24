/**
 * Portfolio HTML Template Generators
 * Each function generates a complete standalone HTML file.
 */

const escapeHtml = (text) => {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

const socialLinks = (data) => {
  let html = '';
  if (data.github) html += `<a href="${escapeHtml(data.github)}" target="_blank" rel="noopener" class="social-link">GitHub</a>`;
  if (data.linkedin) html += `<a href="${escapeHtml(data.linkedin)}" target="_blank" rel="noopener" class="social-link">LinkedIn</a>`;
  if (data.portfolio) html += `<a href="${escapeHtml(data.portfolio)}" target="_blank" rel="noopener" class="social-link">Website</a>`;
  return html;
};

function wrapDocument(title, cssVars, bodyContent) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(title)} - Portfolio</title>
<style>
:root {
  ${cssVars}
}
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; line-height: 1.6; color: var(--text); background: var(--bg); }
.container { max-width: 1100px; margin: 0 auto; padding: 0 24px; }
a { color: inherit; text-decoration: none; }
a:hover { opacity: 0.85; }

.header { background: var(--primary-gradient); color: #fff; padding: 80px 24px 60px; text-align: center; }
.avatar { width: 120px; height: 120px; border-radius: 50%; background: rgba(255,255,255,0.2); backdrop-filter: blur(10px); display: flex; align-items: center; justify-content: center; font-size: 48px; font-weight: 700; margin: 0 auto 20px; border: 4px solid rgba(255,255,255,0.3); }
.header h1 { font-size: 2.8em; font-weight: 800; margin-bottom: 8px; }
.header .subtitle { font-size: 1.3em; opacity: 0.9; margin-bottom: 16px; }
.contact-row { display: flex; flex-wrap: wrap; justify-content: center; gap: 20px; font-size: 0.95em; opacity: 0.9; }
.social-links { display: flex; justify-content: center; gap: 12px; margin-top: 20px; }
.social-link { display: inline-block; padding: 8px 20px; border: 2px solid rgba(255,255,255,0.4); border-radius: 25px; font-weight: 600; font-size: 0.9em; transition: all 0.3s; }
.social-link:hover { background: rgba(255,255,255,0.2); border-color: #fff; }

.section { padding: 60px 0; }
.section:nth-child(even) { background: var(--section-alt); }
.section-title { font-size: 2em; font-weight: 700; color: var(--accent); margin-bottom: 30px; position: relative; padding-bottom: 12px; }
.section-title::after { content: ''; position: absolute; bottom: 0; left: 0; width: 60px; height: 4px; background: var(--accent); border-radius: 2px; }

.about-text { font-size: 1.15em; line-height: 1.9; color: var(--text-secondary); max-width: 800px; }

.skills-grid { display: flex; flex-wrap: wrap; gap: 10px; }
.skill { padding: 8px 20px; border-radius: 25px; font-weight: 600; font-size: 0.9em; }

.exp-card { border-left: 4px solid var(--accent); padding: 20px 24px; margin-bottom: 24px; background: var(--card-bg); border-radius: 0 12px 12px 0; transition: transform 0.2s; }
.exp-card:hover { transform: translateX(4px); }
.exp-card h3 { font-size: 1.3em; color: var(--text); margin-bottom: 4px; }
.exp-card .company { color: var(--accent); font-weight: 600; font-size: 1.05em; }
.exp-card .duration { color: var(--text-muted); font-size: 0.9em; margin-bottom: 8px; }
.exp-card .desc { color: var(--text-secondary); }

.projects-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 24px; }
.project-card { background: var(--card-bg); border-radius: 16px; padding: 28px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); transition: transform 0.3s, box-shadow 0.3s; }
.project-card:hover { transform: translateY(-4px); box-shadow: 0 8px 30px rgba(0,0,0,0.12); }
.project-card h3 { font-size: 1.2em; margin-bottom: 10px; color: var(--text); }
.project-card p { color: var(--text-secondary); margin-bottom: 14px; font-size: 0.95em; }
.project-card .tech-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 12px; }
.project-card .tech-tag { padding: 4px 12px; border-radius: 6px; font-size: 0.8em; font-weight: 600; background: var(--tag-bg); color: var(--tag-text); }
.project-card .project-link { color: var(--accent); font-weight: 600; font-size: 0.9em; }

.edu-card { border-left: 4px solid var(--accent-secondary); padding: 16px 24px; margin-bottom: 20px; background: var(--card-bg); border-radius: 0 12px 12px 0; }
.edu-card h3 { font-size: 1.15em; color: var(--text); }
.edu-card .institution { color: var(--accent); font-weight: 600; }
.edu-card .year { color: var(--text-muted); font-size: 0.9em; }

.cert-list, .achieve-list { list-style: none; }
.cert-list li, .achieve-list li { padding: 12px 0; border-bottom: 1px solid var(--border); font-size: 1.05em; color: var(--text-secondary); }

.footer { text-align: center; padding: 40px 24px; color: var(--text-muted); font-size: 0.9em; border-top: 1px solid var(--border); }

@media (max-width: 768px) {
  .header { padding: 50px 16px 40px; }
  .header h1 { font-size: 2em; }
  .section { padding: 40px 0; }
  .projects-grid { grid-template-columns: 1fr; }
  .contact-row { flex-direction: column; align-items: center; gap: 8px; }
}
</style>
</head>
<body>
${bodyContent}
</body>
</html>`;
}

function generateBodyContent(data) {
  const name = escapeHtml(data.name || 'Portfolio');
  const title = escapeHtml(data.title || '');
  const initial = (data.name || 'P').charAt(0).toUpperCase();

  let html = '';

  html += `<header class="header">
  <div class="container">
    <div class="avatar">${initial}</div>
    <h1>${name}</h1>
    <p class="subtitle">${title}</p>
    <div class="contact-row">
      ${data.email ? `<span>${escapeHtml(data.email)}</span>` : ''}
      ${data.phone ? `<span>${escapeHtml(data.phone)}</span>` : ''}
      ${data.location ? `<span>${escapeHtml(data.location)}</span>` : ''}
    </div>
    <div class="social-links">${socialLinks(data)}</div>
  </div>
</header>`;

  if (data.about) {
    html += `<section class="section"><div class="container">
  <h2 class="section-title">About Me</h2>
  <p class="about-text">${escapeHtml(data.about)}</p>
</div></section>`;
  }

  if (data.skills && data.skills.length > 0) {
    html += `<section class="section"><div class="container">
  <h2 class="section-title">Skills</h2>
  <div class="skills-grid">${data.skills.map(s => `<span class="skill">${escapeHtml(s)}</span>`).join('')}</div>
</div></section>`;
  }

  if (data.experience && data.experience.length > 0) {
    html += `<section class="section"><div class="container">
  <h2 class="section-title">Experience</h2>
  ${data.experience.map(exp => `<div class="exp-card">
    <h3>${escapeHtml(exp.position || '')}</h3>
    <p class="company">${escapeHtml(exp.company || '')}</p>
    <p class="duration">${escapeHtml(exp.duration || '')}</p>
    <p class="desc">${escapeHtml(exp.description || '')}</p>
  </div>`).join('')}
</div></section>`;
  }

  if (data.projects && data.projects.length > 0) {
    html += `<section class="section"><div class="container">
  <h2 class="section-title">Projects</h2>
  <div class="projects-grid">
  ${data.projects.map(proj => `<div class="project-card">
    <h3>${escapeHtml(proj.name || '')}</h3>
    <p>${escapeHtml(proj.description || '')}</p>
    <div class="tech-tags">${(proj.technologies || []).map(t => `<span class="tech-tag">${escapeHtml(t)}</span>`).join('')}</div>
    ${proj.link ? `<a href="${escapeHtml(proj.link)}" target="_blank" rel="noopener" class="project-link">View Project</a>` : ''}
  </div>`).join('')}
  </div>
</div></section>`;
  }

  if (data.education && data.education.length > 0) {
    html += `<section class="section"><div class="container">
  <h2 class="section-title">Education</h2>
  ${data.education.map(edu => `<div class="edu-card">
    <h3>${escapeHtml(edu.degree || '')}</h3>
    <p class="institution">${escapeHtml(edu.institution || '')}</p>
    <p class="year">${escapeHtml(edu.year || '')}</p>
    ${edu.cgpa ? `<p class="year">CGPA: ${escapeHtml(edu.cgpa)}</p>` : ''}
  </div>`).join('')}
</div></section>`;
  }

  if (data.certifications && data.certifications.length > 0) {
    html += `<section class="section"><div class="container">
  <h2 class="section-title">Certifications</h2>
  <ul class="cert-list">${data.certifications.map(c => `<li>${escapeHtml(c)}</li>`).join('')}</ul>
</div></section>`;
  }

  if (data.achievements && data.achievements.length > 0) {
    html += `<section class="section"><div class="container">
  <h2 class="section-title">Achievements</h2>
  <ul class="achieve-list">${data.achievements.map(a => `<li>${escapeHtml(a)}</li>`).join('')}</ul>
</div></section>`;
  }

  html += `<footer class="footer">
  <p>&copy; ${new Date().getFullYear()} ${name}. All rights reserved.</p>
  <p style="margin-top:8px;opacity:0.7;">Built with EduPath Portfolio Generator</p>
</footer>`;

  return html;
}

const templateStyles = {
  template1: {
    name: 'Ocean Blue',
    css: `--primary-gradient: linear-gradient(135deg, #2563eb, #0891b2);
  --accent: #2563eb; --accent-secondary: #0891b2;
  --bg: #f0f9ff; --section-alt: #ffffff;
  --card-bg: #ffffff; --text: #1e293b; --text-secondary: #475569; --text-muted: #94a3b8;
  --border: #e2e8f0;
  --tag-bg: #dbeafe; --tag-text: #1d4ed8;
  --skill-bg: linear-gradient(135deg, #3b82f6, #06b6d4); --skill-text: #ffffff;`
  },
  template2: {
    name: 'Sunset Orange',
    css: `--primary-gradient: linear-gradient(135deg, #f97316, #ef4444);
  --accent: #ea580c; --accent-secondary: #dc2626;
  --bg: #fff7ed; --section-alt: #ffffff;
  --card-bg: #ffffff; --text: #1c1917; --text-secondary: #57534e; --text-muted: #a8a29e;
  --border: #fed7aa;
  --tag-bg: #ffedd5; --tag-text: #c2410c;
  --skill-bg: linear-gradient(135deg, #f97316, #ef4444); --skill-text: #ffffff;`
  },
  template3: {
    name: 'Forest Green',
    css: `--primary-gradient: linear-gradient(135deg, #16a34a, #059669);
  --accent: #16a34a; --accent-secondary: #059669;
  --bg: #f0fdf4; --section-alt: #ffffff;
  --card-bg: #ffffff; --text: #14532d; --text-secondary: #3f6212; --text-muted: #86efac;
  --border: #bbf7d0;
  --tag-bg: #dcfce7; --tag-text: #15803d;
  --skill-bg: linear-gradient(135deg, #22c55e, #10b981); --skill-text: #ffffff;`
  },
  template4: {
    name: 'Royal Purple',
    css: `--primary-gradient: linear-gradient(135deg, #9333ea, #ec4899);
  --accent: #9333ea; --accent-secondary: #ec4899;
  --bg: #faf5ff; --section-alt: #ffffff;
  --card-bg: #ffffff; --text: #3b0764; --text-secondary: #6b21a8; --text-muted: #c084fc;
  --border: #e9d5ff;
  --tag-bg: #f3e8ff; --tag-text: #7c3aed;
  --skill-bg: linear-gradient(135deg, #a855f7, #ec4899); --skill-text: #ffffff;`
  },
  template5: {
    name: 'Midnight Dark',
    css: `--primary-gradient: linear-gradient(135deg, #1e1b4b, #312e81);
  --accent: #818cf8; --accent-secondary: #6366f1;
  --bg: #0f172a; --section-alt: #1e293b;
  --card-bg: #1e293b; --text: #f1f5f9; --text-secondary: #cbd5e1; --text-muted: #64748b;
  --border: #334155;
  --tag-bg: #312e81; --tag-text: #a5b4fc;
  --skill-bg: linear-gradient(135deg, #6366f1, #8b5cf6); --skill-text: #ffffff;`
  },
  template6: {
    name: 'Teal Aqua',
    css: `--primary-gradient: linear-gradient(135deg, #0d9488, #06b6d4);
  --accent: #0d9488; --accent-secondary: #06b6d4;
  --bg: #f0fdfa; --section-alt: #ffffff;
  --card-bg: #ffffff; --text: #134e4a; --text-secondary: #2dd4bf; --text-muted: #99f6e4;
  --border: #ccfbf1;
  --tag-bg: #ccfbf1; --tag-text: #0f766e;
  --skill-bg: linear-gradient(135deg, #14b8a6, #22d3ee); --skill-text: #ffffff;`
  },
  template7: {
    name: 'Rose Pink',
    css: `--primary-gradient: linear-gradient(135deg, #e11d48, #ec4899);
  --accent: #e11d48; --accent-secondary: #ec4899;
  --bg: #fff1f2; --section-alt: #ffffff;
  --card-bg: #ffffff; --text: #4c0519; --text-secondary: #881337; --text-muted: #fda4af;
  --border: #fecdd3;
  --tag-bg: #ffe4e6; --tag-text: #be123c;
  --skill-bg: linear-gradient(135deg, #f43f5e, #ec4899); --skill-text: #ffffff;`
  },
  template8: {
    name: 'Amber Gold',
    css: `--primary-gradient: linear-gradient(135deg, #d97706, #ca8a04);
  --accent: #d97706; --accent-secondary: #ca8a04;
  --bg: #fffbeb; --section-alt: #ffffff;
  --card-bg: #ffffff; --text: #451a03; --text-secondary: #78350f; --text-muted: #fbbf24;
  --border: #fde68a;
  --tag-bg: #fef3c7; --tag-text: #b45309;
  --skill-bg: linear-gradient(135deg, #f59e0b, #eab308); --skill-text: #ffffff;`
  },
  template9: {
    name: 'Slate Gray',
    css: `--primary-gradient: linear-gradient(135deg, #475569, #334155);
  --accent: #475569; --accent-secondary: #64748b;
  --bg: #f8fafc; --section-alt: #ffffff;
  --card-bg: #ffffff; --text: #0f172a; --text-secondary: #475569; --text-muted: #94a3b8;
  --border: #e2e8f0;
  --tag-bg: #f1f5f9; --tag-text: #334155;
  --skill-bg: linear-gradient(135deg, #64748b, #475569); --skill-text: #ffffff;`
  },
  template10: {
    name: 'Indigo Violet',
    css: `--primary-gradient: linear-gradient(135deg, #4f46e5, #7c3aed);
  --accent: #4f46e5; --accent-secondary: #7c3aed;
  --bg: #eef2ff; --section-alt: #ffffff;
  --card-bg: #ffffff; --text: #1e1b4b; --text-secondary: #3730a3; --text-muted: #a5b4fc;
  --border: #c7d2fe;
  --tag-bg: #e0e7ff; --tag-text: #4338ca;
  --skill-bg: linear-gradient(135deg, #6366f1, #8b5cf6); --skill-text: #ffffff;`
  }
};

export function generateTemplateHTML(data, templateKey = 'template1') {
  const template = templateStyles[templateKey] || templateStyles.template1;
  const additionalCSS = `.skill { background: var(--skill-bg); color: var(--skill-text); }`;
  const bodyContent = generateBodyContent(data);
  const fullCss = template.css;

  return wrapDocument(
    data.name || 'Portfolio',
    fullCss,
    bodyContent
  ).replace('</style>', `${additionalCSS}\n</style>`);
}

export { templateStyles };
