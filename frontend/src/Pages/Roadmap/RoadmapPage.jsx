import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Map, Zap, ArrowLeft, Clock } from 'lucide-react';
import {
  generateRoadmap,
  getRoadmapById,
  getRoadmapHistory,
  updateSkillStatus,
} from '../Services/roadmapService';
import { getProfile } from '../Services/profileService';
import { getInterviewHistory } from '../Services/interviewResultService';
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
  // Shown instead of a form: these values live on the profile now.
  const [profile,          setProfile]          = useState(null);
  const [loadingProfile,   setLoadingProfile]   = useState(true);
  // The interview score for this role, shown as a readiness signal beside the plan.
  const [latestInterview,  setLatestInterview]  = useState(null);
  const [loadingInterview, setLoadingInterview] = useState(true);

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

  // Read fresh rather than from the session, so edits made in the profile are
  // reflected here without signing in again.
  useEffect(() => {
    getProfile()
      .then((response) => {
        const p = response?.data || null;
        setProfile(p);

        // Scoped to the role the plan is for — a score earned while targeting
        // another track says nothing about readiness for this one.
        return getInterviewHistory()
          .then((res) => {
            const all = res?.data?.data?.results || [];
            setLatestInterview(all.find((r) => r.role === p?.target_role) || null);
          })
          .catch((err) => console.error('Failed to load interview history:', err));
      })
      .catch((err) => console.error('Failed to load profile for roadmap:', err))
      .finally(() => { setLoadingProfile(false); setLoadingInterview(false); });
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
      setRoadmapData({ roadmap_id: data?.roadmap_id || id, duration: data?.total_duration_weeks || data?.duration || 0, skills: data?.skills || [], weeklyPlans: data?.weekly_plans || [], status: data?.status || 'active', isStale: Boolean(data?.is_stale) });
      setSelectedRoadmapId(id);
      // Selecting a roadmap from the history list loaded it into state just
      // fine, but left the history list on screen — the load was invisible
      // unless the learner also clicked "Back to roadmap" themselves.
      setShowHistory(false);
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

  /* generate — the inputs are already on the profile, so there is nothing to
     collect or save first. */
  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const res  = await generateRoadmap();
      const data = res?.data;
      setRoadmapData({ roadmap_id: data?.roadmap_id, duration: data?.duration || 0, skills: data?.skills || [], weeklyPlans: data?.weekly_plans || [], status: data?.status || 'active' });
      setSelectedRoadmapId(data?.roadmap_id || '');
      await loadHistory();
      if (data?.roadmap_id) await loadRoadmapById(data.roadmap_id);
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
        <RoadmapForm
          isGenerating={isGenerating}
          onGenerate={handleGenerate}
          profile={profile}
          loadingProfile={loadingProfile}
        />
      ) : (
        <RoadmapTimeline
          roadmapData={roadmapData}
          isRoadmapLoading={isRoadmapLoading}
          updatingSkill={updatingSkill}
          onMarkCompleted={handleMarkCompleted}
          onRegenerate={handleGenerate}
          latestInterview={latestInterview}
          loadingInterview={loadingInterview}
          targetRole={profile?.target_role}
        />
      )}
    </LearnerShell>
  );
};

export default RoadmapPage;

