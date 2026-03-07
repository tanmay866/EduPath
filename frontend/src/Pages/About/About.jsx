import React, { useEffect, useState } from 'react'
import BackgroundAnimation from '../Assessment/AssesmentDashboard/components/BackgroundAnimation'
import { Brain, Target, Users, Zap, BookOpen, Award, TrendingUp, Shield } from 'lucide-react'

const About = () => {

  const LINE1 = 'Building the Future of'
  const LINE2 = 'Career Growth'
  const FULL_TEXT = LINE1 + '\n' + LINE2

  const [typedText, setTypedText] = useState('')
  const [cursorVisible, setCursorVisible] = useState(true)
  const [heroReady, setHeroReady] = useState(false)

  // Typewriter
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

  // Blinking cursor — stops when done
  useEffect(() => {
    if (heroReady) {
      setCursorVisible(false)
      return
    }
    const id = setInterval(() => setCursorVisible(v => !v), 530)
    return () => clearInterval(id)
  }, [heroReady])

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

  const features = [
    {
      icon: <Brain size={28} />,
      title: 'AI-Powered Assessments',
      description: 'Our intelligent quiz engine generates personalized questions based on your skill level, topic, and experience — powered by cutting-edge AI models.',
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/10 border-indigo-500/20',
    },
    {
      icon: <Target size={28} />,
      title: 'Skill Gap Analysis',
      description: 'Get detailed insights into your strengths and weaknesses after every assessment, with actionable recommendations to improve.',
      color: 'text-purple-400',
      bg: 'bg-purple-500/10 border-purple-500/20',
    },
    {
      icon: <BookOpen size={28} />,
      title: 'Resume Builder',
      description: 'Create professional resumes tailored to your skills and experience. Our AI parses and enhances your resume content automatically.',
      color: 'text-teal-400',
      bg: 'bg-teal-500/10 border-teal-500/20',
    },
    {
      icon: <TrendingUp size={28} />,
      title: 'Progress Tracking',
      description: 'Track your quiz history, average scores, and improvement over time with visual dashboards and performance cards.',
      color: 'text-green-400',
      bg: 'bg-green-500/10 border-green-500/20',
    },
    {
      icon: <Zap size={28} />,
      title: 'Instant Feedback',
      description: 'Receive immediate, detailed explanations for every answer — right and wrong — helping you learn faster and retain more.',
      color: 'text-yellow-400',
      bg: 'bg-yellow-500/10 border-yellow-500/20',
    },
    {
      icon: <Shield size={28} />,
      title: 'Secure & Private',
      description: 'Your data is protected with JWT authentication, encrypted passwords, and secure cloud storage. Your progress is always safe.',
      color: 'text-red-400',
      bg: 'bg-red-500/10 border-red-500/20',
    },
  ]

  const stats = [
    { value: '10+', label: 'Topics Available', icon: <BookOpen size={20} /> },
    { value: '3', label: 'Difficulty Levels', icon: <Target size={20} /> },
    { value: 'AI', label: 'Powered Engine', icon: <Brain size={20} /> },
    { value: '100%', label: 'Free to Use', icon: <Award size={20} /> },
  ]

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <BackgroundAnimation />

      {/* Hero Section */}
      <section className="relative z-10 pt-32 pb-20 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <div data-animate className="inline-flex items-center gap-2 backdrop-blur-lg bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-2 text-indigo-400 text-sm font-medium mb-6">
            <Users size={16} />
            About EduPath
          </div>
          <h1 data-animate style={{transitionDelay: '0.1s'}} className="text-5xl md:text-6xl font-extrabold text-white mb-6 leading-tight min-h-[2.4em] md:min-h-[2em]">
            {(() => {
              const parts = typedText.split('\n')
              return (
                <>
                  <span className="text-white">{parts[0]}</span>
                  {parts[1] !== undefined && (
                    <>
                      {' '}
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-teal-400">
                        {parts[1]}
                      </span>
                    </>
                  )}
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
              )
            })()}
          </h1>
          <p data-animate style={{transitionDelay: '0.2s'}} className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
            EduPath is an AI-powered learning and assessment platform designed to help students and professionals identify skill gaps, build resumes, and accelerate their career journey.
          </p>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="relative z-10 px-4 pb-16">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, i) => (
              <div key={i} data-animate style={{transitionDelay: `${i * 0.1}s`}} className="backdrop-blur-xl bg-slate-900/60 border border-white/10 rounded-2xl p-5 text-center">
                <div className="flex justify-center text-indigo-400 mb-2">{stat.icon}</div>
                <div className="text-3xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-gray-400 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="relative z-10 px-4 pb-16">
        <div className="max-w-5xl mx-auto">
          <div data-animate className="backdrop-blur-xl bg-slate-900/60 border border-white/10 rounded-2xl p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-3xl font-bold text-white mb-4">Our Mission</h2>
                <p className="text-gray-400 leading-relaxed mb-4">
                  We believe everyone deserves access to high-quality, personalized skill assessments. EduPath removes the guesswork from learning by using AI to generate relevant, dynamic quizzes tailored to your exact experience and goals.
                </p>
                <p className="text-gray-400 leading-relaxed">
                  Whether you're a student preparing for your first job or a professional looking to upskill, EduPath helps you understand exactly where you stand and what to do next.
                </p>
              </div>
              <div className="space-y-4">
                {[
                  'Personalized AI-generated assessments',
                  'Real-time performance feedback',
                  'Resume building with AI assistance',
                  'Progress tracking over time',
                  'Multi-topic, multi-difficulty support',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center flex-shrink-0">
                      <div className="w-2 h-2 rounded-full bg-indigo-400" />
                    </div>
                    <span className="text-gray-300 text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative z-10 px-4 pb-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 data-animate className="text-3xl md:text-4xl font-bold text-white mb-3">What We Offer</h2>
            <p data-animate style={{transitionDelay: '0.1s'}} className="text-gray-400">Everything you need to grow your skills and career</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <div
                key={i}
                data-animate
                style={{transitionDelay: `${i * 0.1}s`}}
                className="backdrop-blur-xl bg-slate-900/60 border border-white/10 rounded-2xl p-6 hover:border-white/20 hover:bg-slate-900/80 transition-all group"
              >
                <div className={`w-12 h-12 rounded-xl border flex items-center justify-center mb-4 ${feature.bg} ${feature.color}`}>
                  {feature.icon}
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default About

