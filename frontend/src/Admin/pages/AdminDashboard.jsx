import React, { useState } from 'react';
import {
  AdminShell, Card, CardHeader, StatStrip, SegmentedFilter, BarChart,
} from '../../design';
import { adminNav } from '../../design/nav';
import { overviewStats, skillUsage, difficultySplit, attempts } from '../mockData';
import { DIFFICULTIES } from '../format';
import AttemptsTable from '../component/AttemptsTable';

/**
 * Spec §7 Admin · Overview.
 *
 * A full-bleed four-cell stat strip with deltas, then `1.35fr 1fr` — a bar
 * chart beside a five-bar distribution in ink — then the attempts table with a
 * segmented filter in its header strip.
 */
const AdminDashboard = () => {
  const [filter, setFilter] = useState('All');
  const rows = filter === 'All' ? attempts : attempts.filter((a) => a.difficulty === filter);

  return (
    <AdminShell items={adminNav} title="Overview" chip="SAMPLE DATA">
      <StatStrip items={overviewStats} />

      <div style={{ display: 'grid', gridTemplateColumns: '1.35fr 1fr', gap: 22, alignItems: 'start' }}>
        <Card>
          <CardHeader label="Skill usage" />
          <div style={{ padding: '22px 24px' }}>
            <BarChart data={skillUsage} height={220} markLast />
          </div>
        </Card>

        <Card>
          <CardHeader label="Difficulty split" />
          <div style={{ padding: '22px 24px' }}>
            <BarChart data={difficultySplit} height={220} tone="ink" />
          </div>
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
