import React, { useState } from 'react';
import {
  AdminShell, Card, CardHeader, CardFooterNote, TableHead, TableRow, NumCell,
  SegmentedFilter, Input, Empty,
} from '../../design';
import { adminNav } from '../../design/nav';
import { roadmaps as seedRoadmaps } from '../mockData';
import { shortDate } from '../format';

/**
 * Spec §7 Admin · Roadmaps.
 *
 * Columns `1.2fr 1.2fr 0.6fr 0.9fr 0.7fr` — learner, track, mono weeks, then a
 * progress cell holding an inline 5px bar with the percentage right-aligned in
 * a 34px mono column, and the issued date in mono on the right.
 */
const COLUMNS = '1.2fr 1.2fr 0.6fr 0.9fr 0.7fr';
const LEVELS = ['All', 'Beginner', 'Intermediate', 'Advanced'];

const ProgressCell = ({ value }) => (
  <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
    <span style={{ flex: 1, height: 5, background: 'var(--color-bar-empty)' }}>
      <span
        style={{
          display: 'block',
          height: 5,
          width: `${Math.min(100, Math.max(0, value))}%`,
          background: value >= 70 ? 'var(--color-green)' : 'var(--color-navy)',
        }}
      />
    </span>
    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-text-3)', width: 34, textAlign: 'right' }}>
      {`${value}%`}
    </span>
  </span>
);

const RoadmapHistory = () => {
  const [roadmaps] = useState(seedRoadmaps);
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState('All');

  const filtered = roadmaps.filter((roadmap) => {
    const term = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !term || roadmap.userName.toLowerCase().includes(term) || roadmap.skill.toLowerCase().includes(term);
    const matchesLevel = levelFilter === 'All' || roadmap.level === levelFilter;
    return matchesSearch && matchesLevel;
  });

  return (
    <AdminShell items={adminNav} title="Roadmaps" chip="SAMPLE DATA">
      <Card>
        <CardHeader
          label={
            <Input
              admin
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by learner or track"
              style={{ padding: '9px 12px', fontSize: 14, flex: 1 }}
            />
          }
          right={<SegmentedFilter options={LEVELS} value={levelFilter} onChange={setLevelFilter} />}
        />

        <TableHead columns={COLUMNS} align={['left', 'left', 'right', 'left', 'right']}>
          <span>Learner</span>
          <span>Track</span>
          <span>Weeks</span>
          <span>Progress</span>
          <span>Issued</span>
        </TableHead>

        {filtered.length === 0 ? (
          <Empty>No roadmap matches that search.</Empty>
        ) : (
          filtered.map((roadmap) => (
            <TableRow key={roadmap._id} columns={COLUMNS}>
              <span style={{ color: 'var(--color-ink)' }}>{roadmap.userName}</span>
              <span>{roadmap.skill}</span>
              <NumCell>{roadmap.weeks}</NumCell>
              <ProgressCell value={roadmap.progress} />
              <NumCell tone="var(--color-text-4)" size={12.5}>{shortDate(roadmap.createdAt)}</NumCell>
            </TableRow>
          ))
        )}

        <CardFooterNote>
          {levelFilter === 'All'
            ? `${filtered.length} roadmap${filtered.length === 1 ? '' : 's'}, all levels.`
            : `${filtered.length} of ${roadmaps.length} roadmaps, filtered to ${levelFilter.toLowerCase()}.`}
        </CardFooterNote>
      </Card>
    </AdminShell>
  );
};

export default RoadmapHistory;
