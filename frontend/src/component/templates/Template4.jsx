// Template 4: Royal Purple — Elegant Card-Based
function Template4({ data }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 font-[system-ui]">
      {/* Hero */}
      <header className="relative">
        <div className="bg-gradient-to-br from-purple-700 via-purple-600 to-pink-600 text-white">
          <div className="container mx-auto px-6 py-16 max-w-5xl text-center">
            <div className="w-20 h-20 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-3xl font-black text-white mx-auto mb-4 ring-4 ring-white/30 shadow-xl">
              {data.name?.charAt(0) || 'P'}
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-2">{data.name || 'Your Name'}</h1>
            <p className="text-xl text-purple-200 font-medium mb-4">{data.title || 'Your Title'}</p>
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-purple-200">
              {data.email && <span>{data.email}</span>}
              {data.phone && <span>{data.phone}</span>}
              {data.location && <span>{data.location}</span>}
            </div>
            <div className="flex justify-center gap-3 mt-5">
              {data.github && <a href={data.github} target="_blank" rel="noopener noreferrer" className="px-5 py-2 bg-white text-purple-700 rounded-full text-sm font-bold hover:bg-purple-50 transition-all shadow-md">GitHub</a>}
              {data.linkedin && <a href={data.linkedin} target="_blank" rel="noopener noreferrer" className="px-5 py-2 bg-white/20 text-white border border-white/30 rounded-full text-sm font-bold hover:bg-white/30 transition-all">LinkedIn</a>}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 max-w-5xl -mt-8 relative z-10 space-y-8 pb-16">
        {/* About Card */}
        {data.about && (
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-purple-100">
            <h2 className="text-lg font-bold text-purple-700 mb-3 flex items-center gap-2">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center"><span className="text-purple-600 text-sm">01</span></div>
              About Me
            </h2>
            <p className="text-gray-600 leading-relaxed">{data.about}</p>
          </div>
        )}

        {/* Skills */}
        {data.skills?.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-purple-100">
            <h2 className="text-lg font-bold text-purple-700 mb-5 flex items-center gap-2">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center"><span className="text-purple-600 text-sm">02</span></div>
              Skills & Expertise
            </h2>
            <div className="flex flex-wrap gap-2">
              {data.skills.map((s, i) => (
                <span key={i} className="px-4 py-2 bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 rounded-xl text-sm font-semibold border border-purple-100 hover:from-purple-100 hover:to-pink-100 transition-all">{s}</span>
              ))}
            </div>
          </div>
        )}

        {/* Experience */}
        {data.experience?.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-purple-100">
            <h2 className="text-lg font-bold text-purple-700 mb-6 flex items-center gap-2">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center"><span className="text-purple-600 text-sm">03</span></div>
              Experience
            </h2>
            <div className="space-y-5">
              {data.experience.map((exp, i) => (
                <div key={i} className="p-5 bg-gradient-to-r from-purple-50/50 to-pink-50/50 rounded-xl border border-purple-50 hover:border-purple-200 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 mb-2">
                    <div><h3 className="text-base font-bold text-gray-900">{exp.position}</h3><p className="text-purple-600 font-semibold text-sm">{exp.company}</p></div>
                    {exp.duration && <span className="text-xs text-purple-400 font-medium">{exp.duration}</span>}
                  </div>
                  {exp.description && <p className="text-gray-600 text-sm leading-relaxed mt-2">{exp.description}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        {data.projects?.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-purple-100">
            <h2 className="text-lg font-bold text-purple-700 mb-6 flex items-center gap-2">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center"><span className="text-purple-600 text-sm">04</span></div>
              Projects
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {data.projects.map((proj, i) => (
                <div key={i} className="p-5 rounded-xl border-2 border-gray-100 hover:border-purple-200 hover:shadow-md transition-all group">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-gray-900">{proj.name}</h3>
                    {proj.link && <a href={proj.link} target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-600"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg></a>}
                  </div>
                  {proj.description && <p className="text-gray-600 text-sm mb-3">{proj.description}</p>}
                  {proj.technologies?.length > 0 && <div className="flex flex-wrap gap-1.5">{proj.technologies.map((t, idx) => <span key={idx} className="px-2 py-0.5 bg-purple-50 text-purple-600 rounded text-xs font-semibold">{t}</span>)}</div>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education & Extras Row */}
        <div className="grid md:grid-cols-2 gap-6">
          {data.education?.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-purple-100">
              <h2 className="text-lg font-bold text-purple-700 mb-5 flex items-center gap-2">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center"><span className="text-purple-600 text-sm">05</span></div>
                Education
              </h2>
              <div className="space-y-4">
                {data.education.map((edu, i) => (
                  <div key={i} className="border-l-2 border-purple-200 pl-4">
                    <h3 className="font-bold text-gray-900 text-sm">{edu.degree}</h3>
                    <p className="text-purple-600 text-sm">{edu.institution}</p>
                    <div className="flex gap-2 text-xs text-gray-400 mt-1">
                      {edu.year && <span>{edu.year}</span>}
                      {edu.cgpa && <span>CGPA: {edu.cgpa}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-6">
            {data.certifications?.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-purple-100">
                <h2 className="text-lg font-bold text-purple-700 mb-4">Certifications</h2>
                <ul className="space-y-2">
                  {data.certifications.map((cert, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                      <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full shrink-0" />
                      {typeof cert === 'string' ? cert : cert.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {data.achievements?.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-purple-100">
                <h2 className="text-lg font-bold text-purple-700 mb-4">Achievements</h2>
                <ul className="space-y-2">
                  {data.achievements.map((ach, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-pink-500 shrink-0">&#10038;</span>
                      {typeof ach === 'string' ? ach : ach.title || ach.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="bg-gradient-to-r from-purple-700 to-pink-600 text-white py-6">
        <div className="container mx-auto px-6 max-w-5xl text-center text-sm">
          <p className="text-purple-200">© {new Date().getFullYear()} {data.name}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default Template4;
