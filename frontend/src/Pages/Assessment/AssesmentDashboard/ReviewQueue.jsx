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

/**
 * How well held the topic is, across every attempt rather than the last one.
 *
 * The list judged a topic by its most recent score alone, so somebody who had
 * passed four times running and somebody who scraped one pass looked
 * identical — and the difference between them is the difference between
 * "keep this warm" and "you have not really got this yet".
 */
const MASTERY_TONE = {
  struggling: 'clay',
  developing: 'muted',
  consolidating: 'muted',
  mastered: 'green',
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
              {item.bestScore > item.latestScore && (
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-text-4)' }}>
                  {`best ${item.bestScore}%`}
                </span>
              )}
              {item.mastery?.level && (
                <Badge tone={MASTERY_TONE[item.mastery.level] || 'muted'}>{item.mastery.label}</Badge>
              )}
              {item.overdueBy >= 30 && <Badge tone="muted">long overdue</Badge>}
            </div>
            {/* Says why it is here. "Review this" with no reason is a chore;
                "you scored 40% five weeks ago" is a reason. The sentence comes
                from the server, which is where the interval that made it due
                is decided — a second version written here would drift from it. */}
            <p style={{ fontSize: 14, color: 'var(--color-text-3)', margin: '4px 0 0', lineHeight: 1.5 }}>
              {item.explanation || `${item.reason} — last attempt ${ago(item.daysSince)}.`}
            </p>
          </div>

          {/* Straight to the quiz with this topic already chosen. Sending the
              learner to the hub instead made the button a round trip back to
              this page, and even arriving at the right screen they would have
              had to find the topic again in a list of 29 — for a card whose
              whole point is naming the one topic to go back to. */}
          <Button
            variant="secondary"
            style={{ flexShrink: 0, padding: '9px 18px', fontSize: 14 }}
            onClick={() => navigate('/assessment/quiz', {
              state: {
                topicId: item.topicId,
                // Carried so the retake matches the attempt that put the topic
                // on this list. Without them it started at the defaults, so a
                // learner who struggled with an advanced quiz was quietly
                // handed a beginner one and the improvement meant nothing.
                difficulty: item.difficulty || undefined,
                experienceLevel: item.experienceLevel || undefined,
              },
            })}
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
