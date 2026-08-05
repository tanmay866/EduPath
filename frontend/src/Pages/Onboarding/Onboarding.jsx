import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getProfile, updateProfile } from '../Services/profileService';
import { useCareerRoles } from '../../hooks/useCareerRoles';
import {
  Card, CardHeader, CardFooterNote, Button, Field, FieldGroup, Input,
  MicroLabel, Loading, type,
} from '../../design';

const Page = ({ children }) => (
  <div style={{ background: 'var(--color-paper)', minHeight: '100vh', padding: '48px 32px' }}>
    <div style={{ maxWidth: 720, margin: '0 auto' }}>{children}</div>
  </div>
);

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

/**
 * Asked once, after the email is verified, instead of on every screen that
 * needs it. Target role in particular used to be re-typed on the roadmap form
 * each time; it now lives on the profile and everything reads it from there.
 *
 * Skippable on purpose — someone who just wants to look around should not hit
 * a wall — but the pages that genuinely cannot work without a role send the
 * user back here, carrying where they were headed in `next`.
 */
const Onboarding = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = params.get('next') || '/assessment-hub';

  const { roles: careerRoles } = useCareerRoles();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [form, setForm] = useState({
    target_role: '',
    experience_level: '',
    hours_per_week: '',
    learning_style: 'mixed',
    current_skills: [],
  });

  useEffect(() => {
    if (!sessionStorage.getItem('token')) {
      navigate('/signin', { replace: true });
      return;
    }

    // Prefilled from the server rather than assumed empty: a user can land
    // here with some of it already set, and re-asking for what we have would
    // look like the save had not worked.
    getProfile()
      .then((response) => {
        const p = response?.data || {};
        setForm({
          target_role: p.target_role || '',
          experience_level: p.experience_level || '',
          hours_per_week: p.hours_per_week ? String(p.hours_per_week) : '',
          learning_style: p.learning_style || 'mixed',
          current_skills: Array.isArray(p.current_skills)
            ? p.current_skills.map((s) => (typeof s === 'string' ? s : s?.skill)).filter(Boolean)
            : [],
        });
      })
      .catch((error) => console.error('Could not prefill onboarding:', error))
      .finally(() => setLoading(false));
  }, [navigate]);

  const change = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const addSkill = () => {
    const value = skillInput.trim();
    if (!value || form.current_skills.includes(value)) { setSkillInput(''); return; }
    setForm((prev) => ({ ...prev, current_skills: [...prev.current_skills, value] }));
    setSkillInput('');
  };

  const removeSkill = (skill) =>
    setForm((prev) => ({
      ...prev,
      current_skills: prev.current_skills.filter((s) => s !== skill),
    }));

  const handleSave = async (e) => {
    e.preventDefault();

    if (!form.target_role)      { toast.error('Pick the role you are working towards.'); return; }
    if (!form.experience_level) { toast.error('Pick your experience level.'); return; }
    if (!Number(form.hours_per_week) || Number(form.hours_per_week) < 1) {
      toast.error('Enter how many hours a week you can study.');
      return;
    }

    setSaving(true);
    try {
      const response = await updateProfile({
        target_role: form.target_role,
        experience_level: form.experience_level,
        hours_per_week: Number(form.hours_per_week),
        learning_style: form.learning_style,
        current_skills: form.current_skills,
      });
      if (!response?.success) throw new Error(response?.message || 'Could not save your setup.');

      sessionStorage.setItem('profileComplete', '1');
      sessionStorage.setItem('targetRole', form.target_role);
      toast.success('You are all set.');
      navigate(next, { replace: true });
    } catch (error) {
      toast.error(error?.message || 'Could not save your setup.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Page><Card><Loading label="Loading your details" /></Card></Page>;
  }

  return (
    <Page>
      <div style={{ marginBottom: 26 }}>
        <MicroLabel size={10.5} tracking="0.13em" color="var(--color-text-4)">Getting started</MicroLabel>
        <h1 style={{ ...type.pageTitle, margin: '10px 0 0', color: 'var(--color-ink)' }}>
          What are you working towards?
        </h1>
        <p style={{ fontSize: 15, color: 'var(--color-text-2)', lineHeight: 1.6, margin: '10px 0 0' }}>
          Your roadmap and assessments are built from this. You only answer it once —
          it lives on your profile and you can change it there whenever you like.
        </p>
      </div>

      <Card>
        <CardHeader label="Your track" />
        <form onSubmit={handleSave}>
          <div style={{ padding: '22px 24px' }}>
            <FieldGroup>
              <Field label="Target role">
                <select name="target_role" value={form.target_role} onChange={change} style={SELECT_STYLE}>
                  <option value="">Select your target role</option>
                  {careerRoles.map((role) => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </Field>

              <Field label="Experience level">
                <select name="experience_level" value={form.experience_level} onChange={change} style={SELECT_STYLE}>
                  <option value="">Select your level</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </Field>

              <Field label="Hours per week" help="Be realistic — the plan is paced from this.">
                <Input
                  name="hours_per_week"
                  type="number"
                  min="1"
                  value={form.hours_per_week}
                  onChange={change}
                  placeholder="10"
                />
              </Field>

              <Field label="Learning style">
                <select name="learning_style" value={form.learning_style} onChange={change} style={SELECT_STYLE}>
                  <option value="mixed">Mixed</option>
                  <option value="video">Video</option>
                  <option value="reading">Reading</option>
                  <option value="project">Projects</option>
                </select>
              </Field>

              <Field label="Skills you already have" help="Optional. Type a skill and press Enter.">
                <div style={{ display: 'flex', gap: 8 }}>
                  <Input
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
                    placeholder="e.g. HTML, Python, Git"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={addSkill}
                    style={{ padding: '13px 18px', flexShrink: 0 }}
                  >
                    Add
                  </Button>
                </div>
              </Field>
            </FieldGroup>

            {form.current_skills.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 14 }}>
                {form.current_skills.map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => removeSkill(skill)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '6px 10px',
                      fontSize: 13,
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--color-text-2)',
                      background: 'var(--color-surface)',
                      border: '1px solid var(--color-line)',
                      cursor: 'pointer',
                    }}
                  >
                    {skill}
                    <span style={{ color: 'var(--color-text-4)' }} aria-hidden="true">×</span>
                    <span style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>
                      Remove {skill}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 16,
              padding: '18px 24px',
              borderTop: '1px solid var(--color-line)',
            }}
          >
            <Button
              type="button"
              variant="quiet"
              onClick={() => navigate('/assessment-hub', { replace: true })}
            >
              Set this up later
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving…' : 'Save and continue'}
            </Button>
          </div>
        </form>
        <CardFooterNote>
          Changing your role later starts a fresh plan for it — the work recorded against
          your current one is kept.
        </CardFooterNote>
      </Card>
    </Page>
  );
};

export default Onboarding;
