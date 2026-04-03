import React, { useState } from 'react';
import { Loader2, Plus, X } from 'lucide-react';

const initialForm = {
  targetRole: '',
  experienceLevel: '',
  skills: [],
  hoursPerWeek: '',
  learningStyle: '',
};

const RoadmapForm = ({ isGenerating, onGenerate }) => {
  const [form, setForm] = useState(initialForm);
  const [skillInput, setSkillInput] = useState('');

  const addSkill = () => {
    const value = skillInput.trim();
    if (!value) return;
    if (form.skills.includes(value)) {
      setSkillInput('');
      return;
    }

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
    onGenerate(form, () => {
      setForm(initialForm);
      setSkillInput('');
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="backdrop-blur-xl bg-slate-900/60 border border-white/10 rounded-2xl p-5 space-y-4 shadow-xl shadow-black/20"
    >
      <div>
        <h2 className="text-xl font-bold text-white">Roadmap Inputs</h2>
        <p className="text-sm text-gray-400 mt-1">Enter details before each generation.</p>
      </div>

      <div>
        <label className="block text-xs text-gray-300 mb-1">Target Role</label>
        <input
          type="text"
          name="targetRole"
          value={form.targetRole}
          onChange={handleChange}
          placeholder="Enter your target role"
          className="w-full px-3 py-2.5 rounded-lg bg-slate-800 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-300 mb-1">Experience Level</label>
        <select
          name="experienceLevel"
          value={form.experienceLevel}
          onChange={handleChange}
          className="w-full px-3 py-2.5 rounded-lg bg-slate-800 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Select level</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
      </div>

      <div>
        <label className="block text-xs text-gray-300 mb-1">Current Skills</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={skillInput}
            onChange={(event) => setSkillInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                addSkill();
              }
            }}
            placeholder="Add skill"
            className="flex-1 px-3 py-2.5 rounded-lg bg-slate-800 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="button"
            onClick={addSkill}
            className="px-3 rounded-lg bg-white/10 border border-white/20 text-white hover:bg-white/15"
          >
            <Plus size={16} />
          </button>
        </div>

        {form.skills.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {form.skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-indigo-500/20 border border-indigo-400/30 text-indigo-200"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => removeSkill(skill)}
                  className="text-indigo-200 hover:text-white"
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        )}
        <p className="text-[11px] text-gray-500 mt-2">Press Enter to quickly add a skill.</p>
      </div>

      <div>
        <label className="block text-xs text-gray-300 mb-1">Hours per week</label>
        <input
          type="number"
          min="1"
          name="hoursPerWeek"
          value={form.hoursPerWeek}
          onChange={handleChange}
          placeholder="10"
          className="w-full px-3 py-2.5 rounded-lg bg-slate-800 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-300 mb-1">Learning Style</label>
        <select
          name="learningStyle"
          value={form.learningStyle}
          onChange={handleChange}
          className="w-full px-3 py-2.5 rounded-lg bg-slate-800 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Select style</option>
          <option value="visual">Visual</option>
          <option value="practical">Practical</option>
          <option value="mixed">Mixed</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={isGenerating}
        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-linear-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
      >
        {isGenerating ? <Loader2 size={16} className="animate-spin" /> : null}
        {isGenerating ? 'Generating...' : 'Generate Roadmap'}
      </button>
    </form>
  );
};

export default RoadmapForm;
