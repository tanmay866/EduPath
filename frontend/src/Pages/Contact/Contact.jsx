import React, { useState, useEffect } from 'react';
import { MapPin, Phone, Mail, Send, AlertCircle } from 'lucide-react';

const MAX_MESSAGE = 500;

const Contact = () => {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [planeFlying, setPlaneFlying] = useState(false);
  const [error, setError] = useState('');

  // Fade-up scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('fade-in-up');
          observer.unobserve(entry.target);
        }
      }),
      { threshold: 0.1 }
    );
    document.querySelectorAll('[data-animate]').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const msgLen = formData.message.length;

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'name') {
      setFormData(prev => ({ ...prev, [name]: value.replace(/[^a-zA-Z\s]/g, '') }));
    } else if (name === 'phone') {
      setFormData(prev => ({ ...prev, [name]: value.replace(/[^0-9]/g, '') }));
    } else if (name === 'message') {
      if (value.length <= MAX_MESSAGE) setFormData(prev => ({ ...prev, [name]: value }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.email || !formData.message) {
      setError('Please fill in all required fields');
      setTimeout(() => setError(''), 3000);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      setTimeout(() => setError(''), 3000);
      return;
    }

    setPlaneFlying(true);
    setLoading(true);

    try {
      const response = await fetch('' + import.meta.env.VITE_API_URL + '/api/contact/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      setTimeout(() => {
        setPlaneFlying(false);
        setLoading(false);
        if (data.success) {
          setSent(true);
          setFormData({ name: '', email: '', phone: '', message: '' });
        } else {
          setError(data.message || 'Failed to send message');
          setTimeout(() => setError(''), 3000);
        }
      }, 900);
    } catch (err) {
      setTimeout(() => {
        setPlaneFlying(false);
        setLoading(false);
        setError('Failed to send message. Please try again.');
        setTimeout(() => setError(''), 3000);
      }, 900);
    }
  };

  return (
    <div className="min-h-screen bg-black pt-24 pb-20 px-8 relative overflow-hidden">
      {/* Animated Background */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(circle, rgba(99,102,241,0.1) 1px, transparent 1px)',
          backgroundSize: '36px 36px',
        }} />
        <div style={{
          position: 'absolute', top: '8%', left: '10%',
          width: 440, height: 440, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.05), transparent 70%)',
          animation: 'cOrb1 18s ease-in-out infinite alternate',
        }} />
        <div style={{
          position: 'absolute', bottom: '10%', right: '8%',
          width: 360, height: 360, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.04), transparent 70%)',
          animation: 'cOrb2 22s ease-in-out infinite alternate',
        }} />
        <div style={{
          position: 'absolute', top: '50%', right: '25%',
          width: 260, height: 260, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(56,189,248,0.03), transparent 70%)',
          animation: 'cOrb1 26s ease-in-out infinite alternate-reverse',
        }} />
      </div>

      <style>{`
        @keyframes cOrb1 {
          from { transform: translate(0, 0) scale(1); }
          to   { transform: translate(40px, 30px) scale(1.08); }
        }
        @keyframes cOrb2 {
          from { transform: translate(0, 0) scale(1); }
          to   { transform: translate(-35px, -25px) scale(1.06); }
        }
        @keyframes planeFly {
          0%   { transform: translateX(0) translateY(0) rotate(0deg); opacity: 1; }
          60%  { transform: translateX(120px) translateY(-60px) rotate(-20deg); opacity: 0.6; }
          100% { transform: translateX(260px) translateY(-140px) rotate(-30deg); opacity: 0; }
        }
        @keyframes successPop {
          0%   { opacity: 0; transform: scale(0.85) translateY(20px); }
          70%  { transform: scale(1.03) translateY(-4px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes checkDraw {
          from { stroke-dashoffset: 60; }
          to   { stroke-dashoffset: 0; }
        }
        @keyframes ringPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(34,197,94,0.4); }
          50%       { box-shadow: 0 0 0 18px rgba(34,197,94,0); }
        }
        .plane-flying { animation: planeFly 0.85s ease-in forwards; }
        .success-pop  { animation: successPop 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards; }
        .ring-pulse   { animation: ringPulse 1.2s ease-out 0.3s 2; }
        .check-draw   {
          stroke-dasharray: 60;
          stroke-dashoffset: 60;
          animation: checkDraw 0.5s ease-out 0.35s forwards;
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        [data-animate] {
          opacity: 0;
          transform: translateY(28px);
        }
        [data-animate].fade-in-up {
          animation: fadeUp 0.6s cubic-bezier(0.22,1,0.36,1) forwards;
        }
      `}</style>

      <div className="max-w-6xl mx-auto relative z-10 mt-12">
        {/* Header */}
        <div className="text-center mb-14">
          <div data-animate style={{ transitionDelay: '0s' }} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-widest mb-6">
            <Mail size={12} />
            Get in Touch
          </div>
          <h1 data-animate style={{ animationDelay: '0.1s' }} className="text-5xl font-black text-white leading-none tracking-tight mb-4">
            Contact <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">Us</span>
          </h1>
          <p data-animate style={{ animationDelay: '0.2s' }} className="text-slate-400 text-lg max-w-md mx-auto leading-relaxed">
            We'd love to hear from you. Send us a message and we'll respond within 24 hours.
          </p>
        </div>

        {/* Error banner */}
        {error && (
          <div className="mb-8 backdrop-blur-xl bg-red-900/30 border border-red-500/40 text-red-300 px-6 py-4 rounded-[1rem] font-medium flex items-center gap-3 max-w-2xl mx-auto shadow-xl">
            <AlertCircle size={18} className="flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">

          {/* Left Column — Contact Info */}
          <div className="lg:col-span-2 space-y-4">
            {[
              {
                Icon: MapPin,
                label: 'Our Address',
                color: 'indigo',
                content: (
                  <p className="text-slate-400 leading-relaxed text-sm">
                    CHARUSAT University,<br />Changa, Anand,<br />Gujarat — 388421.
                  </p>
                )
              },
              {
                Icon: Phone,
                label: 'Contact No',
                color: 'emerald',
                content: (
                  <a href="tel:+919512842105" className="text-slate-400 hover:text-emerald-400 transition-colors text-sm font-medium">
                    +91 9512842105
                  </a>
                )
              },
              {
                Icon: Mail,
                label: 'Email',
                color: 'cyan',
                content: (
                  <a href="mailto:mihirpatel2102005@gmail.com" className="text-slate-400 hover:text-cyan-400 transition-colors text-sm font-medium break-all">
                    mihirpatel2102005@gmail.com
                  </a>
                )
              },
            ].map(({ Icon, label, color, content }, i) => (
              <div
                key={label}
                data-animate
                style={{ animationDelay: `${0.3 + i * 0.1}s` }}
                className="backdrop-blur-3xl bg-[#090b14]/70 rounded-[1.5rem] border border-white/5 shadow-2xl p-6 group hover:border-white/10 transition-all duration-500"
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl border flex-shrink-0 ${
                    color === 'indigo' ? 'bg-indigo-500/15 border-indigo-500/25' :
                    color === 'emerald' ? 'bg-emerald-500/15 border-emerald-500/25' :
                    'bg-cyan-500/15 border-cyan-500/25'
                  }`}>
                    <Icon size={18} className={
                      color === 'indigo' ? 'text-indigo-400' :
                      color === 'emerald' ? 'text-emerald-400' :
                      'text-cyan-400'
                    } />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">{label}</p>
                    {content}
                  </div>
                </div>
              </div>
            ))}

            {/* Decorative response time card */}
            <div data-animate style={{ animationDelay: '0.6s' }} className="backdrop-blur-3xl bg-[#090b14]/70 rounded-[1.5rem] border border-white/5 shadow-2xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Response Time</p>
              </div>
              <p className="text-white font-bold text-xl">Within 24 Hours</p>
              <p className="text-slate-500 text-xs mt-1">Mon – Fri, 9am – 6pm IST</p>
            </div>
          </div>

          {/* Right Column — Form */}
          <div data-animate style={{ animationDelay: '0.4s' }} className="lg:col-span-3 backdrop-blur-3xl bg-[#090b14]/70 rounded-[1.5rem] border border-white/5 shadow-2xl p-8 min-h-[480px] flex items-center justify-center">

            {/* SUCCESS STATE */}
            {sent ? (
              <div className="success-pop flex flex-col items-center text-center gap-5 py-6 w-full">
                <div className="ring-pulse w-24 h-24 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center">
                  <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
                    <circle cx="26" cy="26" r="24" stroke="rgba(34,197,94,0.2)" strokeWidth="2" />
                    <polyline
                      className="check-draw"
                      points="14,27 22,35 38,18"
                      stroke="#22c55e"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />
                  </svg>
                </div>

                <div>
                  <h3 className="text-2xl font-black text-white mb-2 tracking-tight">Message Sent! 🎉</h3>
                  <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
                    Thanks for reaching out. We'll get back to you within 24 hours.
                  </p>
                </div>

                <button
                  onClick={() => setSent(false)}
                  className="mt-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-blue-600 shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all duration-300"
                >
                  Send Another
                </button>
              </div>
            ) : (

              /* FORM */
              <form onSubmit={handleSubmit} className="space-y-5 w-full">
                <div className="mb-6">
                  <h2 className="text-2xl font-black text-white tracking-tight">Send a Message</h2>
                  <p className="text-slate-500 text-sm mt-1">Fill in the form and we'll be in touch.</p>
                </div>

                {/* Name + Email row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text" name="name" value={formData.name} onChange={handleChange}
                      placeholder="John Doe"
                      className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/10 rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 hover:bg-white/[0.02] transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Email <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="email" name="email" value={formData.email} onChange={handleChange}
                      placeholder="you@example.com"
                      className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/10 rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 hover:bg-white/[0.02] transition-colors"
                      required
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Phone Number</label>
                  <input
                    type="tel" name="phone" value={formData.phone} onChange={handleChange}
                    placeholder="Enter your 10-digit phone number"
                    inputMode="numeric" maxLength="10"
                    className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/10 rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 hover:bg-white/[0.02] transition-colors"
                  />
                </div>

                {/* Message */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Message <span className="text-red-400">*</span>
                    </label>
                    <span className={`text-xs font-mono transition-colors ${msgLen > MAX_MESSAGE * 0.9 ? 'text-amber-400' : 'text-gray-600'}`}>
                      {msgLen}<span className="text-gray-700">/{MAX_MESSAGE}</span>
                    </span>
                  </div>
                  <textarea
                    name="message" value={formData.message} onChange={handleChange}
                    placeholder="Type your message here..."
                    rows="4"
                    className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/10 rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 hover:bg-white/[0.02] transition-colors resize-none"
                    required
                  />
                  {/* Progress bar */}
                  <div className="mt-1.5 h-0.5 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${(msgLen / MAX_MESSAGE) * 100}%`,
                        background: msgLen > MAX_MESSAGE * 0.9
                          ? 'linear-gradient(90deg,#f59e0b,#ef4444)'
                          : 'linear-gradient(90deg,#6366f1,#38bdf8)',
                      }}
                    />
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="relative w-full overflow-hidden px-6 py-3.5 rounded-xl font-bold text-sm text-white transition-all duration-500 bg-gradient-to-r from-indigo-600 to-blue-600 shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/40 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                >
                  <span className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-xl" />
                  {loading ? (
                    <>
                      <span className={`${planeFlying ? 'plane-flying' : ''}`}>✈️</span>
                      <span className="text-white/80">Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
