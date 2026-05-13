import React, { useEffect, useState } from 'react'
import { Brain, Target, Users, Zap, BookOpen, Award, TrendingUp, Shield } from 'lucide-react'

const About = () => {

  const LINE1 = 'Building the Future of'
  const LINE2 = 'Career Growth'
  const FULL_TEXT = LINE1 + '\n' + LINE2

  const [typedText, setTypedText] = useState('')
  const [cursorVisible, setCursorVisible] = useState(true)
  const [heroReady, setHeroReady] = useState(false)

  useEffect(() => {
    let i = 0
    const interval = setInterval(() => {
      i++
      setTypedText(FULL_TEXT.slice(0, i))
      if (i >= FULL_TEXT.length) {
        clearInterval(interval)
        setHeroReady(true)
      }
    }, 55)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (heroReady) { setCursorVisible(false); return }
    const id = setInterval(() => setCursorVisible(v => !v), 530)
    return () => clearInterval(id)
  }, [heroReady])

  // Scroll-triggered fade-up
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('fade-in-up')
          observer.unobserve(entry.target)
        }
      }),
      { threshold: 0.08 }
    )
    document.querySelectorAll('[data-animate]').forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  const features = [
    {
      icon: <Brain size={24} />,
      title: 'AI-Powered Assessments',
      description: 'Our intelligent quiz engine generates personalized questions based on your skill level, topic, and experience — powered by cutting-edge AI models.',
      color: 'text-indigo-400', bg: 'bg-indigo-500/15 border-indigo-500/25',
    },
    {
      icon: <Target size={24} />,
      title: 'Skill Gap Analysis',
      description: 'Get detailed insights into your strengths and weaknesses after every assessment, with actionable recommendations to improve.',
      color: 'text-purple-400', bg: 'bg-purple-500/15 border-purple-500/25',
    },
    {
      icon: <BookOpen size={24} />,
      title: 'Resume Builder',
      description: 'Create professional resumes tailored to your skills and experience. Our AI parses and enhances your resume content automatically.',
      color: 'text-cyan-400', bg: 'bg-cyan-500/15 border-cyan-500/25',
    },
    {
      icon: <TrendingUp size={24} />,
      title: 'Progress Tracking',
      description: 'Track your quiz history, average scores, and improvement over time with visual dashboards and performance cards.',
      color: 'text-emerald-400', bg: 'bg-emerald-500/15 border-emerald-500/25',
    },
    {
      icon: <Zap size={24} />,
      title: 'Instant Feedback',
      description: 'Receive immediate, detailed explanations for every answer — right and wrong — helping you learn faster and retain more.',
      color: 'text-amber-400', bg: 'bg-amber-500/15 border-amber-500/25',
    },
    {
      icon: <Shield size={24} />,
      title: 'Secure & Private',
      description: 'Your data is protected with JWT authentication, encrypted passwords, and secure cloud storage. Your progress is always safe.',
      color: 'text-rose-400', bg: 'bg-rose-500/15 border-rose-500/25',
    },
  ]

  const stats = [
    { value: '10+', label: 'Topics Available', icon: <BookOpen size={18} /> },
    { value: '3',   label: 'Difficulty Levels', icon: <Target size={18} /> },
    { value: 'AI',  label: 'Powered Engine',   icon: <Brain size={18} /> },
    { value: '100%',label: 'Free to Use',       icon: <Award size={18} /> },
  ]

  const missionPoints = [
    'Personalized AI-generated assessments',
    'Real-time performance feedback',
    'Resume building with AI assistance',
    'Progress tracking over time',
    'Multi-topic, multi-difficulty support',
  ]

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">

      {/* Unified Animated Background */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(circle, rgba(99,102,241,0.1) 1px, transparent 1px)',
          backgroundSize: '36px 36px',
        }} />
        <div style={{
          position: 'absolute', top: '5%', left: '8%',
          width: 480, height: 480, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.05), transparent 70%)',
          animation: 'aOrb1 18s ease-in-out infinite alternate',
        }} />
        <div style={{
          position: 'absolute', bottom: '8%', right: '6%',
          width: 380, height: 380, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.04), transparent 70%)',
          animation: 'aOrb2 22s ease-in-out infinite alternate',
        }} />
        <div style={{
          position: 'absolute', top: '45%', right: '22%',
          width: 280, height: 280, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(20,184,166,0.03), transparent 70%)',
          animation: 'aOrb1 28s ease-in-out infinite alternate-reverse',
        }} />
      </div>

      <style>{`
        @keyframes aOrb1 {
          from { transform: translate(0,0) scale(1); }
          to   { transform: translate(40px,30px) scale(1.08); }
        }
        @keyframes aOrb2 {
          from { transform: translate(0,0) scale(1); }
          to   { transform: translate(-35px,-25px) scale(1.06); }
        }
        .mission-point {
          position: relative;
          transform: translateX(0);
          transition: transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease, background 0.3s ease;
        }
        .mission-point:hover {
          transform: translateX(6px);
          border-color: rgba(99,102,241,0.4) !important;
          background: rgba(99,102,241,0.05) !important;
          box-shadow: 0 0 24px -6px rgba(99,102,241,0.2), inset 0 0 0 1px rgba(99,102,241,0.1);
        }
        .mission-point::before {
          content: '';
          position: absolute; left: 0; top: 50%; transform: translateY(-50%);
          width: 3px; height: 0; border-radius: 0 3px 3px 0;
          background: linear-gradient(180deg, #6366f1, #38bdf8);
          transition: height 0.3s ease;
        }
        .mission-point:hover::before { height: 60%; }
        .mission-point .mp-dot {
          transition: transform 0.35s cubic-bezier(0.34,1.56,0.64,1), background 0.3s ease;
        }
        .mission-point:hover .mp-dot {
          transform: scale(1.4);
          background: #818cf8;
        }
        .mission-point .mp-icon {
          transition: background 0.3s ease, border-color 0.3s ease, transform 0.35s cubic-bezier(0.34,1.56,0.64,1);
        }
        .mission-point:hover .mp-icon {
          background: rgba(99,102,241,0.3);
          border-color: rgba(99,102,241,0.5);
          transform: scale(1.1);
        }
        .mission-point .mp-text {
          transition: color 0.3s ease;
        }
        .mission-point:hover .mp-text { color: #e0e7ff; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        [data-animate] { opacity: 0; transform: translateY(28px); }
        [data-animate].fade-in-up { animation: fadeUp 0.65s cubic-bezier(0.22,1,0.36,1) forwards; }
      `}</style>

      {/* ── HERO ── */}
      <section className="relative z-10 pt-36 pb-20 px-8 text-center">
        <div className="max-w-4xl mx-auto">
          <div data-animate style={{ animationDelay: '0s' }} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-widest mb-8">
            <Users size={12} />
            About EduPath
          </div>

          <h1 className="text-5xl md:text-6xl font-black text-white mb-6 leading-tight tracking-tight min-h-[2.4em] md:min-h-[2em]">
            {(() => {
              const parts = typedText.split('\n')
              return (
                <>
                  <span className="text-white">{parts[0]}</span>
                  {parts[1] !== undefined && (
                    <>
                      {' '}
                      <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                        {parts[1]}
                      </span>
                    </>
                  )}
                  {!heroReady && (
                    <span style={{
                      display: 'inline-block', width: '3px', height: '0.85em',
                      background: 'rgb(99 102 241)', marginLeft: '4px',
                      verticalAlign: 'middle', borderRadius: '2px',
                      opacity: cursorVisible ? 1 : 0, transition: 'opacity 0.1s',
                    }} />
                  )}
                </>
              )
            })()}
          </h1>

          <p data-animate style={{ animationDelay: '0.15s' }} className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            EduPath is an AI-powered learning and assessment platform designed to help students and professionals identify skill gaps, build resumes, and accelerate their career journey.
          </p>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="relative z-10 px-8 pb-20">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, i) => (
              <div
                key={i}
                data-animate
                style={{ animationDelay: `${0.1 + i * 0.1}s` }}
                className="backdrop-blur-3xl bg-[#090b14]/70 rounded-[1.5rem] border border-white/5 shadow-2xl p-6 text-center group hover:border-white/10 transition-all duration-500"
              >
                <div className="flex justify-center mb-3">
                  <div className="p-2.5 bg-indigo-500/15 border border-indigo-500/25 rounded-xl text-indigo-400">
                    {stat.icon}
                  </div>
                </div>
                <div className="text-3xl font-black text-white tracking-tight">{stat.value}</div>
                <div className="text-xs text-slate-500 mt-1.5 font-medium uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MISSION ── */}
      <section className="relative z-10 px-8 pb-20">
        <div className="max-w-5xl mx-auto">
          <div data-animate style={{ animationDelay: '0.1s' }} className="backdrop-blur-3xl bg-[#090b14]/70 rounded-[1.5rem] border border-white/5 shadow-2xl p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[11px] font-bold uppercase tracking-widest mb-5">
                  Our Mission
                </div>
                <h2 className="text-3xl font-black text-white tracking-tight mb-5 leading-tight">
                  Democratizing Skills <br/>
                  <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">for Everyone</span>
                </h2>
                <p className="text-slate-400 leading-relaxed mb-4 text-sm">
                  We believe everyone deserves access to high-quality, personalized skill assessments. EduPath removes the guesswork from learning by using AI to generate relevant, dynamic quizzes tailored to your exact experience and goals.
                </p>
                <p className="text-slate-400 leading-relaxed text-sm">
                  Whether you're a student preparing for your first job or a professional looking to upskill, EduPath helps you understand exactly where you stand and what to do next.
                </p>
              </div>

              <div className="space-y-3">
                {missionPoints.map((item, i) => (
                  <div key={i} className="mission-point flex items-center gap-3 p-3.5 bg-[#0a0a0a] border border-white/5 rounded-xl">
                    <div className="mp-icon w-6 h-6 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center flex-shrink-0">
                      <div className="mp-dot w-2 h-2 rounded-full bg-indigo-400" />
                    </div>
                    <span className="mp-text text-slate-300 text-sm font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="relative z-10 px-8 pb-28">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div data-animate style={{ animationDelay: '0s' }} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-widest mb-5">
              <Zap size={12} />
              What We Offer
            </div>
            <h2 data-animate style={{ animationDelay: '0.1s' }} className="text-4xl font-black text-white tracking-tight mb-3">
              Everything You Need to <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">Grow</span>
            </h2>
            <p data-animate style={{ animationDelay: '0.2s' }} className="text-slate-400 text-sm max-w-md mx-auto">Comprehensive tools built to accelerate your skills and career trajectory.</p>
          </div>

          <style>{`
            .feature-card { position: relative; overflow: hidden; }
            .feature-card::before {
              content: '';
              position: absolute; inset: 0; border-radius: 1.5rem;
              opacity: 0; transition: opacity 0.4s ease;
              pointer-events: none;
            }
            .feature-card:hover::before { opacity: 1; }
            .feature-card.indigo:hover  { border-color: rgba(99,102,241,0.45)  !important; box-shadow: 0 0 40px -8px rgba(99,102,241,0.25),  0 20px 60px -15px rgba(99,102,241,0.15);  }
            .feature-card.purple:hover  { border-color: rgba(168,85,247,0.45)  !important; box-shadow: 0 0 40px -8px rgba(168,85,247,0.25),  0 20px 60px -15px rgba(168,85,247,0.15);  }
            .feature-card.cyan:hover    { border-color: rgba(34,211,238,0.45)  !important; box-shadow: 0 0 40px -8px rgba(34,211,238,0.25),   0 20px 60px -15px rgba(34,211,238,0.15);   }
            .feature-card.emerald:hover { border-color: rgba(52,211,153,0.45)  !important; box-shadow: 0 0 40px -8px rgba(52,211,153,0.25),   0 20px 60px -15px rgba(52,211,153,0.15);   }
            .feature-card.amber:hover   { border-color: rgba(251,191,36,0.45)  !important; box-shadow: 0 0 40px -8px rgba(251,191,36,0.25),   0 20px 60px -15px rgba(251,191,36,0.15);   }
            .feature-card.rose:hover    { border-color: rgba(251,113,133,0.45) !important; box-shadow: 0 0 40px -8px rgba(251,113,133,0.25),  0 20px 60px -15px rgba(251,113,133,0.15);  }

            .feature-card .feat-icon    { transition: transform 0.35s cubic-bezier(0.34,1.56,0.64,1), filter 0.35s ease; }
            .feature-card:hover .feat-icon { transform: scale(1.18) rotate(-4deg); filter: brightness(1.3); }

            .feature-card .feat-title   { transition: color 0.3s ease; }
            .feature-card.indigo:hover  .feat-title { color: #a5b4fc; }
            .feature-card.purple:hover  .feat-title { color: #d8b4fe; }
            .feature-card.cyan:hover    .feat-title { color: #67e8f9; }
            .feature-card.emerald:hover .feat-title { color: #6ee7b7; }
            .feature-card.amber:hover   .feat-title { color: #fcd34d; }
            .feature-card.rose:hover    .feat-title { color: #fda4af; }

            .feature-card { transform: translateY(0); transition: transform 0.35s ease, border-color 0.35s ease, box-shadow 0.35s ease; }
            .feature-card:hover { transform: translateY(-6px); }
          `}</style>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature, i) => {
              const accent = ['indigo','purple','cyan','emerald','amber','rose'][i];
              return (
                <div
                  key={i}
                  data-animate
                  style={{ animationDelay: `${0.1 + i * 0.08}s` }}
                  className={`feature-card ${accent} backdrop-blur-3xl bg-[#090b14]/70 rounded-[1.5rem] border border-white/5 shadow-2xl p-6`}
                >
                  {/* Subtle inner glow on hover */}
                  <div className={`w-12 h-12 rounded-xl border flex items-center justify-center mb-5 feat-icon ${feature.bg} ${feature.color}`}>
                    {feature.icon}
                  </div>
                  <h3 className="feat-title font-black text-lg mb-2.5 tracking-tight text-white">{feature.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

    </div>
  )
}

export default About
