// Template 7: Rose Pink — Elegant & Refined
function Template7({ data }) {
  return (
    <div className="min-h-screen bg-stone-50 font-[Georgia,serif]">
      {/* Elegant Header */}
      <header className="bg-white border-b-2 border-rose-200 py-14">
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-rose-400 to-pink-500 rounded-full flex items-center justify-center text-2xl font-bold text-white mx-auto mb-5 shadow-lg shadow-rose-200">
            {data.name?.charAt(0) || 'P'}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 mb-2">{data.name || 'Your Name'}</h1>
          <p className="text-lg text-rose-500 font-medium italic mb-4">{data.title || 'Your Title'}</p>
          <div className="w-16 h-0.5 bg-rose-300 mx-auto mb-5" />
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500">
            {data.email && <span>{data.email}</span>}
            {data.phone && <span>{data.phone}</span>}
            {data.location && <span>{data.location}</span>}
          </div>
          <div className="flex justify-center gap-4 mt-4">
            {data.github && <a href={data.github} target="_blank" rel="noopener noreferrer" className="text-rose-400 hover:text-rose-600 text-sm font-sans font-semibold transition-colors underline underline-offset-2">GitHub</a>}
            {data.linkedin && <a href={data.linkedin} target="_blank" rel="noopener noreferrer" className="text-rose-400 hover:text-rose-600 text-sm font-sans font-semibold transition-colors underline underline-offset-2">LinkedIn</a>}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 max-w-4xl py-12 space-y-12">
        {data.about && (
          <section className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">About</h2>
            <div className="w-12 h-0.5 bg-rose-300 mx-auto mb-5" />
            <p className="text-gray-600 leading-relaxed text-base italic">{data.about}</p>
          </section>
        )}

        {data.skills?.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">Expertise</h2>
            <div className="w-12 h-0.5 bg-rose-300 mx-auto mb-6" />
            <div className="flex flex-wrap justify-center gap-3">
              {data.skills.map((s, i) => (
                <span key={i} className="px-5 py-2 bg-white text-gray-700 rounded-full text-sm font-sans font-semibold border border-rose-200 hover:bg-rose-50 hover:border-rose-300 transition-all shadow-sm">{s}</span>
              ))}
            </div>
          </section>
        )}

        {data.experience?.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">Experience</h2>
            <div className="w-12 h-0.5 bg-rose-300 mx-auto mb-8" />
            <div className="space-y-6">
              {data.experience.map((exp, i) => (
                <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-rose-100 hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 mb-2">
                    <div><h3 className="text-lg font-bold text-gray-900 font-sans">{exp.position}</h3><p className="text-rose-500 font-semibold text-sm font-sans">{exp.company}</p></div>
                    {exp.duration && <span className="text-xs text-gray-400 font-sans">{exp.duration}</span>}
                  </div>
                  {exp.description && <p className="text-gray-600 text-sm leading-relaxed mt-2">{exp.description}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {data.projects?.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">Featured Projects</h2>
            <div className="w-12 h-0.5 bg-rose-300 mx-auto mb-8" />
            <div className="grid md:grid-cols-2 gap-5">
              {data.projects.map((proj, i) => (
                <div key={i} className="bg-white rounded-xl p-6 border border-rose-100 shadow-sm hover:shadow-lg transition-all duration-200">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-gray-900 font-sans">{proj.name}</h3>
                    {proj.link && <a href={proj.link} target="_blank" rel="noopener noreferrer" className="text-rose-400 hover:text-rose-600"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg></a>}
                  </div>
                  {proj.description && <p className="text-gray-600 text-sm mb-3">{proj.description}</p>}
                  {proj.technologies?.length > 0 && <div className="flex flex-wrap gap-1.5 font-sans">{proj.technologies.map((t, idx) => <span key={idx} className="px-2 py-0.5 bg-rose-50 text-rose-600 rounded text-xs font-semibold">{t}</span>)}</div>}
                </div>
              ))}
            </div>
          </section>
        )}

        {data.education?.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">Education</h2>
            <div className="w-12 h-0.5 bg-rose-300 mx-auto mb-6" />
            <div className="space-y-4">
              {data.education.map((edu, i) => (
                <div key={i} className="text-center">
                  <h3 className="font-bold text-gray-900 font-sans">{edu.degree}</h3>
                  <p className="text-rose-500 text-sm font-sans">{edu.institution}</p>
                  <div className="flex justify-center gap-3 text-xs text-gray-400 font-sans mt-1">{edu.year && <span>{edu.year}</span>}{edu.cgpa && <span>CGPA: {edu.cgpa}</span>}</div>
                  {i < data.education.length - 1 && <div className="w-8 h-px bg-rose-200 mx-auto mt-4" />}
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="grid sm:grid-cols-2 gap-8">
          {data.certifications?.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">Certifications</h2>
              <div className="space-y-2">
                {data.certifications.map((cert, i) => (
                  <p key={i} className="text-sm text-gray-600 text-center font-sans">
                    {typeof cert === 'string' ? cert : cert.name}
                  </p>
                ))}
              </div>
            </section>
          )}

          {data.achievements?.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">Achievements</h2>
              <div className="space-y-2">
                {data.achievements.map((ach, i) => (
                  <p key={i} className="text-sm text-gray-600 text-center font-sans">
                    {typeof ach === 'string' ? ach : ach.title || ach.name}
                  </p>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      <footer className="border-t-2 border-rose-200 py-8 mt-8">
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <p className="text-gray-400 text-xs font-sans">© {new Date().getFullYear()} {data.name}. Crafted with care.</p>
        </div>
      </footer>
    </div>
  );
}

export default Template7;
