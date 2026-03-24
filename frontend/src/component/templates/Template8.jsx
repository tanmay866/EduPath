// Template 8: Amber Gold — Corporate Professional
function Template8({ data }) {
  return (
    <div className="min-h-screen bg-amber-50/50 font-[system-ui]">
      {/* Top Bar */}
      <div className="bg-amber-600 h-1.5" />
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-6 max-w-5xl py-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-lg flex items-center justify-center text-3xl font-black text-white shadow-lg shrink-0">
              {data.name?.charAt(0) || 'P'}
            </div>
            <div className="text-center md:text-left flex-1">
              <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">{data.name || 'Your Name'}</h1>
              <p className="text-amber-600 font-bold text-lg">{data.title || 'Your Title'}</p>
            </div>
            <div className="text-center md:text-right text-sm text-gray-500 space-y-1 shrink-0">
              {data.email && <p>{data.email}</p>}
              {data.phone && <p>{data.phone}</p>}
              {data.location && <p>{data.location}</p>}
              <div className="flex justify-center md:justify-end gap-3 mt-2">
                {data.github && <a href={data.github} target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:text-amber-700 font-semibold text-xs transition-colors">GitHub</a>}
                {data.linkedin && <a href={data.linkedin} target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:text-amber-700 font-semibold text-xs transition-colors">LinkedIn</a>}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 max-w-5xl py-10 space-y-10">
        {data.about && (
          <section className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-amber-500">
            <h2 className="text-sm font-bold uppercase tracking-wider text-amber-700 mb-3">Professional Summary</h2>
            <p className="text-gray-600 leading-relaxed">{data.about}</p>
          </section>
        )}

        {/* Two Column: Skills + Education */}
        <div className="grid md:grid-cols-3 gap-6">
          {data.skills?.length > 0 && (
            <div className="md:col-span-2 bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-sm font-bold uppercase tracking-wider text-amber-700 mb-4">Core Competencies</h2>
              <div className="flex flex-wrap gap-2">
                {data.skills.map((s, i) => (
                  <span key={i} className="px-3 py-1.5 bg-amber-50 text-amber-800 rounded-md text-sm font-semibold border border-amber-200 hover:bg-amber-100 transition-colors">{s}</span>
                ))}
              </div>
            </div>
          )}

          {data.education?.length > 0 && (
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-sm font-bold uppercase tracking-wider text-amber-700 mb-4">Education</h2>
              <div className="space-y-4">
                {data.education.map((edu, i) => (
                  <div key={i}>
                    <h3 className="font-bold text-gray-900 text-sm">{edu.degree}</h3>
                    <p className="text-amber-600 text-sm">{edu.institution}</p>
                    <div className="flex gap-2 text-xs text-gray-400 mt-0.5">
                      {edu.year && <span>{edu.year}</span>}
                      {edu.cgpa && <span>CGPA: {edu.cgpa}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {data.experience?.length > 0 && (
          <section className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-wider text-amber-700 mb-6">Professional Experience</h2>
            <div className="space-y-6">
              {data.experience.map((exp, i) => (
                <div key={i} className={`pb-6 ${i < data.experience.length - 1 ? 'border-b border-gray-100' : ''}`}>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 mb-2">
                    <div>
                      <h3 className="text-base font-bold text-gray-900">{exp.position}</h3>
                      <p className="text-amber-600 font-semibold text-sm">{exp.company}</p>
                    </div>
                    {exp.duration && <span className="text-xs text-gray-400 bg-amber-50 px-2.5 py-1 rounded font-medium">{exp.duration}</span>}
                  </div>
                  {exp.description && <p className="text-gray-600 text-sm leading-relaxed mt-2">{exp.description}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {data.projects?.length > 0 && (
          <section className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-wider text-amber-700 mb-6">Key Projects</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {data.projects.map((proj, i) => (
                <div key={i} className="p-4 bg-amber-50/50 rounded-lg border border-amber-100 hover:border-amber-300 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-gray-900 text-sm">{proj.name}</h3>
                    {proj.link && <a href={proj.link} target="_blank" rel="noopener noreferrer" className="text-amber-500 hover:text-amber-700"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg></a>}
                  </div>
                  {proj.description && <p className="text-gray-600 text-xs mb-2">{proj.description}</p>}
                  {proj.technologies?.length > 0 && <div className="flex flex-wrap gap-1">{proj.technologies.map((t, idx) => <span key={idx} className="px-1.5 py-0.5 bg-white text-amber-700 rounded text-xs font-medium border border-amber-200">{t}</span>)}</div>}
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="grid sm:grid-cols-2 gap-6">
          {data.certifications?.length > 0 && (
            <section className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-sm font-bold uppercase tracking-wider text-amber-700 mb-4">Certifications</h2>
              <ul className="space-y-2">
                {data.certifications.map((cert, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full shrink-0" />
                    {typeof cert === 'string' ? cert : cert.name}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {data.achievements?.length > 0 && (
            <section className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-sm font-bold uppercase tracking-wider text-amber-700 mb-4">Achievements</h2>
              <ul className="space-y-2">
                {data.achievements.map((ach, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-amber-500 shrink-0">&#9679;</span>
                    {typeof ach === 'string' ? ach : ach.title || ach.name}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="container mx-auto px-6 max-w-5xl text-center">
          <p className="text-gray-400 text-xs">© {new Date().getFullYear()} {data.name}. All rights reserved.</p>
        </div>
      </footer>
      <div className="bg-amber-600 h-1.5" />
    </div>
  );
}

export default Template8;
