import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

  const [history,          setHistory]         = useState([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [isGenerating,     setIsGenerating]     = useState(false);
  const [isRoadmapLoading, setIsRoadmapLoading] = useState(false);
  const [selectedRoadmapId,setSelectedRoadmapId]= useState('');
  const [roadmapData,      setRoadmapData]      = useState(null);
  const [updatingSkill,    setUpdatingSkill]    = useState('');
  const [showHistory,      setShowHistory]      = useState(false);

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
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-violet-600/8 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/10">
            <div>
              <span className="inline-block text-xs font-semibold tracking-widest uppercase px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 mb-3">
                Career Roadmap
              </span>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white">
                {showHistory ? 'Roadmap History' : 'Your Generated Roadmap'}
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                {showHistory ? 'Browse and switch between your saved roadmaps.' : 'Follow each step and track your progress below.'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {showRoadmapView && !showHistory && (
                <button onClick={handleOpenHistory} className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-white/5 border border-white/15 hover:bg-white/10 hover:border-white/30 transition-all duration-200 flex items-center gap-1.5">
                  <Clock size={14} /> History
                </button>
              )}
              <button onClick={handleBackToForm} className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-indigo-500/15 border border-indigo-400/30 hover:bg-indigo-500/25 text-indigo-300 transition-all duration-200 flex items-center gap-1.5">
                <Zap size={14} /> New Roadmap
              </button>
            </div>
          </div>

          {/* Summary strip */}
          {hasRoadmap && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Total Skills',  value: summary.total,     color: 'text-white' },
                { label: 'Completed',     value: summary.completed, color: 'text-emerald-400' },
                { label: 'Remaining',     value: summary.pending,   color: 'text-amber-400' },
                { label: 'Est. Weeks',    value: summary.duration || '—', color: 'text-indigo-400' },
              ].map(s => (
                <div key={s.label} className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md px-5 py-4 text-center">
                  <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-slate-500 mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          )}

          {/* Content */}
          {showHistory ? (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
              <div className="xl:col-span-3">
                <HistorySidebar history={history} selectedRoadmapId={selectedRoadmapId} onSelectRoadmap={loadRoadmapById} isLoading={isHistoryLoading} />
              </div>
              <div className="xl:col-span-9">
                <RoadmapTimeline roadmapData={roadmapData} isRoadmapLoading={isRoadmapLoading} updatingSkill={updatingSkill} onMarkCompleted={handleMarkCompleted} />
              </div>
            </div>
          ) : (
            <RoadmapTimeline roadmapData={roadmapData} isRoadmapLoading={isRoadmapLoading} updatingSkill={updatingSkill} onMarkCompleted={handleMarkCompleted} />
          )}
        </div>
      </div>
    );
  }

  /* ── Generator form view ─────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-black text-white font-sans pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-violet-600/8 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto">

        {/* Page header */}
        <div className="mb-10">
          <button
            onClick={() => navigate('/roadmap')}
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft size={14} /> Back to Roadmap Overview
          </button>

          <div className="text-center">
            <span className="inline-block text-xs font-semibold tracking-widest uppercase px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/25 text-violet-300 mb-4">
              Generator
            </span>
            <h1 className="text-3xl md:text-4xl font-black text-white mb-3">
              Generate Your{' '}
              <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
                Career Roadmap
              </span>
            </h1>
            <p className="text-slate-400 max-w-xl mx-auto text-sm leading-relaxed">
              Fill in the details below. Our AI will build a personalised, week-by-week learning path tailored to your goals and schedule.
            </p>
          </div>
        </div>

        {/* Main 7 / 5 grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Form — 7 cols */}
          <div className="lg:col-span-7">
            <RoadmapForm isGenerating={isGenerating} onGenerate={handleGenerate} />
          </div>

          {/* Right info panel — 5 cols */}
          <div className="lg:col-span-5 flex flex-col gap-5">

            {/* Quick tips */}
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6">
              <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
                <Zap size={15} className="text-indigo-400" /> Quick Tips
              </h3>
              <ul className="space-y-3">
                {QUICK_TIPS.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-slate-400">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>

            {/* Supported roles */}
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6">
              <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
                <Map size={15} className="text-violet-400" /> Supported Roles
              </h3>
              <div className="flex flex-wrap gap-2">
                {SUPPORTED_ROLES.map(role => (
                  <span key={role.label} className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${role.bg} ${role.color}`}>
                    {role.label}
                  </span>
                ))}
              </div>
            </div>

            {/* History CTA */}
            <button
              onClick={handleOpenHistory}
              className="w-full rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 backdrop-blur-md p-5 text-left flex items-center justify-between group transition-all duration-200"
            >
              <div>
                <p className="text-white font-semibold text-sm">View Past Roadmaps</p>
                <p className="text-slate-500 text-xs mt-1">Browse your previously generated career paths.</p>
              </div>
              <span className="text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all duration-200">→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoadmapPage;
