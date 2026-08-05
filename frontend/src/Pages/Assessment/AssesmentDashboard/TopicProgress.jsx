import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardFooterNote, Button, MicroLabel, Empty } from '../../../design';

/**
 * First score against latest, per topic.
 *
 * Derived from the quiz results themselves rather than stored anywhere: every
 * attempt is already on record with its score and date, so keeping a second
 * copy of the same numbers would only give them a chance to disagree.
 *
 * A topic sat once has nothing to compare, so it is shown as a starting point
 * with a prompt to sit it again — which is the part of assess, plan, learn,
 * re-assess that nothing was asking for.
 */
const deltaTone = (delta) =>
  delta > 0 ? 'var(--color-green)' : delta < 0 ? 'var(--color-clay)' : 'var(--color-text-4)';

const TopicProgress = ({ topics = [] }) => {
  const navigate = useNavigate();

  if (!topics.length) {
    return (
      <Card>
        <CardHeader label="Progress by topic" />
        <Empty action={<Button onClick={() => navigate('/assessment/quiz')}>Take an assessment</Button>}>
          Once you have sat a topic twice, the change between attempts shows here.
        </Empty>
      </Card>
    );
  }

  const retaken = topics.filter((t) => t.quizCount > 1);
  const improved = retaken.filter((t) => t.latestScore > t.firstScore).length;

  return (
    <Card>
      <CardHeader
        label="Progress by topic"
        right={
          retaken.length > 0 && (
            <MicroLabel size={10.5} tracking="0.13em" color="var(--color-text-4)">
              {`${improved} OF ${retaken.length} IMPROVED`}
            </MicroLabel>
          )
        }
      />

      {topics.map((t, i) => {
        const once = t.quizCount <= 1;
        const delta = Math.round((t.latestScore ?? 0) - (t.firstScore ?? 0));

        return (
          <div
            key={t._id || t.topicName || i}
            style={{
              padding: '14px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              borderBottom: i === topics.length - 1 ? 'none' : '1px solid var(--color-line-soft)',
            }}
          >
            <span style={{ flex: 1, fontSize: 15, color: 'var(--color-ink)', minWidth: 0 }}>
              {t.topicName}
            </span>

            {once ? (
              <>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--color-text-3)' }}>
                  {`${t.latestScore}%`}
                </span>
                <MicroLabel size={10} tracking="0.1em" color="var(--color-text-4)" style={{ width: 92, textAlign: 'right' }}>
                  Sat once
                </MicroLabel>
              </>
            ) : (
              <>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--color-text-4)' }}>
                  {`${t.firstScore}%`}
                </span>
                <span style={{ color: 'var(--color-text-4)', fontSize: 12 }}>→</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--color-ink)' }}>
                  {`${t.latestScore}%`}
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 12.5,
                    color: deltaTone(delta),
                    width: 92,
                    textAlign: 'right',
                  }}
                >
                  {`${delta > 0 ? '+' : ''}${delta} over ${t.quizCount}`}
                </span>
              </>
            )}
          </div>
        );
      })}

      <CardFooterNote>
        Sitting a topic again is how the roadmap learns what you have actually picked up.
      </CardFooterNote>
    </Card>
  );
};

export default TopicProgress;
