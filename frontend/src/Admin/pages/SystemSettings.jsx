import React, { useState } from 'react';
import {
  AdminShell, Card, CardHeader, Button, Stepper, Toggle, SegmentedFilter, MicroLabel,
} from '../../design';
import { adminNav } from '../../design/nav';

/**
 * Spec §7 Admin · Settings.
 *
 * Centred 780px. Card one holds three stepper rows and a row whose control is
 * a three-option segmented group. Card two holds a toggle row whose detail
 * line changes with the state, then a row with a full-width mono input on
 * surface-field. The footer pairs the primary with a green confirmation note
 * that only appears after saving.
 */
const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

const Row = ({ title, detail, children, last = false }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 24,
      padding: '17px 20px',
      borderBottom: last ? 'none' : '1px solid var(--color-line-soft)',
    }}
  >
    <div>
      <div style={{ fontSize: 15.5, fontWeight: 500, color: 'var(--color-ink)' }}>{title}</div>
      {detail && <div style={{ fontSize: 14, color: 'var(--color-text-3)', marginTop: 3 }}>{detail}</div>}
    </div>
    <div style={{ flexShrink: 0 }}>{children}</div>
  </div>
);

const SystemSettings = () => {
  const [settings, setSettings] = useState({
    maxQuestions: 10,
    maxDuration: 30,
    maxModules: 8,
    defaultLevel: 'Beginner',
    enableAI: true,
    basePrompt: 'Generate structured JSON output only. No explanations.',
  });
  const [saved, setSaved] = useState(false);

  const handleInputChange = (field, value) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    // No endpoint exists for these yet, so the values live only in this session.
    console.log('Settings:', settings);
    setSaved(true);
  };

  return (
    <AdminShell items={adminNav} title="Settings" chip="SAMPLE DATA">
      <div style={{ maxWidth: 780, margin: '0 auto', width: '100%' }}>
        <Card>
          <CardHeader label="Generation limits" />

          <Row title="Questions per quiz" detail="Caps what the generator will return in one quiz.">
            <Stepper
              value={settings.maxQuestions}
              onChange={(v) => handleInputChange('maxQuestions', v)}
              min={1}
              max={50}
            />
          </Row>

          <Row title="Quiz duration" detail="Minutes allowed before a quiz auto-submits.">
            <Stepper
              value={settings.maxDuration}
              onChange={(v) => handleInputChange('maxDuration', v)}
              min={1}
              max={99}
              suffix=" min"
            />
          </Row>

          <Row title="Modules per roadmap" detail="How many stages a generated roadmap may contain.">
            <Stepper
              value={settings.maxModules}
              onChange={(v) => handleInputChange('maxModules', v)}
              min={1}
              max={30}
            />
          </Row>

          <Row title="Default roadmap level" detail="Used when a learner does not pick one." last>
            <SegmentedFilter
              options={LEVELS}
              value={settings.defaultLevel}
              onChange={(v) => handleInputChange('defaultLevel', v)}
              size="lg"
            />
          </Row>
        </Card>

        <Card style={{ marginTop: 22 }}>
          <CardHeader label="AI control" />

          <Row
            title="AI generation"
            detail={
              settings.enableAI
                ? 'Quizzes and roadmaps are generated on demand.'
                : 'Generation is off — learners see only the seeded catalogue.'
            }
          >
            <Toggle
              checked={settings.enableAI}
              onChange={(v) => handleInputChange('enableAI', v)}
              label="Enable AI generation"
            />
          </Row>

          <div style={{ padding: '17px 20px' }}>
            <MicroLabel size={11} tracking="0.12em" style={{ display: 'block', marginBottom: 8 }}>
              Base prompt
            </MicroLabel>
            <input
              value={settings.basePrompt}
              onChange={(e) => handleInputChange('basePrompt', e.target.value)}
              style={{
                width: '100%',
                padding: '11px 13px',
                fontFamily: 'var(--font-mono)',
                fontSize: 13,
                color: 'var(--color-ink)',
                background: 'var(--color-surface-field)',
                border: '1px solid var(--color-line-input)',
                borderRadius: 0,
                outline: 'none',
              }}
            />
          </div>
        </Card>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 22 }}>
          <Button onClick={handleSave}>Save settings</Button>
          {saved && (
            <span style={{ fontSize: 14, color: 'var(--color-green)' }}>
              Saved for this session — there is no endpoint behind these yet.
            </span>
          )}
        </div>
      </div>
    </AdminShell>
  );
};

export default SystemSettings;
