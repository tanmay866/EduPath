import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getQuizHistory } from '../Services/assessmentService';
import { getPracticeHistory } from '../Services/practiceResultService';
import { getInterviewHistory } from '../Services/interviewResultService';
import {
  LearnerShell, Card, RuledGrid, RuledCell, Button, Badge, MicroLabel, type,
} from '../../design';
import { learnerNav, sessionInitials, sessionName, sessionLoginId } from '../../design/nav';
import OnboardingTour from '../../component/OnboardingTour';
import { markTourSeen } from '../Services/profileService';

/**
 * Spec §7 Assessments.
 *
 * A completion card across the top, then a 2-up ruled grid. Untaken cells sit
 * on surface-attn and lead with a filled clay CTA; taken cells drop to a quiet
 * underlined action.
 */
const AssessmentHub = () => {
  const navigate = useNavigate();

  const [completedAssessments, setCompletedAssessments] = useState({
    skill: false,
    aptitude: false,
    csFundamentals: false,
    mockInterview: false,
  });

  // Shown once per account, not once per browser — the flag lives on the user.
  const [showTour, setShowTour] = useState(
    () => Boolean(sessionStorage.getItem('token')) && sessionStorage.getItem('tourSeen') !== '1'
  );

  const dismissTour = () => {
    setShowTour(false);
    sessionStorage.setItem('tourSeen', '1');
    // Closing must not depend on the network. If this fails the tour simply
    // reappears next session, which is far better than an overlay the user
    // cannot get out of.
    markTourSeen().catch((error) => console.error('Could not record tour state:', error));
  };

  useEffect(() => {
    const checkCompletedAssessments = async () => {
      const token = sessionStorage.getItem('token');
      if (!token) return;

      try {
        const response = await getQuizHistory();
        // The endpoint returns { success, data: { results, pagination } } —
        // this was reading response.data.history, a field that has never
        // existed, so the card sat on "NOT TAKEN" no matter how many
        // attempts were on record.
        const total = response.data?.data?.pagination?.total ?? 0;
        if (total > 0) {
          setCompletedAssessments((prev) => ({ ...prev, skill: true }));
        }
      } catch (error) {
        console.error('Error fetching quiz history:', error);
      }

      // Aptitude and CS Fundamentals now save every attempt too, so they
      // get the same "TAKEN" check the Skill Assessment already had.
      try {
        const [aptitudeRes, csRes] = await Promise.all([
          getPracticeHistory('aptitude'),
          getPracticeHistory('cs-fundamentals'),
        ]);
        setCompletedAssessments((prev) => ({
          ...prev,
          aptitude: (aptitudeRes.data?.data?.results || []).length > 0,
          csFundamentals: (csRes.data?.data?.results || []).length > 0,
        }));
      } catch (error) {
        console.error('Error fetching practice history:', error);
      }

      // AI Mock Interview now saves every attempt too.
      try {
        const interviewRes = await getInterviewHistory();
        setCompletedAssessments((prev) => ({
          ...prev,
          mockInterview: (interviewRes.data?.data?.results || []).length > 0,
        }));
      } catch (error) {
        console.error('Error fetching interview history:', error);
      }
    };

    checkCompletedAssessments();
  }, []);

  const assessments = [
    {
      kicker: 'Technical',
      title: 'Skill Assessment',
      description: 'Analyze your technical skills and discover your strengths and weaknesses.',
      path: '/assessment-hub/skill',
      resultsPath: '/assessment',
      duration: '20 MIN',
      completed: completedAssessments.skill,
    },
    {
      kicker: 'Reasoning',
      title: 'Aptitude Test',
      description: 'Test your logical reasoning, quantitative ability, and problem-solving skills.',
      path: '/assessment-hub/aptitude',
      resultsPath: '/assessment-hub/aptitude/results',
      duration: '25 MIN',
      completed: completedAssessments.aptitude,
    },
    {
      kicker: 'Core CS',
      title: 'CS Fundamentals',
      description: 'Questions on operating systems, networks, databases and data structures.',
      path: '/assessment-hub/cs-fundamentals',
      resultsPath: '/assessment-hub/cs-fundamentals/results',
      duration: '20 MIN',
      completed: completedAssessments.csFundamentals,
    },
    {
      kicker: 'Interview',
      title: 'AI Mock Interview',
      description: 'Answer role-specific questions and get scored feedback on each response.',
      path: '/assessment-hub/mock-interview',
      resultsPath: '/assessment-hub/mock-interview/results',
      duration: '30 MIN',
      completed: completedAssessments.mockInterview,
    },
  ];

  const takenCount = assessments.filter((a) => a.completed).length;

  return (
    <LearnerShell
      sections={learnerNav}
      eyebrow="Learner"
      title="Assessments"
      note={sessionName()}
      initials={sessionInitials()}
      footLabel={sessionLoginId()}
    >
      <OnboardingTour open={showTour} onDismiss={dismissTour} />

      {/* Completion card: status left, ticks and the primary right. */}
      <Card style={{ padding: '22px 26px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-ink)' }}>
            {takenCount} of {assessments.length} assessments complete
          </div>
          <p style={{ fontSize: 14.5, color: 'var(--color-text-3)', margin: '6px 0 0' }}>
            Each one you finish narrows what the roadmap recommends.{' '}
            {/* Recoverable rather than gone for good once dismissed. */}
            <button
              type="button"
              onClick={() => setShowTour(true)}
              style={{
                font: 'inherit',
                color: 'var(--color-text-2)',
                background: 'none',
                border: 'none',
                padding: 0,
                textDecoration: 'underline',
                cursor: 'pointer',
              }}
            >
              How this works
            </button>
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ display: 'flex', gap: 6 }}>
            {assessments.map((a) => (
              <span
                key={a.title}
                style={{ width: 58, height: 5, background: a.completed ? 'var(--color-green)' : 'var(--color-line)' }}
              />
            ))}
          </div>
          <Button onClick={() => navigate('/assessment-hub/skill')}>
            {takenCount === 0 ? 'Begin' : 'Continue'}
          </Button>
        </div>
      </Card>

      <RuledGrid columns={2}>
        {assessments.map((a) => (
          <RuledCell key={a.title} attn={!a.completed} style={{ padding: '24px 26px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 14 }}>
              <MicroLabel size={10.5} tracking="0.13em" color="var(--color-text-4)">{a.kicker}</MicroLabel>
              <Badge tone={a.completed ? 'green' : 'clay'}>{a.completed ? 'TAKEN' : 'NOT TAKEN'}</Badge>
            </div>

            <h2 style={{ ...type.cardHeading, margin: 0, color: 'var(--color-ink)' }}>{a.title}</h2>

            <p style={{ fontSize: 14.5, color: 'var(--color-text-2)', lineHeight: 1.55, margin: '10px 0 0', minHeight: 44 }}>
              {a.description}
            </p>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginTop: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
                {a.completed ? (
                  <Button variant="quiet" onClick={() => navigate(a.path)}>Retake</Button>
                ) : (
                  <Button variant="attention" onClick={() => navigate(a.path)}>Start</Button>
                )}
                {a.completed && a.resultsPath && (
                  <Button variant="quiet" onClick={() => navigate(a.resultsPath)}>See results</Button>
                )}
              </div>
              <MicroLabel size={12} tracking="0.06em" color="var(--color-text-4)">{a.duration}</MicroLabel>
            </div>
          </RuledCell>
        ))}
      </RuledGrid>
    </LearnerShell>
  );
};

export default AssessmentHub;
