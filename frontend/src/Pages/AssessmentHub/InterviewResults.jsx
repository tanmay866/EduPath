import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getInterviewHistory } from '../Services/interviewResultService';
import {
  LearnerShell, Card, CardHeader, CardFooterNote, StatStrip, Button,
  TableHead, TableRow, NumCell, ActionCell, MicroLabel, Loading, Empty,
} from '../../design';
import { learnerNav, sessionInitials, sessionName, sessionLoginId } from '../../design/nav';

/** Interview scores run 0–10, not 0–100, so they get their own bands. */
const scoreTone = (score) =>
  score >= 8 ? 'var(--color-green)' : score >= 5 ? 'var(--color-amber)' : 'var(--color-clay)';

/**
 * Every past mock interview, in the same stat-strip-plus-table shape as the
 * other assessment result screens.
 */
const COLUMNS = '1fr 0.7fr 1fr 0.8fr';

const InterviewResults = () => {
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
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await getInterviewHistory();
      setAttempts(response.data?.data?.results || []);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch interview history:', err);
      setError('Failed to load interviews. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const attemptsCount = attempts.length;
  const average = attemptsCount
    ? Math.round((attempts.reduce((sum, a) => sum + a.overallScore, 0) / attemptsCount) * 10) / 10
    : 0;
  const last = attempts[0];

  const statItems = [
    { label: 'Interviews', value: attemptsCount },
    { label: 'Average score', value: average, suffix: '/10' },
    { label: 'Last result', value: last ? last.overallScore : '—', suffix: last ? '/10' : undefined },
  ];

  return (
    <LearnerShell
      sections={learnerNav}
      eyebrow="Learner"
      title="Mock interview results"
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
          label="Every interview"
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
          <Empty action={<Button onClick={() => navigate('/assessment-hub/mock-interview')}>Take one</Button>}>
            You have not done a mock interview yet.
          </Empty>
        ) : (
          <>
            <TableHead columns={COLUMNS} align={['left', 'right', 'left', 'right']}>
              <span>Role</span>
              <span>Score</span>
              <span>Recommendation</span>
              <span>Date</span>
            </TableHead>

            {attempts.map((attempt) => (
              <TableRow
                key={attempt._id}
                columns={COLUMNS}
                onClick={() => navigate(`/assessment-hub/mock-interview/results/${attempt._id}`)}
              >
                <span style={{ color: 'var(--color-ink)' }}>{attempt.role}</span>
                <NumCell tone={scoreTone(attempt.overallScore)}>{`${attempt.overallScore}/10`}</NumCell>
                <MicroLabel size={11} tracking="0.1em" color={scoreTone(attempt.overallScore)}>
                  {String(attempt.recommendation || '—').replace(/_/g, ' ')}
                </MicroLabel>
                <ActionCell>
                  <NumCell tone="var(--color-text-4)" size={12.5}>
                    {new Date(attempt.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </NumCell>
                </ActionCell>
              </TableRow>
            ))}

            <CardFooterNote>{`Showing ${attemptsCount} of ${attemptsCount}. Click a row to open it.`}</CardFooterNote>
          </>
        )}
      </Card>
    </LearnerShell>
  );
};

export default InterviewResults;
