import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import ReviewQueue from './ReviewQueue';

/**
 * The queue named a topic and a two-word reason. What it could not say was how
 * well the topic is actually held — a learner who has passed it four times and
 * one who scraped a single pass looked identical — or start the retake at the
 * setup that put it on the list.
 */
const navigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => navigate };
});

const item = (overrides = {}) => ({
  topicId: 't1',
  topicName: 'React Hooks',
  latestScore: 45,
  bestScore: 45,
  daysSince: 21,
  intervalDays: 7,
  overdueBy: 14,
  reason: 'Struggled with this',
  explanation: 'Struggled with this — you scored 45% 21 days ago, which is well past the 7-day mark for a score like that.',
  attempts: 2,
  mastery: { level: 'struggling', label: '2 attempts, not passed yet' },
  ...overrides,
});

const renderQueue = (queue) =>
  render(<MemoryRouter><ReviewQueue queue={queue} /></MemoryRouter>);

describe('the review queue', () => {
  test('renders nothing when nothing is due', () => {
    // A card saying "all caught up" on every visit is a card people stop
    // seeing, and this one has to be noticed on the days it speaks.
    const { container } = renderQueue([]);
    expect(container).toBeEmptyDOMElement();
  });

  test('gives the full reason rather than the two-word label', () => {
    renderQueue([item()]);
    expect(screen.getByText(/21 days ago/)).toBeInTheDocument();
    expect(screen.getByText(/past the 7-day mark/)).toBeInTheDocument();
  });

  test('falls back to the short reason when the server sends no sentence', () => {
    // Older responses, and anything that fails to build an explanation, must
    // still produce a readable row.
    renderQueue([item({ explanation: undefined })]);
    expect(screen.getByText(/Struggled with this/)).toBeInTheDocument();
  });

  test('says how well held the topic is', () => {
    renderQueue([item()]);
    expect(screen.getByText('2 attempts, not passed yet')).toBeInTheDocument();
  });

  test('a topic passed repeatedly reads differently from one never passed', () => {
    renderQueue([
      item({ topicId: 'a', topicName: 'Held', mastery: { level: 'mastered', label: 'Passed 3 times, comfortably' } }),
      item({ topicId: 'b', topicName: 'Shaky', mastery: { level: 'struggling', label: '2 attempts, not passed yet' } }),
    ]);
    expect(screen.getByText('Passed 3 times, comfortably')).toBeInTheDocument();
    expect(screen.getByText('2 attempts, not passed yet')).toBeInTheDocument();
  });

  test('a better past score is shown beside the latest', () => {
    // Otherwise a bad day reads as having lost the skill.
    renderQueue([item({ latestScore: 55, bestScore: 90 })]);
    expect(screen.getByText('best 90%')).toBeInTheDocument();
  });

  test('the best score is not repeated when it is the latest', () => {
    renderQueue([item({ latestScore: 90, bestScore: 90 })]);
    expect(screen.queryByText(/best 90%/)).not.toBeInTheDocument();
  });

  test('retake carries the setup that put the topic on the list', async () => {
    const user = userEvent.setup();
    renderQueue([item({ difficulty: 'advanced', experienceLevel: 'intermediate' })]);

    await user.click(screen.getByRole('button', { name: /retake/i }));

    // Starting at the defaults would hand somebody who struggled with an
    // advanced quiz a beginner one, and the better score would mean nothing.
    expect(navigate).toHaveBeenCalledWith('/assessment/quiz', {
      state: { topicId: 't1', difficulty: 'advanced', experienceLevel: 'intermediate' },
    });
  });

  test('retake still works when no setup was recorded', async () => {
    const user = userEvent.setup();
    renderQueue([item({ difficulty: null, experienceLevel: null })]);

    await user.click(screen.getByRole('button', { name: /retake/i }));

    expect(navigate).toHaveBeenCalledWith('/assessment/quiz', {
      state: { topicId: 't1', difficulty: undefined, experienceLevel: undefined },
    });
  });
});
