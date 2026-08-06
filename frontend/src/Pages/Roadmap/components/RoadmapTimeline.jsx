import React, { useState } from 'react';
import {
  Card, CardHeader, CardFooterNote, Button, MicroLabel, Badge, StatusBox, LabelledBar, Loading, Empty,
} from '../../../design';
import WeeklyPlan from './WeeklyPlan';
import InterviewReadiness from './InterviewReadiness';

/**
 * Spec §7 Roadmap.
 *
 * Left: one row per node — status box, title, mono status tag, mono week label.
 * Done drops the title to text-2 and the tag to text-4; the current node takes
 * surface-current with a 600 title and an amber tag. A 3px left border keyed to
 * the same status colour runs down the column, echoing the sidebar's active-item
 * border so the list reads as a path rather than a plain table.
 * Right: the current focus card, then a gap report of bars by category.
 *
 * Rows with a mini project or resources expand in place on click — the two
 * concerns (mark complete vs. see resources) used to share one click target,
 * which meant there was nowhere to show what a skill actually links to. The
 * status box now owns "mark complete" on its own; the row owns "show detail."
 *
 * The old skeleton shimmer is gone — §5 asks for card chrome plus a mono
 * LOADING label instead.
 */
const domainOf = (url) => {
  try { return new URL(url).hostname.replace(/^www\./, ''); }
  catch { return ''; }
};

const RESOURCE_TONE = { docs: 'muted', article: 'amber', video: 'clay', course: 'green' };

const ResourceList = ({ resources }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
    {resources.map((r, i) => (
      <a
        key={`${r.url}-${i}`}
        href={r.url}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: 10,
          textDecoration: 'none',
        }}
      >
        <Badge tone={RESOURCE_TONE[r.type] || 'muted'}>{r.type || 'link'}</Badge>
        <span style={{ fontSize: 14, color: 'var(--color-ink)', textDecoration: 'underline' }}>
          {r.title || r.url}
        </span>
        {domainOf(r.url) && (
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, color: 'var(--color-text-4)' }}>
            {domainOf(r.url)}
          </span>
        )}
      </a>
    ))}
  </div>
);

const STATUS_BORDER = {
  done: 'var(--color-green)',
  current: 'var(--color-amber)',
  future: 'transparent',
};

const RoadmapTimeline = ({
  onAdapt, adapting, roadmapData, isRoadmapLoading, updatingSkill, onMarkCompleted, onRegenerate, latestInterview, loadingInterview, targetRole, onTestSkill }) => {
  const skills = roadmapData?.skills || [];
  const [expanded, setExpanded] = useState('');

  if (isRoadmapLoading) {
    return <Card><Loading /></Card>;
  }

  if (skills.length === 0) {
    return (
      <Card>
        <Empty>Generate a roadmap and its skills will appear here, in the order to learn them.</Empty>
      </Card>
    );
  }

  const completed = skills.filter((s) => s.status === 'completed').length;
  const pct = skills.length ? Math.round((completed / skills.length) * 100) : 0;

  // The first node that is not done is "current"; everything after it is future.
  const currentIndex = skills.findIndex((s) => s.status !== 'completed');
  const currentSkill = currentIndex >= 0 ? skills[currentIndex] : null;

  const byCategory = skills.reduce((acc, s) => {
    const key = s.category || 'Other';
    if (!acc[key]) acc[key] = { total: 0, done: 0 };
    acc[key].total += 1;
    if (s.status === 'completed') acc[key].done += 1;
    return acc;
  }, {});

  const gapReport = Object.entries(byCategory).slice(0, 4).map(([label, v]) => ({
    label,
    value: Math.round((v.done / v.total) * 100),
  }));

  return (
    <div className="stack-sm" style={{ display: 'grid', gridTemplateColumns: '1.55fr 1fr', gap: 22, alignItems: 'start' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 22, minWidth: 0 }}>
      {/* The plan was built from the gaps known when it was generated, and
          nothing rebuilds it on its own. Saying so beats showing a stale
          plan as though it were current. */}
      {roadmapData?.isStale && (
        <Card
          style={{
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 20,
            flexWrap: 'wrap',
            borderLeft: '3px solid var(--color-amber)',
          }}
        >
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-ink)' }}>
              You have assessed since this plan was built
            </div>
            {/* Two different actions, and the difference matters: updating
                keeps what you have finished, regenerating starts the plan
                over. Only one of those was offered before. */}
            <p style={{ fontSize: 14, color: 'var(--color-text-3)', margin: '5px 0 0' }}>
              Updating rebuilds it around your latest results and keeps everything you have
              marked done. Regenerating starts the plan over.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10, flexShrink: 0, flexWrap: 'wrap' }}>
            {onAdapt && (
              <Button variant="attention" onClick={onAdapt} loading={adapting} loadingLabel="Updating…">
                Update this plan
              </Button>
            )}
            {onRegenerate && (
              <Button variant="secondary" onClick={onRegenerate}>
                Start over
              </Button>
            )}
          </div>
        </Card>
      )}

      <Card>
        <CardHeader
          label="Learning path"
          right={
            <MicroLabel size={10.5} tracking="0.13em" color="var(--color-text-4)">
              {`${completed} / ${skills.length} DONE`}
            </MicroLabel>
          }
        />

        {skills.map((step, i) => {
          const isDone = step.status === 'completed';
          const isCurrent = i === currentIndex;
          const busy = updatingSkill === step.skill;
          const hasDetail = Boolean(step.resources?.length || step.mini_project || step.quiz_topic_id);
          const isOpen = hasDetail && expanded === step.skill;
          const statusKey = isDone ? 'done' : isCurrent ? 'current' : 'future';

          return (
            <div
              key={step.skill || i}
              style={{
                borderLeft: `3px solid ${STATUS_BORDER[statusKey]}`,
                borderBottom: i === skills.length - 1 ? 'none' : '1px solid var(--color-line-soft)',
              }}
            >
              <div
                onClick={() => hasDetail && setExpanded(isOpen ? '' : step.skill)}
                style={{
                  padding: '14px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  background: isCurrent ? 'var(--color-surface-current)' : 'transparent',
                  cursor: hasDetail ? 'pointer' : 'default',
                  transition: 'background-color 120ms ease',
                }}
              >
                <span
                  onClick={(e) => { e.stopPropagation(); if (!busy && !isDone) onMarkCompleted?.(step.skill); }}
                  title={isDone ? 'Completed' : 'Mark complete'}
                  style={{ cursor: isDone ? 'default' : busy ? 'wait' : 'pointer', display: 'flex' }}
                >
                  <StatusBox status={statusKey} />
                </span>

                <span
                  style={{
                    flex: 1,
                    fontSize: 15,
                    fontWeight: isCurrent ? 600 : 400,
                    color: isDone ? 'var(--color-text-2)' : 'var(--color-ink)',
                  }}
                >
                  {step.skill}
                </span>

                <MicroLabel
                  size={11}
                  tracking="0.1em"
                  color={isDone ? 'var(--color-text-4)' : isCurrent ? 'var(--color-amber)' : 'var(--color-text-3)'}
                >
                  {busy ? 'Saving' : isDone ? 'Done' : isCurrent ? 'In progress' : 'Planned'}
                </MicroLabel>

                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11.5,
                    color: 'var(--color-text-4)',
                    width: 34,
                    textAlign: 'right',
                  }}
                >
                  {step.start_week ? `W${step.start_week}` : '—'}
                </span>

                {hasDetail && (
                  <MicroLabel
                    size={10}
                    tracking="0.1em"
                    color={isOpen ? 'var(--color-ink)' : 'var(--color-text-4)'}
                    style={{ width: 44, textAlign: 'right', flexShrink: 0 }}
                  >
                    {isOpen ? 'Hide' : 'Info'}
                  </MicroLabel>
                )}
              </div>

              {isOpen && (
                <div style={{ padding: '2px 20px 18px 47px', background: 'var(--color-surface-current)' }}>
                  {step.mini_project && (
                    <div style={{ marginBottom: step.resources?.length ? 16 : 0 }}>
                      <MicroLabel size={10} tracking="0.12em" color="var(--color-text-4)" style={{ display: 'block', marginBottom: 6 }}>
                        Mini project
                      </MicroLabel>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-ink)' }}>
                        {step.mini_project.title}
                      </div>
                      {step.mini_project.description && (
                        <p style={{ fontSize: 13.5, color: 'var(--color-text-3)', margin: '4px 0 0', lineHeight: 1.5 }}>
                          {step.mini_project.description}
                        </p>
                      )}
                    </div>
                  )}

                  {step.resources?.length > 0 && (
                    <div>
                      <MicroLabel size={10} tracking="0.12em" color="var(--color-text-4)" style={{ display: 'block', marginBottom: 8 }}>
                        Resources
                      </MicroLabel>
                      <ResourceList resources={step.resources} />
                    </div>
                  )}

                  {/* Marking done is self-reported; this offers to check it
                      instead. The quiz covers the topic the skill sits in,
                      which is broader than the skill itself — so it is
                      offered as a check, not as proof of completion. */}
                  {step.quiz_topic_id && onTestSkill && (
                    <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--color-line-soft)' }}>
                      <MicroLabel size={10} tracking="0.13em" color="var(--color-text-4)" style={{ display: 'block', marginBottom: 8 }}>
                        Check yourself
                      </MicroLabel>
                      <p style={{ fontSize: 13.5, color: 'var(--color-text-3)', lineHeight: 1.5, margin: '0 0 12px' }}>
                        {`Sit the ${step.quiz_topic_name} assessment. The score feeds back into this plan.`}
                      </p>
                      <Button
                        variant="secondary"
                        style={{ padding: '9px 16px', fontSize: 13.5 }}
                        onClick={(e) => { e.stopPropagation(); onTestSkill(step); }}
                      >
                        Test me on this
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        <CardFooterNote>Click the marker to mark a skill complete, click the row for its resources.</CardFooterNote>
      </Card>

      <WeeklyPlan weeks={roadmapData?.weeklyPlans} skills={skills} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
        <Card>
          <CardHeader label="Current focus" />
          <div style={{ padding: '20px 22px' }}>
            {currentSkill && (currentSkill.category || currentSkill.difficulty) && (
              <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                {currentSkill.category && <Badge tone="muted">{currentSkill.category}</Badge>}
                {currentSkill.difficulty && <Badge tone="amber">{currentSkill.difficulty}</Badge>}
              </div>
            )}

            <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-ink)' }}>
              {currentSkill ? currentSkill.skill : 'Everything is complete'}
            </div>
            <p style={{ fontSize: 14.5, color: 'var(--color-text-2)', margin: '8px 0 18px', lineHeight: 1.55 }}>
              {currentSkill
                ? currentSkill.mini_project?.title || `Part of ${currentSkill.category || 'your track'}.`
                : 'Every skill on this roadmap is marked done.'}
            </p>

            <div style={{ borderTop: '1px solid var(--color-line-soft)' }}>
              {[
                { label: 'Progress', value: `${pct}%`, amber: false },
                { label: 'Weeks planned', value: roadmapData?.duration || '—', amber: false },
                { label: 'Remaining', value: skills.length - completed, amber: skills.length - completed > 0 },
              ].map((row) => (
                <div
                  key={row.label}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '11px 0',
                    borderBottom: '1px solid var(--color-line-soft)',
                    fontSize: 14,
                    color: 'var(--color-text-2)',
                  }}
                >
                  <span>{row.label}</span>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 13,
                      color: row.amber ? 'var(--color-amber)' : 'var(--color-ink)',
                    }}
                  >
                    {row.value}
                  </span>
                </div>
              ))}
            </div>

            {currentSkill && (
              <Button
                fullWidth
                style={{ marginTop: 20 }}
                onClick={() => onMarkCompleted?.(currentSkill.skill)}
                loading={updatingSkill === currentSkill.skill}
                loadingLabel="Saving…"
              >
                Mark done
              </Button>
            )}

            {currentSkill?.resources?.length > 0 && (
              <div style={{ marginTop: 20, paddingTop: 18, borderTop: '1px solid var(--color-line-soft)' }}>
                <MicroLabel size={10} tracking="0.12em" color="var(--color-text-4)" style={{ display: 'block', marginBottom: 10 }}>
                  Resources
                </MicroLabel>
                <ResourceList resources={currentSkill.resources} />
              </div>
            )}
          </div>
        </Card>

        <InterviewReadiness latest={latestInterview} role={targetRole} loading={loadingInterview} />

        <Card>
          <CardHeader label="Gap report" />
          <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {gapReport.map((g) => (
              <LabelledBar
                key={g.label}
                label={g.label}
                value={g.value}
                display={`${g.value}%`}
                max={100}
                tone={g.value >= 70 ? 'green' : g.value >= 35 ? 'amber' : 'clay'}
              />
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default RoadmapTimeline;
