import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getQuizHistory } from '../Services/assessmentService';
import {
  LearnerShell, Card, RuledGrid, RuledCell, Button, Badge, MicroLabel, type,
} from '../../design';
import { learnerNav, sessionInitials, sessionName, sessionLoginId } from '../../design/nav';

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

  useEffect(() => {
    const checkCompletedAssessments = async () => {
      try {
        const token = sessionStorage.getItem('token');
        if (token) {
          const response = await getQuizHistory();
          if (response.data && response.data.history && response.data.history.length > 0) {
            setCompletedAssessments((prev) => ({ ...prev, skill: true }));
          }
        }
      } catch (error) {
        console.error('Error fetching quiz history:', error);
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
      duration: '20 MIN',
      completed: completedAssessments.skill,
    },
    {
      kicker: 'Reasoning',
      title: 'Aptitude Test',
      description: 'Test your logical reasoning, quantitative ability, and problem-solving skills.',
      path: '/assessment-hub/aptitude',
      duration: '25 MIN',
      completed: completedAssessments.aptitude,
    },
    {
      kicker: 'Core CS',
      title: 'CS Fundamentals',
      description: 'Questions on operating systems, networks, databases and data structures.',
      path: '/assessment-hub/cs-fundamentals',
      duration: '20 MIN',
      completed: completedAssessments.csFundamentals,
    },
    {
      kicker: 'Interview',
      title: 'AI Mock Interview',
      description: 'Answer role-specific questions and get scored feedback on each response.',
      path: '/assessment-hub/mock-interview',
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
      {/* Completion card: status left, ticks and the primary right. */}
      <Card style={{ padding: '22px 26px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-ink)' }}>
            {takenCount} of {assessments.length} assessments complete
          </div>
          <p style={{ fontSize: 14.5, color: 'var(--color-text-3)', margin: '6px 0 0' }}>
            Each one you finish narrows what the roadmap recommends.
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
                <Button variant="quiet" onClick={() => navigate('/assessment')}>See results</Button>
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
