import React from 'react';
import { TableHead, TableRow, NumCell, MicroLabel, Empty, TableScroll } from '../../design';
import { scoreTone, shortDate } from '../format';

/**
 * The attempts table from spec §7 Admin · Overview, columns
 * `1.4fr 1fr 0.8fr 0.6fr 0.7fr`. Score is right-aligned mono and takes its
 * colour from the band; the date is right-aligned mono in text-4.
 *
 * Lives here because the spec asks for the same table on both Overview and
 * Attempts.
 */
const COLUMNS = '1.4fr 1fr 0.8fr 0.6fr 0.7fr';

const AttemptsTable = ({ rows = [] }) => (
  <TableScroll>
    <TableHead columns={COLUMNS} align={['left', 'left', 'left', 'right', 'right']}>
      <span>Learner</span>
      <span>Skill</span>
      <span>Difficulty</span>
      <span>Score</span>
      <span>Date</span>
    </TableHead>

    {rows.length === 0 ? (
      <Empty>No attempt matches that difficulty.</Empty>
    ) : (
      rows.map((a) => {
        const pct = Math.round((a.score / a.totalQuestions) * 100);
        return (
          <TableRow key={a._id} columns={COLUMNS}>
            <span style={{ color: 'var(--color-ink)' }}>{a.userName}</span>
            <span>{a.skill}</span>
            <MicroLabel size={11} tracking="0.1em" color="var(--color-text-3)">{a.difficulty}</MicroLabel>
            <NumCell tone={scoreTone(pct)}>{`${pct}%`}</NumCell>
            <NumCell tone="var(--color-text-4)" size={12.5}>{shortDate(a.createdAt)}</NumCell>
          </TableRow>
        );
      })
    )}
  </TableScroll>
);

export default AttemptsTable;
