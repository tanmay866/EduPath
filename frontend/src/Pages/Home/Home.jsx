import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom';

const Home = () => {

  const navigate = useNavigate();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const glowTextRef = useRef(null);

  const handleMouseMove = (e) => {
    if (glowTextRef.current) {
      const rect = glowTextRef.current.getBoundingClientRect();
      setMousePosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  const calculateGlow = (index, totalLetters) => {
    if (!glowTextRef.current) return {};
    
    const letterElements = glowTextRef.current.querySelectorAll('.glow-letter');
    if (!letterElements[index]) return {};
    
    const rect = letterElements[index].getBoundingClientRect();
    const parentRect = glowTextRef.current.getBoundingClientRect();
    
    const letterCenterX = rect.left + rect.width / 2 - parentRect.left;
    const letterCenterY = rect.top + rect.height / 2 - parentRect.top;
    
    const distance = Math.sqrt(
      Math.pow(mousePosition.x - letterCenterX, 2) + 
      Math.pow(mousePosition.y - letterCenterY, 2)
    );
    
    // Spotlight parameters
    const spotlightRadius = 180;
    const falloffPower = 2; // Exponential falloff for realistic spotlight
    
    // Calculate intensity with smooth exponential falloff
    let intensity = 0;
    if (distance < spotlightRadius) {
      const normalizedDistance = distance / spotlightRadius;
      intensity = Math.pow(1 - normalizedDistance, falloffPower);
    }
    
    // Base outline color
    const baseGray = 'rgba(100, 116, 139, 0.4)';
    
    // Spotlight colors (brighter and more vibrant)
    const spotlightColor = `rgba(16, 185, 129, ${0.5 + intensity * 0.5})`;
    
    return {
      WebkitTextFillColor: 'transparent',
      WebkitTextStrokeWidth: '3px',
      WebkitTextStrokeColor: intensity > 0.05 ? spotlightColor : baseGray,
      filter: intensity > 0.05 
        ? `drop-shadow(0 0 ${15 + intensity * 60}px rgba(16, 185, 129, ${intensity * 1}))
           drop-shadow(0 0 ${25 + intensity * 90}px rgba(34, 197, 94, ${intensity * 0.8}))
           drop-shadow(0 0 ${35 + intensity * 120}px rgba(52, 211, 153, ${intensity * 0.6}))
           drop-shadow(0 0 ${45 + intensity * 150}px rgba(16, 185, 129, ${intensity * 0.4}))
           brightness(${1 + intensity * 0.5})`
        : 'none',
      transition: 'all 0.1s ease-out'
    };
  };

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
        <div className="max-w-4xl mx-auto">
          {/* Contact Support Box */}
          <div className="relative backdrop-blur-lg bg-white/5 rounded-2xl p-8 md:p-12 text-center mb-20 border border-white/10 shadow-2xl transition-all duration-300">
            <div className="relative z-10">
              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-white">Still have questions?</h2>
              <p className="text-slate-200 mb-6 max-w-xl mx-auto leading-relaxed">Can't find the answer you're looking for? Our support team is here to help you every step of the way.</p>
              
              <button 
                onClick={() => navigate('/contact')}
                className="backdrop-blur-lg bg-indigo-500/20 text-white px-8 py-4 rounded-xl font-bold border border-indigo-400/30 hover:bg-indigo-500/30 hover:border-indigo-400/50 hover:scale-105 hover:shadow-xl hover:shadow-indigo-500/50 transition-all duration-300 cursor-pointer"
              >
                Contact Support →
              </button>

              <p className="text-sm text-slate-300 italic mt-5">Average response time: <span className="text-emerald-400 font-semibold">under 24 hours</span></p>
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

      {/* Interactive Glow Text Section */}
      <section className="py-32 px-6 bg-black overflow-hidden">
        <div 
          ref={glowTextRef}
          onMouseMove={handleMouseMove}
          className="relative flex items-center justify-center min-h-[400px] cursor-default select-none"
        >
          <h1 className="text-[120px] md:text-[180px] lg:text-[240px] font-black tracking-tighter leading-none uppercase">
            {'EDUPATH'.split('').map((letter, index) => (
              <span
                key={index}
                className="glow-letter inline-block"
                style={calculateGlow(index, 7)}
              >
                {letter}
              </span>
            ))}
          </h1>
        </div>
      </section>

    </div>
  )
}

export default Home