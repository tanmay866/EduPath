import React, { useState } from 'react';
import {
  AdminShell, Card, CardHeader, CardFooterNote, SegmentedFilter, Button, Loading, Empty,
} from '../../design';
import { adminNav } from '../../design/nav';
import { DIFFICULTIES } from '../format';
import { getAttempts } from '../services/adminService';
import { useAdminData } from '../useAdminData';
import AttemptsTable from '../component/AttemptsTable';

/**
 * Spec §7 Admin · Attempts — the Overview table full-width, with the segmented
 * filter in its header and a footer line naming the active filter.
 *
 * Not only quizzes, despite the file name: the endpoint merges quiz, practice
 * (aptitude and CS fundamentals) and mock-interview results, so the page is
 * titled Attempts to match the nav and what the table actually holds.
 *
 * The table is the shared AttemptsTable rather than a second copy, since the
 * spec asks for the same table on both screens.
 */
const QuizAttempts = () => {
  const [filter, setFilter] = useState('All');
  const { data, loading, error, reload } = useAdminData(getAttempts);

  const attempts = data || [];
  const rows = filter === 'All' ? attempts : attempts.filter((a) => a.difficulty === filter);

  return (
    <AdminShell items={adminNav} title="Attempts">
      <Card>
        <CardHeader
          label="All attempts"
          right={<SegmentedFilter options={DIFFICULTIES} value={filter} onChange={setFilter} />}
        />

        {loading ? (
          <Loading />
        ) : error ? (
          <Empty action={<Button onClick={reload}>Try again</Button>}>{error}</Empty>
        ) : (
          <>
            <AttemptsTable rows={rows} />
            <CardFooterNote>
              {/* "most recent", not a total: the endpoint returns the newest
                  200 across all three result collections. Once an install
                  passes that, a flat count here would read as the total and
                  contradict the figure on the overview. */}
              {filter === 'All'
                ? `${rows.length} most recent attempt${rows.length === 1 ? '' : 's'}, all difficulties.`
                : `${rows.length} of the ${attempts.length} most recent attempts, filtered to ${filter.toLowerCase()}.`}
            </CardFooterNote>
          </>
        )}
      </Card>
    </AdminShell>
  );
};

export default QuizAttempts;
