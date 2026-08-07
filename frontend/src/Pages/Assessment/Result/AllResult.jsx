import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getQuizHistory } from '../../Services/assessmentService';
import {
  LearnerShell, Card, CardHeader, CardFooterNote, Button, TableHead, TableRow,
  NumCell, ActionCell, MicroLabel, Loading, Empty,
} from '../../../design';
import { learnerNav, sessionInitials, sessionName, sessionLoginId } from '../../../design/nav';

/**
 * Every attempt, as a §5 table.
 *
 * §7 has no all-results screen — the Overview shows only the recent few — so
 * this follows the table pattern: mono right-aligned score and date, a mono
 * status in green or clay, and a footer count.
 */
const COLUMNS = '1.4fr 0.8fr 0.7fr 0.7fr 0.8fr';

const AllResult = () => {
  const navigate = useNavigate();
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    if (!token) {
      navigate('/signin');
      return;
    }
  }, [navigate]);

  useEffect(() => {
    fetchQuizHistory();
  }, []);

  const fetchQuizHistory = async () => {
    try {
      setLoading(true);
      const response = await getQuizHistory();
      const results = response.data.data.results || [];

      const formattedAttempts = results.map((attempt) => ({
        id: attempt._id,
        resultId: attempt._id,
        // History populates the topic onto `topicId`, so reading only
        // `topic` fell through to the placeholder and every row in the table
        // read "Assessment" — a list of attempts with nothing to tell them
        // apart. Both shapes are accepted since other endpoints return the
        // flatter one.
        topic: attempt.topicId?.name || attempt.topic?.name || attempt.topicName || 'Assessment',
        date: new Date(attempt.completedAt || attempt.createdAt).toLocaleDateString('en-GB', {
          day: '2-digit', month: 'short', year: 'numeric',
        }),
        score: attempt.score,
        totalQuestions: attempt.totalQuestions,
        percentage: attempt.percentage,
        passed: attempt.percentage >= 70,
      }));

      setAttempts(formattedAttempts);
      setError(null);
    } catch (err) {
      console.error('Error fetching quiz history:', err);
      setError('Failed to load quiz history. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const passed = attempts.filter((a) => a.passed).length;

  return (
    <LearnerShell
      sections={learnerNav}
      eyebrow="Learn"
      title="All results"
      note={sessionName()}
      initials={sessionInitials()}
      footLabel={sessionLoginId()}
    >
      <Card>
        <CardHeader
          label="Every attempt"
          right={
            <MicroLabel size={10.5} tracking="0.13em" color="var(--color-text-4)">
              {`${attempts.length} TOTAL`}
            </MicroLabel>
          }
        />

        {loading ? (
          <Loading />
        ) : error ? (
          <Empty action={<Button onClick={fetchQuizHistory}>Try again</Button>}>{error}</Empty>
        ) : attempts.length === 0 ? (
          <Empty action={<Button onClick={() => navigate('/assessment-hub')}>Take one</Button>}>
            You have not completed an assessment yet.
          </Empty>
        ) : (
          <>
            <TableHead columns={COLUMNS} align={['left', 'right', 'right', 'left', 'right']}>
              <span>Topic</span>
              <span>Score</span>
              <span>Result</span>
              <span>Status</span>
              <span>Date</span>
            </TableHead>

            {attempts.map((attempt) => (
              <TableRow
                key={attempt.id}
                columns={COLUMNS}
                onClick={() => navigate(`/assessment/result/${attempt.resultId}`)}
              >
                <span style={{ color: 'var(--color-ink)' }}>{attempt.topic}</span>
                <NumCell tone="var(--color-text-3)">
                  {`${attempt.score}/${attempt.totalQuestions}`}
                </NumCell>
                <NumCell tone={attempt.passed ? 'var(--color-green)' : 'var(--color-clay)'}>
                  {`${Math.round(attempt.percentage)}%`}
                </NumCell>
                <MicroLabel
                  size={11}
                  tracking="0.1em"
                  color={attempt.passed ? 'var(--color-green)' : 'var(--color-clay)'}
                >
                  {attempt.passed ? 'Passed' : 'Below 70'}
                </MicroLabel>
                <ActionCell>
                  <NumCell tone="var(--color-text-4)" size={12.5}>{attempt.date}</NumCell>
                </ActionCell>
              </TableRow>
            ))}

            <CardFooterNote>
              {`${passed} of ${attempts.length} at or above the 70% pass mark. Click a row to open it.`}
            </CardFooterNote>
          </>
        )}
      </Card>
    </LearnerShell>
  );
};

export default AllResult;
