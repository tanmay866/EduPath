import React, { useState, useEffect } from 'react';
import { MapPin, Phone, Mail, Send, CheckCircle, AlertCircle } from 'lucide-react';

const MAX_MESSAGE = 500;

const Contact = () => {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [planeFlying, setPlaneFlying] = useState(false);
  const [error, setError] = useState('');

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
      const alphabeticValue = value.replace(/[^a-zA-Z\s]/g, '');
      setFormData(prev => ({ ...prev, [name]: alphabeticValue }));
    } else if (name === 'phone') {
      const numericValue = value.replace(/[^0-9]/g, '');
      setFormData(prev => ({ ...prev, [name]: numericValue }));
    } else if (name === 'message') {
      if (value.length <= MAX_MESSAGE)
        setFormData(prev => ({ ...prev, [name]: value }));
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

    // Start plane animation
    setPlaneFlying(true);
    setLoading(true);

    try {
      const response = await fetch('http://localhost:4000/api/contact/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      // Wait for plane to fly off before showing success
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
      console.error('Contact form error:', err);
      setTimeout(() => {
        setPlaneFlying(false);
        setLoading(false);
        setError('Failed to send message. Please try again.');
        setTimeout(() => setError(''), 3000);
      }, 900);
    }
  };

  const inputClass =
    'w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-gray-500 ' +
    'focus:outline-none focus:ring-2 focus:ring-cyan-500/60 focus:border-cyan-500/50 focus:shadow-[0_0_18px_rgba(6,182,212,0.25)] ' +
    'hover:border-white/20 transition-all duration-200';

  return (
    <div className="min-h-screen bg-black pt-32 pb-20 px-4 relative">
      {/* Animated Background */}
      <div className="animated-bg">
        <div className="moving-shape shape-1"></div>
        <div className="moving-shape shape-2"></div>
        <div className="moving-shape shape-3"></div>
        <div className="moving-shape shape-4"></div>
        <div className="moving-shape shape-5"></div>
        <div className="moving-shape shape-6"></div>
        <div className="rotating-gradient"></div>
        <div className="floating-particle" style={{top: '5%', left: '15%', animationDelay: '0s'}}></div>
        <div className="floating-particle" style={{top: '8%', left: '85%', animationDelay: '2s'}}></div>
        <div className="floating-particle" style={{top: '15%', left: '50%', animationDelay: '1.5s'}}></div>
        <div className="floating-particle" style={{top: '25%', left: '70%', animationDelay: '1s'}}></div>
        <div className="floating-particle" style={{top: '45%', left: '10%', animationDelay: '2s'}}></div>
        <div className="floating-particle" style={{top: '65%', left: '80%', animationDelay: '1.5s'}}></div>
        <div className="floating-particle" style={{top: '75%', left: '30%', animationDelay: '0.5s'}}></div>
        <div className="floating-particle" style={{top: '85%', left: '60%', animationDelay: '2.5s'}}></div>
      </div>

      <style>{`
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
      `}</style>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 data-animate className="text-5xl font-bold text-white mb-4">
            Contact <span className="text-blue-500">Us</span>
          </h1>
          <p data-animate style={{transitionDelay: '0.15s'}} className="text-gray-400 text-lg">
            We'd love to hear from you! Send us a message or visit our office.
          </p>
        </div>

        {/* Error banner */}
        {error && (
          <div className="mb-6 backdrop-blur-lg bg-red-500/20 border border-red-500/50 text-red-400 px-6 py-4 rounded-xl font-medium shadow-xl flex items-center gap-3 max-w-2xl mx-auto">
            <AlertCircle size={20} />
            {error}
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Left Side - Contact Information */}
          <div className="space-y-4">
            {[
              { Icon: MapPin,  label: 'Our Address', content: (<p className="text-gray-400 leading-relaxed text-sm">CHARUSAT University,<br />Changa, Anand,<br />Gujarat-388421.</p>) },
              { Icon: Phone,   label: 'Contact No',  content: (<a href="tel:+919512842105" className="text-gray-400 hover:text-blue-400 transition-colors text-base">+91 9512842105</a>) },
              { Icon: Mail,    label: 'Email',       content: (<a href="mailto:mihirpatel2102005@gmail.com" className="text-gray-400 hover:text-blue-400 transition-colors text-base">mihirpatel2102005@gmail.com</a>) },
            ].map(({ Icon, label, content }, i) => (
              <div
                key={label}
                data-animate
                style={{ transitionDelay: `${0.1 + i * 0.12}s` }}
                className="backdrop-blur-xl bg-slate-900/60 border border-white/10 rounded-2xl p-5 shadow-xl hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/20 transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 backdrop-blur-lg bg-blue-500/30 border border-blue-400/30 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icon size={20} className="text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">{label}</h3>
                    {content}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right Side - Form OR Success Card */}
          <div
            data-animate
            style={{ transitionDelay: '0.25s' }}
            className="backdrop-blur-xl bg-slate-900/60 border border-white/10 rounded-2xl p-8 shadow-xl min-h-[420px] flex items-center justify-center"
          >

            {/* ── SUCCESS STATE ── */}
            {sent ? (
              <div className="success-pop flex flex-col items-center text-center gap-5 py-6 w-full">
                {/* Animated check ring */}
                <div className="ring-pulse w-24 h-24 rounded-full bg-green-500/10 border-2 border-green-500/40 flex items-center justify-center">
                  <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
                    <circle cx="26" cy="26" r="24" stroke="rgba(34,197,94,0.25)" strokeWidth="2" />
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
                  <h3 className="text-2xl font-bold text-white mb-2">Message Sent! 🎉</h3>
                  <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
                    Thanks for reaching out. We'll get back to you within 24 hours.
                  </p>
                </div>

                <button
                  onClick={() => setSent(false)}
                  className="mt-2 px-6 py-2.5 rounded-xl text-sm font-medium text-white bg-white/10 border border-white/15 hover:bg-white/15 hover:border-white/25 transition-all duration-200 hover:scale-105 active:scale-95"
                >
                  Send Another
                </button>
              </div>
            ) : (

              /* ── FORM ── */
              <form onSubmit={handleSubmit} className="space-y-5 w-full">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your name"
                    className={inputClass}
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    className={inputClass}
                    required
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter your 10-digit phone number"
                    inputMode="numeric"
                    maxLength="10"
                    className={inputClass}
                  />
                </div>

                {/* Message + character counter */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium text-gray-300">
                      Message <span className="text-red-400">*</span>
                    </label>
                    <span className={`text-xs font-mono transition-colors ${msgLen > MAX_MESSAGE * 0.9 ? 'text-amber-400' : 'text-gray-500'}`}>
                      {msgLen}<span className="text-gray-600">/{MAX_MESSAGE}</span>
                    </span>
                  </div>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Type your message..."
                    rows="4"
                    className={inputClass + ' resize-none'}
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
                          : 'linear-gradient(90deg,#06b6d4,#818cf8)',
                      }}
                    />
                  </div>
                </div>

                {/* Submit button with flying plane */}
                <button
                  type="submit"
                  disabled={loading}
                  className="relative w-full overflow-hidden px-6 py-3.5 rounded-xl font-semibold text-white transition-all duration-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-xl group"
                  style={{
                    background: loading
                      ? 'rgba(99,102,241,0.3)'
                      : 'linear-gradient(135deg, rgba(99,102,241,0.8), rgba(139,92,246,0.8))',
                    border: '1px solid rgba(139,92,246,0.4)',
                    boxShadow: loading ? 'none' : '0 0 24px rgba(99,102,241,0.35)',
                  }}
                >
                  {/* Hover shimmer */}
                  <span className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-xl" />

                  {loading ? (
                    <>
                      <span className={`${planeFlying ? 'plane-flying' : ''}`}>✈️</span>
                      <span className="text-gray-300">Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send size={17} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
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
