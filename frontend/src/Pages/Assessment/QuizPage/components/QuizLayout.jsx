import { useEffect } from 'react';
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

const QuizLayout = ({
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

  return (
    <div style={{ background: 'var(--color-paper)', minHeight: '100vh', padding: '48px 32px' }}>
      <div style={{ maxWidth: 1160, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 22, alignItems: 'start' }}>
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
              <h1 style={{ ...type.question, margin: 0, color: 'var(--color-ink)' }}>
                {currentQuestion?.question}
              </h1>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 26 }}>
                {(currentQuestion?.options || []).map((option, index) => {
                  const value = option?.text ?? option;
                  // selectedAnswer is the stored { questionIndex, selectedOptionIndex }
                  // for the current question (or undefined) — not the option itself.
                  const selected = selectedAnswer?.selectedOptionIndex === index;

                  return (
                    <button
                      key={value ?? index}
                      type="button"
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
