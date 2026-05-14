import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Map, Zap, ArrowLeft, Clock } from 'lucide-react';
import {
  generateRoadmap,
  getRoadmapById,
  getRoadmapHistory,
  updateSkillStatus,
  updateRoadmapSkillsProfile,
  updateRoadmapAvailability,
} from '../Services/roadmapService';
import HistorySidebar from './components/HistorySidebar';
import RoadmapForm    from './components/RoadmapForm';
import RoadmapTimeline from './components/RoadmapTimeline';

/* ── helpers ─────────────────────────────────────────────────────── */
const getErrorMessage = (error, fallback) => {
  if (error?.message) return error.message;
  if (error?.error)   return error.error;
  return fallback;
};

const TARGET_ROLE_ENUMS = [
  'MERN', 'AI', 'Cyber', 'Data Science', 'DevOps', 'Mobile',
  'MERN Developer', 'AI/ML Engineer', 'Cybersecurity Engineer',
  'Data Science Engineer', 'DevOps Engineer', 'Mobile Developer',
];

const normalizeTargetRole = (value) => {
  const role = String(value || '').trim();
  if (!role) return '';
  if (TARGET_ROLE_ENUMS.includes(role)) return role;
  const lower      = role.toLowerCase();
  const normalized = lower.replace(/[^a-z0-9\s/+.-]/g, ' ').replace(/\s+/g, ' ').trim();
  if (normalized === 'mern' || normalized.includes('full stack') || normalized.includes('fullstack')) return 'MERN Developer';
  if (['frontend','front end','backend','back end','web developer','software developer','software engineer','javascript developer','react developer','node','express'].some(k => normalized.includes(k))) return 'MERN Developer';
  if (['ai/ml','machine learning','ml engineer','artificial intelligence','llm','genai','prompt engineer','ai engineer','ml','ai'].some(k => normalized.includes(k))) return 'AI/ML Engineer';
  if (['data scientist','data science','data analyst','analytics','business analyst','bi analyst'].some(k => normalized.includes(k)) || (normalized.includes('data') && normalized.includes('engineer')) || normalized.includes('data')) return 'Data Science Engineer';
  if (['devops','site reliability','sre','platform engineer','cloud engineer','cloud architect','kubernetes','docker','infrastructure'].some(k => normalized.includes(k))) return 'DevOps Engineer';
  if (['mobile','android','ios','react native','flutter','swift','kotlin'].some(k => normalized.includes(k))) return 'Mobile Developer';
  if (['cyber','security engineer','information security','infosec','penetration','pentest','ethical hacker','soc analyst','network security'].some(k => normalized.includes(k))) return 'Cybersecurity Engineer';
  return '';
};

const normalizeSkills = (skills) => {
  if (!Array.isArray(skills)) return [];
  return [...new Set(skills.map(s => String(s || '').trim()).filter(Boolean))];
};

const SUPPORTED_ROLES = [
  { label: 'MERN Developer',        color: 'text-indigo-300',  bg: 'bg-indigo-500/10 border-indigo-500/25' },
  { label: 'AI/ML Engineer',        color: 'text-violet-300',  bg: 'bg-violet-500/10 border-violet-500/25' },
  { label: 'Data Science Engineer', color: 'text-cyan-300',    bg: 'bg-cyan-500/10 border-cyan-500/25' },
  { label: 'DevOps Engineer',       color: 'text-emerald-300', bg: 'bg-emerald-500/10 border-emerald-500/25' },
  { label: 'Mobile Developer',      color: 'text-amber-300',   bg: 'bg-amber-500/10 border-amber-500/25' },
  { label: 'Cybersecurity Engineer',color: 'text-rose-300',    bg: 'bg-rose-500/10 border-rose-500/25' },
];

const QUICK_TIPS = [
  'Be specific — "MERN Developer" works better than just "developer".',
  'List technologies you already know (e.g., HTML, Python, Git).',
  'More hours per week = shorter, denser roadmap. Be realistic.',
  'Choose "Mixed" style if you enjoy both reading and building.',
];

/* ── component ───────────────────────────────────────────────────── */
const RoadmapPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [history,          setHistory]         = useState([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [isGenerating,     setIsGenerating]     = useState(false);
  const [isRoadmapLoading, setIsRoadmapLoading] = useState(false);
  const [selectedRoadmapId,setSelectedRoadmapId]= useState('');
  const [roadmapData,      setRoadmapData]      = useState(null);
  const [updatingSkill,    setUpdatingSkill]    = useState('');
  const [showHistory,      setShowHistory]      = useState(false);

  // Auto-open history if navigated from "View History" button
  useEffect(() => {
    if (location.state?.openHistory) {
      handleOpenHistory();
      // Clear the state so refresh doesn't re-trigger
      window.history.replaceState({}, '');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const summary = useMemo(() => {
    const skills    = roadmapData?.skills || [];
    const completed = skills.filter(s => s.status === 'completed').length;
    const pending   = skills.length - completed;
    return { total: skills.length, completed, pending, duration: roadmapData?.duration || 0 };
  }, [roadmapData]);

  /* data loading */
  const loadRoadmapById = async (id) => {
    if (!id) return;
    setIsRoadmapLoading(true);
    try {
      const res  = await getRoadmapById(id);
      const data = res?.data;
      setRoadmapData({ roadmap_id: data?.roadmap_id || id, duration: data?.total_duration_weeks || data?.duration || 0, skills: data?.skills || [], status: data?.status || 'active' });
      setSelectedRoadmapId(id);
    } catch (err) { toast.error(getErrorMessage(err, 'Failed to load roadmap.')); }
    finally       { setIsRoadmapLoading(false); }
  };

  const loadHistory = async () => {
    setIsHistoryLoading(true);
    try {
      const res   = await getRoadmapHistory();
      const items = (res?.data || []).slice(0, 5);
      setHistory(items);
      if (items.length > 0) { await loadRoadmapById(items[0].roadmap_id); }
      else                  { setRoadmapData(null); setSelectedRoadmapId(''); }
    } catch (err) { toast.error(getErrorMessage(err, 'Failed to load history.')); setHistory([]); }
    finally       { setIsHistoryLoading(false); }
  };

  /* generate */
  const validateForm = (form) => {
    if (!form.targetRole?.trim())                              return 'Target Role is required.';
    if (!form.experienceLevel)                                 return 'Experience Level is required.';
    if (!form.skills || form.skills.length === 0)              return 'At least one Current Skill is required.';
    if (!form.hoursPerWeek || Number(form.hoursPerWeek) <= 0)  return 'Learning hours must be greater than 0.';
    if (!form.learningStyle)                                   return 'Learning Style is required.';
    return '';
  };

  const handleGenerate = async (form, resetForm) => {
    const err = validateForm(form);
    if (err) { toast.error(err); return; }

    const role   = normalizeTargetRole(form.targetRole);
    const skills = normalizeSkills(form.skills);

    if (!role)          { toast.error('Target Role not supported. Try: MERN Developer, AI/ML Engineer, Data Science Engineer, DevOps Engineer, Mobile Developer, or Cybersecurity Engineer.'); return; }
    if (!skills.length) { toast.error('Please add at least one valid skill.'); return; }

    setIsGenerating(true);
    try {
      const r1 = await updateRoadmapSkillsProfile({ target_role: role, experience_level: form.experienceLevel, current_skills: skills });
      if (!r1?.success) throw new Error('Failed to save skills profile.');
      const r2 = await updateRoadmapAvailability({ hours_per_week: Number(form.hoursPerWeek), learning_style: form.learningStyle });
      if (!r2?.success) throw new Error('Failed to save availability.');
      const res  = await generateRoadmap();
      const data = res?.data;
      setRoadmapData({ roadmap_id: data?.roadmap_id, duration: data?.duration || 0, skills: data?.skills || [], status: data?.status || 'active' });
      setSelectedRoadmapId(data?.roadmap_id || '');
      await loadHistory();
      if (data?.roadmap_id) await loadRoadmapById(data.roadmap_id);
      resetForm();
      toast.success('Roadmap generated successfully!');
    } catch (err) { toast.error(getErrorMessage(err, 'Failed to generate roadmap.')); }
    finally       { setIsGenerating(false); }
  };

  const handleMarkCompleted = async (skillName) => {
    if (!skillName || !roadmapData) return;
    const prev = roadmapData.skills || [];
    setRoadmapData(d => ({ ...d, skills: prev.map(s => s.skill === skillName ? { ...s, status: 'completed' } : s) }));
    setUpdatingSkill(skillName);
    try { await updateSkillStatus(skillName, 'completed'); toast.success('Skill marked as completed.'); }
    catch (err) { setRoadmapData(d => ({ ...d, skills: prev })); toast.error(getErrorMessage(err, 'Failed to update skill.')); }
    finally     { setUpdatingSkill(''); }
  };

  const handleOpenHistory = async () => {
    setShowHistory(true);
    if (history.length === 0) await loadHistory();
  };

  const handleBackToForm = () => { setRoadmapData(null); setSelectedRoadmapId(''); setShowHistory(false); };

  const hasRoadmap     = Boolean(roadmapData && (roadmapData.skills || []).length > 0);
  const showRoadmapView = hasRoadmap || isRoadmapLoading;

  /* ── Active roadmap / history view ───────────────────────────── */
  if (showHistory || showRoadmapView) {
    return (
      <div className="min-h-screen bg-black text-white font-sans pt-32 pb-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">

        {/* ── Animated background ── */}
        <div className="pointer-events-none fixed inset-0 z-0">
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'radial-gradient(circle, rgba(99,102,241,0.08) 1px, transparent 1px)',
            backgroundSize: '36px 36px',
          }} />
          <div style={{
            position: 'absolute', top: '4%', left: '8%',
            width: 520, height: 520, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(99,102,241,0.06), transparent 70%)',
          }} />
          <div style={{
            position: 'absolute', bottom: '8%', right: '6%',
            width: 380, height: 380, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(139,92,246,0.05), transparent 70%)',
          }} />
        </div>

        <style>{`
          .stat-card { transition: border-color 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease; }
          .stat-card:hover { transform: translateY(-3px); }
          .stat-card.emerald:hover { border-color: rgba(52,211,153,0.3) !important; box-shadow: 0 0 28px -8px rgba(52,211,153,0.2); }
          .stat-card.amber:hover   { border-color: rgba(251,191,36,0.3)  !important; box-shadow: 0 0 28px -8px rgba(251,191,36,0.2);  }
          .stat-card.indigo:hover  { border-color: rgba(99,102,241,0.3)  !important; box-shadow: 0 0 28px -8px rgba(99,102,241,0.2);  }
          .stat-card.white:hover   { border-color: rgba(255,255,255,0.12) !important; box-shadow: 0 0 28px -8px rgba(255,255,255,0.08); }
          .hdr-btn { transition: all 0.25s ease; }
          .hdr-btn:hover { transform: translateY(-1px); }
        `}</style>

        <div className="relative z-10 max-w-7xl mx-auto">

          {/* ── Header ── */}
          <div className="flex items-start justify-between mb-10 pb-8 border-b border-white/5">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-widest mb-4">
                <Map size={10} /> Career Roadmap
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
                {showHistory ? 'Roadmap History' : 'Your Generated Roadmap'}
              </h1>
              <p className="text-slate-500 text-sm mt-1.5">
                {showHistory
                  ? 'Browse and switch between your saved roadmaps.'
                  : 'Follow each step and track your progress below.'}
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {showRoadmapView && !showHistory && (
                <button
                  onClick={handleOpenHistory}
                  className="hdr-btn px-4 py-2.5 rounded-xl text-xs font-black backdrop-blur-3xl bg-[#090b14]/70 border border-white/8 hover:border-indigo-500/30 hover:bg-indigo-500/8 text-slate-300 hover:text-indigo-300 flex items-center gap-2 shadow-lg"
                >
                  <Clock size={13} /> History
                </button>
              )}
              <button
                onClick={handleBackToForm}
                className="hdr-btn px-4 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white flex items-center gap-2 shadow-lg shadow-indigo-500/25"
              >
                <Zap size={13} /> New Roadmap
              </button>
            </div>
          </div>

          {/* ── Summary stat cards ── */}
          {hasRoadmap && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
              {[
                { label: 'Total Skills', value: summary.total,           color: 'text-white',        accent: 'white',   orb: 'rgba(255,255,255,0.04)' },
                { label: 'Completed',   value: summary.completed,        color: 'text-emerald-400',  accent: 'emerald', orb: 'rgba(52,211,153,0.06)' },
                { label: 'Remaining',   value: summary.pending,          color: 'text-amber-400',    accent: 'amber',   orb: 'rgba(251,191,36,0.06)' },
                { label: 'Est. Weeks',  value: summary.duration || '—',  color: 'text-indigo-400',   accent: 'indigo',  orb: 'rgba(99,102,241,0.06)' },
              ].map(s => (
                <div
                  key={s.label}
                  className={`stat-card ${s.accent} backdrop-blur-3xl bg-[#090b14]/70 rounded-[1.5rem] border border-white/5 shadow-2xl px-6 py-5 text-center relative overflow-hidden`}
                >
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: `radial-gradient(circle at 50% 100%, ${s.orb}, transparent 70%)`,
                  }} />
                  <p className={`text-4xl font-black tracking-tight relative z-10 ${s.color}`}>{s.value}</p>
                  <p className="text-[11px] text-slate-600 uppercase tracking-widest font-bold mt-2 relative z-10">{s.label}</p>
                </div>
              ))}
            </div>
          )}

          {/* ── Content ── */}
          {showHistory ? (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
              <div className="xl:col-span-3">
                <HistorySidebar
                  history={history}
                  selectedRoadmapId={selectedRoadmapId}
                  onSelectRoadmap={loadRoadmapById}
                  isLoading={isHistoryLoading}
                />
              </div>
              <div className="xl:col-span-9">
                <RoadmapTimeline
                  roadmapData={roadmapData}
                  isRoadmapLoading={isRoadmapLoading}
                  updatingSkill={updatingSkill}
                  onMarkCompleted={handleMarkCompleted}
                />
              </div>
            </div>
          ) : (
            <RoadmapTimeline
              roadmapData={roadmapData}
              isRoadmapLoading={isRoadmapLoading}
              updatingSkill={updatingSkill}
              onMarkCompleted={handleMarkCompleted}
            />
          )}
        </div>
      </div>
    );
  }

  /* ── Generator form view ─────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-black text-white font-sans pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">

      {/* ── Animated background ── */}
      <div className="pointer-events-none fixed inset-0 z-0">
        {/* dot grid */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(circle, rgba(99,102,241,0.08) 1px, transparent 1px)',
          backgroundSize: '36px 36px',
        }} />
        {/* orbs */}
        <div style={{
          position: 'absolute', top: '5%', left: '10%',
          width: 500, height: 500, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.06), transparent 70%)',
        }} />
        <div style={{
          position: 'absolute', bottom: '10%', right: '8%',
          width: 380, height: 380, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.05), transparent 70%)',
        }} />
      </div>

      <style>{`
        .info-card {
          transition: border-color 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease;
        }
        .info-card:hover {
          border-color: rgba(99,102,241,0.25) !important;
          box-shadow: 0 0 32px -8px rgba(99,102,241,0.15);
          transform: translateY(-2px);
        }
        .history-cta {
          transition: border-color 0.3s ease, box-shadow 0.3s ease, background 0.3s ease, transform 0.3s ease;
        }
        .history-cta:hover {
          border-color: rgba(99,102,241,0.35) !important;
          background: rgba(99,102,241,0.08) !important;
          box-shadow: 0 0 32px -8px rgba(99,102,241,0.2);
          transform: translateY(-2px);
        }
      `}</style>

      <div className="relative z-10 max-w-6xl mx-auto">

        {/* Back link */}
        <button
          onClick={() => navigate('/roadmap')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-indigo-400 transition-colors mb-10 group"
        >
          <ArrowLeft size={13} className="group-hover:-translate-x-0.5 transition-transform duration-200" />
          Back to Roadmap Overview
        </button>

        {/* Page header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[11px] font-black uppercase tracking-widest mb-5">
            <Map size={11} /> Generator
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
            Generate Your{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
              Career Roadmap
            </span>
          </h1>
          <p className="text-slate-400 max-w-xl mx-auto text-sm leading-relaxed">
            Fill in the details below. Our AI will build a personalised, week-by-week learning path tailored to your goals and schedule.
          </p>
        </div>

        {/* Main 7 / 5 grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Form — 7 cols */}
          <div className="lg:col-span-7">
            <RoadmapForm isGenerating={isGenerating} onGenerate={handleGenerate} />
          </div>

          {/* Right info panel — 5 cols */}
          <div className="lg:col-span-5 flex flex-col gap-5">

            {/* Quick Tips */}
            <div className="info-card backdrop-blur-3xl bg-[#090b14]/70 rounded-[1.5rem] border border-white/5 shadow-2xl p-6">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="p-1.5 rounded-lg bg-amber-500/15 border border-amber-500/25">
                  <Zap size={13} className="text-amber-400" />
                </div>
                <h3 className="text-[11px] font-black uppercase tracking-widest text-amber-400">Quick Tips</h3>
              </div>
              <ul className="space-y-3.5">
                {QUICK_TIPS.map((tip, i) => (
                  <li key={i} className="flex items-start gap-3 text-[13px] text-slate-400 leading-relaxed">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>

            {/* Supported Roles */}
            <div className="info-card backdrop-blur-3xl bg-[#090b14]/70 rounded-[1.5rem] border border-white/5 shadow-2xl p-6">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="p-1.5 rounded-lg bg-violet-500/15 border border-violet-500/25">
                  <Map size={13} className="text-violet-400" />
                </div>
                <h3 className="text-[11px] font-black uppercase tracking-widest text-violet-400">Supported Roles</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {SUPPORTED_ROLES.map(role => (
                  <span
                    key={role.label}
                    className={`text-[11px] font-bold px-3 py-1.5 rounded-full border ${role.bg} ${role.color} transition-all duration-200 hover:scale-105`}
                  >
                    {role.label}
                  </span>
                ))}
              </div>
            </div>

            {/* View History CTA */}
            <button
              onClick={handleOpenHistory}
              className="history-cta w-full backdrop-blur-3xl bg-[#090b14]/70 rounded-[1.5rem] border border-white/5 shadow-2xl p-6 text-left flex items-center justify-between group"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Clock size={14} className="text-indigo-400" />
                  <p className="text-white font-black text-sm">View Past Roadmaps</p>
                </div>
                <p className="text-slate-500 text-[12px] ml-6">Browse your previously generated career paths.</p>
              </div>
              <span className="w-8 h-8 rounded-full bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center text-indigo-400 group-hover:text-white group-hover:bg-indigo-500/30 group-hover:translate-x-0.5 transition-all duration-200 shrink-0">
                →
              </span>
            </button>

          </div>
        </div>
      </div>
    </div>
  );
};

export default RoadmapPage;

