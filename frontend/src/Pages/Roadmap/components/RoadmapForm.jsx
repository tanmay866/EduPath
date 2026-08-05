import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card, CardHeader, CardFooterNote, Button, MicroLabel, Loading, Empty,
} from '../../../design';

/**
 * What the roadmap will be built from, rather than a form asking for it again.
 *
 * Every field here already lives on the profile — role, experience, hours,
 * style and skills — so re-collecting them was a second copy that could
 * disagree with the first. This shows the values and sends the user to the
 * profile to change them.
 */
const Line = ({ label, value, muted }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      gap: 20,
      padding: '13px 24px',
      borderTop: '1px solid var(--color-line-soft)',
    }}
  >
    <MicroLabel size={10.5} tracking="0.13em" color="var(--color-text-4)">{label}</MicroLabel>
    <span
      style={{
        fontSize: 14.5,
        color: muted ? 'var(--color-text-4)' : 'var(--color-ink)',
        textAlign: 'right',
      }}
    >
      {value}
    </span>
  </div>
);

const RoadmapForm = ({ isGenerating, onGenerate, profile, loadingProfile }) => {
  const navigate = useNavigate();

  if (loadingProfile) {
    return <Card><Loading label="Loading your details" /></Card>;
  }

  const skills = Array.isArray(profile?.current_skills)
    ? profile.current_skills.map((s) => (typeof s === 'string' ? s : s?.skill)).filter(Boolean)
    : [];

  const ready = Boolean(profile?.target_role && profile?.experience_level && profile?.hours_per_week);

  return (
    <Card>
      <CardHeader
        label="Built from your profile"
        right={
          <Button variant="quiet" onClick={() => navigate('/profile')}>Edit in profile</Button>
        }
      />

      {!ready ? (
        <Empty action={<Button onClick={() => navigate('/onboarding?next=/roadmap/generate')}>Finish setup</Button>}>
          Your target role, experience level and weekly hours are needed before a plan can be built.
        </Empty>
      ) : (
        <>
          <Line label="Target role" value={profile.target_role} />
          <Line label="Experience" value={profile.experience_level} />
          <Line label="Hours per week" value={profile.hours_per_week} />
          <Line label="Learning style" value={profile.learning_style || 'mixed'} />
          <Line
            label="Skills you have"
            value={skills.length ? skills.join(', ') : 'None listed'}
            muted={!skills.length}
          />

          <div style={{ padding: '18px 24px', borderTop: '1px solid var(--color-line)' }}>
            <Button onClick={onGenerate} disabled={isGenerating}>
              {isGenerating ? 'Generating…' : 'Generate roadmap'}
            </Button>
          </div>
        </>
      )}

      <CardFooterNote>
        Generating replaces the current plan for this role. Plans for other roles are kept.
      </CardFooterNote>
    </Card>
  );
};

export default RoadmapForm;
