import React from 'react';
import {
  AdminShell, Card, CardHeader, StatStrip, InkPanel, LabelledBar, ShareChart, MicroLabel,
} from '../../design';
import { adminNav } from '../../design/nav';
import { aiStats, requestedSkills, difficultySplit, tokenUsage } from '../mockData';

/**
 * Spec §7 Admin · AI analytics.
 *
 * A four-cell stat strip, then `1fr 1fr`: a four-bar normalised card on the
 * left; on the right, stacked, a share chart and an ink panel carrying a mono
 * label, a mono 34px figure beside a 14px unit, and a 14.5px line.
 */
const AIAnalytics = () => {
  const peak = Math.max(...requestedSkills.map((s) => s.value), 1);

  return (
    <AdminShell items={adminNav} title="AI analytics" chip="SAMPLE DATA">
      <StatStrip items={aiStats} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22, alignItems: 'start' }}>
        <Card>
          <CardHeader
            label="Most requested skills"
            right={
              <MicroLabel size={10.5} tracking="0.13em" color="var(--color-text-4)">
                {`PEAK ${peak}`}
              </MicroLabel>
            }
          />
          {/* Normalised against the busiest skill, so the bars compare with each
              other rather than against an arbitrary 100. */}
          <div style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
            {requestedSkills.map((skill) => (
              <LabelledBar
                key={skill.label}
                label={skill.label}
                value={skill.value}
                display={skill.value}
                max={peak}
              />
            ))}
          </div>
        </Card>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          <Card>
            <CardHeader label="Difficulty share" />
            <div style={{ padding: '22px 24px' }}>
              <ShareChart data={difficultySplit.slice(0, 3)} />
            </div>
          </Card>

          <InkPanel label="Token usage">
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 10 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 34, letterSpacing: '-0.02em', color: '#fff' }}>
                {(tokenUsage.total / 1000).toFixed(0)}
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--color-dark-text-3)' }}>
                K TOKENS
              </span>
            </div>
            <span style={{ fontSize: 14.5, lineHeight: 1.55, color: 'var(--color-dark-text-2)' }}>
              {`About ${tokenUsage.averagePerRequest} tokens per request across every quiz and roadmap generated.`}
            </span>
          </InkPanel>
        </div>
      </div>
    </AdminShell>
  );
};

export default AIAnalytics;
