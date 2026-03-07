import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import EduPathLogo from '../../component/EduPathLogo';

const FEATURES = [
  {
    id: 0,
    title: 'Skill Assessment',
    desc: 'Identify your current level with our AI-powered quiz engine.',
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    color: 'indigo',
    video: 'https://res.cloudinary.com/dmk1ekxzf/video/upload/v1772564071/How_to_Give_Assesement_r8rhac.mp4',
  },
  {
    id: 1,
    title: 'AI Roadmap',
    desc: 'Get a personalised learning path generated for your goals.',
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>,
    color: 'cyan',
    video: null,
  },
  {
    id: 2,
    title: 'Resume Analysis',
    desc: 'Upload your resume and receive AI-powered improvement tips.',
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
    color: 'purple',
    video: 'https://res.cloudinary.com/dmk1ekxzf/video/upload/v1772564129/How_to_Upload_Resume_twlaai.mp4',
  },
  {
    id: 3,
    title: 'Progress Tracking',
    desc: 'Visualise your growth with scores, streaks and analytics.',
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>,
    color: 'emerald',
    video: 'https://res.cloudinary.com/dmk1ekxzf/video/upload/v1772564003/Progress_Traking_wj1etg.mp4',
  },
];

const COLORS = {
  indigo:  { bg: 'bg-indigo-500/15',  border: 'border-indigo-500/40',  title: 'text-indigo-400',  icon: 'bg-indigo-500/20 border border-indigo-500/40 text-indigo-400',  dot: 'bg-indigo-400',  glow: 'shadow-indigo-500/20' },
  cyan:    { bg: 'bg-cyan-500/15',    border: 'border-cyan-500/40',    title: 'text-cyan-400',    icon: 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-400',    dot: 'bg-cyan-400',    glow: 'shadow-cyan-500/20' },
  purple:  { bg: 'bg-purple-500/15',  border: 'border-purple-500/40',  title: 'text-purple-400',  icon: 'bg-purple-500/20 border border-purple-500/40 text-purple-400',  dot: 'bg-purple-400',  glow: 'shadow-purple-500/20' },
  emerald: { bg: 'bg-emerald-500/15', border: 'border-emerald-500/40', title: 'text-emerald-400', icon: 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400', dot: 'bg-emerald-400', glow: 'shadow-emerald-500/20' },
};

const Home = () => {

  const navigate = useNavigate();

  const [activeFeature, setActiveFeature] = useState(0);
  const [videoVisible, setVideoVisible]   = useState(true);
  const [typedText, setTypedText]         = useState('');
  const [cursorVisible, setCursorVisible] = useState(true);
  const [heroReady, setHeroReady]         = useState(false);
  const videoRef   = useRef(null);
  const canvasRef  = useRef(null);

  const HERO_LINE1 = 'Your Personalized Path';
  const HERO_LINE2 = 'to Success';
  const FULL_TEXT  = HERO_LINE1 + '\n' + HERO_LINE2;

  // Typewriter effect on mount
  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setTypedText(FULL_TEXT.slice(0, i));
      if (i >= FULL_TEXT.length) {
        clearInterval(interval);
        setHeroReady(true);
      }
    }, 48);
    return () => clearInterval(interval);
  }, []);

  // Blinking cursor (stops when typing finishes)
  useEffect(() => {
    if (heroReady) {
      setCursorVisible(false);
      return;
    }
    const id = setInterval(() => setCursorVisible(v => !v), 530);
    return () => clearInterval(id);
  }, [heroReady]);

  const handleFeatureClick = (id) => {
    if (id === activeFeature) return;
    setVideoVisible(false);
    setTimeout(() => {
      setActiveFeature(id);
      setVideoVisible(true);
    }, 280);
  };

  // Dot-grid glow effect — scoped to hero section canvas (not body)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const SPACING = 38;   // grid gap in px
    const RADIUS  = 150;  // mouse influence radius
    const DOT_R   = 1.6;  // resting dot radius
    const GLOW_R  = 4.5;  // radius at full glow

    let W, H, animId;
    const mouse = { x: -9999, y: -9999 };
    let dots = [];

    const build = () => {
      const rect = canvas.parentElement.getBoundingClientRect();
      W = canvas.width  = rect.width;
      H = canvas.height = rect.height;
      dots = [];
      const cols = Math.ceil(W / SPACING) + 1;
      const rows = Math.ceil(H / SPACING) + 1;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          dots.push({ x: c * SPACING, y: r * SPACING });
        }
      }
    };
    build();
    window.addEventListener('resize', build);

    const onMove  = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };
    const onLeave = ()  => { mouse.x = -9999; mouse.y = -9999; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseleave', onLeave);

    const draw = () => {
      ctx.clearRect(0, 0, W, H);

      dots.forEach(d => {
        const dx   = mouse.x - d.x;
        const dy   = mouse.y - d.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const t    = dist < RADIUS ? 1 - dist / RADIUS : 0;

        const radius = DOT_R + t * (GLOW_R - DOT_R);
        const alpha  = 0.18 + t * 0.72;

        if (t > 0.01) {
          const hue = 240 + t * 50;
          const grd = ctx.createRadialGradient(d.x, d.y, 0, d.x, d.y, radius * 2.5);
          grd.addColorStop(0,   `hsla(${hue},90%,70%,${alpha * 0.8})`);
          grd.addColorStop(0.5, `hsla(${hue},80%,60%,${alpha * 0.35})`);
          grd.addColorStop(1,   `hsla(${hue},70%,50%,0)`);
          ctx.beginPath();
          ctx.arc(d.x, d.y, radius * 2.5, 0, Math.PI * 2);
          ctx.fillStyle = grd;
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(d.x, d.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = t > 0.01
          ? `hsla(${240 + t * 50},90%,78%,${0.55 + t * 0.45})`
          : 'rgba(148,163,184,0.18)';
        ctx.fill();
      });

      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', build);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    document.querySelectorAll('[data-animate]').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);



  return (
    <div className="bg-black font-sans">

        {/* SECTION 1: HERO */}
      <section data-section="0" className="min-h-svh flex flex-col justify-center items-center px-4 text-center relative overflow-hidden">
        {/* Dot-grid canvas — scoped to hero only, sits behind all content */}
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" style={{zIndex: 0}} />

        {/* All hero content sits above the canvas */}
        <div className="relative z-10 flex flex-col items-center text-center">
        {/* EduPath logo badge — fades in with buttons after typing */}
        <div
          style={{
            opacity: heroReady ? 1 : 0,
            transform: heroReady ? 'translateY(0)' : 'translateY(24px)',
            transition: 'opacity 0.7s ease 0.55s, transform 0.7s ease 0.55s',
          }}
          className="mb-8"
        >
          <EduPathLogo size={32} showText={true} fontSize={18} />
        </div>

        {/* Typewriter heading — Antigravity style */}
        <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight leading-tight min-h-[3.5em] md:min-h-[2.8em]">
          {(() => {
            const parts = typedText.split('\n');
            return (
              <>
                <span>{parts[0]}</span>
                {parts[1] !== undefined && (
                  <>
                    <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-cyan-400 to-emerald-400">
                      {parts[1]}
                    </span>
                  </>
                )}
                {/* Blinking cursor — hidden once typing completes */}
                {!heroReady && (
                  <span
                    style={{
                      display: 'inline-block',
                      width: '3px',
                      height: '0.85em',
                      background: 'rgb(99 102 241)',
                      marginLeft: '4px',
                      verticalAlign: 'middle',
                      borderRadius: '2px',
                      opacity: cursorVisible ? 1 : 0,
                      transition: 'opacity 0.1s',
                    }}
                  />
                )}
              </>
            );
          })()}
        </h1>

        <p
          className="mt-6 text-lg md:text-xl text-gray-300 max-w-3xl"
          style={{
            opacity: heroReady ? 1 : 0,
            transform: heroReady ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 0.7s ease 0.1s, transform 0.7s ease 0.1s',
          }}
        >
          Learn Smarter, Grow Faster with our AI-powered personalized learning platform
        </p>

        {/* Buttons — fade + slide in from below after typing done */}
        <div
          className="flex flex-col sm:flex-row gap-4 mt-8"
          style={{
            opacity: heroReady ? 1 : 0,
            transform: heroReady ? 'translateY(0)' : 'translateY(28px)',
            transition: 'opacity 0.7s ease 0.35s, transform 0.7s ease 0.35s',
          }}
        >
          <button
            className="backdrop-blur-lg bg-indigo-500/20 text-white px-8 py-4 rounded-xl font-bold border border-indigo-400/30 hover:bg-indigo-500/30 hover:border-indigo-400/50 hover:scale-105 hover:shadow-xl hover:shadow-indigo-500/50 transition-all duration-300 cursor-pointer"
            onClick={() => navigate('/assessment')}
          >
            Skill Assessment →
          </button>
          <button
            className="backdrop-blur-lg bg-white/5 text-white px-8 py-4 rounded-xl font-bold border border-white/15 hover:bg-white/10 hover:border-white/30 hover:scale-105 transition-all duration-300 cursor-pointer"
            onClick={() => navigate('/services')}
          >
            Explore EduPath
          </button>
        </div>
        </div>
      </section>

      <section data-section="1" className="py-20 px-6 relative z-10 bg-black">
        <div className="max-w-6xl mx-auto text-center">
          
          <h2 data-animate className="text-3xl md:text-5xl font-bold text-white mb-4">How It Works</h2>
          <p data-animate style={{transitionDelay: '0.1s'}} className="text-slate-500 mb-16">Three simple steps to transform your career</p>

          {/* Grid Container for 3 Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Card 1 */}
            <div data-animate style={{transitionDelay: '0s'}} className="relative backdrop-blur-lg bg-white/5 p-8 rounded-2xl border border-white/10 hover:border-blue-500/50 shadow-2xl hover:shadow-blue-500/30 text-left transition-all duration-300 hover:transform hover:scale-105 group">
              <div className="absolute -top-4 -left-4 w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-xl z-20">1</div>
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-sm rounded-lg flex items-center justify-center mb-6 text-blue-400 font-bold text-xl border border-blue-500/30 group-hover:border-blue-500/60 transition-all">◎</div>
                <h3 className="text-xl font-bold mb-2 text-white group-hover:text-blue-400 transition-colors">Quick Assessment</h3>
                <p className="text-slate-300 text-sm leading-relaxed">2-5 min career assessment to identify your current skills and goals</p>
              </div>
            </div>

            {/* Card 2 */}
            <div data-animate style={{transitionDelay: '0.15s'}} className="relative backdrop-blur-lg bg-white/5 p-8 rounded-2xl border border-white/10 hover:border-emerald-500/50 shadow-2xl hover:shadow-emerald-500/30 text-left transition-all duration-300 hover:transform hover:scale-105 group">
              <div className="absolute -top-4 -left-4 w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-xl z-20">2</div>
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 backdrop-blur-sm rounded-lg flex items-center justify-center mb-6 text-emerald-400 font-bold text-xl border border-emerald-500/30 group-hover:border-emerald-500/60 transition-all">↗</div>
                <h3 className="text-xl font-bold mb-2 text-white group-hover:text-emerald-400 transition-colors">Personalized Path</h3>
                <p className="text-slate-300 text-sm leading-relaxed">Get a custom learning roadmap with skills timeline and milestones</p>
              </div>
            </div>

            {/* Card 3 */}
            <div data-animate style={{transitionDelay: '0.3s'}} className="relative backdrop-blur-lg bg-white/5 p-8 rounded-2xl border border-white/10 hover:border-indigo-500/50 shadow-2xl hover:shadow-indigo-500/30 text-left transition-all duration-300 hover:transform hover:scale-105 group">
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

      {/* SECTION: Feature Showcase */}
      <section data-section="2" className="py-24 px-6 relative z-10 bg-black">
        <div className="max-w-6xl mx-auto">
          {/* Heading */}
          <div className="text-center mb-14">
            <div data-animate className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold tracking-widest uppercase mb-5" style={{backdropFilter:'blur(8px)'}}>
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-cyan-400 to-emerald-400">Explore Features</span>
            </div>
            <h2 data-animate style={{transitionDelay:'0.05s'}} className="text-3xl md:text-5xl font-bold text-white mb-4">
              Everything You Need to
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-cyan-400 to-emerald-400"> Grow Faster</span>
            </h2>
            <p data-animate style={{transitionDelay:'0.1s'}} className="text-slate-500 max-w-xl mx-auto">
              Click a feature to see it in action
            </p>
          </div>

          {/* Two-column layout */}
          <div data-animate style={{transitionDelay:'0.15s'}} className="flex flex-col lg:flex-row gap-6 items-start">

            {/* Left — Feature List */}
            <div className="flex flex-col gap-3 lg:w-[340px] w-full flex-shrink-0">
              {FEATURES.map((f) => {
                const active = activeFeature === f.id;
                const c = COLORS[f.color];
                return (
                  <button
                    key={f.id}
                    onClick={() => handleFeatureClick(f.id)}
                    className={`text-left w-full rounded-2xl border p-5 transition-all duration-300 backdrop-blur-lg ${
                      active
                        ? `${c.bg} ${c.border} shadow-xl ${c.glow}`
                        : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/8'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`mt-0.5 w-10 h-10 rounded-xl border flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                        active ? c.icon : 'bg-white/10 border-white/20 text-gray-400'
                      }`}>
                        {f.icon}
                      </div>
                      <div>
                        <div className={`font-semibold text-base transition-colors duration-300 ${
                          active ? c.title : 'text-white'
                        }`}>{f.title}</div>
                        <div className="text-gray-400 text-sm mt-1 leading-relaxed">{f.desc}</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Right — Video Preview */}
            <div className="flex-1 w-full">
              {/* Device frame */}
              <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-slate-900/60 backdrop-blur-xl shadow-2xl">
                {/* Browser bar */}
                <div className="flex items-center gap-2 px-4 py-3 bg-slate-900/80 border-b border-white/10">
                  <span className="w-3 h-3 rounded-full bg-red-500/70"></span>
                  <span className="w-3 h-3 rounded-full bg-yellow-500/70"></span>
                  <span className="w-3 h-3 rounded-full bg-green-500/70"></span>
                  <div className="ml-3 flex-1 bg-white/5 border border-white/10 rounded-md px-3 py-1 text-xs text-gray-500">
                    localhost:5173 — {FEATURES[activeFeature].title}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-400 border border-white/10 rounded-full px-2.5 py-1">
                    <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${COLORS[FEATURES[activeFeature].color].dot}`}></span>
                    Live Demo
                  </div>
                </div>

                {/* Video */}
                <div className="relative aspect-video overflow-hidden">
                  <div
                    style={{
                      opacity: videoVisible ? 1 : 0,
                      transform: videoVisible ? 'scale(1) translateY(0)' : 'scale(0.97) translateY(8px)',
                      transition: 'opacity 0.3s ease, transform 0.3s ease',
                      width: '100%',
                      height: '100%',
                    }}
                  >
                    {FEATURES[activeFeature].video ? (
                      <>
                        <video
                          ref={videoRef}
                          key={FEATURES[activeFeature].video}
                          src={FEATURES[activeFeature].video}
                          autoPlay
                          muted
                          loop
                          playsInline
                          disablePictureInPicture
                          className="w-full h-full object-cover pointer-events-none"
                        />
                        <div className={`absolute bottom-3 left-3 text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur-md border flex items-center gap-2 ${COLORS[FEATURES[activeFeature].color].bg} ${COLORS[FEATURES[activeFeature].color].border} ${COLORS[FEATURES[activeFeature].color].title}`}>
                          <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${COLORS[FEATURES[activeFeature].color].dot}`} />
                          <span>{FEATURES[activeFeature].title}</span>
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">

                        {/* Grid pattern */}
                        <div className="absolute inset-0 opacity-[0.07]" style={{backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '40px 40px'}} />

                        {/* Cyan glow blobs */}
                        <div className="absolute top-1/4 left-1/4 w-56 h-56 rounded-full blur-3xl opacity-10 bg-cyan-400" />
                        <div className="absolute bottom-1/4 right-1/4 w-40 h-40 rounded-full blur-3xl opacity-10 bg-indigo-500" />

                        {/* Fake roadmap UI preview */}
                        <div className="relative z-10 w-full max-w-sm px-6 flex flex-col gap-3">

                          {/* Title row */}
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                                {FEATURES[activeFeature].icon}
                              </div>
                              <span className="text-white font-semibold text-sm">Your AI Roadmap</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                              Coming Soon
                            </div>
                          </div>

                          {/* Roadmap steps */}
                          {[
                            { label: 'HTML & CSS Basics',     pct: 100, done: true  },
                            { label: 'JavaScript Fundamentals', pct: 72, done: false },
                            { label: 'React & Component Design', pct: 30, done: false },
                            { label: 'Node.js & REST APIs',    pct: 0,  done: false },
                          ].map((step, i) => (
                            <div key={i} className="flex items-center gap-3">
                              {/* dot + line */}
                              <div className="flex flex-col items-center flex-shrink-0">
                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${step.done ? 'bg-cyan-500 border-cyan-400' : step.pct > 0 ? 'bg-cyan-500/20 border-cyan-500/60' : 'bg-slate-700 border-slate-600'}`}>
                                  {step.done && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>}
                                </div>
                                {i < 3 && <div className={`w-px h-5 mt-0.5 ${step.done ? 'bg-cyan-500/50' : 'bg-slate-700'}`} />}
                              </div>
                              {/* content */}
                              <div className="flex-1 pb-2">
                                <div className="flex items-center justify-between mb-1">
                                  <span className={`text-xs font-medium ${step.done ? 'text-cyan-400' : step.pct > 0 ? 'text-white' : 'text-slate-500'}`}>{step.label}</span>
                                  <span className={`text-[10px] font-bold ${step.done ? 'text-cyan-400' : step.pct > 0 ? 'text-slate-300' : 'text-slate-600'}`}>{step.pct}%</span>
                                </div>
                                <div className="h-1 rounded-full bg-slate-700/60 overflow-hidden">
                                  <div
                                    className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-indigo-400"
                                    style={{width: `${step.pct}%`, opacity: step.pct === 0 ? 0.2 : 1}}
                                  />
                                </div>
                              </div>
                            </div>
                          ))}

                          {/* Bottom hint */}
                          <p className="text-center text-slate-600 text-[11px] mt-1">🚀 Full demo dropping soon</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section data-section="3" className="py-20 px-6 relative z-10 bg-black">
        <div className="max-w-6xl mx-auto text-center">
          <h2 data-animate className="text-3xl md:text-4xl font-bold mb-4">How Your Career Journey Works</h2>
          <p data-animate style={{transitionDelay: '0.1s'}} className="text-slate-500 max-w-2xl mx-auto mb-12">
            Our AI-powered career engine creates a personalized roadmap based on your current skills, interests, and market demand.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {[
              { title: "Skills Assessment", desc: "Take our comprehensive assessment to understand your level.", icon: "◎", color: "blue" },
              { title: "Personalized Path", desc: "Get a custom roadmap with courses, projects, and milestones.", icon: "📊", color: "emerald" },
              { title: "Learn & Build", desc: "Complete verified courses and build portfolio projects.", icon: "⟨⟩", color: "purple" },
              { title: "Get Hired", desc: "Connect with hiring partners and showcase your skills.", icon: "👥", color: "pink" }
            ].map((item, idx) => (
              <div key={idx} data-animate style={{transitionDelay: `${idx * 0.12}s`}} className="flex flex-col items-center group">
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

      <section data-section="4" className="py-20 px-6 relative z-10 bg-black">
        <div className="max-w-4xl mx-auto">
          {/* Contact Support Box */}
          <div data-animate className="relative backdrop-blur-lg bg-white/5 rounded-2xl p-8 md:p-12 text-center mb-20 border border-white/10 shadow-2xl transition-all duration-300">
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
          <div data-animate className="text-center mb-12">
             <span className="text-emerald-500 font-bold bg-emerald-50 px-4 py-1 rounded-full text-xs uppercase tracking-widest">Community Success</span>
             <h2 className="text-3xl font-bold mt-4"><span className="text-emerald-500">Real Stories</span> from Our Community</h2>
             <p className="text-slate-500 mt-2 max-w-2xl mx-auto text-sm">Join thousands of learners who have transformed their careers with LearnPath.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div data-animate style={{transitionDelay: '0s'}}>
              <div className="text-3xl font-black mb-1">10,000+</div>
              <div className="text-slate-400 text-sm">Success Stories</div>
            </div>
            <div data-animate style={{transitionDelay: '0.1s'}}>
              <div className="text-3xl font-black mb-1">85%</div>
              <div className="text-slate-400 text-sm">Career Transitions</div>
            </div>
            <div data-animate style={{transitionDelay: '0.2s'}}>
              <div className="text-3xl font-black mb-1">160%</div>
              <div className="text-slate-400 text-sm">Avg Salary Increase</div>
            </div>
            <div data-animate style={{transitionDelay: '0.3s'}}>
              <div className="text-3xl font-black mb-1">6 months</div>
              <div className="text-slate-400 text-sm">Avg Learning Time</div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Glow Text Section */}
      <section data-section="5" className="py-32 px-6 overflow-hidden relative z-10 bg-black">
        <div className="relative flex items-center justify-center min-h-[400px]">
          <h1 data-animate className="text-[120px] md:text-[180px] lg:text-[240px] font-black tracking-tighter leading-none uppercase text-white">
            EDUPATH
          </h1>
        </div>
      </section>

    </div>
  )
}

export default Home