// Template 3: Forest Green — Sidebar Layout
function Template3({ data }) {
  return (
    <div className="min-h-screen bg-gray-50 font-[system-ui] flex flex-col lg:flex-row">
      {/* Sidebar */}
      <aside className="lg:w-80 bg-gradient-to-b from-green-800 via-green-700 to-emerald-700 text-white p-8 lg:min-h-screen lg:sticky lg:top-0 lg:max-h-screen lg:overflow-y-auto shrink-0">
        <div className="text-center lg:text-left">
          <div className="w-24 h-24 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center text-4xl font-black text-white mx-auto lg:mx-0 mb-5 ring-4 ring-white/20">
            {data.name?.charAt(0) || 'P'}
          </div>
          <h1 className="text-2xl font-black tracking-tight mb-1">{data.name || 'Your Name'}</h1>
          <p className="text-green-200 font-medium mb-6">{data.title || 'Your Title'}</p>
          <div className="space-y-2 text-sm text-green-100">
            {data.email && <p className="flex items-center gap-2 justify-center lg:justify-start"><span className="w-1 h-1 bg-emerald-300 rounded-full" />{data.email}</p>}
            {data.phone && <p className="flex items-center gap-2 justify-center lg:justify-start"><span className="w-1 h-1 bg-emerald-300 rounded-full" />{data.phone}</p>}
            {data.location && <p className="flex items-center gap-2 justify-center lg:justify-start"><span className="w-1 h-1 bg-emerald-300 rounded-full" />{data.location}</p>}
          </div>
          <div className="flex flex-wrap gap-2 mt-5 justify-center lg:justify-start">
            {data.github && <a href={data.github} target="_blank" rel="noopener noreferrer" className="px-3 py-1 bg-white/15 hover:bg-white/25 rounded-lg text-xs font-medium transition-all">GitHub</a>}
            {data.linkedin && <a href={data.linkedin} target="_blank" rel="noopener noreferrer" className="px-3 py-1 bg-white/15 hover:bg-white/25 rounded-lg text-xs font-medium transition-all">LinkedIn</a>}
          </div>
        </div>

        {/* Skills in sidebar */}
        {data.skills?.length > 0 && (
          <div className="mt-8 pt-6 border-t border-white/20">
            <h3 className="text-xs font-bold uppercase tracking-widest text-green-300 mb-4">Skills</h3>
            <div className="flex flex-wrap gap-1.5">
              {data.skills.map((s, i) => (
                <span key={i} className="px-2.5 py-1 bg-white/10 text-green-100 rounded-lg text-xs font-medium hover:bg-white/20 transition-all">{s}</span>
              ))}
            </div>
          </div>
        )}

        {data.certifications?.length > 0 && (
          <div className="mt-8 pt-6 border-t border-white/20">
            <h3 className="text-xs font-bold uppercase tracking-widest text-green-300 mb-4">Certifications</h3>
            <ul className="space-y-2">
              {data.certifications.map((cert, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-green-100">
                  <svg className="w-3.5 h-3.5 mt-0.5 text-emerald-300 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" /></svg>
                  {typeof cert === 'string' ? cert : cert.name}
                </li>
              ))}
            </ul>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 lg:p-12 space-y-10 max-w-4xl">
        {data.about && (
          <section>
            <h2 className="text-2xl font-bold text-green-800 mb-4 flex items-center gap-2">
              <span className="w-6 h-0.5 bg-emerald-500" />About
            </h2>
            <p className="text-gray-600 leading-relaxed">{data.about}</p>
          </section>
        )}

        {data.experience?.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-green-800 mb-6 flex items-center gap-2">
              <span className="w-6 h-0.5 bg-emerald-500" />Experience
            </h2>
            <div className="space-y-5">
              {data.experience.map((exp, i) => (
                <div key={i} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:border-green-200 transition-all">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 mb-2">
                    <div>
                      <h3 className="text-base font-bold text-gray-900">{exp.position}</h3>
                      <p className="text-green-600 font-semibold text-sm">{exp.company}</p>
                    </div>
                    {exp.duration && <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-md">{exp.duration}</span>}
                  </div>
                  {exp.description && <p className="text-gray-600 text-sm leading-relaxed">{exp.description}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {data.projects?.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-green-800 mb-6 flex items-center gap-2">
              <span className="w-6 h-0.5 bg-emerald-500" />Projects
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {data.projects.map((proj, i) => (
                <div key={i} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-gray-900">{proj.name}</h3>
                    {proj.link && <a href={proj.link} target="_blank" rel="noopener noreferrer" className="text-green-500 hover:text-green-700"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg></a>}
                  </div>
                  {proj.description && <p className="text-gray-600 text-sm mb-3">{proj.description}</p>}
                  {proj.technologies?.length > 0 && <div className="flex flex-wrap gap-1">{proj.technologies.map((t, idx) => <span key={idx} className="px-2 py-0.5 bg-green-50 text-green-700 rounded text-xs font-medium">{t}</span>)}</div>}
                </div>
              ))}
            </div>
          </section>
        )}

        {data.education?.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-green-800 mb-6 flex items-center gap-2">
              <span className="w-6 h-0.5 bg-emerald-500" />Education
            </h2>
            <div className="space-y-4">
              {data.education.map((edu, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full mt-1.5 shrink-0 ring-4 ring-emerald-100" />
                  <div>
                    <h3 className="font-bold text-gray-900">{edu.degree}</h3>
                    <p className="text-green-600 font-medium text-sm">{edu.institution}</p>
                    <div className="flex gap-3 text-xs text-gray-400 mt-1">
                      {edu.year && <span>{edu.year}</span>}
                      {edu.cgpa && <span>CGPA: {edu.cgpa}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {data.achievements?.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-green-800 mb-5 flex items-center gap-2">
              <span className="w-6 h-0.5 bg-emerald-500" />Achievements
            </h2>
            <div className="space-y-2">
              {data.achievements.map((ach, i) => (
                <div key={i} className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                  <span className="text-gray-700 text-sm">{typeof ach === 'string' ? ach : ach.title || ach.name}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        <footer className="pt-8 border-t border-gray-200 text-center text-xs text-gray-400">
          <p>© {new Date().getFullYear()} {data.name}. All rights reserved.</p>
        </footer>
      </main>
    </div>
  );
}

export default Template3;
