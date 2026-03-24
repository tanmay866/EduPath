// Template 9: Slate Gray — Ultra Minimalist
function Template9({ data }) {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-[system-ui]">
      {/* Minimal Header */}
      <header className="container mx-auto px-6 max-w-3xl pt-16 pb-12 border-b border-gray-200">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900 mb-1">{data.name || 'Your Name'}</h1>
        <p className="text-lg text-slate-500 font-medium mb-4">{data.title || 'Your Title'}</p>
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
          {data.email && <span>{data.email}</span>}
          {data.phone && <span>{data.phone}</span>}
          {data.location && <span>{data.location}</span>}
          {data.github && <a href={data.github} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-900 font-medium transition-colors">GitHub</a>}
          {data.linkedin && <a href={data.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-900 font-medium transition-colors">LinkedIn</a>}
        </div>
      </header>

      <main className="container mx-auto px-6 max-w-3xl py-10 space-y-10">
        {data.about && (
          <section>
            <p className="text-gray-600 leading-relaxed text-base">{data.about}</p>
          </section>
        )}

        {data.skills?.length > 0 && (
          <section>
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-4">Skills</h2>
            <p className="text-gray-700 text-sm leading-loose">{data.skills.join(' · ')}</p>
          </section>
        )}

        {data.experience?.length > 0 && (
          <section>
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-6">Experience</h2>
            <div className="space-y-6">
              {data.experience.map((exp, i) => (
                <div key={i}>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-0.5 mb-1">
                    <h3 className="font-bold text-gray-900">{exp.position} <span className="font-normal text-slate-500">at {exp.company}</span></h3>
                    {exp.duration && <span className="text-xs text-gray-400 shrink-0">{exp.duration}</span>}
                  </div>
                  {exp.description && <p className="text-gray-500 text-sm leading-relaxed">{exp.description}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {data.projects?.length > 0 && (
          <section>
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-6">Projects</h2>
            <div className="space-y-5">
              {data.projects.map((proj, i) => (
                <div key={i}>
                  <div className="flex items-baseline gap-2 mb-1">
                    <h3 className="font-bold text-gray-900">{proj.name}</h3>
                    {proj.link && <a href={proj.link} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-slate-600 text-xs">&#8599;</a>}
                  </div>
                  {proj.description && <p className="text-gray-500 text-sm mb-1.5">{proj.description}</p>}
                  {proj.technologies?.length > 0 && <p className="text-xs text-slate-400">{proj.technologies.join(' · ')}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {data.education?.length > 0 && (
          <section>
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-5">Education</h2>
            <div className="space-y-3">
              {data.education.map((edu, i) => (
                <div key={i}>
                  <h3 className="font-bold text-gray-900 text-sm">{edu.degree}</h3>
                  <p className="text-slate-500 text-sm">{edu.institution}{edu.year ? ` · ${edu.year}` : ''}{edu.cgpa ? ` · CGPA: ${edu.cgpa}` : ''}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {data.certifications?.length > 0 && (
          <section>
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-4">Certifications</h2>
            <ul className="space-y-1">
              {data.certifications.map((cert, i) => (
                <li key={i} className="text-sm text-gray-600">{typeof cert === 'string' ? cert : cert.name}</li>
              ))}
            </ul>
          </section>
        )}

        {data.achievements?.length > 0 && (
          <section>
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-4">Achievements</h2>
            <ul className="space-y-1">
              {data.achievements.map((ach, i) => (
                <li key={i} className="text-sm text-gray-600">{typeof ach === 'string' ? ach : ach.title || ach.name}</li>
              ))}
            </ul>
          </section>
        )}
      </main>

      <footer className="container mx-auto px-6 max-w-3xl py-8 border-t border-gray-200">
        <p className="text-gray-300 text-xs">© {new Date().getFullYear()} {data.name}</p>
      </footer>
    </div>
  );
}

export default Template9;
