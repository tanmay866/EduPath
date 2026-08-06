import React, { useState } from 'react';
import {
  AdminShell, Card, CardHeader, StatStrip, SegmentedFilter, BarChart,
  Button, Loading, Empty,
} from '../../design';
import { adminNav } from '../../design/nav';
import { DIFFICULTIES } from '../format';
import { getOverview } from '../services/adminService';
import { useAdminData } from '../useAdminData';
import AttemptsTable from '../component/AttemptsTable';

/**
 * Spec §7 Admin · Overview.
 *
 * A full-bleed four-cell stat strip with deltas, then `1.35fr 1fr` — a bar
 * chart beside a distribution in ink — then the attempts table with a
 * segmented filter in its header strip.
 *
 * Deltas compare the last 30 days against the 30 before them, and are omitted
 * rather than shown as 0% when there is no earlier window to compare against.
 */
const AdminDashboard = () => {
  const [filter, setFilter] = useState('All');
  const { data, loading, error, reload } = useAdminData(getOverview);

  const attempts = data?.attempts || [];
  const rows = filter === 'All' ? attempts : attempts.filter((a) => a.difficulty === filter);

  if (loading) {
    return (
      <AdminShell items={adminNav} title="Overview">
        <Card><Loading /></Card>
      </AdminShell>
    );
  }

  if (error) {
    return (
      <AdminShell items={adminNav} title="Overview">
        <Card>
          <Empty action={<Button onClick={reload}>Try again</Button>}>{error}</Empty>
        </Card>
      </AdminShell>
    );
  }

  return (
    <AdminShell items={adminNav} title="Overview">
      <StatStrip items={data.stats} />

      <div className="stack-sm" style={{ display: 'grid', gridTemplateColumns: '1.35fr 1fr', gap: 22, alignItems: 'start' }}>
        <Card>
          <CardHeader label="Attempts by topic" />
          {data.skillUsage.length === 0 ? (
            <Empty>No assessment has been completed yet.</Empty>
          ) : (
            <div style={{ padding: '22px 24px' }}>
              <BarChart data={data.skillUsage} height={220} markLast />
            </div>
          )}
        </Card>

        <Card>
          <CardHeader label="Difficulty split" />
          {data.difficultySplit.length === 0 ? (
            <Empty>Nothing to split yet.</Empty>
          ) : (
            <div style={{ padding: '22px 24px' }}>
              <BarChart data={data.difficultySplit} height={220} tone="ink" />
            </div>
          )}
        </Card>
      </div>

      <Card>
        <CardHeader
          label="Recent attempts"
          right={<SegmentedFilter options={DIFFICULTIES} value={filter} onChange={setFilter} />}
        />
        <AttemptsTable rows={rows} />
      </Card>
    </AdminShell>
  );
};

export default AdminDashboard;
