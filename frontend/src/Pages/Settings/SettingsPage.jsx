import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings as SettingsIcon, ArrowLeft, Lock, Eye, EyeOff, User } from 'lucide-react';
import { changePassword } from '../Services/profileService';

const SettingsPage = () => {
  const navigate = useNavigate();

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const email = sessionStorage.getItem('email');
    if (!email) {
      navigate('/signin');
      return;
    }
  }, [navigate]);

  // Scroll-in animations
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

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordError('');
    setPasswordMessage('');

    // Validation
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordError('All fields are required');
      setTimeout(() => setPasswordError(''), 3000);
      setPasswordLoading(false);
      return;
    }

    if (passwordData.newPassword.length < 3) {
      setPasswordError('New password must be at least 3 characters');
      setTimeout(() => setPasswordError(''), 3000);
      setPasswordLoading(false);
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      setTimeout(() => setPasswordError(''), 3000);
      setPasswordLoading(false);
      return;
    }

    try {
      const response = await changePassword(passwordData);
      if (response.success) {
        // Update token in sessionStorage
        if (response.token) {
          sessionStorage.setItem('token', response.token);
        }
        setPasswordMessage(response.message || 'Password changed successfully!');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setTimeout(() => setPasswordMessage(''), 3000);
      }
    } catch (err) {
      setPasswordError(err.message || 'Failed to change password');
      setTimeout(() => setPasswordError(''), 3000);
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black pt-24 pb-12 px-8 relative overflow-hidden flex flex-col justify-center">
      <div className="pointer-events-none fixed inset-0 z-0">
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(circle, rgba(99,102,241,0.1) 1px, transparent 1px)',
          backgroundSize: '36px 36px',
        }} />
        <div style={{
          position: 'absolute', top: '8%', left: '10%',
          width: 420, height: 420,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.05), transparent 70%)',
          animation: 'settingOrb1 18s ease-in-out infinite alternate',
        }} />
        <div style={{
          position: 'absolute', bottom: '10%', right: '8%',
          width: 360, height: 360,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.04), transparent 70%)',
          animation: 'settingOrb2 22s ease-in-out infinite alternate',
        }} />
        <div style={{
          position: 'absolute', top: '45%', right: '20%',
          width: 260, height: 260,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(56,189,248,0.03), transparent 70%)',
          animation: 'settingOrb1 26s ease-in-out infinite alternate-reverse',
        }} />
      </div>
      <style>{`
        @keyframes settingOrb1 {
          from { transform: translate(0, 0) scale(1); }
          to   { transform: translate(40px, 30px) scale(1.08); }
        }
        @keyframes settingOrb2 {
          from { transform: translate(0, 0) scale(1); }
          to   { transform: translate(-35px, -25px) scale(1.06); }
        }
      `}</style>

      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 relative z-10 items-start">
        {/* Left Column (Spans 4 Columns) - Header & Preferences */}
        <div className="lg:col-span-4 flex flex-col gap-5">
          {/* Header */}
          <div data-animate className="mb-4 flex items-center gap-4" style={{ transitionDelay: '0s' }}>
            <button
              onClick={() => navigate('/profile')}
              className="p-2.5 backdrop-blur-lg bg-white/[0.03] hover:bg-white/[0.1] rounded-xl transition-all border border-white/5"
            >
              <ArrowLeft size={20} className="text-gray-400" />
            </button>
            <div>
              <h1 className="text-3xl font-black text-white leading-none tracking-tight">Settings</h1>
              <p className="text-slate-400 text-sm mt-1">Manage your preferences</p>
            </div>
          </div>


          {/* Quick Links Group */}
          <div className="rounded-[1.5rem] border border-white/5 overflow-hidden shadow-xl bg-[#0a0a0a]/50">
            {/* Account Settings */}
            <div data-animate className="backdrop-blur-xl py-4 px-5 border-b border-white/5 hover:bg-white/[0.03] transition-all cursor-pointer group flex items-center justify-between" onClick={() => navigate('/profile')} style={{ transitionDelay: '0.1s' }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-indigo-500/10 rounded-xl flex items-center justify-center group-hover:scale-105 group-hover:bg-indigo-500/20 transition-all border border-indigo-500/20">
                  <User size={16} className="text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-wide">Account settings</h3>
                  <p className="text-slate-500 text-xs mt-0.5">Edit personal info</p>
                </div>
              </div>
              <ArrowLeft className="text-slate-600 group-hover:text-white transition-colors rotate-180" size={16} />
            </div>

            {/* Privacy Settings */}
            <div data-animate className="backdrop-blur-xl py-4 px-5 border-b border-white/5 hover:bg-white/[0.03] transition-all cursor-pointer group flex items-center justify-between" style={{ transitionDelay: '0.2s' }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-emerald-500/10 rounded-xl flex items-center justify-center group-hover:scale-105 group-hover:bg-emerald-500/20 transition-all border border-emerald-500/20">
                  <EyeOff size={16} className="text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-wide">Privacy & Data</h3>
                  <p className="text-slate-500 text-xs mt-0.5">Control footprint</p>
                </div>
              </div>
              <ArrowLeft className="text-slate-600 group-hover:text-white transition-colors rotate-180" size={16} />
            </div>

            {/* Help & Support */}
            <div data-animate className="backdrop-blur-xl py-4 px-5 hover:bg-white/[0.03] transition-all cursor-pointer group flex items-center justify-between" style={{ transitionDelay: '0.3s' }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-cyan-500/10 rounded-xl flex items-center justify-center group-hover:scale-105 group-hover:bg-cyan-500/20 transition-all border border-cyan-500/20">
                  <SettingsIcon size={16} className="text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-wide">Help & Support</h3>
                  <p className="text-slate-500 text-xs mt-0.5">Get assistance</p>
                </div>
              </div>
              <ArrowLeft className="text-slate-600 group-hover:text-white transition-colors rotate-180" size={16} />
            </div>
          </div>
        </div>

        {/* Right Column (Spans 8 Columns) */}
        <div className="lg:col-span-8 backdrop-blur-3xl bg-[#090b14]/70 rounded-[1.5rem] border border-white/5 shadow-2xl p-6 lg:p-8 relative flex flex-col">
          <div className="flex items-center gap-4 mb-6 shrink-0">
            <div className="w-10 h-10 bg-white/[0.03] border border-white/10 rounded-xl flex items-center justify-center">
              <Lock size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Account Security</h2>
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] uppercase tracking-wider font-bold text-emerald-400 mt-2 inline-block">
                Authentication
              </span>
            </div>
          </div>

          {/* Password Messages Overlay */}
          {passwordMessage && (
            <div className="mb-6 backdrop-blur-lg bg-green-500/10 border border-green-500/30 text-green-400 px-5 py-4 rounded-xl font-medium text-sm">
              {passwordMessage}
            </div>
          )}
          {passwordError && (
            <div className="mb-6 backdrop-blur-lg bg-red-500/10 border border-red-500/30 text-red-400 px-5 py-4 rounded-xl font-medium text-sm">
              {passwordError}
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4 flex-1 flex flex-col">
            <div className="p-0.5">
              <label className="block text-[11px] font-bold text-slate-400 mb-1.5 tracking-wider uppercase ml-1">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showCurrentPw ? 'text' : 'password'}
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-3 pr-12 bg-[#0a0a0a] border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500/50 hover:bg-white/[0.02] transition-colors text-sm"
                  placeholder="Enter current password"
                />
                <button type="button" onClick={() => setShowCurrentPw(p => !p)} tabIndex={-1}
                  className="absolute inset-y-0 right-4 flex items-center text-slate-500 hover:text-white transition-colors">
                  {showCurrentPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="p-0.5">
              <label className="block text-[11px] font-bold text-slate-400 mb-1.5 tracking-wider uppercase ml-1">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPw ? 'text' : 'password'}
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-3 pr-12 bg-[#0a0a0a] border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500/50 hover:bg-white/[0.02] transition-colors text-sm"
                  placeholder="Enter new password"
                />
                <button type="button" onClick={() => setShowNewPw(p => !p)} tabIndex={-1}
                  className="absolute inset-y-0 right-4 flex items-center text-slate-500 hover:text-white transition-colors">
                  {showNewPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="p-0.5">
              <label className="block text-[11px] font-bold text-slate-400 mb-1.5 tracking-wider uppercase ml-1">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPw ? 'text' : 'password'}
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-3 pr-12 bg-[#0a0a0a] border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500/50 hover:bg-white/[0.02] transition-colors text-sm"
                  placeholder="Confirm new password"
                />
                <button type="button" onClick={() => setShowConfirmPw(p => !p)} tabIndex={-1}
                  className="absolute inset-y-0 right-4 flex items-center text-slate-500 hover:text-white transition-colors">
                  {showConfirmPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="pt-6 mt-2 border-t border-white/5 flex justify-end">
              <button
                type="submit"
                disabled={passwordLoading}
                className="px-6 py-3 rounded-xl font-bold text-sm transition-all duration-500 group bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2.5"
              >
                <span className="tracking-wide">{passwordLoading ? 'Updating Security...' : 'Update Password'}</span>
                {!passwordLoading && (
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                    <Lock size={12} className="text-white" />
                  </div>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
