import React, { useState } from 'react';
import { Loader2, Plus, X, Zap, Target, Brain, Clock, BookOpen } from 'lucide-react';

const initialForm = {
  targetRole: '',
  experienceLevel: '',
  skills: [],
  hoursPerWeek: '',
  learningStyle: '',
};

const inputCls =
  'w-full px-4 py-3 rounded-xl bg-[#0a0a0a] border border-white/8 text-white text-sm placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/40 transition-all duration-200';

const labelCls = 'block text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2';

const RoadmapForm = ({ isGenerating, onGenerate }) => {
  const [form, setForm]           = useState(initialForm);
  const [skillInput, setSkillInput] = useState('');

  const addSkill = () => {
    const value = skillInput.trim();
    if (!value) return;
    if (form.skills.includes(value)) { setSkillInput(''); return; }
    setForm(prev => ({ ...prev, skills: [...prev.skills, value] }));
    setSkillInput('');
  };

  const removeSkill = skill =>
    setForm(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }));

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    onGenerate(form, () => { setForm(initialForm); setSkillInput(''); });
  };

  return (
    <form onSubmit={handleSubmit} className="backdrop-blur-3xl bg-[#090b14]/70 rounded-[1.5rem] border border-white/5 shadow-2xl p-7 md:p-8 space-y-6">

      {/* Header */}
      <div className="pb-5 border-b border-white/5">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center">
            <Zap size={15} className="text-indigo-400" />
          </div>
          <div>
            <h2 className="text-base font-black text-white tracking-tight">Roadmap Inputs</h2>
            <p className="text-[11px] text-slate-500">Fill in the details to generate your personalised path.</p>
          </div>
        </div>
      </div>

      {/* Target Role */}
      <div>
        <label className={labelCls}>
          <Target size={9} className="inline mr-1.5 text-indigo-400" />
          Target Role <span className="text-indigo-400 normal-case font-normal ml-0.5">*</span>
        </label>
        <input
          type="text"
          name="targetRole"
          value={form.targetRole}
          onChange={handleChange}
          placeholder="e.g. MERN Developer, AI/ML Engineer…"
          className={inputCls}
        />
        <p className="text-[10px] text-slate-700 mt-1.5">
          Supported: MERN Developer · AI/ML Engineer · Data Science · DevOps · Mobile · Cybersecurity
        </p>
      </div>

      {/* Experience Level */}
      <div>
        <label className={labelCls}>
          <Brain size={9} className="inline mr-1.5 text-indigo-400" />
          Experience Level <span className="text-indigo-400 normal-case font-normal ml-0.5">*</span>
        </label>
        <select
          name="experienceLevel"
          value={form.experienceLevel}
          onChange={handleChange}
          className={`${inputCls} appearance-none cursor-pointer`}
        >
          <option value="" className="bg-[#0a0a0a]">Select your level</option>
          <option value="beginner"     className="bg-[#0a0a0a]">Beginner — just starting out</option>
          <option value="intermediate" className="bg-[#0a0a0a]">Intermediate — some experience</option>
          <option value="advanced"     className="bg-[#0a0a0a]">Advanced — seasoned professional</option>
        </select>
      </div>

      {/* Current Skills */}
      <div>
        <label className={labelCls}>
          <BookOpen size={9} className="inline mr-1.5 text-indigo-400" />
          Current Skills <span className="text-indigo-400 normal-case font-normal ml-0.5">*</span>
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={skillInput}
            onChange={e => setSkillInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
            placeholder="Add a skill and press Enter…"
            className={`${inputCls} flex-1`}
          />
          <button
            type="button"
            onClick={addSkill}
            className="px-4 rounded-xl bg-indigo-500/15 border border-indigo-500/25 text-indigo-400 hover:bg-indigo-500/25 hover:border-indigo-400/50 hover:text-indigo-200 transition-all duration-200 shrink-0"
          >
            <Plus size={16} />
          </button>
        </div>

        {form.skills.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {form.skills.map(skill => (
              <span
                key={skill}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold bg-indigo-500/15 border border-indigo-500/25 text-indigo-300"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => removeSkill(skill)}
                  className="text-indigo-400 hover:text-white transition-colors"
                >
                  <X size={10} />
                </button>
              </span>
            ))}
          </div>
        )}
        <p className="text-[10px] text-slate-700 mt-1.5">e.g. HTML, Python, Git — press Enter to add each one.</p>
      </div>

      {/* Hours & Style — 2 col */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className={labelCls}>
            <Clock size={9} className="inline mr-1.5 text-indigo-400" />
            Hours per Week <span className="text-indigo-400 normal-case font-normal ml-0.5">*</span>
          </label>
          <input
            type="number"
            min="1" max="80"
            name="hoursPerWeek"
            value={form.hoursPerWeek}
            onChange={handleChange}
            placeholder="e.g. 10"
            className={inputCls}
          />
        </div>

        <div>
          <label className={labelCls}>
            <Zap size={9} className="inline mr-1.5 text-indigo-400" />
            Learning Style <span className="text-indigo-400 normal-case font-normal ml-0.5">*</span>
          </label>
          <select
            name="learningStyle"
            value={form.learningStyle}
            onChange={handleChange}
            className={`${inputCls} appearance-none cursor-pointer`}
          >
            <option value=""          className="bg-[#0a0a0a]">Select style</option>
            <option value="visual"    className="bg-[#0a0a0a]">Visual — videos & diagrams</option>
            <option value="practical" className="bg-[#0a0a0a]">Practical — projects & coding</option>
            <option value="mixed"     className="bg-[#0a0a0a]">Mixed — blend of both</option>
          </select>
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isGenerating}
        className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-xl text-sm font-black text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 hover:scale-[1.02] hover:shadow-xl hover:shadow-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-300"
      >
        {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
        {isGenerating ? 'Generating Your Roadmap…' : 'Generate My Roadmap'}
      </button>
    </form>
  );
};

export default RoadmapForm;
