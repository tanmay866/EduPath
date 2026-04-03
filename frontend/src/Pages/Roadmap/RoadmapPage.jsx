import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import {
  generateRoadmap,
  getRoadmapById,
  getRoadmapHistory,
  updateSkillStatus,
  updateRoadmapSkillsProfile,
  updateRoadmapAvailability,
} from '../Services/roadmapService';
import HistorySidebar from './components/HistorySidebar';
import RoadmapForm from './components/RoadmapForm';
import RoadmapTimeline from './components/RoadmapTimeline';

const getErrorMessage = (error, fallback) => {
  if (error?.message) return error.message;
  if (error?.error) return error.error;
  return fallback;
};

const TARGET_ROLE_ENUMS = [
  'MERN',
  'AI',
  'Cyber',
  'Data Science',
  'DevOps',
  'Mobile',
  'MERN Developer',
  'AI/ML Engineer',
  'Cybersecurity Engineer',
  'Data Science Engineer',
  'DevOps Engineer',
  'Mobile Developer',
];

const normalizeTargetRole = (value) => {
  const role = String(value || '').trim();
  if (!role) return '';
  if (TARGET_ROLE_ENUMS.includes(role)) return role;

  const lower = role.toLowerCase();
  const normalized = lower.replace(/[^a-z0-9\s/+.-]/g, ' ').replace(/\s+/g, ' ').trim();

  if (normalized === 'mern' || normalized.includes('full stack') || normalized.includes('fullstack')) return 'MERN Developer';
  if (
    normalized.includes('frontend')
    || normalized.includes('front end')
    || normalized.includes('backend')
    || normalized.includes('back end')
    || normalized.includes('web developer')
    || normalized.includes('software developer')
    || normalized.includes('software engineer')
    || normalized.includes('javascript developer')
    || normalized.includes('react developer')
    || normalized.includes('node')
    || normalized.includes('express')
  ) {
    return 'MERN Developer';
  }

  if (
    normalized.includes('ai/ml')
    || normalized.includes('machine learning')
    || normalized.includes('ml engineer')
    || normalized.includes('artificial intelligence')
    || normalized.includes('llm')
    || normalized.includes('genai')
    || normalized.includes('prompt engineer')
    || normalized.includes('ai engineer')
    || normalized.includes('ml')
    || normalized.includes('ai')
  ) {
    return 'AI/ML Engineer';
  }

  if (
    normalized.includes('data scientist')
    || normalized.includes('data science')
    || normalized.includes('data analyst')
    || normalized.includes('analytics')
    || normalized.includes('business analyst')
    || normalized.includes('bi analyst')
    || (normalized.includes('data') && normalized.includes('engineer'))
    || normalized.includes('data')
  ) {
    return 'Data Science Engineer';
  }

  if (
    normalized.includes('devops')
    || normalized.includes('site reliability')
    || normalized.includes('sre')
    || normalized.includes('platform engineer')
    || normalized.includes('cloud engineer')
    || normalized.includes('cloud architect')
    || normalized.includes('kubernetes')
    || normalized.includes('docker')
    || normalized.includes('infrastructure')
  ) {
    return 'DevOps Engineer';
  }

  if (
    normalized.includes('mobile')
    || normalized.includes('android')
    || normalized.includes('ios')
    || normalized.includes('react native')
    || normalized.includes('flutter')
    || normalized.includes('swift')
    || normalized.includes('kotlin')
  ) {
    return 'Mobile Developer';
  }

  if (
    normalized.includes('cyber')
    || normalized.includes('security engineer')
    || normalized.includes('information security')
    || normalized.includes('infosec')
    || normalized.includes('penetration')
    || normalized.includes('pentest')
    || normalized.includes('ethical hacker')
    || normalized.includes('soc analyst')
    || normalized.includes('network security')
  ) {
    return 'Cybersecurity Engineer';
  }

  return '';
};

const normalizeSkills = (skills) => {
  if (!Array.isArray(skills)) return [];

  const cleaned = skills
    .map((skill) => String(skill || '').trim())
    .filter(Boolean);

  return [...new Set(cleaned)];
};

const RoadmapPage = () => {
  const [history, setHistory] = useState([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRoadmapLoading, setIsRoadmapLoading] = useState(false);
  const [selectedRoadmapId, setSelectedRoadmapId] = useState('');
  const [roadmapData, setRoadmapData] = useState(null);
  const [updatingSkill, setUpdatingSkill] = useState('');
  const [showHistoryView, setShowHistoryView] = useState(false);

  const summary = useMemo(() => {
    const skills = roadmapData?.skills || [];
    const completed = skills.filter((item) => item.status === 'completed').length;
    const pending = skills.filter((item) => item.status !== 'completed').length;
    return {
      total: skills.length,
      completed,
      pending,
      duration: roadmapData?.duration || 0,
    };
  }, [roadmapData]);

  const loadRoadmapById = async (roadmapId) => {
    if (!roadmapId) return;

    setIsRoadmapLoading(true);
    try {
      const response = await getRoadmapById(roadmapId);
      const data = response?.data;

      setRoadmapData({
        roadmap_id: data?.roadmap_id || roadmapId,
        duration: data?.total_duration_weeks || data?.duration || 0,
        skills: data?.skills || [],
        status: data?.status || 'active',
      });

      setSelectedRoadmapId(roadmapId);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to load roadmap details.'));
    } finally {
      setIsRoadmapLoading(false);
    }
  };

  const loadHistory = async () => {
    setIsHistoryLoading(true);
    try {
      const response = await getRoadmapHistory();
      const items = response?.data || [];
      const latestFive = items.slice(0, 5);
      setHistory(latestFive);

      if (latestFive.length > 0) {
        const latestId = latestFive[0].roadmap_id;
        setSelectedRoadmapId(latestId);
        await loadRoadmapById(latestId);
      } else {
        setSelectedRoadmapId('');
        setRoadmapData(null);
      }
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to load roadmap history.'));
      setHistory([]);
    } finally {
      setIsHistoryLoading(false);
    }
  };

  useEffect(() => {
    // Keep initial view form-only. History opens on demand.
  }, []);

  const validateForm = (form) => {
    if (!form.targetRole?.trim()) return 'Target Role is required.';
    if (!form.experienceLevel) return 'Experience Level is required.';
    if (!form.skills || form.skills.length === 0) return 'At least one Current Skill is required.';
    if (!form.hoursPerWeek || Number(form.hoursPerWeek) <= 0) return 'Available Learning Time must be greater than 0.';
    if (!form.learningStyle) return 'Learning Style is required.';
    return '';
  };

  const handleGenerate = async (form, resetForm) => {
    const validationError = validateForm(form);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    const normalizedTargetRole = normalizeTargetRole(form.targetRole);
    const normalizedSkills = normalizeSkills(form.skills);

    if (!normalizedTargetRole) {
      toast.error('Target Role not supported. Try MERN Developer, AI/ML Engineer, Data Science Engineer, DevOps Engineer, Mobile Developer, or Cybersecurity Engineer.');
      return;
    }

    if (normalizedSkills.length === 0) {
      toast.error('Please add at least one valid current skill.');
      return;
    }

    setIsGenerating(true);
    try {
      const skillsUpdateRes = await updateRoadmapSkillsProfile({
        target_role: normalizedTargetRole,
        experience_level: form.experienceLevel,
        current_skills: normalizedSkills,
      });

      if (!skillsUpdateRes?.success) {
        throw new Error('Failed to save current skills for roadmap generation.');
      }

      const availabilityUpdateRes = await updateRoadmapAvailability({
        hours_per_week: Number(form.hoursPerWeek),
        learning_style: form.learningStyle,
      });

      if (!availabilityUpdateRes?.success) {
        throw new Error('Failed to save availability for roadmap generation.');
      }

      const response = await generateRoadmap();
      const data = response?.data;

      setRoadmapData({
        roadmap_id: data?.roadmap_id,
        duration: data?.duration || 0,
        skills: data?.skills || [],
        status: data?.status || 'active',
      });
      setSelectedRoadmapId(data?.roadmap_id || '');

      await loadHistory();
      if (data?.roadmap_id) {
        await loadRoadmapById(data.roadmap_id);
      }

      resetForm();
      toast.success('Roadmap generated successfully.');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to generate roadmap.'));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleMarkCompleted = async (skillName) => {
    if (!skillName || !roadmapData) return;

    const previousSkills = roadmapData.skills || [];
    const nextSkills = previousSkills.map((skill) =>
      skill.skill === skillName ? { ...skill, status: 'completed' } : skill
    );

    setRoadmapData((prev) => ({ ...prev, skills: nextSkills }));
    setUpdatingSkill(skillName);

    try {
      await updateSkillStatus(skillName, 'completed');
      toast.success('Skill marked as completed.');
    } catch (error) {
      setRoadmapData((prev) => ({ ...prev, skills: previousSkills }));
      toast.error(getErrorMessage(error, 'Failed to update skill status.'));
    } finally {
      setUpdatingSkill('');
    }
  };

  const handleOpenHistory = async () => {
    setShowHistoryView(true);
    if (history.length === 0) {
      await loadHistory();
    }
  };

  const handleExitRoadmapView = () => {
    setRoadmapData(null);
    setSelectedRoadmapId('');
    setShowHistoryView(false);
    setIsRoadmapLoading(false);
  };

  const hasRoadmap = Boolean(roadmapData && (roadmapData.skills || []).length > 0);
  const showRoadmapOnly = hasRoadmap || isRoadmapLoading;

  return (
    <div className="min-h-screen bg-black relative overflow-hidden pt-24 pb-10 px-4 sm:px-6 lg:px-8">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-175 h-75 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full space-y-4">
        {showHistoryView ? (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
            <div className="xl:col-span-3 space-y-4">
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
        ) : !showRoadmapOnly ? (
          <div className="max-w-2xl mx-auto">
            <div className="backdrop-blur-xl bg-slate-900/60 border border-white/10 rounded-3xl p-5 md:p-6 mb-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h1 className="text-3xl md:text-[2rem] font-extrabold text-white leading-tight">
                    Career <span className="text-violet-500">Roadmap</span> Generator
                  </h1>
                  <p className="text-gray-300 mt-2 text-sm">Personalized learning path crafted to your skills &amp; timeline</p>
                </div>
                <button
                  type="button"
                  onClick={handleOpenHistory}
                  className="px-4 py-2 rounded-lg text-sm font-semibold bg-white/10 hover:bg-white/15 border border-white/20 text-white shrink-0"
                >
                  History
                </button>
              </div>
            </div>
            <RoadmapForm isGenerating={isGenerating} onGenerate={handleGenerate} />
          </div>
        ) : (
          <div className="w-full">
            <div className="mb-4 rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">Generated Roadmap</h2>
                <p className="text-xs text-gray-400 mt-0.5">Follow your roadmap steps below</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleOpenHistory}
                  className="px-4 py-2 rounded-lg text-sm font-semibold bg-white/10 hover:bg-white/15 border border-white/20 text-white"
                >
                  History
                </button>
                <button
                  type="button"
                  onClick={handleExitRoadmapView}
                  className="px-4 py-2 rounded-lg text-sm font-semibold bg-white/10 hover:bg-white/15 border border-white/20 text-white"
                >
                  Exit
                </button>
              </div>
            </div>

            <RoadmapTimeline
              roadmapData={roadmapData}
              isRoadmapLoading={isRoadmapLoading}
              updatingSkill={updatingSkill}
              onMarkCompleted={handleMarkCompleted}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default RoadmapPage;
