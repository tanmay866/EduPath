import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchQuizTopics, getQuizStats, getQuizHistory } from '../../Services/assessmentService';
import {
  LearnerShell, StatStrip, Card, CardHeader, CardFooterNote, InkPanel,
  OrdinalRow, ListItem, Button, ProgressBar, MicroLabel, Badge, Loading, Empty, type,
} from '../../../design';
import { learnerNav, sessionInitials, sessionName, sessionLoginId } from '../../../design/nav';

/**
 * Spec §7 Overview.
 *
 * Stat strip of four, then 1.4fr / 1fr: recent activity as ordinal rows on the
 * left, the next action and an ink panel stacked on the right.
 */
const AssessmentDashboard = () => {
  const navigate = useNavigate();

  const [topicCount, setTopicCount] = useState(0);
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    if (!token) navigate('/signin');
  }, [navigate]);

  useEffect(() => { fetchDashboardData(); }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [topicsRes, statsRes, historyRes] = await Promise.all([
        fetchQuizTopics(),
        getQuizStats().catch(() => ({ data: { data: { overall: { totalQuizzes: 0, averageScore: 0 }, topicPerformance: [] } } })),
        getQuizHistory().catch(() => ({ data: { data: { results: [] } } })),
      ]);
      setTopicCount((topicsRes.data?.data || []).length);
      setStats(statsRes.data?.data || null);
      setHistory(historyRes.data?.data?.results || []);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const attempts = stats?.overall?.totalQuizzes || 0;
  const average = Math.round(stats?.overall?.averageScore || 0);
  const covered = stats?.topicPerformance?.length || 0;
  const last = history[0];

  const statItems = [
    { label: 'Attempts', value: attempts },
    { label: 'Average score', value: average, suffix: '/100' },
    // The catalogue size gives the count a denominator to mean something against.
    { label: 'Topics covered', value: covered, suffix: topicCount ? `/${topicCount}` : undefined },
    { label: 'Last result', value: last ? Math.round(last.percentage) : '—', suffix: last ? '/100' : undefined },
  ];

  const recent = history.slice(0, 3);

  const shell = (children) => (
    <LearnerShell
      sections={learnerNav}
      eyebrow="Learner"
      title="Overview"
      note={sessionName()}
      initials={sessionInitials()}
      footLabel={sessionLoginId()}
    >
      {children}
    </LearnerShell>
  );

  if (error) {
    return shell(
      <Card>
        <Empty action={<Button onClick={fetchDashboardData}>Try again</Button>}>{error}</Empty>
      </Card>
    );
  }

  if (loading) {
    return shell(<Card><Loading /></Card>);
  }

  return shell(
    <>
      <StatStrip items={statItems} />

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 22, alignItems: 'start' }}>
        {/* Left — recent activity as ordinal rows */}
        <Card>
          <CardHeader label="Recent attempts" />
          {recent.length === 0 ? (
            <Empty action={<Button onClick={() => navigate('/assessment/quiz')}>Take an assessment</Button>}>
              Your assessment results will appear here.
            </Empty>
          ) : (
            recent.map((attempt, i) => {
              const pct = Math.round(attempt.percentage);
              const passed = pct >= 70;
              return (
                <div
                  key={attempt._id}
                  style={{ padding: '18px 20px', borderBottom: i === recent.length - 1 ? 'none' : '1px solid var(--color-line-soft)' }}
                >
                  <OrdinalRow
                    ordinal={String(i + 1).padStart(2, '0')}
                    right={
                      <Button
                        variant={i === 0 ? 'attention' : 'secondary'}
                        style={i === 0 ? undefined : { padding: '9px 16px', fontSize: 13.5 }}
                        onClick={() => navigate(`/assessment/result/${attempt._id}`)}
                      >
                        Review
                      </Button>
                    }
                  >
                    <ListItem
                      title={attempt.topicName || attempt.topic?.name || 'Assessment'}
                      detail={
                        <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <Badge tone={passed ? 'green' : 'clay'}>{`SCORE ${pct}`}</Badge>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12.5, color: 'var(--color-text-4)' }}>
                            {new Date(attempt.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </span>
                        </span>
                      }
                    />
                  </OrdinalRow>
                </div>
              );
            })
          )}
          {recent.length > 0 && (
            <CardFooterNote>
              Showing the {recent.length} most recent of {history.length}.
            </CardFooterNote>
          )}
        </Card>

        {/* Right — next action, then one ink panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          <Card>
            <CardHeader label="Next up" />
            <div style={{ padding: '20px 22px' }}>
              <div style={{ ...type.panelHeading, color: 'var(--color-ink)' }}>Skill assessment</div>
              <p style={{ fontSize: 14.5, color: 'var(--color-text-2)', margin: '8px 0 18px', lineHeight: 1.55 }}>
                {covered > 0
                  ? `You have covered ${covered} ${covered === 1 ? 'topic' : 'topics'}. Another pass sharpens the roadmap.`
                  : 'Take your first assessment so the roadmap knows where to start.'}
              </p>

              <ProgressBar value={average} height={6} tone="navy" />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, marginBottom: 20 }}>
                <MicroLabel size={11} tracking="0.1em" color="var(--color-text-3)">{`${average}% AVERAGE`}</MicroLabel>
                <MicroLabel size={11} tracking="0.1em" color="var(--color-text-4)">{`${attempts} TAKEN`}</MicroLabel>
              </div>

              <Button fullWidth onClick={() => navigate('/assessment/quiz')}>Start assessment</Button>
            </div>
          </Card>

          <InkPanel label="Method" title="Assess, then plan.">
            The roadmap is generated from what you actually got wrong, not from a
            template. Each assessment you take narrows it further.
          </InkPanel>
        </div>
      </div>
    </>
  );
};

export default AssessmentDashboard;
