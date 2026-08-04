import React from 'react';
import {
  AdminShell, Card, CardHeader, StatStrip, InkPanel, LabelledBar, ShareChart,
  MicroLabel, Button, Loading, Empty,
} from '../../design';
import { adminNav } from '../../design/nav';
import { getAnalytics } from '../services/adminService';
import { useAdminData } from '../useAdminData';

/**
 * Spec §7 Admin · AI analytics.
 *
 * A four-cell stat strip, then `1fr 1fr`: a four-bar normalised card on the
 * left; on the right, stacked, a share chart and an ink panel.
 *
 * This reports what the AI produced, which is countable, rather than how many
 * times it was called or what it cost — nothing logs either. The ink panel
 * says so instead of printing a token figure nobody measured.
 */
const AIAnalytics = () => {
  const { data, loading, error, reload } = useAdminData(getAnalytics);

  if (loading) {
    return (
      <AdminShell items={adminNav} title="AI analytics">
        <Card><Loading /></Card>
      </AdminShell>
    );
  }

  if (error) {
    return (
      <AdminShell items={adminNav} title="AI analytics">
        <Card>
          <Empty action={<Button onClick={reload}>Try again</Button>}>{error}</Empty>
        </Card>
      </AdminShell>
    );
  }

  const roles = data.requestedRoles || [];
  const peak = Math.max(...roles.map((r) => r.value), 1);

  return (
    <AdminShell items={adminNav} title="AI analytics">
      <StatStrip items={data.stats} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22, alignItems: 'start' }}>
        <Card>
          <CardHeader
            label="Most requested tracks"
            right={
              roles.length > 0 && (
                <MicroLabel size={10.5} tracking="0.13em" color="var(--color-text-4)">
                  {`PEAK ${peak}`}
                </MicroLabel>
              )
            }
          />
          {roles.length === 0 ? (
            <Empty>No roadmap has been generated yet.</Empty>
          ) : (
            // Normalised against the busiest track, so the bars compare with
            // each other rather than against an arbitrary 100.
            <div style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
              {roles.map((role) => (
                <LabelledBar
                  key={role.label}
                  label={role.label}
                  value={role.value}
                  display={role.value}
                  max={peak}
                />
              ))}
            </div>
          )}
        </Card>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          <Card>
            <CardHeader label="Difficulty share" />
            {(data.difficultySplit || []).length === 0 ? (
              <Empty>Nothing to split yet.</Empty>
            ) : (
              <div style={{ padding: '22px 24px' }}>
                <ShareChart data={data.difficultySplit} />
              </div>
            )}
          </Card>

          <InkPanel label="Token usage">
            {data.tokenUsage ? (
              <>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 10 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 34, letterSpacing: '-0.02em', color: '#fff' }}>
                    {(data.tokenUsage.total / 1000).toFixed(0)}
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--color-dark-text-3)' }}>
                    K TOKENS
                  </span>
                </div>
                <span style={{ fontSize: 14.5, lineHeight: 1.55, color: 'var(--color-dark-text-2)' }}>
                  {`About ${data.tokenUsage.averagePerRequest} tokens per request.`}
                </span>
              </>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 10 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 34, letterSpacing: '-0.02em', color: 'var(--color-dark-text-3)' }}>
                    —
                  </span>
                </div>
                <span style={{ fontSize: 14.5, lineHeight: 1.55, color: 'var(--color-dark-text-2)' }}>
                  Nothing records per-call token spend yet, so there is no figure to report. The
                  counts above are what the AI produced, not what it cost.
                </span>
              </>
            )}
          </InkPanel>
        </div>
      </div>
    </AdminShell>
  );
};

export default AIAnalytics;
