import React, { useState } from 'react';
import { AdminShell, Card, CardHeader, CardFooterNote, SegmentedFilter } from '../../design';
import { adminNav } from '../../design/nav';
import { attempts } from '../mockData';
import { DIFFICULTIES } from '../format';
import AttemptsTable from '../component/AttemptsTable';

/**
 * Spec §7 Admin · Attempts — the Overview table full-width, with the segmented
 * filter in its header and a footer line naming the active filter.
 *
 * The table is the shared AttemptsTable rather than a second copy, since the
 * spec asks for the same table on both screens.
 */
const QuizAttempts = () => {
  const [filter, setFilter] = useState('All');
  const rows = filter === 'All' ? attempts : attempts.filter((a) => a.difficulty === filter);

  return (
    <AdminShell items={adminNav} title="Quiz attempts" chip="SAMPLE DATA">
      <Card>
        <CardHeader
          label="All attempts"
          right={<SegmentedFilter options={DIFFICULTIES} value={filter} onChange={setFilter} />}
        />
        <AttemptsTable rows={rows} />
        <CardFooterNote>
          {filter === 'All'
            ? `${rows.length} attempt${rows.length === 1 ? '' : 's'}, all difficulties.`
            : `${rows.length} of ${attempts.length} attempts, filtered to ${filter.toLowerCase()}.`}
        </CardFooterNote>
      </Card>
    </AdminShell>
  );
};

export default QuizAttempts;
