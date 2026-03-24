// Template 2: Sunset Orange — Creative & Bold
function Template2({ data }) {
  return (
    <div className="min-h-screen bg-white font-[system-ui]">
      {/* Asymmetric Hero */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-red-500 to-rose-600" />
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-white" style={{ clipPath: 'polygon(0 100%, 100% 100%, 100% 0)' }} />
        <div className="relative container mx-auto px-6 py-20 max-w-5xl text-white">
          <div className="flex flex-col sm:flex-row items-center gap-8">
            <div className="w-28 h-28 bg-white rounded-2xl flex items-center justify-center text-5xl font-black text-orange-600 shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-300 shrink-0">
              {data.name?.charAt(0) || 'P'}
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-4xl md:text-5xl font-black mb-2 tracking-tight">{data.name || 'Your Name'}</h1>
              <p className="text-xl text-orange-100 font-semibold mb-4">{data.title || 'Your Title'}</p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-sm text-orange-100">
                {data.email && <span>{data.email}</span>}
                {data.phone && <span>{data.phone}</span>}
                {data.location && <span>{data.location}</span>}
              </div>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-4">
                {data.github && <a href={data.github} target="_blank" rel="noopener noreferrer" className="px-4 py-1.5 border border-white/40 hover:bg-white hover:text-orange-600 rounded-full text-sm font-medium transition-all">GitHub</a>}
                {data.linkedin && <a href={data.linkedin} target="_blank" rel="noopener noreferrer" className="px-4 py-1.5 border border-white/40 hover:bg-white hover:text-orange-600 rounded-full text-sm font-medium transition-all">LinkedIn</a>}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 max-w-5xl space-y-14 pb-16">
        {data.about && (
          <section className="-mt-6">
            <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-8 border border-orange-100">
              <h2 className="text-xl font-black text-orange-700 uppercase tracking-wider mb-3">About</h2>
              <p className="text-gray-700 text-base leading-relaxed">{data.about}</p>
            </div>
          </section>
        )}

        {data.skills?.length > 0 && (
          <section>
            <h2 className="text-xl font-black text-orange-700 uppercase tracking-wider mb-5">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {data.skills.map((s, i) => (
                <span key={i} className="px-4 py-2 bg-white border-2 border-orange-200 text-orange-700 rounded-xl text-sm font-bold hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-all duration-200 cursor-default">{s}</span>
              ))}
            </div>
          </section>
        )}

        {data.experience?.length > 0 && (
          <section>
            <h2 className="text-xl font-black text-orange-700 uppercase tracking-wider mb-6">Experience</h2>
            <div className="space-y-6">
              {data.experience.map((exp, i) => (
                <div key={i} className="flex gap-5 group">
                  <div className="flex flex-col items-center shrink-0">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg group-hover:scale-110 transition-transform">{String(i + 1).padStart(2, '0')}</div>
                    {i < data.experience.length - 1 && <div className="w-0.5 flex-1 bg-orange-200 mt-2" />}
                  </div>
                  <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex-1 mb-2">
                    <h3 className="text-lg font-bold text-gray-900">{exp.position}</h3>
                    <p className="text-orange-600 font-semibold text-sm">{exp.company}</p>
                    {exp.duration && <p className="text-gray-400 text-xs mt-1">{exp.duration}</p>}
                    {exp.description && <p className="text-gray-600 text-sm mt-3 leading-relaxed">{exp.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {data.projects?.length > 0 && (
          <section>
            <h2 className="text-xl font-black text-orange-700 uppercase tracking-wider mb-6">Projects</h2>
            <div className="grid md:grid-cols-2 gap-5">
              {data.projects.map((proj, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-red-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-bold text-gray-900">{proj.name}</h3>
                    {proj.link && <a href={proj.link} target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:text-orange-700"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg></a>}
                  </div>
                  {proj.description && <p className="text-gray-600 text-sm mb-4 leading-relaxed">{proj.description}</p>}
                  {proj.technologies?.length > 0 && <div className="flex flex-wrap gap-1.5">{proj.technologies.map((t, idx) => <span key={idx} className="px-2 py-0.5 bg-orange-50 text-orange-600 rounded text-xs font-semibold">{t}</span>)}</div>}
                </div>
              ))}
            </div>
          </section>
        )}

        {data.education?.length > 0 && (
          <section>
            <h2 className="text-xl font-black text-orange-700 uppercase tracking-wider mb-6">Education</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {data.education.map((edu, i) => (
                <div key={i} className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-5 border border-orange-100">
                  <h3 className="font-bold text-gray-900">{edu.degree}</h3>
                  <p className="text-orange-600 font-medium text-sm">{edu.institution}</p>
                  {edu.year && <p className="text-gray-400 text-sm mt-1">{edu.year}</p>}
                  {edu.cgpa && <p className="text-gray-500 text-xs mt-1">CGPA: {edu.cgpa}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {data.certifications?.length > 0 && (
          <section>
            <h2 className="text-xl font-black text-orange-700 uppercase tracking-wider mb-5">Certifications</h2>
            <div className="flex flex-wrap gap-3">
              {data.certifications.map((cert, i) => (
                <span key={i} className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-800 rounded-full text-sm font-semibold">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" /></svg>
                  {typeof cert === 'string' ? cert : cert.name}
                </span>
              ))}
            </div>
          </section>
        )}

        {data.achievements?.length > 0 && (
          <section>
            <h2 className="text-xl font-black text-orange-700 uppercase tracking-wider mb-5">Achievements</h2>
            <ul className="space-y-2">
              {data.achievements.map((ach, i) => (
                <li key={i} className="flex items-start gap-3 text-gray-700 text-sm">
                  <span className="text-orange-500 mt-0.5">&#9733;</span>
                  {typeof ach === 'string' ? ach : ach.title || ach.name}
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>

      <footer className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-6">
        <div className="container mx-auto px-6 max-w-5xl text-center">
          <div className="flex justify-center gap-5 mb-2">
            {data.github && <a href={data.github} target="_blank" rel="noopener noreferrer" className="hover:text-orange-200 text-sm font-medium transition-colors">GitHub</a>}
            {data.linkedin && <a href={data.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-orange-200 text-sm font-medium transition-colors">LinkedIn</a>}
          </div>
          <p className="text-orange-200 text-xs">© {new Date().getFullYear()} {data.name}</p>
        </div>
      </footer>
    </div>
  );
}

export default Template2;
