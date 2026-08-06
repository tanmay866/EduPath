import React, { useEffect, useState } from 'react';
import {
  AdminShell, Card, CardHeader, Button, Stepper, Toggle, SegmentedFilter,
  MicroLabel, InlineMessage, Loading, Empty,
} from '../../design';
import { adminNav } from '../../design/nav';
import { getSettings, updateSettings } from '../services/adminService';
import { useAdminData } from '../useAdminData';

/**
 * Spec §7 Admin · Settings.
 *
 * Centred 780px. Card one holds three stepper rows and a row whose control is
 * a three-option segmented group. Card two holds a toggle row whose detail
 * line changes with the state, then a row with a full-width mono input on
 * surface-field. The footer pairs the primary with a green confirmation note
 * that only appears after saving.
 *
 * All six are read where they claim to apply. The quiz controller caps the
 * question count, takes the session expiry from the duration, refuses the
 * request when AI generation is off, and passes the base prompt into the
 * generation prompt; the roadmap controller sends the module cap to the
 * generator and falls back to the default level when a learner has not picked
 * one. Three of them used to be stored and read by nothing, which made this
 * screen a form that looked like a control panel.
 */
const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

const Row = ({ title, detail, children, last = false }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 24,
      flexWrap: 'wrap',
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
  const { data, loading, error, reload } = useAdminData(getSettings);
  const [settings, setSettings] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState('');

  // The form edits a copy, so an unsaved change is not mistaken for stored state.
  useEffect(() => { if (data) setSettings(data); }, [data]);

  const change = (field, value) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
    setSaveError('');
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError('');
    try {
      const stored = await updateSettings({
        maxQuestions: settings.maxQuestions,
        maxDuration: settings.maxDuration,
        maxModules: settings.maxModules,
        defaultLevel: settings.defaultLevel,
        enableAI: settings.enableAI,
        basePrompt: settings.basePrompt,
      });
      setSettings(stored);
      setSaved(true);
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading || (!settings && !error)) {
    return (
      <AdminShell items={adminNav} title="Settings">
        <Card><Loading /></Card>
      </AdminShell>
    );
  }

  if (error) {
    return (
      <AdminShell items={adminNav} title="Settings">
        <Card>
          <Empty action={<Button onClick={reload}>Try again</Button>}>{error}</Empty>
        </Card>
      </AdminShell>
    );
  }

  return (
    <AdminShell items={adminNav} title="Settings">
      <div style={{ maxWidth: 780, margin: '0 auto', width: '100%' }}>
        <Card>
          <CardHeader label="Generation limits" />

          <Row title="Questions per quiz" detail="Caps what the generator returns, whatever a learner asks for.">
            <Stepper
              value={settings.maxQuestions}
              onChange={(v) => change('maxQuestions', v)}
              min={1}
              max={50}
            />
          </Row>

          <Row title="Quiz duration" detail="Minutes before a session expires.">
            <Stepper
              value={settings.maxDuration}
              onChange={(v) => change('maxDuration', v)}
              min={1}
              max={180}
              suffix=" min"
            />
          </Row>

          <Row title="Modules per roadmap" detail="Longer tracks are trimmed to this, keeping prerequisites.">
            <Stepper
              value={settings.maxModules}
              onChange={(v) => change('maxModules', v)}
              min={1}
              max={30}
            />
          </Row>

          <Row title="Default roadmap level" detail="Paces the plan when a learner has not set their own." last>
            <SegmentedFilter
              options={LEVELS}
              value={settings.defaultLevel}
              onChange={(v) => change('defaultLevel', v)}
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
                ? 'Quizzes are generated on demand.'
                : 'Off — quiz generation is refused and learners are told to try later.'
            }
          >
            <Toggle
              checked={settings.enableAI}
              onChange={(v) => change('enableAI', v)}
              label="Enable AI generation"
            />
          </Row>

          <div style={{ padding: '17px 20px' }}>
            <MicroLabel size={11} tracking="0.12em" style={{ display: 'block', marginBottom: 8 }}>
              Base prompt
            </MicroLabel>
            <p style={{ margin: '0 0 10px', fontSize: 14, color: 'var(--color-text-3)' }}>
              Added to the quiz prompt as house style. The rules that keep a question
              valid are applied after it, so this cannot break generation.
            </p>
            <input
              value={settings.basePrompt}
              onChange={(e) => change('basePrompt', e.target.value)}
              maxLength={1000}
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

        {saveError && <InlineMessage tone="error" style={{ marginTop: 22 }}>{saveError}</InlineMessage>}

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 22 }}>
          <Button onClick={handleSave} loading={saving} loadingLabel="Saving…">Save settings</Button>
          {saved && (
            <span style={{ fontSize: 14, color: 'var(--color-green)' }}>
              Saved. New quizzes use these limits.
            </span>
          )}
        </div>
      </div>
    </AdminShell>
  );
};

export default SystemSettings;
