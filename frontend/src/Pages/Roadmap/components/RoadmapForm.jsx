import React, { useState } from 'react';
import {
  Card, CardHeader, Button, Field, FieldGroup, Input, MicroLabel,
} from '../../../design';
import { useCareerRoles } from '../../../hooks/useCareerRoles';

const initialForm = {
  targetRole: '',
  experienceLevel: '',
  skills: [],
  hoursPerWeek: '',
  learningStyle: '',
};

// Native selects have no spec entry; they borrow the Field input treatment so
// they line up with the text inputs beside them.
const SELECT_STYLE = {
  width: '100%',
  padding: '13px 14px',
  fontSize: 15,
  fontFamily: 'var(--font-sans)',
  color: 'var(--color-ink)',
  background: '#fff',
  border: '1px solid var(--color-line-input)',
  borderRadius: 0,
  outline: 'none',
};

const RoadmapForm = ({ isGenerating, onGenerate }) => {
  const { roles: careerRoles } = useCareerRoles();
  const [form, setForm] = useState(initialForm);
  const [skillInput, setSkillInput] = useState('');

  const addSkill = () => {
    const value = skillInput.trim();
    if (!value) return;
    if (form.skills.includes(value)) { setSkillInput(''); return; }
    setForm((prev) => ({ ...prev, skills: [...prev.skills, value] }));
    setSkillInput('');
  };

  const removeSkill = (skill) =>
    setForm((prev) => ({ ...prev, skills: prev.skills.filter((s) => s !== skill) }));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onGenerate(form, () => { setForm(initialForm); setSkillInput(''); });
  };

  return (
    <Card>
      <CardHeader
        label="Roadmap inputs"
        right={<MicroLabel size={10.5} color="var(--color-text-4)">All fields required</MicroLabel>}
      />

      <form onSubmit={handleSubmit}>
        <div style={{ padding: '22px 24px' }}>
          <FieldGroup>
            {/* A select rather than a text box: the value has to match one of
                the AI service's templates exactly, and guessing what a typed
                role meant used to send "Email Marketer" to AI/ML Engineer. */}
            <Field label="Target role" help="This is saved to your profile.">
              <select name="targetRole" value={form.targetRole} onChange={handleChange} style={SELECT_STYLE}>
                <option value="">Select your target role</option>
                {careerRoles.map((role) => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </Field>

            <Field label="Experience level">
              <select name="experienceLevel" value={form.experienceLevel} onChange={handleChange} style={SELECT_STYLE}>
                <option value="">Select your level</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </Field>

            <Field label="Current skills" help="Type a skill and press Enter to add it.">
              <div style={{ display: 'flex', gap: 8 }}>
                <Input
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
                  placeholder="e.g. HTML, Python, Git"
                />
                <Button variant="secondary" onClick={addSkill} style={{ padding: '13px 18px', flexShrink: 0 }}>
                  Add
                </Button>
              </div>

              {form.skills.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
                  {form.skills.map((skill) => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => removeSkill(skill)}
                      title="Remove"
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 11.5,
                        padding: '5px 9px',
                        border: '1px solid var(--color-line-btn)',
                        background: '#fff',
                        color: 'var(--color-text-2)',
                        cursor: 'pointer',
                        borderRadius: 0,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                      }}
                    >
                      {skill}
                      <span style={{ color: 'var(--color-text-4)' }}>×</span>
                    </button>
                  ))}
                </div>
              )}
            </Field>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <Field label="Hours per week">
                <Input
                  name="hoursPerWeek"
                  type="number"
                  min="1"
                  max="168"
                  value={form.hoursPerWeek}
                  onChange={handleChange}
                  placeholder="10"
                />
              </Field>

              <Field label="Learning style">
                <select name="learningStyle" value={form.learningStyle} onChange={handleChange} style={SELECT_STYLE}>
                  <option value="">Select a style</option>
                  <option value="video">Video</option>
                  <option value="reading">Reading</option>
                  <option value="project">Project-based</option>
                  <option value="mixed">Mixed</option>
                </select>
              </Field>
            </div>
          </FieldGroup>
        </div>

        <div style={{ padding: '18px 24px', borderTop: '1px solid var(--color-line)' }}>
          <Button type="submit" loading={isGenerating} loadingLabel="Generating…">
            Generate roadmap
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default RoadmapForm;
