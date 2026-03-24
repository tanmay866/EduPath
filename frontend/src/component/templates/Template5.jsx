// Template 5: Midnight Dark — Modern Dark Mode
function Template5({ data }) {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-[system-ui]">
      {/* Hero */}
      <header className="relative border-b border-gray-800">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/50 via-transparent to-purple-950/50" />
        <div className="relative container mx-auto px-6 py-20 max-w-5xl">
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center text-3xl font-black text-white shadow-lg shadow-indigo-500/30 mb-6">
              {data.name?.charAt(0) || 'P'}
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">{data.name || 'Your Name'}</h1>
            <p className="text-xl text-indigo-400 font-medium mb-5">{data.title || 'Your Title'}</p>
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-400">
              {data.email && <span className="flex items-center gap-1.5"><span className="w-1 h-1 bg-indigo-500 rounded-full" />{data.email}</span>}
              {data.phone && <span className="flex items-center gap-1.5"><span className="w-1 h-1 bg-indigo-500 rounded-full" />{data.phone}</span>}
              {data.location && <span className="flex items-center gap-1.5"><span className="w-1 h-1 bg-indigo-500 rounded-full" />{data.location}</span>}
            </div>
            <div className="flex gap-3 mt-5">
              {data.github && <a href={data.github} target="_blank" rel="noopener noreferrer" className="px-4 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 rounded-lg text-sm font-medium transition-all">GitHub</a>}
              {data.linkedin && <a href={data.linkedin} target="_blank" rel="noopener noreferrer" className="px-4 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 rounded-lg text-sm font-medium transition-all">LinkedIn</a>}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12 max-w-5xl space-y-12">
        {data.about && (
          <section>
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-400 mb-4">About</h2>
            <p className="text-gray-400 leading-relaxed text-base">{data.about}</p>
          </section>
        )}

        {data.skills?.length > 0 && (
          <section>
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-400 mb-5">Tech Stack</h2>
            <div className="flex flex-wrap gap-2">
              {data.skills.map((s, i) => (
                <span key={i} className="px-3.5 py-1.5 bg-gray-900 text-gray-300 rounded-lg text-sm font-medium border border-gray-800 hover:border-indigo-500/50 hover:text-indigo-300 transition-all duration-200">{s}</span>
              ))}
            </div>
          </section>
        )}

        {data.experience?.length > 0 && (
          <section>
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-400 mb-6">Experience</h2>
            <div className="space-y-4">
              {data.experience.map((exp, i) => (
                <div key={i} className="bg-gray-900/70 rounded-xl p-5 border border-gray-800 hover:border-indigo-500/30 transition-colors group">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 mb-2">
                    <div><h3 className="text-base font-bold text-white">{exp.position}</h3><p className="text-indigo-400 font-semibold text-sm">{exp.company}</p></div>
                    {exp.duration && <span className="text-xs text-gray-500 font-mono bg-gray-800 px-2.5 py-1 rounded">{exp.duration}</span>}
                  </div>
                  {exp.description && <p className="text-gray-400 text-sm leading-relaxed mt-2">{exp.description}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {data.projects?.length > 0 && (
          <section>
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-400 mb-6">Projects</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {data.projects.map((proj, i) => (
                <div key={i} className="bg-gray-900/70 rounded-xl p-5 border border-gray-800 hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/5 transition-all duration-300 group">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-white">{proj.name}</h3>
                    {proj.link && <a href={proj.link} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-indigo-400"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg></a>}
                  </div>
                  {proj.description && <p className="text-gray-400 text-sm mb-3">{proj.description}</p>}
                  {proj.technologies?.length > 0 && <div className="flex flex-wrap gap-1.5">{proj.technologies.map((t, idx) => <span key={idx} className="px-2 py-0.5 bg-indigo-950/80 text-indigo-300 border border-indigo-900/50 rounded text-xs font-medium">{t}</span>)}</div>}
                </div>
              ))}
            </div>
          </section>
        )}

        {data.education?.length > 0 && (
          <section>
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-400 mb-6">Education</h2>
            <div className="space-y-3">
              {data.education.map((edu, i) => (
                <div key={i} className="flex items-start gap-4 p-4 bg-gray-900/50 rounded-xl border border-gray-800">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center text-white text-sm font-bold shrink-0">{edu.degree?.charAt(0) || 'E'}</div>
                  <div>
                    <h3 className="font-bold text-white text-sm">{edu.degree}</h3>
                    <p className="text-indigo-400 text-sm">{edu.institution}</p>
                    <div className="flex gap-3 text-xs text-gray-500 mt-1">
                      {edu.year && <span>{edu.year}</span>}
                      {edu.cgpa && <span>CGPA: {edu.cgpa}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="grid sm:grid-cols-2 gap-6">
          {data.certifications?.length > 0 && (
            <section>
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-400 mb-4">Certifications</h2>
              <div className="space-y-2">
                {data.certifications.map((cert, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-gray-300">
                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full shrink-0" />
                    {typeof cert === 'string' ? cert : cert.name}
                  </div>
                ))}
              </div>
            </section>
          )}

          {data.achievements?.length > 0 && (
            <section>
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-400 mb-4">Achievements</h2>
              <div className="space-y-2">
                {data.achievements.map((ach, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-gray-300">
                    <span className="text-purple-400 shrink-0">&#9830;</span>
                    {typeof ach === 'string' ? ach : ach.title || ach.name}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      <footer className="border-t border-gray-800 py-6 mt-8">
        <div className="container mx-auto px-6 max-w-5xl text-center">
          <div className="flex justify-center gap-5 mb-2">
            {data.github && <a href={data.github} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-indigo-400 text-sm transition-colors">GitHub</a>}
            {data.linkedin && <a href={data.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-indigo-400 text-sm transition-colors">LinkedIn</a>}
          </div>
          <p className="text-gray-600 text-xs">© {new Date().getFullYear()} {data.name}</p>
        </div>
      </footer>
    </div>
  );
}

export default Template5;
