import React, { useState } from 'react';
import { Loader2, Plus, X, Zap } from 'lucide-react';

const initialForm = {
  targetRole: '',
  experienceLevel: '',
  skills: [],
  hoursPerWeek: '',
  learningStyle: '',
};

const inputBase =
  'w-full px-4 py-3 rounded-xl bg-slate-900 border border-white/10 text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/70 focus:border-indigo-500/50 transition-all duration-200';

const RoadmapForm = ({ isGenerating, onGenerate }) => {
  const [form, setForm] = useState(initialForm);
  const [skillInput, setSkillInput] = useState('');

  const addSkill = () => {
    const value = skillInput.trim();
    if (!value) return;
    if (form.skills.includes(value)) { setSkillInput(''); return; }
    setForm((prev) => ({ ...prev, skills: [...prev.skills, value] }));
    setSkillInput('');
  };

  const removeSkill = (skill) => {
    setForm((prev) => ({ ...prev, skills: prev.skills.filter((item) => item !== skill) }));
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onGenerate(form, () => { setForm(initialForm); setSkillInput(''); });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="backdrop-blur-xl bg-slate-900/60 border border-white/10 rounded-3xl p-7 md:p-8 shadow-2xl shadow-black/40 space-y-6"
    >
      {/* Form header */}
      <div className="pb-4 border-b border-white/8">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center">
            <Zap size={14} className="text-indigo-400" />
          </div>
          <h2 className="text-lg font-bold text-white">Roadmap Inputs</h2>
        </div>
        <p className="text-sm text-slate-500 ml-10">Fill in the details to generate your personalised path.</p>
      </div>

      {/* Target Role */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-300">
          Target Role <span className="text-indigo-400">*</span>
        </label>
        <input
          type="text"
          name="targetRole"
          value={form.targetRole}
          onChange={handleChange}
          placeholder="e.g. MERN Developer, AI/ML Engineer…"
          className={inputBase}
        />
        <p className="text-xs text-slate-600">Supported: MERN Developer · AI/ML Engineer · Data Science Engineer · DevOps · Mobile · Cybersecurity</p>
      </div>

      {/* Experience Level */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-300">
          Experience Level <span className="text-indigo-400">*</span>
        </label>
        <select
          name="experienceLevel"
          value={form.experienceLevel}
          onChange={handleChange}
          className={`${inputBase} appearance-none cursor-pointer`}
        >
          <option value="" className="bg-slate-900">Select your level</option>
          <option value="beginner" className="bg-slate-900">Beginner — just starting out</option>
          <option value="intermediate" className="bg-slate-900">Intermediate — some experience</option>
          <option value="advanced" className="bg-slate-900">Advanced — seasoned professional</option>
        </select>
      </div>

      {/* Current Skills */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-300">
          Current Skills <span className="text-indigo-400">*</span>
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
            placeholder="Add a skill and press Enter…"
            className={`${inputBase} flex-1`}
          />
          <button
            type="button"
            onClick={addSkill}
            className="px-4 rounded-xl bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 hover:bg-indigo-500/30 hover:border-indigo-400/60 transition-all duration-200 shrink-0"
          >
            <Plus size={16} />
          </button>
        </div>

        {form.skills.length > 0 && (
          <div className="pt-1 flex flex-wrap gap-2">
            {form.skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-indigo-500/15 border border-indigo-400/30 text-indigo-200"
              >
                {skill}
                <button type="button" onClick={() => removeSkill(skill)} className="text-indigo-300 hover:text-white transition-colors">
                  <X size={11} />
                </button>
              </span>
            ))}
          </div>
        )}
        <p className="text-xs text-slate-600">e.g. HTML, CSS, Python, Git — press Enter to add each one quickly.</p>
      </div>

      {/* Hours & Learning Style — 2-col on md+ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-300">
            Hours per week <span className="text-indigo-400">*</span>
          </label>
          <input
            type="number"
            min="1"
            max="80"
            name="hoursPerWeek"
            value={form.hoursPerWeek}
            onChange={handleChange}
            placeholder="e.g. 10"
            className={inputBase}
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-300">
            Learning Style <span className="text-indigo-400">*</span>
          </label>
          <select
            name="learningStyle"
            value={form.learningStyle}
            onChange={handleChange}
            className={`${inputBase} appearance-none cursor-pointer`}
          >
            <option value="" className="bg-slate-900">Select style</option>
            <option value="visual" className="bg-slate-900">Visual — videos & diagrams</option>
            <option value="practical" className="bg-slate-900">Practical — projects & coding</option>
            <option value="mixed" className="bg-slate-900">Mixed — blend of both</option>
          </select>
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isGenerating}
        className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-400 hover:to-violet-400 hover:scale-[1.02] hover:shadow-lg hover:shadow-indigo-500/30 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-300"
      >
        {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
        {isGenerating ? 'Generating Your Roadmap…' : 'Generate My Roadmap'}
      </button>
    </form>
  );
};

export default RoadmapForm;
