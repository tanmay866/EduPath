import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

import { QuizProvider } from './QuizContext';
import { useQuiz } from './useQuiz';

/**
 * The provider and the hook live in separate files so that neither loses fast
 * refresh. That split is only safe while both reach for the same context
 * object — two `createContext()` calls would leave the hook reading an empty
 * context forever, and the quiz would silently lose every answer rather than
 * fail loudly.
 */
const Probe = () => {
  const quiz = useQuiz();
  if (!quiz) return <p>no context</p>;
  return (
    <button onClick={() => quiz.setTimer(90)}>
      {`timer:${quiz.timer}`}
    </button>
  );
};

describe('the quiz context', () => {
  it('reaches a consumer inside the provider', () => {
    render(<QuizProvider><Probe /></QuizProvider>);
    expect(screen.getByRole('button')).toHaveTextContent('timer:0');
  });

  it('hands back state the consumer can actually set', async () => {
    render(<QuizProvider><Probe /></QuizProvider>);
    screen.getByRole('button').click();
    expect(await screen.findByText('timer:90')).toBeInTheDocument();
  });

  it('is undefined outside the provider rather than a stale empty object', () => {
    render(<Probe />);
    expect(screen.getByText('no context')).toBeInTheDocument();
  });
});
