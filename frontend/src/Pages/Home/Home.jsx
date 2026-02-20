import React from 'react'
import { useNavigate } from 'react-router-dom';

const Home = () => {

  const navigate = useNavigate();

  return (
    <div className="bg-slate-900 font-sans relative">
      {/* Live Moving Background Animations */}
      <div className="animated-bg">
        {/* Moving Shapes */}
        <div className="moving-shape shape-1"></div>
        <div className="moving-shape shape-2"></div>
        <div className="moving-shape shape-3"></div>
        <div className="moving-shape shape-4"></div>
        <div className="moving-shape shape-5"></div>
        <div className="moving-shape shape-6"></div>
        <div className="moving-shape shape-7"></div>
        <div className="moving-shape shape-8"></div>
        
        {/* Rotating Center Gradient */}
        <div className="rotating-gradient"></div>
        
        {/* Floating Particles */}
        <div className="floating-particle" style={{top: '5%', left: '15%', animationDelay: '0s'}}></div>
        <div className="floating-particle" style={{top: '8%', left: '85%', animationDelay: '2s'}}></div>
        <div className="floating-particle" style={{top: '12%', left: '50%', animationDelay: '1.5s'}}></div>
        <div className="floating-particle" style={{top: '15%', left: '20%', animationDelay: '0s'}}></div>
        <div className="floating-particle" style={{top: '25%', left: '70%', animationDelay: '1s'}}></div>
        <div className="floating-particle" style={{top: '45%', left: '10%', animationDelay: '2s'}}></div>
        <div className="floating-particle" style={{top: '55%', left: '85%', animationDelay: '1.5s'}}></div>
        <div className="floating-particle" style={{top: '75%', left: '30%', animationDelay: '0.5s'}}></div>
        <div className="floating-particle" style={{top: '65%', left: '60%', animationDelay: '2.5s'}}></div>
        <div className="floating-particle" style={{top: '35%', left: '50%', animationDelay: '3s'}}></div>
        <div className="floating-particle" style={{top: '85%', left: '75%', animationDelay: '1.2s'}}></div>
      </div>

        {/* SECTION 1: HERO (The first code I gave you) */}
      <section className="min-h-svh flex flex-col justify-center items-center px-4 text-center relative z-10">
        <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight leading-tight">
          Your Personalized Path to Success
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400">
            with EduPath
          </span>
        </h1>
        
        <p className="mt-6 text-lg md:text-xl text-gray-300 max-w-3xl">
          Learn Smarter, Grow Faster with our AI-powered personalized learning platform
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <button className="backdrop-blur-lg bg-indigo-500/20 text-white px-8 py-4 rounded-xl font-bold border border-indigo-400/30 hover:bg-indigo-500/30 hover:border-indigo-400/50 hover:scale-105 hover:shadow-xl hover:shadow-indigo-500/50 transition-all duration-300 cursor-pointer"
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
            <div className="relative backdrop-blur-lg bg-white/5 p-8 rounded-2xl border border-white/10 hover:border-blue-500/50 shadow-2xl hover:shadow-blue-500/30 text-left transition-all duration-300 hover:transform hover:scale-105 group">
              <div className="absolute -top-4 -left-4 w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-xl z-20">1</div>
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-sm rounded-lg flex items-center justify-center mb-6 text-blue-400 font-bold text-xl border border-blue-500/30 group-hover:border-blue-500/60 transition-all">◎</div>
                <h3 className="text-xl font-bold mb-2 text-white group-hover:text-blue-400 transition-colors">Quick Assessment</h3>
                <p className="text-slate-300 text-sm leading-relaxed">2-5 min career assessment to identify your current skills and goals</p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="relative backdrop-blur-lg bg-white/5 p-8 rounded-2xl border border-white/10 hover:border-emerald-500/50 shadow-2xl hover:shadow-emerald-500/30 text-left transition-all duration-300 hover:transform hover:scale-105 group">
              <div className="absolute -top-4 -left-4 w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-xl z-20">2</div>
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 backdrop-blur-sm rounded-lg flex items-center justify-center mb-6 text-emerald-400 font-bold text-xl border border-emerald-500/30 group-hover:border-emerald-500/60 transition-all">↗</div>
                <h3 className="text-xl font-bold mb-2 text-white group-hover:text-emerald-400 transition-colors">Personalized Path</h3>
                <p className="text-slate-300 text-sm leading-relaxed">Get a custom learning roadmap with skills timeline and milestones</p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="relative backdrop-blur-lg bg-white/5 p-8 rounded-2xl border border-white/10 hover:border-indigo-500/50 shadow-2xl hover:shadow-indigo-500/30 text-left transition-all duration-300 hover:transform hover:scale-105 group">
              <div className="absolute -top-4 -left-4 w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-xl z-20">3</div>
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500/20 to-indigo-600/20 backdrop-blur-sm rounded-lg flex items-center justify-center mb-6 text-indigo-400 font-bold text-xl border border-indigo-500/30 group-hover:border-indigo-500/60 transition-all">🛡</div>
                <h3 className="text-xl font-bold mb-2 text-white group-hover:text-indigo-400 transition-colors">Verified Providers</h3>
                <p className="text-slate-300 text-sm leading-relaxed">Access courses from trusted platforms with transparent policies</p>
              </div>
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
              { title: "Skills Assessment", desc: "Take our comprehensive assessment to understand your level.", icon: "◎", color: "blue" },
              { title: "Personalized Path", desc: "Get a custom roadmap with courses, projects, and milestones.", icon: "📊", color: "emerald" },
              { title: "Learn & Build", desc: "Complete verified courses and build portfolio projects.", icon: "⟨⟩", color: "purple" },
              { title: "Get Hired", desc: "Connect with hiring partners and showcase your skills.", icon: "👥", color: "pink" }
            ].map((item, idx) => (
              <div key={idx} className="flex flex-col items-center group">
                <div className={`w-16 h-16 backdrop-blur-lg rounded-2xl flex items-center justify-center text-2xl mb-4 shadow-xl transition-all duration-300 hover:scale-110
                  ${item.color === 'blue' ? 'bg-gradient-to-br from-blue-500/20 to-blue-600/20 text-blue-300 border border-blue-500/30 hover:border-blue-500/60 hover:shadow-blue-500/50 hover:from-blue-500/30 hover:to-blue-600/30' : ''}
                  ${item.color === 'emerald' ? 'bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:border-emerald-500/60 hover:shadow-emerald-500/50 hover:from-emerald-500/30 hover:to-emerald-600/30' : ''}
                  ${item.color === 'purple' ? 'bg-gradient-to-br from-purple-500/20 to-purple-600/20 text-purple-300 border border-purple-500/30 hover:border-purple-500/60 hover:shadow-purple-500/50 hover:from-purple-500/30 hover:to-purple-600/30' : ''}
                  ${item.color === 'pink' ? 'bg-gradient-to-br from-pink-500/20 to-pink-600/20 text-pink-300 border border-pink-500/30 hover:border-pink-500/60 hover:shadow-pink-500/50 hover:from-pink-500/30 hover:to-pink-600/30' : ''}
                `}>
                  {item.icon}
                </div>
                <h3 className={`font-bold text-lg mb-2 text-white transition-all duration-300
                  ${item.color === 'blue' ? 'group-hover:text-blue-400' : ''}
                  ${item.color === 'emerald' ? 'group-hover:text-emerald-400' : ''}
                  ${item.color === 'purple' ? 'group-hover:text-purple-400' : ''}
                  ${item.color === 'pink' ? 'group-hover:text-pink-400' : ''}
                `}>{item.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      <section className="py-20 px-6 bg-slate-900">
        <div className="max-w-6xl mx-auto">
          {/* Newsletter Box */}
          <div className="relative backdrop-blur-lg bg-white/5 rounded-3xl p-8 md:p-16 text-center mb-20 border border-white/10 shadow-2xl hover:shadow-indigo-500/20 transition-all duration-300 overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <h2 className="text-3xl font-bold mb-4 text-white">Stay Updated</h2>
              <p className="text-slate-300 mb-8">Get weekly insights on emerging skills, industry trends, and curated learning opportunities</p>
              
              {/* Social Media Icons */}
              <div className="flex justify-center gap-6 flex-wrap mb-8">
                
                {/* Twitter/X */}
                <a
                  href="https://twitter.com/edupath"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col items-center gap-3 transition-transform hover:scale-110"
                  title="Follow us on Twitter"
                >
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-lg rounded-2xl flex items-center justify-center border border-blue-500/30 group-hover:border-blue-400/60 group-hover:shadow-lg group-hover:shadow-blue-500/50 transition-all">
                    <svg className="w-10 h-10 text-blue-400 group-hover:text-blue-300 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                    </svg>
                  </div>
                  <span className="text-gray-400 font-medium text-sm group-hover:text-blue-400 transition-colors">Twitter</span>
                </a>

                {/* LinkedIn */}
                <a
                  href="https://linkedin.com/company/edupath"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col items-center gap-3 transition-transform hover:scale-110"
                  title="Follow us on LinkedIn"
                >
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-600/20 to-blue-700/20 backdrop-blur-lg rounded-2xl flex items-center justify-center border border-blue-600/30 group-hover:border-blue-500/60 group-hover:shadow-lg group-hover:shadow-blue-600/50 transition-all">
                    <svg className="w-10 h-10 text-blue-500 group-hover:text-blue-400 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </div>
                  <span className="text-gray-400 font-medium text-sm group-hover:text-blue-500 transition-colors">LinkedIn</span>
                </a>

                {/* GitHub */}
                <a
                  href="https://github.com/edupath"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col items-center gap-3 transition-transform hover:scale-110"
                  title="Follow us on GitHub"
                >
                  <div className="w-20 h-20 bg-gradient-to-br from-gray-600/20 to-gray-700/20 backdrop-blur-lg rounded-2xl flex items-center justify-center border border-gray-600/30 group-hover:border-gray-500/60 group-hover:shadow-lg group-hover:shadow-gray-600/50 transition-all">
                    <svg className="w-10 h-10 text-gray-400 group-hover:text-gray-300 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <span className="text-gray-400 font-medium text-sm group-hover:text-gray-300 transition-colors">GitHub</span>
                </a>

                {/* Discord */}
                <a
                  href="https://discord.gg/edupath"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col items-center gap-3 transition-transform hover:scale-110"
                  title="Join our Discord"
                >
                  <div className="w-20 h-20 bg-gradient-to-br from-indigo-500/20 to-purple-600/20 backdrop-blur-lg rounded-2xl flex items-center justify-center border border-indigo-500/30 group-hover:border-indigo-400/60 group-hover:shadow-lg group-hover:shadow-indigo-500/50 transition-all">
                    <svg className="w-10 h-10 text-indigo-400 group-hover:text-indigo-300 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                    </svg>
                  </div>
                  <span className="text-gray-400 font-medium text-sm group-hover:text-indigo-400 transition-colors">Discord</span>
                </a>

                {/* YouTube */}
                <a
                  href="https://youtube.com/@edupath"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col items-center gap-3 transition-transform hover:scale-110"
                  title="Subscribe on YouTube"
                >
                  <div className="w-20 h-20 bg-gradient-to-br from-red-500/20 to-red-600/20 backdrop-blur-lg rounded-2xl flex items-center justify-center border border-red-500/30 group-hover:border-red-400/60 group-hover:shadow-lg group-hover:shadow-red-500/50 transition-all">
                    <svg className="w-10 h-10 text-red-500 group-hover:text-red-400 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                  </div>
                  <span className="text-gray-400 font-medium text-sm group-hover:text-red-500 transition-colors">YouTube</span>
                </a>

              </div>

              <p className="text-xs text-slate-400 italic">No spam. Unsubscribe anytime. <span className="text-indigo-400 font-semibold">25,000+</span> professionals already subscribed.</p>
            </div>
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