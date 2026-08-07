import React from 'react';
import {
  Card, CardHeader, CardFooterNote, Button, Field, FieldGroup, InlineMessage,
  MicroLabel, StatusBox, OrdinalRow, Loading, Modal, type,
} from '../../../design';

/**
 * The configure → instructions → quiz → result stages shared by the aptitude
 * and CS-fundamentals tests.
 *
 * Both screens ran the same four stages with the same markup duplicated
 * between them, so a change to one silently diverged from the other. The quiz
 * stage follows §7 Quiz and the result stage follows §7 Result; configure and
 * instructions have no spec entry and are built from §5 parts.
 */
const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

export const Page = ({ children, width = 760 }) => (
  <div style={{ background: 'var(--color-paper)', minHeight: '100vh', padding: '48px 32px' }}>
    <div style={{ maxWidth: width, margin: '0 auto' }}>{children}</div>
  </div>
);

const SELECT_STYLE = {
  width: '100%',
  padding: '13px 14px',
  fontSize: 15,
  fontFamily: 'var(--font-sans)',
  color: 'var(--color-ink)',
  background: '#fff',
  border: '1px solid var(--color-line-input)',
  borderRadius: 0,
  outline: 'none',
};

/* ── Configure ──────────────────────────────────────────────────────────── */
export const ConfigureStage = ({
  label,
  title,
  intro,
  difficulties,
  difficulty,
  onDifficultyChange,
  questionCount,
  onQuestionCountChange,
  counts = [5, 10, 15, 20],
  loading,
  error,
  onStart,
  onBack,
}) => (
  <Page>
    <div style={{ marginBottom: 18 }}>
      <Button variant="quiet" onClick={onBack}>Back to the hub</Button>
    </div>

    <Card>
      <CardHeader label={label} />

      <div style={{ padding: '34px 34px 26px' }}>
        <h1 style={{ ...type.cardHeading, margin: 0, color: 'var(--color-ink)' }}>{title}</h1>
        <p style={{ ...type.body, margin: '12px 0 0', maxWidth: 560 }}>{intro}</p>
      </div>

      <div style={{ padding: '0 34px 26px' }}>
        <FieldGroup>
          <Field label="Difficulty">
            <select value={difficulty} onChange={(e) => onDifficultyChange(e.target.value)} style={SELECT_STYLE}>
              {difficulties.map((d) => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>
          </Field>

          <Field label="Questions" help="More questions means a longer test and a steadier score.">
            <select
              value={questionCount}
              onChange={(e) => onQuestionCountChange(Number(e.target.value))}
              style={SELECT_STYLE}
            >
              {counts.map((c) => (
                <option key={c} value={c}>{`${c} questions`}</option>
              ))}
            </select>
          </Field>

          {error && <InlineMessage tone="error">{error}</InlineMessage>}
        </FieldGroup>
      </div>

      <div style={{ padding: '18px 34px', borderTop: '1px solid var(--color-line)' }}>
        <Button onClick={onStart} loading={loading} loadingLabel="Loading questions…">Continue</Button>
      </div>
    </Card>
  </Page>
);

/* ── Instructions ───────────────────────────────────────────────────────── */
export const InstructionsStage = ({
  label,
  title,
  facts = [],
  rules = [],
  agreed,
  onAgreedChange,
  onBegin,
  onBack,
  loading,
}) => (
  <Page>
    <div style={{ marginBottom: 18 }}>
      <Button variant="quiet" onClick={onBack}>Change the settings</Button>
    </div>

    <Card>
      <CardHeader label={label} />

      <div style={{ padding: '34px 34px 26px' }}>
        <h1 style={{ ...type.cardHeading, margin: 0, color: 'var(--color-ink)' }}>{title}</h1>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${facts.length || 1}, 1fr)`,
          borderTop: '1px solid var(--color-line)',
          borderBottom: '1px solid var(--color-line)',
        }}
      >
        {facts.map((fact, i) => (
          <div
            key={fact.label}
            style={{ padding: '18px 22px', borderRight: i === facts.length - 1 ? 'none' : '1px solid var(--color-line)' }}
          >
            <MicroLabel size={10.5} tracking="0.13em" color="var(--color-text-3)" style={{ display: 'block', marginBottom: 8 }}>
              {fact.label}
            </MicroLabel>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 15, color: 'var(--color-ink)' }}>{fact.value}</span>
          </div>
        ))}
      </div>

      <div style={{ padding: '26px 34px 6px' }}>
        <MicroLabel size={10.5} tracking="0.13em" style={{ display: 'block', marginBottom: 18 }}>
          Rules
        </MicroLabel>

        {rules.map((rule, i) => (
          <div key={rule} style={{ marginBottom: 18 }}>
            <OrdinalRow ordinal={String(i + 1).padStart(2, '0')}>
              <span style={{ fontSize: 15, color: 'var(--color-ink)', lineHeight: 1.5 }}>{rule}</span>
            </OrdinalRow>
          </div>
        ))}
      </div>

      <label
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '17px 34px',
          borderTop: '1px solid var(--color-line)',
          cursor: 'pointer',
        }}
      >
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => onAgreedChange(e.target.checked)}
          style={{ width: 15, height: 15, accentColor: 'var(--color-ink)', borderRadius: 0 }}
        />
        <span style={{ fontSize: 14.5, color: 'var(--color-text-2)' }}>
          I have read the rules and I am ready to start.
        </span>
      </label>

      <div style={{ padding: '18px 34px', borderTop: '1px solid var(--color-line)' }}>
        <Button onClick={onBegin} disabled={!agreed} loading={loading} loadingLabel="Preparing your quiz…">
          Begin
        </Button>
      </div>
    </Card>
  </Page>
);

/* ── Quiz ───────────────────────────────────────────────────────────────── */
export const QuizStage = ({
  label,
  question,
  index,
  total,
  selected,
  onSelect,
  clock,
  answeredCount,
  onPrevious,
  onNext,
  onSubmit,
  showSubmitModal,
  onConfirmSubmit,
  onCancelSubmit,
  onQuestionSelect,
  answers = [],
}) => {
  const isLast = index === total - 1;
  const progress = total ? ((index + 1) / total) * 100 : 0;

  return (
    <Page width={1160}>
      <div className="stack-sm" style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 22, alignItems: 'start' }}>
        <Card>
          <CardHeader
            label={`Question ${index + 1} of ${total}`}
            right={
              <span style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <MicroLabel size={11} tracking="0.1em" color="var(--color-text-3)">{clock}</MicroLabel>
                <MicroLabel size={11} tracking="0.1em" color="var(--color-clay)">{label}</MicroLabel>
              </span>
            }
          />

          <div style={{ height: 4, background: 'var(--color-bar-empty)' }}>
            <div style={{ height: 4, width: `${progress}%`, background: 'var(--color-navy)' }} />
          </div>

          <div style={{ padding: '32px 34px 34px' }}>
            <h1 style={{ ...type.question, margin: 0, color: 'var(--color-ink)' }}>{question?.question}</h1>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 26 }}>
              {(question?.options || []).map((option, i) => {
                const isSelected = selected === i;
                return (
                  <button
                    key={option ?? i}
                    type="button"
                    onClick={() => onSelect(i)}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '15px 18px',
                      border: `1px solid ${isSelected ? 'var(--color-ink)' : 'var(--color-line-opt)'}`,
                      background: isSelected ? 'var(--color-surface-active)' : 'var(--color-surface)',
                      fontSize: 15.5,
                      fontFamily: 'var(--font-sans)',
                      color: 'var(--color-ink)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'baseline',
                      borderRadius: 0,
                      transition: 'background-color 120ms ease, border-color 120ms ease',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 12,
                        marginRight: 16,
                        color: isSelected ? 'var(--color-clay)' : 'var(--color-text-4)',
                      }}
                    >
                      {LETTERS[i]}
                    </span>
                    <span>{option}</span>
                  </button>
                );
              })}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginTop: 28 }}>
              <Button variant="quiet" onClick={onPrevious} disabled={index === 0}>Previous</Button>
              {isLast ? (
                <Button onClick={onSubmit}>Submit</Button>
              ) : (
                <Button onClick={onNext}>Next question</Button>
              )}
            </div>
          </div>
        </Card>

        {/* Sits beside the question rather than under it, so the answered
            count and Submit are visible without scrolling past the card. */}
        <Card style={{ position: 'sticky', top: 22 }}>
          <CardHeader label={`${answeredCount} of ${total}`} right={<MicroLabel size={10.5} tracking="0.13em" color="var(--color-text-4)">Answered</MicroLabel>} />
          <div style={{ padding: '18px 20px', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {Array.from({ length: total }).map((_, i) => {
              const answered = answers[i] !== null && answers[i] !== undefined;
              const current = i === index;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => onQuestionSelect?.(i)}
                  title={`Question ${i + 1}`}
                  style={{
                    width: 34,
                    height: 34,
                    border: `1px solid ${current ? 'var(--color-ink)' : 'var(--color-line)'}`,
                    background: current ? 'var(--color-surface-active)' : 'var(--color-surface)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 12,
                    color: 'var(--color-text-2)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 4,
                    padding: 0,
                    borderRadius: 0,
                  }}
                >
                  {String(i + 1).padStart(2, '0')}
                  {answered && <StatusBox status="done" size={5} />}
                </button>
              );
            })}
          </div>
          <div style={{ padding: '18px 20px', borderTop: '1px solid var(--color-line)' }}>
            <Button fullWidth onClick={onSubmit}>Submit now</Button>
          </div>
        </Card>
      </div>

      <Modal
        open={showSubmitModal}
        onClose={onCancelSubmit}
        title="Submit your answers?"
        actions={
          <>
            <Button variant="secondary" onClick={onCancelSubmit}>Cancel</Button>
            <Button onClick={onConfirmSubmit}>Submit</Button>
          </>
        }
      >
        You have answered {answeredCount} of {total}. Answers cannot be changed after submitting.
      </Modal>
    </Page>
  );
};

/* ── Result ─────────────────────────────────────────────────────────────── */
/**
 * `doneLabel` because this screen is reached two ways: straight off the end of
 * a test, and by opening a saved attempt from that instrument's results list.
 * Both now lead back to the results, so the label says so rather than naming
 * the hub — landing two levels up from where you came in is how a list of
 * attempts becomes hard to work through.
 */
export const ResultStage = ({
  label, result, review = [], onRetry, onDone, formatTime, doneLabel = 'Back to results',
}) => {
  const passed = result.percentage >= 70;

  return (
    <Page>
      <Card>
        <CardHeader
          label={label}
          right={
            <MicroLabel size={11} color="var(--color-text-4)">
              {formatTime ? formatTime(result.timeTaken) : `${result.timeTaken}s`}
            </MicroLabel>
          }
        />

        <div style={{ padding: 34, display: 'flex', gap: 40, alignItems: 'flex-start' }}>
          <div>
            <MicroLabel size={10.5} tracking="0.13em" color="var(--color-text-4)" style={{ display: 'block', marginBottom: 10 }}>
              Score
            </MicroLabel>
            <span
              style={{
                ...type.heroMetric,
                fontSize: 68,
                color: passed ? 'var(--color-green)' : 'var(--color-clay)',
                display: 'block',
                lineHeight: 1,
              }}
            >
              {result.percentage}
            </span>
          </div>

          <div style={{ flex: 1 }}>
            <h1 style={{ ...type.question, margin: 0, color: 'var(--color-ink)' }}>
              {passed ? (result.percentage >= 80 ? 'Strong pass' : 'Passed') : 'Below the pass mark'}
            </h1>
            <p style={{ fontSize: 15, color: 'var(--color-text-2)', lineHeight: 1.6, margin: '12px 0 0' }}>
              {`You answered ${result.correct} of ${result.total} correctly`}
              {result.wrong ? `, missed ${result.wrong}` : ''}
              {result.unanswered ? `, and left ${result.unanswered} unanswered` : ''}
              {passed ? '.' : ', against a 70% pass mark.'}
            </p>
          </div>
        </div>

        {review.length > 0 && (
          <>
            <div style={{ padding: '0 34px' }}>
              <MicroLabel
                size={10.5}
                tracking="0.13em"
                style={{ display: 'block', paddingBottom: 14, borderBottom: '1px solid var(--color-line-soft)' }}
              >
                Answer review
              </MicroLabel>
            </div>

            {review.map((item, i) => (
              <div
                key={i}
                style={{
                  padding: '16px 34px',
                  borderBottom: i === review.length - 1 ? 'none' : '1px solid var(--color-line-soft)',
                  display: 'grid',
                  gridTemplateColumns: '10px 1fr',
                  gap: 16,
                  alignItems: 'start',
                }}
              >
                <span style={{ paddingTop: 6 }}>
                  <StatusBox status={item.isCorrect ? 'correct' : 'wrong'} size={10} />
                </span>
                <div>
                  <div style={{ fontSize: 15, color: 'var(--color-ink)', lineHeight: 1.5 }}>{item.question}</div>
                  {!item.isCorrect && item.answer && (
                    <p style={{ fontSize: 13.5, color: 'var(--color-text-3)', lineHeight: 1.55, margin: '6px 0 0' }}>
                      {`Correct answer: ${item.answer}`}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </>
        )}

        <div
          style={{
            padding: '18px 34px',
            borderTop: '1px solid var(--color-line)',
            display: 'flex',
            gap: 12,
            justifyContent: 'flex-end',
          }}
        >
          <Button variant="secondary" onClick={onDone}>{doneLabel}</Button>
          <Button onClick={onRetry}>Take it again</Button>
        </div>

        <CardFooterNote>This result is saved — it is listed with your other attempts.</CardFooterNote>
      </Card>
    </Page>
  );
};

export const LoadingStage = ({ label = 'Loading' }) => (
  <Page>
    <Card><Loading label={label} /></Card>
  </Page>
);

export default { Page, ConfigureStage, InstructionsStage, QuizStage, ResultStage, LoadingStage };
