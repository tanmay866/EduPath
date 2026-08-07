import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPracticeResult } from '../Services/practiceResultService';
import { ResultStage, LoadingStage, Page } from './components/QuizStages';
import { Card, Button, Empty } from '../../design';

const LABELS = { aptitude: 'Aptitude', 'cs-fundamentals': 'CS fundamentals' };
const RETAKE_PATH = { aptitude: '/assessment-hub/aptitude', 'cs-fundamentals': '/assessment-hub/cs-fundamentals' };

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

/**
 * One past attempt at Aptitude or CS Fundamentals, reusing the same
 * ResultStage the live post-quiz screen renders — a saved attempt should
 * look exactly like the moment it was taken.
 */
const PracticeResultDetail = ({ type }) => {
  const { resultId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    if (!token) navigate('/signin');
  }, [navigate]);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        setLoading(true);
        const response = await getPracticeResult(resultId);
        setData(response.data?.data);
        setError(null);
      } catch (err) {
        console.error('Failed to load practice result:', err);
        setError('This result could not be loaded.');
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [resultId]);

  if (loading) return <LoadingStage label="Loading result" />;

  if (error || !data) {
    return (
      <Page>
        <Card>
          <Empty action={<Button onClick={() => navigate(`/assessment-hub/${type}/results`)}>Back to results</Button>}>
            {error || 'This result could not be loaded.'}
          </Empty>
        </Card>
      </Page>
    );
  }

  return (
    <ResultStage
      label={LABELS[type]}
      result={data}
      review={data.review || []}
      formatTime={formatTime}
      onRetry={() => navigate(RETAKE_PATH[type])}
      onDone={() => navigate(`/assessment-hub/${type}/results`)}
    />
  );
};

export default PracticeResultDetail;
