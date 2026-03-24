// Template 6: Teal Aqua — Timeline Layout
function Template6({ data }) {
  return (
    <div className="min-h-screen bg-white font-[system-ui]">
      {/* Compact Header */}
      <header className="bg-gradient-to-r from-teal-600 to-cyan-500 text-white py-12">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-teal-600 text-4xl font-black shadow-xl shrink-0">
              {data.name?.charAt(0) || 'P'}
            </div>
            <div className="text-center md:text-left flex-1">
              <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-1">{data.name || 'Your Name'}</h1>
              <p className="text-lg text-teal-100 font-medium mb-3">{data.title || 'Your Title'}</p>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-teal-100">
                {data.email && <span>{data.email}</span>}
                {data.phone && <span>{data.phone}</span>}
                {data.location && <span>{data.location}</span>}
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              {data.github && <a href={data.github} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center text-sm font-bold transition-all" title="GitHub">GH</a>}
              {data.linkedin && <a href={data.linkedin} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center text-sm font-bold transition-all" title="LinkedIn">LI</a>}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 max-w-4xl py-12 space-y-12">
        {data.about && (
          <section className="bg-teal-50 rounded-2xl p-6 border border-teal-100">
            <h2 className="text-lg font-bold text-teal-700 mb-3">About Me</h2>
            <p className="text-gray-600 leading-relaxed">{data.about}</p>
          </section>
        )}

        {data.skills?.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-teal-700 mb-4">Skills</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {data.skills.map((s, i) => (
                <div key={i} className="px-3 py-2.5 bg-gradient-to-r from-teal-50 to-cyan-50 text-teal-700 rounded-xl text-sm font-semibold text-center border border-teal-100 hover:shadow-md hover:border-teal-300 transition-all">{s}</div>
              ))}
            </div>
          </section>
        )}

        {/* Timeline Experience */}
        {data.experience?.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-teal-700 mb-6">Experience</h2>
            <div className="relative pl-8 border-l-2 border-teal-200 space-y-8">
              {data.experience.map((exp, i) => (
                <div key={i} className="relative">
                  <div className="absolute -left-[2.35rem] w-4 h-4 bg-teal-500 rounded-full ring-4 ring-teal-100" />
                  <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 mb-2">
                      <div><h3 className="font-bold text-gray-900">{exp.position}</h3><p className="text-teal-600 font-semibold text-sm">{exp.company}</p></div>
                      {exp.duration && <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded">{exp.duration}</span>}
                    </div>
                    {exp.description && <p className="text-gray-600 text-sm leading-relaxed">{exp.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {data.projects?.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-teal-700 mb-6">Projects</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {data.projects.map((proj, i) => (
                <div key={i} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-lg hover:border-teal-200 transition-all duration-200">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-gray-900">{proj.name}</h3>
                    {proj.link && <a href={proj.link} target="_blank" rel="noopener noreferrer" className="text-teal-500 hover:text-teal-700"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg></a>}
                  </div>
                  {proj.description && <p className="text-gray-600 text-sm mb-3">{proj.description}</p>}
                  {proj.technologies?.length > 0 && <div className="flex flex-wrap gap-1.5">{proj.technologies.map((t, idx) => <span key={idx} className="px-2 py-0.5 bg-teal-50 text-teal-600 rounded text-xs font-medium">{t}</span>)}</div>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Timeline Education */}
        {data.education?.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-teal-700 mb-6">Education</h2>
            <div className="relative pl-8 border-l-2 border-cyan-200 space-y-6">
              {data.education.map((edu, i) => (
                <div key={i} className="relative">
                  <div className="absolute -left-[2.35rem] w-4 h-4 bg-cyan-500 rounded-full ring-4 ring-cyan-100" />
                  <div>
                    <h3 className="font-bold text-gray-900">{edu.degree}</h3>
                    <p className="text-teal-600 font-medium text-sm">{edu.institution}</p>
                    <div className="flex gap-3 text-xs text-gray-400 mt-1">{edu.year && <span>{edu.year}</span>}{edu.cgpa && <span>CGPA: {edu.cgpa}</span>}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="grid sm:grid-cols-2 gap-8">
          {data.certifications?.length > 0 && (
            <section>
              <h2 className="text-lg font-bold text-teal-700 mb-4">Certifications</h2>
              <ul className="space-y-2">
                {data.certifications.map((cert, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                    <svg className="w-4 h-4 text-teal-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    {typeof cert === 'string' ? cert : cert.name}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {data.achievements?.length > 0 && (
            <section>
              <h2 className="text-lg font-bold text-teal-700 mb-4">Achievements</h2>
              <ul className="space-y-2">
                {data.achievements.map((ach, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-cyan-500 shrink-0">&#11044;</span>
                    {typeof ach === 'string' ? ach : ach.title || ach.name}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </main>

      <footer className="bg-gradient-to-r from-teal-600 to-cyan-500 text-white py-6 mt-8">
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <p className="text-teal-100 text-xs">© {new Date().getFullYear()} {data.name}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default Template6;
