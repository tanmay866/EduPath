import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPracticeHistory } from '../Services/practiceResultService';
import {
  LearnerShell, Card, CardHeader, CardFooterNote, StatStrip, Button,
  TableHead, TableRow, NumCell, ActionCell, MicroLabel, Loading, Empty,
} from '../../design';
import { learnerNav, sessionInitials, sessionName, sessionLoginId } from '../../design/nav';

/**
 * Every attempt at one practice test (Aptitude or CS Fundamentals), in the
 * same stat-strip-plus-table shape as the Skill Assessment's Overview and
 * All-results screens — these two tests never had anywhere to send "See
 * results" to before, since nothing about them was saved.
 */
const COLUMNS = '1fr 0.8fr 0.7fr 0.8fr';

const PracticeResults = ({ type, label, retakePath }) => {
  const navigate = useNavigate();
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    if (!token) navigate('/signin');
  }, [navigate]);

  useEffect(() => {
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await getPracticeHistory(type);
      setAttempts(response.data?.data?.results || []);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch practice history:', err);
      setError('Failed to load results. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const passedCount = attempts.filter((a) => a.percentage >= 70).length;
  const attemptsCount = attempts.length;
  const average = attemptsCount
    ? Math.round(attempts.reduce((sum, a) => sum + a.percentage, 0) / attemptsCount)
    : 0;
  const last = attempts[0];

  const statItems = [
    { label: 'Attempts', value: attemptsCount },
    { label: 'Average score', value: average, suffix: '/100' },
    { label: 'Last result', value: last ? Math.round(last.percentage) : '—', suffix: last ? '/100' : undefined },
  ];

  return (
    <LearnerShell
      sections={learnerNav}
      eyebrow="Learner"
      title={`${label} results`}
      note={sessionName()}
      initials={sessionInitials()}
      footLabel={sessionLoginId()}
    >
      <div>
        <Button variant="quiet" onClick={() => navigate('/assessment-hub')}>Back to the hub</Button>
      </div>

      <StatStrip items={statItems} />

      <Card>
        <CardHeader
          label="Every attempt"
          right={
            <MicroLabel size={10.5} tracking="0.13em" color="var(--color-text-4)">
              {`${attemptsCount} TOTAL`}
            </MicroLabel>
          }
        />

        {loading ? (
          <Loading />
        ) : error ? (
          <Empty action={<Button onClick={fetchHistory}>Try again</Button>}>{error}</Empty>
        ) : attempts.length === 0 ? (
          <Empty action={<Button onClick={() => navigate(retakePath)}>Take it</Button>}>
            You have not taken this test yet.
          </Empty>
        ) : (
          <>
            <TableHead columns={COLUMNS} align={['left', 'right', 'left', 'right']}>
              <span>Difficulty</span>
              <span>Score</span>
              <span>Status</span>
              <span>Date</span>
            </TableHead>

            {attempts.map((attempt) => {
              const pct = Math.round(attempt.percentage);
              const passed = pct >= 70;
              return (
                <TableRow
                  key={attempt._id}
                  columns={COLUMNS}
                  onClick={() => navigate(`/assessment-hub/${type}/results/${attempt._id}`)}
                >
                  <span style={{ textTransform: 'capitalize', color: 'var(--color-ink)' }}>
                    {attempt.difficulty || '—'}
                  </span>
                  <NumCell tone={passed ? 'var(--color-green)' : 'var(--color-clay)'}>{`${pct}%`}</NumCell>
                  <MicroLabel size={11} tracking="0.1em" color={passed ? 'var(--color-green)' : 'var(--color-clay)'}>
                    {passed ? 'Passed' : 'Below 70'}
                  </MicroLabel>
                  <ActionCell>
                    <NumCell tone="var(--color-text-4)" size={12.5}>
                      {new Date(attempt.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </NumCell>
                  </ActionCell>
                </TableRow>
              );
            })}

            <CardFooterNote>
              {`${passedCount} of ${attemptsCount} at or above the 70% pass mark. Click a row to open it.`}
            </CardFooterNote>
          </>
        )}
      </Card>
    </LearnerShell>
  );
};

export default PracticeResults;
