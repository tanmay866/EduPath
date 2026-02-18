import React from 'react'
import { useNavigate } from 'react-router-dom';

const Home = () => {

  const navigate = useNavigate();

  return (
    <div className="bg-slate-900 font-sans">
        {/* SECTION 1: HERO (The first code I gave you) */}
      <section className="min-h-svh flex flex-col justify-center items-center px-4 text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight">
          Learn with EduPath <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
            Upskill Faster
          </span>
        </h1>
        
        <p className="mt-4 text-lg text-gray-300 max-w-2xl">
          A free platform to build your personalized learning path and grow with verified providers.
        </p>

        {/* Decorative Wave SVG */}
        <div className="my-10 w-full max-w-md">
          <svg viewBox="0 0 500 100" className="w-full h-auto">
            <path d="M0,50 C150,110 350,-10 500,50" fill="none" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" />
          </svg>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button className="bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-indigo-700 transition cursor-pointer"
            onClick={() => navigate('/assessment')}
          >
            Skill Assessment →
          </button>
          {/* <button className="bg-slate-800 text-gray-200 px-8 py-4 rounded-xl font-bold border border-slate-700 hover:bg-slate-700 transition cursor-pointer active:scale-95">
            Browse Top Providers
          </button> */}
        </div>
      </section>

      <section className="py-20 px-6 bg-slate-900">
        <div className="max-w-6xl mx-auto text-center">
          
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">How It Works</h2>
          <p className="text-slate-500 mb-16">Three simple steps to transform your career</p>

          {/* Grid Container for 3 Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Card 1 */}
            <div className="relative bg-white p-8 rounded-2xl border border-slate-100 shadow-sm text-left">
              <div className="absolute -top-3 -left-3 w-8 h-8 bg-[#1e2342] text-white rounded-full flex items-center justify-center font-bold">1</div>
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-6 text-blue-500 font-bold text-xl">◎</div>
              <h3 className="text-xl font-bold mb-2 text-slate-900">Quick Assessment</h3>
              <p className="text-slate-500 text-sm">2-5 min career assessment to identify your current skills and goals</p>
            </div>

            {/* Card 2 */}
            <div className="relative bg-white p-8 rounded-2xl border border-slate-100 shadow-sm text-left">
              <div className="absolute -top-3 -left-3 w-8 h-8 bg-[#1e2342] text-white rounded-full flex items-center justify-center font-bold">2</div>
              <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center mb-6 text-emerald-500 font-bold text-xl">↗</div>
              <h3 className="text-xl font-bold mb-2 text-slate-900">Personalized Path</h3>
              <p className="text-slate-500 text-sm">Get a custom learning roadmap with skills timeline and milestones</p>
            </div>

            {/* Card 3 */}
            <div className="relative bg-white p-8 rounded-2xl border border-slate-100 shadow-sm text-left">
              <div className="absolute -top-3 -left-3 w-8 h-8 bg-[#1e2342] text-white rounded-full flex items-center justify-center font-bold">3</div>
              <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center mb-6 text-indigo-500 font-bold text-xl">🛡</div>
              <h3 className="text-xl font-bold mb-2 text-slate-900">Verified Providers</h3>
              <p className="text-slate-500 text-sm">Access courses from trusted platforms with transparent policies</p>
            </div>

          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-slate-900">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How Your Career Journey Works</h2>
          <p className="text-slate-500 max-w-2xl mx-auto mb-12">
            Our AI-powered career engine creates a personalized roadmap based on your current skills, interests, and market demand.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {[
              { title: "Skills Assessment", desc: "Take our comprehensive assessment to understand your level.", icon: "◎" },
              { title: "Personalized Path", desc: "Get a custom roadmap with courses, projects, and milestones.", icon: "📊" },
              { title: "Learn & Build", desc: "Complete verified courses and build portfolio projects.", icon: "⟨⟩" },
              { title: "Get Hired", desc: "Connect with hiring partners and showcase your skills.", icon: "👥" }
            ].map((item, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <div className="w-16 h-16 bg-[#1a2144] text-white rounded-2xl flex items-center justify-center text-2xl mb-4 shadow-lg">
                  {item.icon}
                </div>
                <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      <section className="py-20 px-6 bg-slate-900">
        <div className="max-w-6xl mx-auto">
          {/* Newsletter Box */}
          <div className="bg-slate-400 rounded-3xl p-8 md:p-16 text-center mb-20">
            <h2 className="text-3xl font-bold mb-4 text-slate-900">Stay Updated</h2>
            <p className="text-slate-900 mb-8">Get weekly insights on emerging skills, industry trends, and curated learning opportunities</p>
            <div className="flex flex-col sm:flex-row max-w-md mx-auto items-center justify-center">
              <button className="bg-[#1a2144] text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition"
                onClick={() => navigate('/signup')}
              >
                Get Started
              </button>
            </div>
            <p className="text-xs text-slate-800 mt-4 italic">No spam. Unsubscribe anytime. 25,000+ professionals already subscribed.</p>
          </div>

          {/* Stats Bar */}
          <div className="text-center mb-12">
             <span className="text-emerald-500 font-bold bg-emerald-50 px-4 py-1 rounded-full text-xs uppercase tracking-widest">Community Success</span>
             <h2 className="text-3xl font-bold mt-4"><span className="text-emerald-500">Real Stories</span> from Our Community</h2>
             <p className="text-slate-500 mt-2 max-w-2xl mx-auto text-sm">Join thousands of learners who have transformed their careers with LearnPath.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-black mb-1">10,000+</div>
              <div className="text-slate-400 text-sm">Success Stories</div>
            </div>
            <div>
              <div className="text-3xl font-black mb-1">85%</div>
              <div className="text-slate-400 text-sm">Career Transitions</div>
            </div>
            <div>
              <div className="text-3xl font-black mb-1">160%</div>
              <div className="text-slate-400 text-sm">Avg Salary Increase</div>
            </div>
            <div>
              <div className="text-3xl font-black mb-1">6 months</div>
              <div className="text-slate-400 text-sm">Avg Learning Time</div>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}

export default Home