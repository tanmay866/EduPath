import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Map, Zap, Star, Clock, CheckCircle2, ArrowRight, ChevronDown, BookOpen, Target, Brain, Award } from 'lucide-react';

const SUPPORTED_ROLES = [
  { label: 'MERN Developer',        color: 'text-indigo-300', bg: 'bg-indigo-500/10 border-indigo-500/25',  hover: 'pill-indigo' },
  { label: 'AI/ML Engineer',        color: 'text-violet-300', bg: 'bg-violet-500/10 border-violet-500/25',  hover: 'pill-violet' },
  { label: 'Data Science Engineer', color: 'text-cyan-300',   bg: 'bg-cyan-500/10 border-cyan-500/25',      hover: 'pill-cyan'   },
  { label: 'DevOps Engineer',       color: 'text-emerald-300',bg: 'bg-emerald-500/10 border-emerald-500/25',hover: 'pill-emerald'},
  { label: 'Mobile Developer',      color: 'text-amber-300',  bg: 'bg-amber-500/10 border-amber-500/25',    hover: 'pill-amber'  },
  { label: 'Cybersecurity Engineer',color: 'text-rose-300',   bg: 'bg-rose-500/10 border-rose-500/25',      hover: 'pill-rose'   },
];

const HOW_IT_WORKS = [
  {
    step: '01',
    icon: <Star size={22} className="text-indigo-400" />,
    title: 'Enter Your Details',
    desc: 'Tell us your target role, current skills, experience level, and how many hours a week you can dedicate.',
    accent: 'from-indigo-500/20 to-indigo-600/5',
    border: 'border-indigo-500/20 hover:border-indigo-500/50',
  },
  {
    step: '02',
    icon: <Zap size={22} className="text-violet-400" />,
    title: 'AI Generates Your Path',
    desc: 'Our AI analyses your skill gap vs the target role and creates a week-by-week, priority-ordered learning roadmap.',
    accent: 'from-violet-500/20 to-violet-600/5',
    border: 'border-violet-500/20 hover:border-violet-500/50',
  },
  {
    step: '03',
    icon: <Map size={22} className="text-cyan-400" />,
    title: 'Follow & Track Progress',
    desc: 'Work through each skill step by step. Mark them complete as you go and watch your progress bar fill up.',
    accent: 'from-cyan-500/20 to-cyan-600/5',
    border: 'border-cyan-500/20 hover:border-cyan-500/50',
  },
  {
    step: '04',
    icon: <Clock size={22} className="text-emerald-400" />,
    title: 'Revisit Any Time',
    desc: 'All generated roadmaps are saved to your history. Switch between them or generate a new one whenever you need.',
    accent: 'from-emerald-500/20 to-emerald-600/5',
    border: 'border-emerald-500/20 hover:border-emerald-500/50',
  },
];

const FEATURES = [
  {
    icon: '🎯',
    title: 'Skill Gap Analysis',
    desc: "We compare what you know against what the target role requires and surface exactly what's missing.",
    badge: 'Smart',
    badgeColor: 'bg-indigo-500/15 border-indigo-500/30 text-indigo-300',
    accent: 'from-indigo-500/20 to-indigo-600/5',
    border: 'border-indigo-500/20 hover:border-indigo-500/50',
  },
  {
    icon: '🗓️',
    title: 'Week-by-Week Schedule',
    desc: 'Every skill is assigned a specific week window and estimated hours so you always know what to do next.',
    badge: 'Structured',
    badgeColor: 'bg-violet-500/15 border-violet-500/30 text-violet-300',
    accent: 'from-violet-500/20 to-violet-600/5',
    border: 'border-violet-500/20 hover:border-violet-500/50',
  },
  {
    icon: '📚',
    title: 'Curated Resources',
    desc: 'Each step includes hand-picked learning resources — courses, docs, and tutorials — for maximum efficiency.',
    badge: 'Curated',
    badgeColor: 'bg-cyan-500/15 border-cyan-500/30 text-cyan-300',
    accent: 'from-cyan-500/20 to-cyan-600/5',
    border: 'border-cyan-500/20 hover:border-cyan-500/50',
  },
  {
    icon: '📈',
    title: 'Progress Tracking',
    desc: 'Mark skills as complete and watch a real-time progress bar update. Stay motivated as completion ticks up.',
    badge: 'Tracking',
    badgeColor: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300',
    accent: 'from-emerald-500/20 to-emerald-600/5',
    border: 'border-emerald-500/20 hover:border-emerald-500/50',
  },
  {
    icon: '💾',
    title: 'Saved History',
    desc: 'Every roadmap you generate is saved. Switch between multiple career paths or revisit old ones any time.',
    badge: 'Persistent',
    badgeColor: 'bg-amber-500/15 border-amber-500/30 text-amber-300',
    accent: 'from-amber-500/20 to-amber-600/5',
    border: 'border-amber-500/20 hover:border-amber-500/50',
  },
  {
    icon: '⚡',
    title: 'Instant Generation',
    desc: 'Your personalised roadmap is generated in seconds — no waiting, no setup, completely free to start.',
    badge: 'Fast',
    badgeColor: 'bg-rose-500/15 border-rose-500/30 text-rose-300',
    accent: 'from-rose-500/20 to-rose-600/5',
    border: 'border-rose-500/20 hover:border-rose-500/50',
  },
];

const STATS = [
  { value: '10+', label: 'Topics Available', icon: <BookOpen size={20} className="text-indigo-400 mb-3" strokeWidth={1.5} /> },
  { value: '3', label: 'Difficulty Levels', icon: <Target size={20} className="text-indigo-400 mb-3" strokeWidth={1.5} /> },
  { value: 'AI', label: 'Powered Engine', icon: <Brain size={20} className="text-indigo-400 mb-3" strokeWidth={1.5} /> },
  { value: '100%', label: 'Free to Use', icon: <Award size={20} className="text-indigo-400 mb-3" strokeWidth={1.5} /> },
];

const CareerRoadmap = () => {
  const navigate = useNavigate();

  // Typewriter
  const HEADLINE_1 = 'AI-Powered Career';
  const HEADLINE_2 = 'Roadmap Generator';
  const FULL_TEXT = HEADLINE_1 + '\n' + HEADLINE_2;
  const [typedText, setTypedText] = useState('');
  const [cursorVisible, setCursorVisible] = useState(true);
  const [heroReady, setHeroReady] = useState(false);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setTypedText(FULL_TEXT.slice(0, i));
      if (i >= FULL_TEXT.length) { clearInterval(interval); setHeroReady(true); }
    }, 55);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (heroReady) { setCursorVisible(false); return; }
    const id = setInterval(() => setCursorVisible(v => !v), 530);
    return () => clearInterval(id);
  }, [heroReady]);

  // Scroll-triggered animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        if (entry.isIntersecting) { entry.target.classList.add('animate-in'); observer.unobserve(entry.target); }
      }),
      { threshold: 0.1 }
    );
    document.querySelectorAll('[data-animate]').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white font-sans">

      {/* ── Hero ───────────────────────────────────────────────────── */}
      <section className="pt-32 pb-20 px-6 text-center relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-20 right-1/4 w-64 h-64 bg-violet-600/8 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto">
          <span className="inline-block text-xs font-semibold tracking-widest uppercase px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 mb-6">
            Personalized Learning Path
          </span>

          <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight mb-6 min-h-[2.6em] md:min-h-[2.2em]">
            {(() => {
              const parts = typedText.split('\n');
              return (
                <>
                  <span className="text-white">{parts[0]}</span>
                  {parts[1] !== undefined && (
                    <>
                      <br />
                      <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
                        {parts[1]}
                      </span>
                    </>
                  )}
                  {!heroReady && (
                    <span style={{ display: 'inline-block', width: '3px', height: '0.85em', background: 'rgb(99 102 241)', marginLeft: '4px', verticalAlign: 'middle', borderRadius: '2px', opacity: cursorVisible ? 1 : 0, transition: 'opacity 0.1s' }} />
                  )}
                </>
              );
            })()}
          </h1>

          <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed mb-10">
            Tell us your target role and current skills. Our AI instantly builds a personalised, week-by-week career roadmap — with resources, priorities, and progress tracking built in.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => navigate('/roadmap/generate')}
              className="px-8 py-3.5 rounded-xl font-bold bg-indigo-500 hover:bg-indigo-400 hover:scale-105 hover:shadow-lg hover:shadow-indigo-500/40 transition-all duration-300 cursor-pointer text-white flex items-center gap-2"
            >
              Generate My Roadmap <ArrowRight size={16} />
            </button>
            <button
              onClick={() => navigate('/roadmap/generate')}
              className="px-8 py-3.5 rounded-xl font-bold bg-white/5 border border-white/15 hover:bg-white/10 hover:border-white/30 hover:scale-105 transition-all duration-300 cursor-pointer"
            >
              View History
            </button>
          </div>

          <div className="mt-14 flex justify-center animate-bounce">
            <ChevronDown size={22} className="text-slate-600" />
          </div>
        </div>
      </section>

      {/* ── Stats ──────────────────────────────────────────────────── */}
      <section className="py-12 px-6 border-y border-white/5">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map((s, i) => (
            <div key={s.label} data-animate className="opacity-0 translate-y-4 !transition-all !duration-700 !ease-out group" style={{ transitionDelay: `${i * 0.1}s` }}>
              <div className="h-full flex flex-col items-center justify-center p-6 rounded-2xl bg-[#090b14] border border-white/5 hover:bg-[#0c0e1a] transition-colors relative overflow-hidden">
                {s.icon}
                <p className="text-2xl md:text-3xl font-bold text-white mb-1.5">{s.value}</p>
                <p className="text-[13px] text-slate-400">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Supported Roles ────────────────────────────────────────── */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 data-animate className="text-2xl md:text-3xl font-bold mb-3 opacity-0 translate-y-4 transition-all duration-500">
            Supported Career Paths
          </h2>
          <p data-animate className="text-slate-500 mb-8 opacity-0 translate-y-4 transition-all duration-500" style={{ transitionDelay: '0.1s' }}>
            Roadmaps are available for these high-demand tech roles.
          </p>

          <style>{`
            .career-pill {
              cursor: default;
              transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1), border-color 0.3s ease, box-shadow 0.3s ease, background 0.3s ease, color 0.3s ease;
            }
            .career-pill:hover { transform: translateY(-4px) scale(1.06); }
            .pill-indigo:hover  { border-color: rgba(99,102,241,0.6)  !important; background: rgba(99,102,241,0.2)  !important; box-shadow: 0 6px 24px -4px rgba(99,102,241,0.35);  color: #c7d2fe !important; }
            .pill-violet:hover  { border-color: rgba(139,92,246,0.6)  !important; background: rgba(139,92,246,0.2)  !important; box-shadow: 0 6px 24px -4px rgba(139,92,246,0.35);  color: #ddd6fe !important; }
            .pill-cyan:hover    { border-color: rgba(34,211,238,0.6)  !important; background: rgba(34,211,238,0.15) !important; box-shadow: 0 6px 24px -4px rgba(34,211,238,0.3);   color: #a5f3fc !important; }
            .pill-emerald:hover { border-color: rgba(52,211,153,0.6)  !important; background: rgba(52,211,153,0.15) !important; box-shadow: 0 6px 24px -4px rgba(52,211,153,0.3);   color: #a7f3d0 !important; }
            .pill-amber:hover   { border-color: rgba(251,191,36,0.6)  !important; background: rgba(251,191,36,0.15) !important; box-shadow: 0 6px 24px -4px rgba(251,191,36,0.3);   color: #fde68a !important; }
            .pill-rose:hover    { border-color: rgba(251,113,133,0.6) !important; background: rgba(251,113,133,0.15)!important; box-shadow: 0 6px 24px -4px rgba(251,113,133,0.3);  color: #fecdd3 !important; }
          `}</style>

          <div className="flex flex-wrap justify-center gap-3">
            {SUPPORTED_ROLES.map((role, i) => (
              <span
                key={role.label}
                data-animate
                className={`career-pill ${role.hover} px-5 py-2.5 rounded-full text-sm font-bold border ${role.bg} ${role.color} opacity-0 translate-y-4 transition-all duration-500`}
                style={{ transitionDelay: `${i * 0.07}s` }}
              >
                {role.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features Grid ──────────────────────────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 data-animate className="text-3xl md:text-4xl font-bold mb-4 opacity-0 translate-y-4 transition-all duration-500">
              What's Included
            </h2>
            <p data-animate className="text-slate-500 max-w-xl mx-auto opacity-0 translate-y-4 transition-all duration-500" style={{ transitionDelay: '0.1s' }}>
              Everything you need to learn the right things, in the right order, at the right pace.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature, i) => (
              <div
                key={feature.title}
                data-animate
                className={`group relative rounded-2xl border bg-gradient-to-br ${feature.accent} ${feature.border} p-7 flex flex-col gap-4 opacity-0 translate-y-6 !transition-all !duration-700 !ease-out hover:shadow-2xl hover:-translate-y-3`}
                style={{ transitionDelay: `${i * 0.08}s` }}
              >
                <span className={`self-start text-[11px] font-semibold px-3 py-1 rounded-full border ${feature.badgeColor}`}>
                  {feature.badge}
                </span>
                <span className="text-4xl leading-none">{feature.icon}</span>
                <div>
                  <h3 className="text-white font-bold text-lg mb-2">{feature.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ───────────────────────────────────────────── */}
      <section className="py-20 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 data-animate className="text-3xl md:text-4xl font-bold mb-4 opacity-0 translate-y-4 transition-all duration-500">
              How It Works
            </h2>
            <p data-animate className="text-slate-500 max-w-xl mx-auto opacity-0 translate-y-4 transition-all duration-500" style={{ transitionDelay: '0.1s' }}>
              From your first input to a fully structured career plan in seconds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOW_IT_WORKS.map((step, i) => (
              <div
                key={step.step}
                data-animate
                className={`group relative rounded-2xl border bg-gradient-to-br ${step.accent} ${step.border} p-7 flex flex-col gap-4 opacity-0 translate-y-6 !transition-all !duration-700 !ease-out hover:shadow-2xl hover:-translate-y-3`}
                style={{ transitionDelay: `${i * 0.1}s` }}
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                    {step.icon}
                  </div>
                  <span className="text-4xl font-black text-white/8 select-none">{step.step}</span>
                </div>
                <div>
                  <h3 className="text-white font-bold text-base mb-2">{step.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── What you get preview ───────────────────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 data-animate className="text-3xl md:text-4xl font-bold mb-4 opacity-0 translate-y-4 transition-all duration-500">
              A Sample Roadmap Step
            </h2>
            <p data-animate className="text-slate-500 max-w-xl mx-auto opacity-0 translate-y-4 transition-all duration-500" style={{ transitionDelay: '0.1s' }}>
              Here's what each step in your generated roadmap looks like.
            </p>
          </div>

          {/* Mock card */}
          <div
            data-animate
            className="group relative rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 to-transparent p-6 opacity-0 translate-y-6 !transition-all !duration-700 !ease-out hover:shadow-[0_0_40px_-10px_rgba(99,102,241,0.2)] hover:-translate-y-2 overflow-hidden space-y-4"
          >
            {/* Animated background glow */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            <div className="relative z-10">
              {/* Mock progress */}
              <div className="flex items-center justify-between text-sm text-slate-300 mb-1">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400" /> 3 Completed</span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400" /> 5 Remaining</span>
                </div>
                <span className="text-indigo-300 font-bold">37%</span>
              </div>
              <div className="h-2.5 bg-white/10 rounded-full overflow-hidden relative">
                <style>{`
                @keyframes progress-stripes {
                  0% { background-position: 1rem 0; }
                  100% { background-position: 0 0; }
                }
              `}</style>
                <div className="h-full w-[37%] bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full relative overflow-hidden">
                  <div className="absolute inset-0 bg-[image:repeating-linear-gradient(45deg,rgba(255,255,255,0.15)_0,rgba(255,255,255,0.15)_25%,transparent_25%,transparent_50%)] bg-[length:1rem_1rem] animate-[progress-stripes_1s_linear_infinite]" />
                </div>
              </div>

              {/* Mock step */}
              <div className="rounded-xl border border-white/10 bg-white/5 p-5 flex gap-4 mt-4">
                <CheckCircle2 size={20} className="text-emerald-400 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] uppercase tracking-widest text-slate-500 font-semibold mb-1">Step 1 · Completed</p>
                  <h3 className="text-base font-bold text-emerald-300 line-through decoration-emerald-500/40">HTML & CSS Fundamentals</h3>
                  <p className="text-xs text-slate-500 mt-1">Frontend Basics · Week 1–2 · 20 hrs</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {['MDN Web Docs', 'CSS-Tricks Guide', 'freeCodeCamp'].map(r => (
                      <span key={r} className="px-3 py-1 rounded-full border border-white/12 bg-white/5 text-[11px] text-slate-300 hover:bg-white/10 hover:text-white transition-colors cursor-default">{r}</span>
                    ))}
                  </div>
                </div>
                <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full self-start bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  Beginner
                </span>
              </div>

              <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-5 flex gap-4 group/step hover:bg-indigo-500/10 transition-colors duration-300">
                <div className="relative w-5 h-5 shrink-0 mt-0.5">
                  <div className="absolute inset-0 rounded-full border-2 border-indigo-400" />
                  <div className="absolute inset-0 rounded-full border-2 border-indigo-400 animate-ping opacity-75" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] uppercase tracking-widest text-slate-500 font-semibold mb-1">Step 2 · Up Next</p>
                  <h3 className="text-base font-bold text-white">JavaScript Essentials</h3>
                  <p className="text-xs text-slate-500 mt-1">Frontend Logic · Week 3–5 · 30 hrs</p>
                </div>
                <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full self-start bg-amber-500/15 text-amber-300 border border-amber-500/30 group-hover/step:bg-amber-500/25 transition-colors duration-300">
                  Intermediate
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA Banner ─────────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div
            data-animate
            className="rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 via-violet-500/5 to-transparent p-12 opacity-0 translate-y-6 transition-all duration-600"
          >
            <h2 className="text-3xl md:text-4xl font-black mb-4">
              Ready to map your career?
            </h2>
            <p className="text-slate-400 mb-8 max-w-lg mx-auto">
              Generate your personalised AI roadmap in seconds and start learning with clarity and purpose.
            </p>
            <button
              onClick={() => navigate('/roadmap/generate')}
              className="px-10 py-4 rounded-xl font-bold bg-indigo-500 hover:bg-indigo-400 hover:scale-105 hover:shadow-xl hover:shadow-indigo-500/40 transition-all duration-300 text-white inline-flex items-center gap-2"
            >
              Generate My Roadmap <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};

export default CareerRoadmap;
