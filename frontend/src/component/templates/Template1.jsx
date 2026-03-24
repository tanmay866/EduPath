// Template 1: Ocean Blue — Professional & Clean
function Template1({ data }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 font-[system-ui]">
      {/* Hero Header */}
      <header className="relative bg-gradient-to-br from-blue-700 via-blue-600 to-cyan-500 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white" />
          <div className="absolute -bottom-32 -left-20 w-96 h-96 rounded-full bg-cyan-300" />
        </div>
        <div className="relative container mx-auto px-6 py-20 max-w-5xl">
          <div className="flex flex-col md:flex-row items-center gap-10">
            <div className="w-36 h-36 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center text-6xl font-black text-white shadow-2xl ring-4 ring-white/30 shrink-0">
              {data.name?.charAt(0) || 'P'}
            </div>
            <div className="text-center md:text-left flex-1">
              <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-2">{data.name || 'Your Name'}</h1>
              <p className="text-xl md:text-2xl text-blue-100 font-medium mb-5">{data.title || 'Your Title'}</p>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-6 gap-y-2 text-sm text-blue-100">
                {data.email && <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-cyan-300 rounded-full" />{data.email}</span>}
                {data.phone && <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-cyan-300 rounded-full" />{data.phone}</span>}
                {data.location && <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-cyan-300 rounded-full" />{data.location}</span>}
              </div>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-4">
                {data.github && <a href={data.github} target="_blank" rel="noopener noreferrer" className="px-4 py-1.5 bg-white/15 hover:bg-white/25 rounded-full text-sm font-medium backdrop-blur-sm transition-all">GitHub</a>}
                {data.linkedin && <a href={data.linkedin} target="_blank" rel="noopener noreferrer" className="px-4 py-1.5 bg-white/15 hover:bg-white/25 rounded-full text-sm font-medium backdrop-blur-sm transition-all">LinkedIn</a>}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12 max-w-5xl space-y-12">
        {data.about && (
          <section>
            <h2 className="text-2xl font-bold text-blue-800 mb-1 flex items-center gap-3"><span className="w-8 h-1 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full" />About Me</h2>
            <p className="text-gray-600 text-lg leading-relaxed mt-4 pl-11">{data.about}</p>
          </section>
        )}

        {data.skills?.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-blue-800 mb-6 flex items-center gap-3"><span className="w-8 h-1 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full" />Skills & Technologies</h2>
            <div className="flex flex-wrap gap-2.5 pl-11">
              {data.skills.map((s, i) => (
                <span key={i} className="px-4 py-2 bg-white text-blue-700 rounded-xl text-sm font-semibold shadow-sm border border-blue-100 hover:shadow-md hover:border-blue-200 hover:-translate-y-0.5 transition-all duration-200">{s}</span>
              ))}
            </div>
          </section>
        )}

        {data.experience?.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-blue-800 mb-6 flex items-center gap-3"><span className="w-8 h-1 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full" />Experience</h2>
            <div className="space-y-5 pl-11">
              {data.experience.map((exp, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 mb-2">
                    <div><h3 className="text-lg font-bold text-gray-900">{exp.position}</h3><p className="text-blue-600 font-semibold">{exp.company}</p></div>
                    {exp.duration && <span className="text-sm text-gray-400 font-medium bg-gray-50 px-3 py-1 rounded-full whitespace-nowrap">{exp.duration}</span>}
                  </div>
                  {exp.description && <p className="text-gray-600 text-sm leading-relaxed mt-2">{exp.description}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {data.projects?.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-blue-800 mb-6 flex items-center gap-3"><span className="w-8 h-1 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full" />Projects</h2>
            <div className="grid md:grid-cols-2 gap-5 pl-11">
              {data.projects.map((proj, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-bold text-gray-900">{proj.name}</h3>
                    {proj.link && <a href={proj.link} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700 shrink-0 ml-2"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg></a>}
                  </div>
                  {proj.description && <p className="text-gray-600 text-sm leading-relaxed mb-4">{proj.description}</p>}
                  {proj.technologies?.length > 0 && <div className="flex flex-wrap gap-1.5">{proj.technologies.map((t, idx) => <span key={idx} className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-semibold">{t}</span>)}</div>}
                </div>
              ))}
            </div>
          </section>
        )}

        {data.education?.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-blue-800 mb-6 flex items-center gap-3"><span className="w-8 h-1 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full" />Education</h2>
            <div className="space-y-4 pl-11">
              {data.education.map((edu, i) => (
                <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-start gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-md">{edu.degree?.charAt(0) || 'E'}</div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">{edu.degree}</h3>
                    <p className="text-blue-600 font-medium text-sm">{edu.institution}</p>
                    {edu.year && <p className="text-gray-400 text-sm">{edu.year}</p>}
                    {edu.cgpa && <p className="text-gray-500 text-xs mt-1">CGPA: {edu.cgpa}</p>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {data.certifications?.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-blue-800 mb-6 flex items-center gap-3"><span className="w-8 h-1 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full" />Certifications</h2>
            <div className="grid sm:grid-cols-2 gap-3 pl-11">
              {data.certifications.map((cert, i) => (
                <div key={i} className="flex items-center gap-3 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 shrink-0">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>
                  </div>
                  <span className="text-sm font-medium text-gray-700">{typeof cert === 'string' ? cert : cert.name}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {data.achievements?.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-blue-800 mb-6 flex items-center gap-3"><span className="w-8 h-1 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full" />Achievements</h2>
            <div className="space-y-3 pl-11">
              {data.achievements.map((ach, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="text-cyan-500 mt-0.5 shrink-0"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg></span>
                  <span className="text-gray-700 text-sm">{typeof ach === 'string' ? ach : ach.title || ach.name}</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      <footer className="bg-gradient-to-r from-blue-700 to-cyan-600 text-white py-8 mt-12">
        <div className="container mx-auto px-6 max-w-5xl text-center">
          <div className="flex justify-center gap-5 mb-3">
            {data.github && <a href={data.github} target="_blank" rel="noopener noreferrer" className="hover:text-blue-200 transition-colors text-sm font-medium">GitHub</a>}
            {data.linkedin && <a href={data.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-blue-200 transition-colors text-sm font-medium">LinkedIn</a>}
            {data.email && <a href={`mailto:${data.email}`} className="hover:text-blue-200 transition-colors text-sm font-medium">Email</a>}
          </div>
          <p className="text-blue-200 text-xs">© {new Date().getFullYear()} {data.name}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default Template1;
