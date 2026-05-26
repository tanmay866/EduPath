import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Template1, Template2, Template3, Template4, Template5,
  Template6, Template7, Template8, Template9, Template10
} from '../templates';

const TEMPLATES_MAP = {
  template1: Template1, template2: Template2, template3: Template3,
  template4: Template4, template5: Template5, template6: Template6,
  template7: Template7, template8: Template8, template9: Template9,
  template10: Template10
};

const TEMPLATE_META = [
  { key: 'template1', name: 'Ocean Blue', desc: 'Professional blue gradient', gradient: 'from-blue-600 to-cyan-600', ring: 'ring-blue-200 border-blue-500', letter: 'A', letterColor: 'text-blue-600' },
  { key: 'template2', name: 'Sunset Orange', desc: 'Creative warm orange', gradient: 'from-orange-500 to-red-500', ring: 'ring-orange-200 border-orange-500', letter: 'B', letterColor: 'text-orange-600' },
  { key: 'template3', name: 'Forest Green', desc: 'Natural green gradient', gradient: 'from-green-600 to-emerald-600', ring: 'ring-green-200 border-green-500', letter: 'C', letterColor: 'text-green-600' },
  { key: 'template4', name: 'Royal Purple', desc: 'Luxurious purple & pink', gradient: 'from-purple-600 to-pink-600', ring: 'ring-purple-200 border-purple-500', letter: 'D', letterColor: 'text-purple-600' },
  { key: 'template5', name: 'Midnight Dark', desc: 'Modern dark mode', gradient: 'from-gray-800 to-gray-900', ring: 'ring-indigo-200 border-indigo-500', letter: 'E', letterColor: 'text-indigo-400' },
  { key: 'template6', name: 'Teal Aqua', desc: 'Fresh teal theme', gradient: 'from-teal-500 to-cyan-500', ring: 'ring-teal-200 border-teal-500', letter: 'F', letterColor: 'text-teal-600' },
  { key: 'template7', name: 'Rose Pink', desc: 'Elegant & stylish', gradient: 'from-rose-500 to-pink-500', ring: 'ring-rose-200 border-rose-500', letter: 'G', letterColor: 'text-rose-600' },
  { key: 'template8', name: 'Amber Gold', desc: 'Warm & professional', gradient: 'from-amber-600 to-yellow-600', ring: 'ring-amber-200 border-amber-500', letter: 'H', letterColor: 'text-amber-600' },
  { key: 'template9', name: 'Slate Gray', desc: 'Minimalist design', gradient: 'from-slate-700 to-gray-700', ring: 'ring-slate-200 border-slate-500', letter: 'I', letterColor: 'text-slate-600' },
  { key: 'template10', name: 'Indigo Violet', desc: 'Creative tech-savvy', gradient: 'from-indigo-600 to-violet-600', ring: 'ring-indigo-200 border-indigo-500', letter: 'J', letterColor: 'text-indigo-600' }
];

const API_BASE = '' + import.meta.env.VITE_API_URL + '/api/portfolio';

function PortfolioGenerator() {
  const navigate = useNavigate();

  // Views: 'home' | 'create' | 'deployed'
  const [view, setView] = useState('home');
  const [currentStep, setCurrentStep] = useState(1); // 1=Upload, 2=Review, 3=Template

  // Portfolio data
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeParsed, setResumeParsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [portfolioData, setPortfolioData] = useState({
    name: '', title: '', email: '', phone: '', location: '', about: '',
    github: '', linkedin: '', portfolio: '', profilePhoto: '',
    experience: [], education: [], skills: [], projects: [],
    certifications: [], achievements: []
  });
  const [selectedTemplate, setSelectedTemplate] = useState('template1');

  // Deployed portfolio data
  const [deployedPortfolio, setDeployedPortfolio] = useState(null);
  const [portfolioLink, setPortfolioLink] = useState('');
  const [vercelUrl, setVercelUrl] = useState('');
  const [vercelDeploying, setVercelDeploying] = useState(false);
  const [copied, setCopied] = useState('');

  // My Portfolios
  const [myPortfolios, setMyPortfolios] = useState([]);
  const [loadingPortfolios, setLoadingPortfolios] = useState(true);

  const token = sessionStorage.getItem('token');

  // Check authentication on component mount
  useEffect(() => {
    const token = sessionStorage.getItem('token');
    if (!token) {
      navigate('/signin');
      return;
    }
    fetchMyPortfolios();
  }, [navigate]);

  const fetchMyPortfolios = async () => {
    setLoadingPortfolios(true);
    try {
      const res = await fetch(`${API_BASE}/my-portfolios`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await res.json();
      if (result.success) setMyPortfolios(result.portfolios || []);
    } catch (err) {
      console.error('Fetch portfolios error:', err);
    } finally {
      setLoadingPortfolios(false);
    }
  };

  // ────── Resume Upload ──────
  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];
    if (!validTypes.includes(file.type)) { setError('Please upload a PDF or DOCX file'); return; }
    if (file.size > 10 * 1024 * 1024) { setError('File size must be less than 10MB'); return; }

    setResumeFile(file);
    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('resume', file);
      const res = await fetch(`${API_BASE}/parse-resume`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const result = await res.json();
      if (res.ok && result.success) {
        setPortfolioData(prev => ({
          ...prev, ...result.data,
          experience: result.data.experience || [],
          education: result.data.education || [],
          skills: result.data.skills || [],
          projects: result.data.projects || [],
          certifications: result.data.certifications || [],
          achievements: result.data.achievements || []
        }));
        setResumeParsed(true);
        setTimeout(() => setCurrentStep(2), 800);
      } else {
        setError(result.message || 'Failed to parse resume');
      }
    } catch (err) {
      setError('Failed to process resume. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ────── Data Handlers ──────
  const handleDataUpdate = (field, value) => setPortfolioData(prev => ({ ...prev, [field]: value }));
  const handleArrayAdd = (field, template) => setPortfolioData(prev => ({ ...prev, [field]: [...prev[field], template] }));
  const handleArrayRemove = (field, index) => setPortfolioData(prev => ({ ...prev, [field]: prev[field].filter((_, i) => i !== index) }));
  const handleArrayUpdate = (field, index, key, value) => {
    setPortfolioData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? (typeof key === 'string' ? { ...item, [key]: value } : value) : item)
    }));
  };
  const handleAddSkill = (skill) => {
    if (skill && !portfolioData.skills.includes(skill)) {
      setPortfolioData(prev => ({ ...prev, skills: [...prev.skills, skill] }));
    }
  };
  const handleRemoveSkill = (skill) => setPortfolioData(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }));

  // ────── Profile Photo Upload ──────
  const handleProfilePhotoUpload = (file) => {
    if (!file) return;
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) { setError('Please upload a JPG, PNG, or WebP image'); return; }
    if (file.size > 5 * 1024 * 1024) { setError('Photo size must be less than 5MB'); return; }
    const reader = new FileReader();
    reader.onloadend = () => {
      setPortfolioData(prev => ({ ...prev, profilePhoto: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  // ────── Deploy to MongoDB ──────
  const handleDeploy = async () => {
    if (!portfolioData.name || !portfolioData.title) { setError('Name and Title are required'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/deploy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ portfolioData, template: selectedTemplate })
      });
      const result = await res.json();
      if (res.ok && result.success) {
        const url = result.username
          ? `${window.location.origin}/${result.username}`
          : `${window.location.origin}/p/${result.portfolioId}`;
        setPortfolioLink(url);
        setDeployedPortfolio(result.portfolio);
        setView('deployed');
        setSuccessMsg('Portfolio deployed successfully!');
        fetchMyPortfolios();
      } else {
        setError(result.message || 'Deployment failed');
      }
    } catch (err) {
      setError('Failed to deploy. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ────── Deploy to Vercel ──────
  const handleDeployToVercel = async (portfolioId) => {
    setVercelDeploying(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/deploy-vercel/${portfolioId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
      });
      const result = await res.json();
      if (res.ok && result.success) {
        setVercelUrl(result.vercelUrl);
        setSuccessMsg('Deployed to Vercel! Your portfolio is live.');
        fetchMyPortfolios();
      } else {
        setError(result.message || 'Vercel deployment failed');
      }
    } catch (err) {
      setError('Vercel deployment failed. Please try again.');
    } finally {
      setVercelDeploying(false);
    }
  };

  // ────── Delete Portfolio ──────
  const handleDeletePortfolio = async (portfolioId) => {
    if (!confirm('Are you sure you want to delete this portfolio?')) return;
    try {
      const res = await fetch(`${API_BASE}/${portfolioId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await res.json();
      if (res.ok && result.success) {
        setSuccessMsg('Portfolio deleted');
        fetchMyPortfolios();
      }
    } catch (err) {
      setError('Failed to delete portfolio');
    }
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(''), 2000);
  };

  const handleCreateNew = () => {
    setPortfolioData({
      name: '', title: '', email: '', phone: '', location: '', about: '',
      github: '', linkedin: '', portfolio: '', profilePhoto: '',
      experience: [], education: [], skills: [], projects: [],
      certifications: [], achievements: []
    });
    setSelectedTemplate('template1');
    setResumeFile(null);
    setResumeParsed(false);
    setPortfolioLink('');
    setVercelUrl('');
    setDeployedPortfolio(null);
    setCurrentStep(1);
    setView('create');
    setError('');
    setSuccessMsg('');
  };

  // ────── Step Indicator ──────
  const StepIndicator = () => (
    <div className="flex items-center justify-center gap-3 mb-8">
      {['Upload Resume', 'Review & Edit', 'Select Template'].map((label, i) => (
        <div key={i} className="flex items-center gap-3">
          <button
            onClick={() => {
              if (i + 1 < currentStep) setCurrentStep(i + 1);
            }}
            disabled={i + 1 >= currentStep}
            className={`px-6 py-3 rounded-xl font-medium border transition-all duration-200 ${currentStep === i + 1
                ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-cyan-400/50 text-cyan-400'
                : currentStep > i + 1
                  ? 'bg-white/5 border-emerald-500/50 text-emerald-400 cursor-pointer hover:border-emerald-400'
                  : 'bg-white/5 border-white/10 text-gray-400'
              }`}
          >
            <div className="flex items-center gap-2">
              {currentStep > i + 1 ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
              ) : (
                <span className="text-sm font-bold">{i + 1}</span>
              )}
              <span className="hidden sm:inline text-sm">{label}</span>
            </div>
          </button>
          {i < 2 && <div className={`w-8 h-0.5 ${currentStep > i + 1 ? 'bg-emerald-400' : 'bg-white/10'}`} />}
        </div>
      ))}
    </div>
  );

  // ────── Alert ──────
  const Alert = ({ type, message, onClose }) => {
    if (!message) return null;
    const styles = type === 'error'
      ? 'bg-red-500/20 text-red-300 border border-red-500/30'
      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30';
    return (
      <div className={`rounded-xl p-4 mb-6 flex items-start justify-between ${styles}`}>
        <div className="flex items-center gap-2">
          <span>{type === 'error' ? '⚠️' : '✅'}</span>
          <span className="font-medium text-sm">{message}</span>
        </div>
        <button onClick={onClose} className="text-lg font-bold opacity-60 hover:opacity-100">×</button>
      </div>
    );
  };

  // ════════════════════════════════════════════
  //  HOME VIEW: My Portfolios + Create New
  // ════════════════════════════════════════════
  if (view === 'home') {
    return (
      <div className="min-h-screen bg-black pt-24 pb-12 px-8 relative overflow-hidden flex flex-col justify-center">
        <div className="pointer-events-none fixed inset-0 z-0">
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(99,102,241,0.1) 1px, transparent 1px)', backgroundSize: '36px 36px' }} />
          <div style={{ position: 'absolute', top: '8%', left: '10%', width: 420, height: 420, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.05), transparent 70%)', animation: 'settingOrb1 18s ease-in-out infinite alternate' }} />
          <div style={{ position: 'absolute', bottom: '10%', right: '8%', width: 360, height: 360, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.04), transparent 70%)', animation: 'settingOrb2 22s ease-in-out infinite alternate' }} />
        </div>
        <style>{`
        @keyframes settingOrb1 { from { transform: translate(0, 0) scale(1); } to { transform: translate(40px, 30px) scale(1.08); } }
        @keyframes settingOrb2 { from { transform: translate(0, 0) scale(1); } to { transform: translate(-35px, -25px) scale(1.06); } }
      `}</style>
        <div className="max-w-7xl mx-auto w-full relative z-10 space-y-8 mt-12">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-start gap-4">
              <button onClick={() => window.history.back()}
                className="p-2.5 backdrop-blur-lg bg-white/[0.03] hover:bg-white/[0.1] rounded-xl transition-all border border-white/5">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <div>
                <h1 className="text-3xl font-black text-white leading-none tracking-tight mb-2">Portfolio Generator</h1>
                <p className="text-gray-400 text-lg">Create, manage, and deploy your professional portfolio</p>
              </div>
            </div>
            <button onClick={handleCreateNew}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all duration-500 bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/40">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Create New Portfolio
            </button>
          </div>

          <Alert type="error" message={error} onClose={() => setError('')} />
          <Alert type="success" message={successMsg} onClose={() => setSuccessMsg('')} />

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[#0a0a0a] border border-white/5 rounded-xl shadow-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl flex items-center justify-center border border-blue-500/30">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{myPortfolios.length}</p>
                  <p className="text-sm text-gray-400">Total Portfolios</p>
                </div>
              </div>
            </div>
            <div className="bg-[#0a0a0a] border border-white/5 rounded-xl shadow-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500/20 to-green-500/20 rounded-xl flex items-center justify-center border border-emerald-500/30">
                  <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{myPortfolios.reduce((s, p) => s + (p.views || 0), 0)}</p>
                  <p className="text-sm text-gray-400">Total Views</p>
                </div>
              </div>
            </div>
            <div className="bg-[#0a0a0a] border border-white/5 rounded-xl shadow-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center border border-purple-500/30">
                  <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{myPortfolios.filter(p => p.vercelDeployment?.url).length}</p>
                  <p className="text-sm text-gray-400">Deployed on Vercel</p>
                </div>
              </div>
            </div>
          </div>

          {/* Portfolios List */}
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent mb-4">My Portfolios</h2>
            {loadingPortfolios ? (
              <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin" /></div>
            ) : myPortfolios.length === 0 ? (
              <div className="backdrop-blur-3xl bg-[#090b14]/70 rounded-[1.5rem] border border-white/5 shadow-2xl p-12 text-center">
                <div className="text-5xl mb-4">📂</div>
                <h3 className="text-xl font-semibold text-white mb-2">No portfolios yet</h3>
                <p className="text-gray-400 mb-6">Create your first portfolio by uploading your resume</p>
                <button onClick={handleCreateNew} className="px-6 py-3 rounded-xl font-bold text-sm transition-all duration-500 bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/40">
                  Create Your First Portfolio
                </button>
              </div>
            ) : (
              <div className="grid gap-4">
                {myPortfolios.map((p) => {
                  const tmpl = TEMPLATE_META.find(t => t.key === p.template) || TEMPLATE_META[0];
                  return (
                    <div key={p.portfolioId} className="backdrop-blur-3xl bg-[#090b14]/70 rounded-[1.5rem] border border-white/5 shadow-2xl overflow-hidden hover:border-cyan-400/50 hover:shadow-[0_0_20px_rgba(6,182,212,0.2)] transition-all duration-200">
                      <div className="flex flex-col lg:flex-row">
                        <div className={`w-full lg:w-2 bg-gradient-to-b ${tmpl.gradient} shrink-0`} />
                        <div className="flex-1 p-6">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-lg font-bold text-white">{p.personalInfo?.name || 'Unnamed'}</h3>
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${p.vercelDeployment?.url ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-white/5 text-gray-400 border border-white/10'
                                  }`}>
                                  {p.vercelDeployment?.url ? '● Live on Vercel' : '● Local Only'}
                                </span>
                              </div>
                              <p className="text-gray-400 text-sm mb-1">{p.personalInfo?.title}</p>
                              <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                                <span>🎨 {tmpl.name}</span>
                                <span>👁 {p.views || 0} views</span>
                                <span>📅 {new Date(p.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <a href={p.username ? `${window.location.origin}/${p.username}` : `${window.location.origin}/p/${p.portfolioId}`} target="_blank" rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-4 py-2 backdrop-blur-lg bg-blue-500/20 text-blue-300 rounded-lg text-sm font-semibold hover:bg-blue-500/30 border border-blue-500/30 transition-all duration-200">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                Visit
                              </a>
                              <button onClick={() => copyToClipboard(p.username ? `${window.location.origin}/${p.username}` : `${window.location.origin}/p/${p.portfolioId}`, p.portfolioId)}
                                className="inline-flex items-center gap-1.5 px-4 py-2 backdrop-blur-lg bg-white/5 text-white rounded-lg text-sm font-semibold hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-200">
                                {copied === p.portfolioId ? '✅ Copied!' : '📋 Copy Link'}
                              </button>
                              {p.vercelDeployment?.url ? (
                                <a href={p.vercelDeployment.url} target="_blank" rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-black text-white rounded-lg text-sm font-semibold hover:bg-gray-900 border border-white/20 transition-all duration-200">
                                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L24 22H0L12 1Z" /></svg>
                                  Vercel URL
                                </a>
                              ) : (
                                <button onClick={() => handleDeployToVercel(p.portfolioId)} disabled={vercelDeploying}
                                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-black text-white rounded-lg text-sm font-semibold hover:bg-gray-900 disabled:opacity-50 border border-white/20 transition-all duration-200">
                                  {vercelDeploying ? (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                  ) : (
                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L24 22H0L12 1Z" /></svg>
                                  )}
                                  Deploy to Vercel
                                </button>
                              )}
                              <button onClick={() => handleDeletePortfolio(p.portfolioId)}
                                className="inline-flex items-center gap-1.5 px-3 py-2 text-red-400 hover:bg-red-500/10 rounded-lg text-sm font-semibold border border-transparent hover:border-red-500/30 transition-all duration-200">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════
  //  DEPLOYED VIEW
  // ════════════════════════════════════════════
  if (view === 'deployed') {
    return (
      <div className="min-h-screen bg-black pt-24 pb-12 px-8 relative overflow-hidden flex flex-col justify-center">
        <div className="pointer-events-none fixed inset-0 z-0">
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(99,102,241,0.1) 1px, transparent 1px)', backgroundSize: '36px 36px' }} />
          <div style={{ position: 'absolute', top: '8%', left: '10%', width: 420, height: 420, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.05), transparent 70%)', animation: 'settingOrb1 18s ease-in-out infinite alternate' }} />
          <div style={{ position: 'absolute', bottom: '10%', right: '8%', width: 360, height: 360, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.04), transparent 70%)', animation: 'settingOrb2 22s ease-in-out infinite alternate' }} />
        </div>
        <style>{`
        @keyframes settingOrb1 { from { transform: translate(0, 0) scale(1); } to { transform: translate(40px, 30px) scale(1.08); } }
        @keyframes settingOrb2 { from { transform: translate(0, 0) scale(1); } to { transform: translate(-35px, -25px) scale(1.06); } }
      `}</style>
        <div className="max-w-7xl mx-auto w-full relative z-10 space-y-8 mt-12">
          <button onClick={() => setView('home')} className="inline-flex items-center gap-2 p-2.5 backdrop-blur-lg bg-white/[0.03] hover:bg-white/[0.1] rounded-xl transition-all border border-white/5">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            <span className="text-white font-medium">Back to Portfolios</span>
          </button>

          <Alert type="error" message={error} onClose={() => setError('')} />
          <Alert type="success" message={successMsg} onClose={() => setSuccessMsg('')} />

          <div className="backdrop-blur-3xl bg-[#090b14]/70 rounded-[1.5rem] border border-white/5 shadow-2xl p-8 text-center">
            <div className="w-20 h-20 bg-emerald-500/20 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            </div>
            <h2 className="text-3xl font-extrabold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-2">Portfolio is Live!</h2>
            <p className="text-gray-400 mb-8">Your portfolio has been created and is ready to share</p>

            {/* Local Link */}
            <div className="backdrop-blur-lg bg-white/5 border border-white/10 rounded-xl p-6 mb-6 max-w-2xl mx-auto">
              <p className="text-sm text-gray-400 mb-3 font-medium">Local Portfolio Link</p>
              <div className="flex items-center gap-3 bg-slate-900/50 rounded-lg border border-white/10 p-3">
                <a href={portfolioLink} target="_blank" rel="noopener noreferrer" className="flex-1 text-cyan-400 hover:text-cyan-300 font-medium text-sm break-all text-left">
                  {portfolioLink}
                </a>
                <button onClick={() => copyToClipboard(portfolioLink, 'local')} className="shrink-0 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg text-sm font-semibold hover:from-indigo-500 hover:to-purple-500 transition-all duration-200">
                  {copied === 'local' ? '✅' : '📋 Copy'}
                </button>
              </div>
              <a href={portfolioLink} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-4 px-6 py-3 rounded-xl font-bold text-sm transition-all duration-500 bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/40">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                Visit Portfolio
              </a>
            </div>

            {/* Vercel Deploy */}
            <div className="backdrop-blur-lg bg-slate-900/80 border border-white/20 rounded-xl p-6 mb-6 max-w-2xl mx-auto">
              <div className="flex items-center justify-center gap-2 mb-3">
                <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L24 22H0L12 1Z" /></svg>
                <h3 className="text-lg font-bold text-white">Deploy to Vercel</h3>
              </div>
              <p className="text-gray-400 text-sm mb-4">Get a permanent, fast-loading URL for your portfolio</p>
              {vercelUrl ? (
                <div>
                  <div className="flex items-center gap-3 bg-slate-900/70 border border-white/10 rounded-lg p-3 mb-4">
                    <a href={vercelUrl} target="_blank" rel="noopener noreferrer" className="flex-1 text-emerald-400 hover:text-emerald-300 font-medium text-sm break-all text-left">
                      {vercelUrl}
                    </a>
                    <button onClick={() => copyToClipboard(vercelUrl, 'vercel')} className="shrink-0 px-4 py-2 bg-white text-gray-900 rounded-lg text-sm font-semibold hover:bg-gray-100 transition-all duration-200">
                      {copied === 'vercel' ? '✅' : '📋 Copy'}
                    </button>
                  </div>
                  <a href={vercelUrl} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-white text-gray-900 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-200">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L24 22H0L12 1Z" /></svg>
                    Visit on Vercel
                  </a>
                </div>
              ) : (
                <button onClick={() => handleDeployToVercel(deployedPortfolio?.portfolioId)} disabled={vercelDeploying}
                  className="inline-flex items-center gap-2 bg-white text-gray-900 px-8 py-3 rounded-xl font-bold hover:bg-gray-100 disabled:opacity-50 transition-all duration-200">
                  {vercelDeploying ? (
                    <><div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" /> Deploying to Vercel...</>
                  ) : (
                    <><svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L24 22H0L12 1Z" /></svg> Deploy to Vercel</>
                  )}
                </button>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <button onClick={() => { setView('create'); setCurrentStep(3); }} className="px-6 py-2.5 backdrop-blur-lg bg-purple-500/20 text-purple-300 rounded-xl font-medium border border-purple-500/30 hover:bg-purple-500/30 hover:border-purple-500/50 transition-all duration-200">
                🎨 Change Template
              </button>
              <button onClick={() => { setView('create'); setCurrentStep(2); }} className="px-6 py-2.5 backdrop-blur-lg bg-blue-500/20 text-blue-300 rounded-xl font-medium border border-blue-500/30 hover:bg-blue-500/30 hover:border-blue-500/50 transition-all duration-200">
                ✏️ Edit Content
              </button>
              <button onClick={() => setView('home')} className="px-6 py-2.5 backdrop-blur-lg bg-white/5 text-white rounded-xl font-medium border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-200">
                📂 My Portfolios
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════
  //  CREATE VIEW: 3-Step Wizard
  // ════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-black pt-24 pb-12 px-8 relative overflow-hidden flex flex-col justify-center">
      <div className="pointer-events-none fixed inset-0 z-0">
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(99,102,241,0.1) 1px, transparent 1px)', backgroundSize: '36px 36px' }} />
        <div style={{ position: 'absolute', top: '8%', left: '10%', width: 420, height: 420, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.05), transparent 70%)', animation: 'settingOrb1 18s ease-in-out infinite alternate' }} />
        <div style={{ position: 'absolute', bottom: '10%', right: '8%', width: 360, height: 360, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.04), transparent 70%)', animation: 'settingOrb2 22s ease-in-out infinite alternate' }} />
      </div>
      <style>{`
        @keyframes settingOrb1 { from { transform: translate(0, 0) scale(1); } to { transform: translate(40px, 30px) scale(1.08); } }
        @keyframes settingOrb2 { from { transform: translate(0, 0) scale(1); } to { transform: translate(-35px, -25px) scale(1.06); } }
      `}</style>
      <div className="max-w-7xl mx-auto w-full relative z-10 space-y-8 mt-12">
        {/* Header with Back Button */}
        <div className="flex items-start gap-4">
          <button onClick={() => setView('home')} className="p-2.5 backdrop-blur-lg bg-white/[0.03] hover:bg-white/[0.1] rounded-xl transition-all border border-white/5">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div>
            <h1 className="text-3xl font-black text-white leading-none tracking-tight mb-2">Create Portfolio</h1>
            <p className="text-gray-400 text-lg">Auto-generate your portfolio from your resume</p>
          </div>
        </div>

        <Alert type="error" message={error} onClose={() => setError('')} />
        <Alert type="success" message={successMsg} onClose={() => setSuccessMsg('')} />
        <StepIndicator />

        {/* STEP 1: Upload */}
        {currentStep === 1 && (
          <div className="backdrop-blur-3xl bg-[#090b14]/70 rounded-[1.5rem] border border-white/5 shadow-2xl p-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 rounded-2xl flex items-center justify-center border border-indigo-500/30">
                <svg className="w-7 h-7 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Upload Your Resume</h2>
                <p className="text-gray-400 text-sm">We'll auto-extract your details using AI</p>
              </div>
            </div>
            <div className="border-2 border-dashed border-white/20 rounded-xl p-16 text-center hover:border-cyan-400/50 hover:bg-white/5 transition-all duration-200 cursor-pointer bg-slate-900/30">
              <label className="cursor-pointer block">
                <div className="w-20 h-20 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-cyan-500/30">
                  <svg className="w-10 h-10 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                </div>
                <span className="text-lg font-semibold text-white block mb-2">
                  {resumeFile ? `✅ ${resumeFile.name}` : 'Choose a file or drag it here'}
                </span>
                <span className="text-sm text-gray-400">PDF, DOC, DOCX — Max 10MB</span>
                <input type="file" accept=".pdf,.doc,.docx" onChange={handleResumeUpload} disabled={loading} className="hidden" />
              </label>
              {loading && (
                <div className="mt-8">
                  <div className="w-10 h-10 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="mt-4 text-white font-medium">Extracting portfolio details with AI...</p>
                </div>
              )}
              {resumeParsed && !loading && (
                <div className="mt-8 inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-6 py-3 rounded-full font-semibold">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  Resume processed! Redirecting...
                </div>
              )}
            </div>
            <div className="mt-6 text-center">
              <button onClick={() => setCurrentStep(2)} className="text-cyan-400 hover:text-cyan-300 text-sm font-medium">
                Skip — I'll fill in manually →
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Review & Edit */}
        {currentStep === 2 && (
          <div className="space-y-6">
            {resumeParsed && (
              <div className="backdrop-blur-xl bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 rounded-xl p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-emerald-300">Resume Data Extracted!</h3>
                    <p className="text-sm text-emerald-400/80">Review and edit the information below</p>
                  </div>
                </div>
              </div>
            )}
            <div className="backdrop-blur-3xl bg-[#090b14]/70 rounded-[1.5rem] border border-white/5 shadow-2xl p-8">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">Portfolio Details</h2>
                <button onClick={() => setCurrentStep(1)} className="text-sm text-cyan-400 hover:text-cyan-300 font-medium">← Re-upload Resume</button>
              </div>

              {/* Profile Photo Upload */}
              <div className="mb-6 p-6 bg-[#0a0a0a] border border-white/10 rounded-xl">
                <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent flex items-center gap-2 mb-4">
                  📸 Profile Photo
                </h3>
                <div className="flex items-center gap-8">
                  {/* Preview */}
                  <div className="relative flex-shrink-0">
                    <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-indigo-500/40 shadow-lg shadow-indigo-500/20 bg-[#090b14] flex items-center justify-center">
                      {portfolioData.profilePhoto ? (
                        <img src={portfolioData.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <svg className="w-12 h-12 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      )}
                    </div>
                    {portfolioData.profilePhoto && (
                      <button
                        onClick={() => setPortfolioData(prev => ({ ...prev, profilePhoto: '' }))}
                        className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs hover:bg-red-400 transition-colors shadow-lg"
                      >×</button>
                    )}
                  </div>

                  {/* Upload Controls */}
                  <div className="flex-1">
                    <label
                      className="flex flex-col items-center justify-center gap-3 p-6 border-2 border-dashed border-white/10 rounded-xl bg-[#090b14]/50 hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all duration-300 cursor-pointer group"
                      onDragOver={e => e.preventDefault()}
                      onDrop={e => { e.preventDefault(); const file = e.dataTransfer.files[0]; if (file) handleProfilePhotoUpload(file); }}
                    >
                      <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center group-hover:bg-indigo-500/30 transition-colors">
                        <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-semibold text-white">
                          {portfolioData.profilePhoto ? 'Click to change photo' : 'Click or drag to upload'}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">JPG, PNG, WebP — Max 5MB</p>
                      </div>
                      <input
                        type="file" accept="image/*" className="hidden"
                        onChange={e => { if (e.target.files[0]) handleProfilePhotoUpload(e.target.files[0]); }}
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Personal Info */}
              <SectionCard title="Personal Information" icon="👤">
                <div className="grid md:grid-cols-2 gap-4">
                  <InputField label="Full Name" required value={portfolioData.name} onChange={v => handleDataUpdate('name', v)} placeholder="John Doe" />
                  <InputField label="Job Title" required value={portfolioData.title} onChange={v => handleDataUpdate('title', v)} placeholder="Full Stack Developer" />
                  <InputField label="Email" value={portfolioData.email} onChange={v => handleDataUpdate('email', v)} placeholder="john@example.com" type="email" />
                  <InputField label="Phone" value={portfolioData.phone} onChange={v => handleDataUpdate('phone', v)} placeholder="+91 9876543210" />
                  <InputField label="Location" value={portfolioData.location} onChange={v => handleDataUpdate('location', v)} placeholder="Mumbai, India" />
                  <InputField label="GitHub" value={portfolioData.github} onChange={v => handleDataUpdate('github', v)} placeholder="https://github.com/username" />
                  <InputField label="LinkedIn" value={portfolioData.linkedin} onChange={v => handleDataUpdate('linkedin', v)} placeholder="https://linkedin.com/in/username" />
                  <InputField label="Website" value={portfolioData.portfolio} onChange={v => handleDataUpdate('portfolio', v)} placeholder="https://yoursite.com" />
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-300 mb-2">About / Bio</label>
                    <textarea value={portfolioData.about} onChange={e => handleDataUpdate('about', e.target.value)} rows="4"
                      placeholder="Write a brief about yourself..."
                      className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 hover:bg-white/[0.02] transition-colors resize-none" />
                  </div>
                </div>
              </SectionCard>

              {/* Experience */}
              <SectionCard title="Experience" icon="💼" onAdd={() => handleArrayAdd('experience', { company: '', position: '', duration: '', description: '' })}>
                {portfolioData.experience.map((exp, i) => (
                  <div key={i} className="p-4 bg-[#0a0a0a] border border-white/10 rounded-xl mb-3 relative group hover:border-white/20 transition-all duration-200">
                    <button onClick={() => handleArrayRemove('experience', i)} className="absolute top-3 right-3 text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                    <div className="grid md:grid-cols-2 gap-3">
                      <input placeholder="Position" value={exp.position} onChange={e => handleArrayUpdate('experience', i, 'position', e.target.value)} className="px-3 py-2 bg-[#0a0a0a] border border-white/10 rounded-lg text-white placeholder-gray-600 text-sm focus:outline-none focus:border-indigo-500/50 hover:bg-white/[0.02] transition-colors" />
                      <input placeholder="Company" value={exp.company} onChange={e => handleArrayUpdate('experience', i, 'company', e.target.value)} className="px-3 py-2 bg-[#0a0a0a] border border-white/10 rounded-lg text-white placeholder-gray-600 text-sm focus:outline-none focus:border-indigo-500/50 hover:bg-white/[0.02] transition-colors" />
                      <input placeholder="Duration" value={exp.duration} onChange={e => handleArrayUpdate('experience', i, 'duration', e.target.value)} className="px-3 py-2 bg-[#0a0a0a] border border-white/10 rounded-lg text-white placeholder-gray-600 text-sm focus:outline-none focus:border-indigo-500/50 hover:bg-white/[0.02] transition-colors md:col-span-2" />
                      <textarea placeholder="Description" value={exp.description} onChange={e => handleArrayUpdate('experience', i, 'description', e.target.value)} rows="2" className="px-3 py-2 bg-[#0a0a0a] border border-white/10 rounded-lg text-white placeholder-gray-600 text-sm focus:outline-none focus:border-indigo-500/50 hover:bg-white/[0.02] transition-colors md:col-span-2 resize-none" />
                    </div>
                  </div>
                ))}
                {portfolioData.experience.length === 0 && <EmptyState text="No experience added" />}
              </SectionCard>

              {/* Education */}
              <SectionCard title="Education" icon="🎓" onAdd={() => handleArrayAdd('education', { degree: '', institution: '', year: '', cgpa: '' })}>
                {portfolioData.education.map((edu, i) => (
                  <div key={i} className="p-4 bg-[#0a0a0a] border border-white/10 rounded-xl mb-3 relative group hover:border-white/20 transition-all duration-200">
                    <button onClick={() => handleArrayRemove('education', i)} className="absolute top-3 right-3 text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                    <div className="grid md:grid-cols-2 gap-3">
                      <input placeholder="Degree" value={edu.degree} onChange={e => handleArrayUpdate('education', i, 'degree', e.target.value)} className="px-3 py-2 bg-[#0a0a0a] border border-white/10 rounded-lg text-white placeholder-gray-600 text-sm focus:outline-none focus:border-indigo-500/50 hover:bg-white/[0.02] transition-colors md:col-span-2" />
                      <input placeholder="Institution" value={edu.institution} onChange={e => handleArrayUpdate('education', i, 'institution', e.target.value)} className="px-3 py-2 bg-[#0a0a0a] border border-white/10 rounded-lg text-white placeholder-gray-600 text-sm focus:outline-none focus:border-indigo-500/50 hover:bg-white/[0.02] transition-colors" />
                      <input placeholder="Year" value={edu.year} onChange={e => handleArrayUpdate('education', i, 'year', e.target.value)} className="px-3 py-2 bg-[#0a0a0a] border border-white/10 rounded-lg text-white placeholder-gray-600 text-sm focus:outline-none focus:border-indigo-500/50 hover:bg-white/[0.02] transition-colors" />
                    </div>
                  </div>
                ))}
                {portfolioData.education.length === 0 && <EmptyState text="No education added" />}
              </SectionCard>

              {/* Skills */}
              <SectionCard title="Skills" icon="⚡">
                <div className="flex flex-wrap gap-2 mb-4">
                  {portfolioData.skills.map((skill, i) => (
                    <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-lg text-sm font-medium">
                      {skill}
                      <button onClick={() => handleRemoveSkill(skill)} className="hover:text-cyan-100">×</button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input type="text" placeholder="Add a skill (press Enter)" className="flex-1 px-4 py-2 bg-[#0a0a0a] border border-white/10 rounded-lg text-white placeholder-gray-600 text-sm focus:outline-none focus:border-indigo-500/50 hover:bg-white/[0.02] transition-colors"
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddSkill(e.target.value.trim()); e.target.value = ''; } }} />
                  <button onClick={e => { const input = e.target.closest('div').querySelector('input'); handleAddSkill(input.value.trim()); input.value = ''; }}
                    className="px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-500 bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/40">Add</button>
                </div>
              </SectionCard>

              {/* Projects */}
              <SectionCard title="Projects" icon="🚀" onAdd={() => handleArrayAdd('projects', { name: '', description: '', technologies: [], link: '' })}>
                {portfolioData.projects.map((proj, i) => (
                  <div key={i} className="p-4 bg-[#0a0a0a] border border-white/10 rounded-xl mb-3 relative group hover:border-white/20 transition-all duration-200">
                    <button onClick={() => handleArrayRemove('projects', i)} className="absolute top-3 right-3 text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                    <div className="space-y-3">
                      <input placeholder="Project Name" value={proj.name} onChange={e => handleArrayUpdate('projects', i, 'name', e.target.value)} className="w-full px-3 py-2 bg-[#0a0a0a] border border-white/10 rounded-lg text-white placeholder-gray-600 text-sm focus:outline-none focus:border-indigo-500/50 hover:bg-white/[0.02] transition-colors" />
                      <textarea placeholder="Description" value={proj.description} onChange={e => handleArrayUpdate('projects', i, 'description', e.target.value)} rows="2" className="w-full px-3 py-2 bg-[#0a0a0a] border border-white/10 rounded-lg text-white placeholder-gray-600 text-sm focus:outline-none focus:border-indigo-500/50 hover:bg-white/[0.02] transition-colors resize-none" />
                      <input placeholder="Technologies (comma separated)" value={Array.isArray(proj.technologies) ? proj.technologies.join(', ') : ''} onChange={e => handleArrayUpdate('projects', i, 'technologies', e.target.value.split(',').map(t => t.trim()))} className="w-full px-3 py-2 bg-[#0a0a0a] border border-white/10 rounded-lg text-white placeholder-gray-600 text-sm focus:outline-none focus:border-indigo-500/50 hover:bg-white/[0.02] transition-colors" />
                      <input placeholder="Project Link (optional)" value={proj.link || ''} onChange={e => handleArrayUpdate('projects', i, 'link', e.target.value)} className="w-full px-3 py-2 bg-[#0a0a0a] border border-white/10 rounded-lg text-white placeholder-gray-600 text-sm focus:outline-none focus:border-indigo-500/50 hover:bg-white/[0.02] transition-colors" />
                    </div>
                  </div>
                ))}
                {portfolioData.projects.length === 0 && <EmptyState text="No projects added" />}
              </SectionCard>

              {/* Certifications */}
              <SectionCard title="Certifications" icon="🏅" onAdd={() => handleArrayAdd('certifications', '')}>
                {portfolioData.certifications.map((cert, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <input placeholder="e.g., AWS Certified Developer" value={cert} onChange={e => handleArrayUpdate('certifications', i, null, e.target.value)}
                      className="flex-1 px-3 py-2 bg-[#0a0a0a] border border-white/10 rounded-lg text-white placeholder-gray-600 text-sm focus:outline-none focus:border-indigo-500/50 hover:bg-white/[0.02] transition-colors" />
                    <button onClick={() => handleArrayRemove('certifications', i)} className="text-red-400 hover:text-red-300 px-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                ))}
                {portfolioData.certifications.length === 0 && <EmptyState text="No certifications added" />}
              </SectionCard>

              {/* Achievements */}
              <SectionCard title="Achievements" icon="🏆" onAdd={() => handleArrayAdd('achievements', '')}>
                {portfolioData.achievements.map((ach, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <input placeholder="e.g., Won National Hackathon" value={ach} onChange={e => handleArrayUpdate('achievements', i, null, e.target.value)}
                      className="flex-1 px-3 py-2 bg-[#0a0a0a] border border-white/10 rounded-lg text-white placeholder-gray-600 text-sm focus:outline-none focus:border-indigo-500/50 hover:bg-white/[0.02] transition-colors" />
                    <button onClick={() => handleArrayRemove('achievements', i)} className="text-red-400 hover:text-red-300 px-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                ))}
                {portfolioData.achievements.length === 0 && <EmptyState text="No achievements added" />}
              </SectionCard>

              <button onClick={() => {
                if (!portfolioData.name || !portfolioData.title) {
                  setError('Please fill in Name and Title before continuing');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  return;
                }
                setError('');
                setCurrentStep(3);
              }}
                className="w-full mt-6 px-6 py-3 rounded-xl font-bold text-sm transition-all duration-500 bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/40">
                Continue to Template Selection →
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Template Selection */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="backdrop-blur-3xl bg-[#090b14]/70 rounded-[1.5rem] border border-white/5 shadow-2xl p-8">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">Choose Your Template</h2>
                  <p className="text-gray-400 text-sm mt-1">10 professionally designed themes</p>
                </div>
                <button onClick={() => setCurrentStep(2)} className="text-sm text-cyan-400 hover:text-cyan-300 font-medium">← Back to Edit</button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
                {TEMPLATE_META.map((tmpl) => {
                  const isSelected = selectedTemplate === tmpl.key;
                  return (
                    <div key={tmpl.key} onClick={() => setSelectedTemplate(tmpl.key)}
                      className={`relative backdrop-blur-lg bg-[#0a0a0a] border rounded-xl cursor-pointer overflow-hidden transition-all duration-200 ${isSelected ? 'border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)] scale-105' : 'border-white/10 hover:border-cyan-400/50 hover:scale-105'
                        }`}>
                      <div className={`bg-gradient-to-br ${tmpl.gradient} h-32 flex items-end p-3 text-white relative`}>
                        {/* Mock layout lines */}
                        <div className="absolute inset-0 p-3 flex flex-col items-center justify-center opacity-80">
                          <div className="w-8 h-8 rounded-full bg-white/30 mb-2 ring-2 ring-white/20" />
                          <div className="h-1.5 w-16 bg-white/40 rounded-full mb-1" />
                          <div className="h-1 w-12 bg-white/25 rounded-full mb-2" />
                          <div className="flex gap-1">
                            <div className="h-1 w-4 bg-white/30 rounded-full" />
                            <div className="h-1 w-4 bg-white/30 rounded-full" />
                            <div className="h-1 w-4 bg-white/30 rounded-full" />
                          </div>
                        </div>
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-6 h-6 bg-cyan-400 rounded-full flex items-center justify-center shadow-md z-10">
                            <svg className="w-3.5 h-3.5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                          </div>
                        )}
                      </div>
                      <div className="p-3 bg-[#0a0a0a]">
                        <div className="flex items-center gap-2 mb-0.5">
                          <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${tmpl.gradient}`} />
                          <h3 className="font-bold text-white text-xs truncate">{tmpl.name}</h3>
                        </div>
                        <p className="text-[10px] text-gray-400 leading-tight">{tmpl.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Live Preview */}
              <div className="mb-8">
                <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent mb-4">Live Preview</h3>
                <div className="border border-white/10 rounded-2xl overflow-hidden shadow-[0_0_20px_rgba(6,182,212,0.1)]" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                  {(() => {
                    const TemplateComp = TEMPLATES_MAP[selectedTemplate] || Template1;
                    return <TemplateComp data={portfolioData} />;
                  })()}
                </div>
              </div>

              {error && (
                <div className="bg-red-500/20 text-red-300 border border-red-500/30 rounded-xl p-4 mb-4">
                  <p className="text-sm">{error}</p>
                </div>
              )}

              <button onClick={handleDeploy} disabled={loading}
                className="w-full px-6 py-3 rounded-xl font-bold text-sm transition-all duration-500 bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/40 disabled:opacity-50">
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Deploying...
                  </span>
                ) : '🚀 Deploy Portfolio'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ──────── Sub-Components ────────

function SectionCard({ title, icon, children, onAdd }) {
  return (
    <div className="mb-6 p-6 bg-[#0a0a0a] border border-white/10 rounded-xl">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent flex items-center gap-2">
          <span>{icon}</span> {title}
        </h3>
        {onAdd && (
          <button onClick={onAdd} className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/40">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Add
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

function InputField({ label, value, onChange, placeholder, type = 'text', required }) {
  return (
    <div>
      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <input type={type} value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className={`w-full px-4 py-3 bg-[#0a0a0a] border rounded-xl text-white placeholder-gray-600 text-sm focus:outline-none focus:border-indigo-500/50 hover:bg-white/[0.02] transition-colors ${required && !value ? 'border-amber-500/50' : 'border-white/10'
          }`} />
    </div>
  );
}

function EmptyState({ text }) {
  return <p className="text-gray-500 text-center py-4 text-sm">{text}</p>;
}

export default PortfolioGenerator;
