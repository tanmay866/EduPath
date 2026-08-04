import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
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
import { LearnerShell, StatStrip, Button, MicroLabel } from '../../design';
import { learnerNav, sessionInitials, sessionName, sessionLoginId } from '../../design/nav';

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
  const location = useLocation();

  const [history,          setHistory]         = useState([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [isGenerating,     setIsGenerating]     = useState(false);
  const [isRoadmapLoading, setIsRoadmapLoading] = useState(false);
  const [selectedRoadmapId,setSelectedRoadmapId]= useState('');
  const [roadmapData,      setRoadmapData]      = useState(null);
  const [updatingSkill,    setUpdatingSkill]    = useState('');
  const [showHistory,      setShowHistory]      = useState(false);

  // Load whatever the learner already has. Previously this only ran when
  // arriving from "View History", so a returning user with a saved roadmap
  // always landed on the empty generate form. loadHistory opens the most
  // recent roadmap once the list comes back.
  useEffect(() => {
    if (location.state?.openHistory) {
      handleOpenHistory();
      // Clear the state so refresh doesn't re-trigger
      window.history.replaceState({}, '');
    } else {
      loadHistory();
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

  /* ── Active roadmap / history view ───────────────────────────── */
  // One return below handles all three states: history, the form when nothing
  // is loaded, and the timeline. The dark-themed branch that used to sit here
  // rendered its own page chrome and is redundant under the learner shell.

  /* ── Generator form view ─────────────────────────────────────── */
  return (
    <LearnerShell
      sections={learnerNav}
      eyebrow="Learner"
      title="Roadmap"
      note={sessionName()}
      initials={sessionInitials()}
      footLabel={sessionLoginId()}
    >
      {/* Full-bleed stat strip, per §7 Roadmap. */}
      <StatStrip
        cellPadding="18px 26px"
        items={[
          { label: 'Total skills', value: summary.total },
          { label: 'Completed', value: summary.completed },
          { label: 'Remaining', value: summary.pending },
          { label: 'Est. weeks', value: summary.duration || '—' },
        ]}
      />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <MicroLabel size={10.5} tracking="0.13em">
          {showHistory ? 'Roadmap history' : 'Your generated roadmap'}
        </MicroLabel>
        <div style={{ display: 'flex', gap: 12 }}>
          <Button
            variant="secondary"
            style={{ padding: '9px 16px', fontSize: 13.5 }}
            onClick={() => (showHistory ? setShowHistory(false) : handleOpenHistory())}
          >
            {showHistory ? 'Back to roadmap' : 'History'}
          </Button>
          <Button
            variant="attention"
            onClick={handleBackToForm}
          >
            Generate new
          </Button>
        </div>
      </div>

      {/* History, else the form when nothing is loaded, else the timeline.
          "Generate new" clears roadmapData, which is what reveals the form. */}
      {showHistory ? (
        <HistorySidebar
          history={history}
          isLoading={isHistoryLoading}
          selectedRoadmapId={selectedRoadmapId}
          onSelectRoadmap={loadRoadmapById}
        />
      ) : !roadmapData && !isRoadmapLoading && !isHistoryLoading ? (
        // isHistoryLoading is included so the form does not flash on mount while
        // the saved roadmap is still being fetched.
        <RoadmapForm isGenerating={isGenerating} onGenerate={handleGenerate} />
      ) : (
        <RoadmapTimeline
          roadmapData={roadmapData}
          isRoadmapLoading={isRoadmapLoading}
          updatingSkill={updatingSkill}
          onMarkCompleted={handleMarkCompleted}
        />
      )}
    </LearnerShell>
  );
};

export default RoadmapPage;

