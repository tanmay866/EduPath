// Template 10: Indigo Violet — Developer / Tech-Savvy
function Template10({ data }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-indigo-950 to-violet-950 text-gray-200 font-[ui-monospace,monospace]">
      {/* Terminal-style Header */}
      <header className="container mx-auto px-6 max-w-5xl pt-12 pb-10">
        <div className="bg-gray-900/80 rounded-2xl border border-indigo-800/40 overflow-hidden">
          {/* Window dots */}
          <div className="flex items-center gap-2 px-4 py-3 bg-gray-900/60 border-b border-indigo-800/30">
            <span className="w-3 h-3 rounded-full bg-red-500/80"></span>
            <span className="w-3 h-3 rounded-full bg-yellow-500/80"></span>
            <span className="w-3 h-3 rounded-full bg-green-500/80"></span>
            <span className="ml-3 text-xs text-gray-500">portfolio.tsx</span>
          </div>
          <div className="p-6 md:p-10">
            <p className="text-indigo-400 text-sm mb-1">{'// Hello, I\'m'}</p>
            <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 mb-2">
              {data.name || 'Your Name'}
            </h1>
            <p className="text-lg text-violet-300/80 mb-5">{'> '}{data.title || 'Your Title'}</p>
            <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-500">
              {data.email && <span className="flex items-center gap-1"><span className="text-violet-500">@</span>{data.email}</span>}
              {data.phone && <span>{data.phone}</span>}
              {data.location && <span>{data.location}</span>}
              {data.github && <a href={data.github} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 transition-colors">github</a>}
              {data.linkedin && <a href={data.linkedin} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 transition-colors">linkedin</a>}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 max-w-5xl pb-16 space-y-10">
        {data.about && (
          <section>
            <p className="text-gray-400 leading-relaxed max-w-2xl">{data.about}</p>
          </section>
        )}

        {data.skills?.length > 0 && (
          <section>
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-500 mb-4">{'<'} Skills {'/'}{'>'}  </h2>
            <div className="flex flex-wrap gap-2">
              {data.skills.map((skill, i) => (
                <span key={i} className="px-3 py-1.5 text-xs bg-indigo-900/40 border border-indigo-700/40 rounded-md text-indigo-300 hover:bg-indigo-800/50 transition-colors">
                  {skill}
                </span>
              ))}
            </div>
          </section>
        )}

        {data.experience?.length > 0 && (
          <section>
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-500 mb-6">{'<'} Experience {'/'}{'>'}  </h2>
            <div className="space-y-5">
              {data.experience.map((exp, i) => (
                <div key={i} className="bg-gray-900/50 border border-indigo-800/30 rounded-xl p-5 hover:border-violet-600/50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 mb-2">
                    <div>
                      <h3 className="font-bold text-gray-100">{exp.position}</h3>
                      <p className="text-violet-400/80 text-sm">{exp.company}</p>
                    </div>
                    {exp.duration && <span className="text-xs bg-indigo-900/50 text-indigo-400 px-2.5 py-1 rounded-full border border-indigo-700/30 shrink-0">{exp.duration}</span>}
                  </div>
                  {exp.description && <p className="text-gray-500 text-sm leading-relaxed">{exp.description}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {data.projects?.length > 0 && (
          <section>
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-500 mb-6">{'<'} Projects {'/'}{'>'}  </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {data.projects.map((proj, i) => (
                <div key={i} className="bg-gray-900/50 border border-indigo-800/30 rounded-xl p-5 hover:border-violet-600/50 transition-colors group">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-2 h-2 rounded-full bg-violet-500 group-hover:bg-violet-400 transition-colors"></span>
                    <h3 className="font-bold text-gray-100">{proj.name}</h3>
                    {proj.link && <a href={proj.link} target="_blank" rel="noopener noreferrer" className="ml-auto text-xs text-indigo-500 hover:text-indigo-300 transition-colors">&#8599; link</a>}
                  </div>
                  {proj.description && <p className="text-gray-500 text-sm mb-2">{proj.description}</p>}
                  {proj.technologies?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {proj.technologies.map((tech, idx) => (
                        <span key={idx} className="text-[10px] px-2 py-0.5 bg-violet-900/30 text-violet-400 rounded">{tech}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {data.education?.length > 0 && (
          <section>
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-500 mb-5">{'<'} Education {'/'}{'>'}  </h2>
            <div className="space-y-3">
              {data.education.map((edu, i) => (
                <div key={i} className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4">
                  <h3 className="text-sm font-bold text-gray-200">{edu.degree}</h3>
                  <span className="text-sm text-gray-500">{edu.institution}{edu.year ? ` · ${edu.year}` : ''}{edu.cgpa ? ` · ${edu.cgpa}` : ''}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          {data.certifications?.length > 0 && (
            <section>
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-500 mb-4">{'<'} Certifications {'/'}{'>'}  </h2>
              <ul className="space-y-1.5">
                {data.certifications.map((cert, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
                    <span className="text-violet-500 mt-1">▸</span>
                    {typeof cert === 'string' ? cert : cert.name}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {data.achievements?.length > 0 && (
            <section>
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-500 mb-4">{'<'} Achievements {'/'}{'>'}  </h2>
              <ul className="space-y-1.5">
                {data.achievements.map((ach, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
                    <span className="text-violet-500 mt-1">▸</span>
                    {typeof ach === 'string' ? ach : ach.title || ach.name}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </main>

      <footer className="border-t border-indigo-800/30 py-6">
        <div className="container mx-auto px-6 max-w-5xl">
          <p className="text-gray-600 text-xs font-mono">© {new Date().getFullYear()} {data.name} · Built with <span className="text-violet-500">{'<'}code{'/>'}</span></p>
        </div>
      </footer>
    </div>
  );
}

export default Template10;
