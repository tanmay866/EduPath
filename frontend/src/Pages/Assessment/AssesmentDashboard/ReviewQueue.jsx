import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardFooterNote, Button, MicroLabel, Badge } from '../../../design';

/**
 * Topics worth going back to.
 *
 * Every attempt has always been stored — score, topic, date, every answer —
 * and nothing ever read it back. This is the one thing that record is good
 * for: noticing that a topic scored badly a month ago has not been touched
 * since, which is not something anyone tracks for themselves.
 *
 * Renders nothing when nothing is due. A card saying "you are all caught up"
 * on every visit is a card people stop seeing, and this one needs to be
 * noticed on the days it has something to say.
 */
const scoreTone = (score) => {
  if (score < 50) return 'var(--color-clay)';
  if (score < 70) return 'var(--color-amber)';
  return 'var(--color-text-2)';
};

const ago = (days) => {
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 14) return `${days} days ago`;
  if (days < 60) return `${Math.round(days / 7)} weeks ago`;
  return `${Math.round(days / 30)} months ago`;
};

const ReviewQueue = ({ queue = [] }) => {
  const navigate = useNavigate();
  if (!queue.length) return null;

  return (
    <Card>
      <CardHeader
        label="Worth revisiting"
        right={
          <MicroLabel size={10.5} tracking="0.13em" color="var(--color-text-4)">
            {`${queue.length} ${queue.length === 1 ? 'TOPIC' : 'TOPICS'}`}
          </MicroLabel>
        }
      />

      {queue.map((item, i) => (
        <div
          key={item.topicId || item.topicName}
          style={{
            padding: '15px 24px',
            borderBottom: i === queue.length - 1 ? 'none' : '1px solid var(--color-line-soft)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 20,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 15.5, fontWeight: 500, color: 'var(--color-ink)' }}>
                {item.topicName}
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 13,
                  color: scoreTone(item.latestScore),
                }}
              >
                {`${item.latestScore}%`}
              </span>
              {item.overdueBy >= 30 && <Badge tone="muted">long overdue</Badge>}
            </div>
            {/* Says why it is here. "Review this" with no reason is a chore;
                "you scored 40% five weeks ago" is a reason. */}
            <p style={{ fontSize: 14, color: 'var(--color-text-3)', margin: '4px 0 0', lineHeight: 1.5 }}>
              {`${item.reason} — last attempt ${ago(item.daysSince)}.`}
            </p>
          </div>

          <Button
            variant="secondary"
            style={{ flexShrink: 0, padding: '9px 18px', fontSize: 14 }}
            onClick={() => navigate('/assessment-hub/skill')}
          >
            Retake
          </Button>
        </div>
      ))}

      <CardFooterNote>
        A weak score comes back within a week, a strong one after two months. Retaking updates
        your roadmap as well as this list.
      </CardFooterNote>
    </Card>
  );
};

export default ReviewQueue;
