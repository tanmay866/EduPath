import { useEffect, useRef } from 'react';
import { Card, CardHeader, Button, Modal, MicroLabel, StatusBox, type } from '../../../../design';

/**
 * Spec §7 Quiz.
 *
 * A centred 760px card: header strip with QUESTION n OF m and the difficulty,
 * a 4px navy bar directly beneath, the question in Newsreader 28px, options as
 * full-width bordered buttons with a mono letter, and a footer holding a quiet
 * leave action beside the primary.
 *
 * The spec's quiz screen has no navigator or timer, but both are real features
 * here. The timer joins the header strip, which §5 allows a second label in,
 * and the navigator sits beneath the card as a row of status boxes — the same
 * primitive the roadmap uses — rather than the old right-hand panel.
 */
const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

/** Off-screen but read aloud — for state changes with no visible home. */
const SR_ONLY = {
  position: 'absolute',
  width: 1,
  height: 1,
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  whiteSpace: 'nowrap',
};

const QuizLayout = ({
  resumed = false,
  assessment,
  currentQuestionIndex,
  currentQuestion,
  questions,
  isMarked,
  selectedAnswer,
  timer,
  setTimer,
  answers,
  markedForReview,
  allAnswered,
  showSubmitModal,
  onSelectOption,
  onMarkForReview,
  onPrevious,
  onNext,
  onQuestionSelect,
  onTimeUp,
  onSubmitClick,
  onConfirmSubmit,
  onCancelSubmit,
}) => {
  // The countdown lived inside the old timer component; it moves here with the
  // rest of the chrome so the display and the tick stay in one place.
  useEffect(() => {
    if (timer <= 0) return undefined;
    const id = setTimeout(() => setTimer(timer - 1), 1000);
    return () => clearTimeout(id);
  }, [timer, setTimer]);

  useEffect(() => {
    if (timer === 0) onTimeUp?.();
  }, [timer, onTimeUp]);

  const total = questions?.length || 0;
  const isLast = currentQuestionIndex === total - 1;
  const minutes = Math.floor(timer / 60);
  const seconds = timer % 60;
  const clock = timer > 0 ? `${minutes}:${String(seconds).padStart(2, '0')}` : '--:--';
  const progress = total ? ((currentQuestionIndex + 1) / total) * 100 : 0;

  const answeredCount = Array.isArray(answers) ? answers.filter(Boolean).length : 0;

  /**
   * Arrow-key movement within the option group.
   *
   * A radio group is expected to move and select with the arrow keys, wrapping
   * at both ends; Tab is expected to leave the group entirely. Space also
   * selects, because a keyboard user who has arrowed onto an option without
   * committing to it will reach for it.
   */
  const optionRefs = useRef([]);

  const onOptionKeyDown = (event, index) => {
    const count = currentQuestion?.options?.length || 0;
    if (count === 0) return;

    const move = (next) => {
      event.preventDefault();
      const target = (next + count) % count;
      optionRefs.current[target]?.focus();
      onSelectOption(currentQuestionIndex, target);
    };

    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        move(index + 1);
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        move(index - 1);
        break;
      case 'Home':
        move(0);
        break;
      case 'End':
        move(count - 1);
        break;
      case ' ':
        event.preventDefault();
        onSelectOption(currentQuestionIndex, index);
        break;
      default:
        break;
    }
  };

  return (
    <div style={{ background: 'var(--color-paper)', minHeight: '100vh', padding: '48px 32px' }}>
      <div style={{ maxWidth: 1160, margin: '0 auto' }}>
        <div className="stack-sm" style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 22, alignItems: 'start' }}>
          <Card>
            <CardHeader
              label={`Question ${currentQuestionIndex + 1} of ${total}`}
              right={
                <span style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <MicroLabel size={11} tracking="0.1em" color="var(--color-text-3)">{clock}</MicroLabel>
                  <MicroLabel size={11} tracking="0.1em" color="var(--color-clay)">
                    {assessment?.difficulty || 'Beginner'}
                  </MicroLabel>
                </span>
              }
            />

            {/* 4px navy bar directly beneath the header strip. */}
            <div style={{ height: 4, background: 'var(--color-bar-empty)' }}>
              <div style={{ height: 4, width: `${progress}%`, background: 'var(--color-navy)' }} />
            </div>

            <div style={{ padding: '32px 34px 34px' }}>
              {/*
                Moving between questions changes the whole card with no
                announcement, so a screen reader user had no way of knowing
                the Next button had done anything. The clock is deliberately
                not in here — a region that spoke every second would make the
                quiz unusable.
              */}
              <p aria-live="polite" style={SR_ONLY}>
                Question {currentQuestionIndex + 1} of {total}.
                {' '}{answeredCount} answered.
                {isMarked ? ' Marked for review.' : ''}
              </p>

              {resumed && (
                <p
                  style={{
                    margin: '0 0 20px',
                    padding: '11px 14px',
                    border: '1px solid var(--color-navy)',
                    fontSize: 14,
                    color: 'var(--color-navy)',
                  }}
                >
                  Picked up where you left off — your earlier answers are still here.
                </p>
              )}

              <h1 id="quiz-question" style={{ ...type.question, margin: 0, color: 'var(--color-ink)' }}>
                {currentQuestion?.question}
              </h1>

              {/*
                A radio group, not four buttons.
                These were plain buttons: reachable by Tab and clickable by
                Enter, so keyboard use technically worked, but a screen reader
                announced four unrelated buttons with no indication that they
                were a set, which of them was chosen, or how many there were.
                As a radiogroup it reads "option 2 of 4, selected", the
                question is its label, and the arrow keys move between options
                the way they do in every other radio group — which is what a
                keyboard user will try first.
              */}
              <div
                role="radiogroup"
                aria-labelledby="quiz-question"
                style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 26 }}
              >
                {(currentQuestion?.options || []).map((option, index) => {
                  const value = option?.text ?? option;
                  // selectedAnswer is the stored { questionIndex, selectedOptionIndex }
                  // for the current question (or undefined) — not the option itself.
                  const selected = selectedAnswer?.selectedOptionIndex === index;

                  return (
                    <button
                      key={value ?? index}
                      ref={(el) => { optionRefs.current[index] = el; }}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      // Roving tabindex: one stop for the whole group, so Tab
                      // moves past the question rather than through every
                      // option. Nothing chosen yet puts the stop on the first.
                      tabIndex={selected || (!selectedAnswer && index === 0) ? 0 : -1}
                      onKeyDown={(e) => onOptionKeyDown(e, index)}
                      onClick={() => onSelectOption(currentQuestionIndex, index)}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '15px 18px',
                        border: `1px solid ${selected ? 'var(--color-ink)' : 'var(--color-line-opt)'}`,
                        background: selected ? 'var(--color-surface-active)' : 'var(--color-surface)',
                        fontSize: 15.5,
                        fontFamily: 'var(--font-sans)',
                        color: 'var(--color-ink)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'baseline',
                        transition: 'background-color 120ms ease, border-color 120ms ease',
                      }}
                    >
                      <span
                        aria-hidden="true"
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: 12,
                          marginRight: 16,
                          color: selected ? 'var(--color-clay)' : 'var(--color-text-4)',
                        }}
                      >
                        {LETTERS[index]}
                      </span>
                      <span>{value}</span>
                    </button>
                  );
                })}
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 16,
                  marginTop: 28,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
                  <Button variant="quiet" onClick={onPrevious} disabled={currentQuestionIndex === 0}>
                    Previous
                  </Button>
                  <Button variant="quiet" onClick={onMarkForReview}>
                    {isMarked ? 'Unmark' : 'Mark for review'}
                  </Button>
                </div>

                {isLast ? (
                  <Button onClick={onSubmitClick} disabled={!selectedAnswer && !allAnswered}>Submit</Button>
                ) : (
                  <Button onClick={onNext} disabled={!selectedAnswer}>Next question</Button>
                )}
              </div>
            </div>
          </Card>

          {/* Sits beside the question rather than under it, so the answered
              count and Submit are visible without scrolling past the card. */}
          <Card style={{ position: 'sticky', top: 22 }}>
            <CardHeader label={`${answeredCount} of ${total}`} right={<MicroLabel size={10.5} tracking="0.13em" color="var(--color-text-4)">Answered</MicroLabel>} />
            <div style={{ padding: '18px 20px', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {questions.map((q, i) => {
                // answers is keyed by questionIndex, not array position — it
                // fills in the order questions were first answered, which
                // isn't necessarily question order once Previous or the grid
                // below is used to jump around.
                const answered = answers?.some((a) => a.questionIndex === i);
                const marked = markedForReview?.includes?.(i);
                const current = i === currentQuestionIndex;

                return (
                  <button
                    key={q?._id ?? i}
                    type="button"
                    onClick={() => onQuestionSelect(i)}
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
                    }}
                  >
                    {String(i + 1).padStart(2, '0')}
                    {(answered || marked) && (
                      <StatusBox status={marked ? 'current' : 'done'} size={5} />
                    )}
                  </button>
                );
              })}
            </div>
            <div style={{ padding: '18px 20px', borderTop: '1px solid var(--color-line)' }}>
              <Button fullWidth onClick={onSubmitClick}>Submit now</Button>
            </div>
          </Card>
        </div>
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
    </div>
  );
};

export default QuizLayout;
