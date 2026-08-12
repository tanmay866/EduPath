import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';

import ChunkErrorBoundary from './ChunkErrorBoundary';

/**
 * Routes load on demand, so a deploy can leave an open tab asking for a chunk
 * hash that no longer exists. Before this boundary that unmounted the tree and
 * left a blank page on a click that used to work.
 *
 * The reload path is what these pin down, in both directions: it has to fire
 * for a stale chunk and it must not fire for an ordinary bug, or a render
 * error becomes an unstoppable refresh loop.
 */
const Boom = ({ error }) => {
  throw error;
};

const chunkError = () =>
  new TypeError('Failed to fetch dynamically imported module: https://x/assets/Roadmap-a1b2c3.js');

let reload;
let consoleError;

beforeEach(() => {
  sessionStorage.clear();
  reload = vi.fn();
  // jsdom's location.reload is not writable, so it is replaced wholesale.
  Object.defineProperty(window, 'location', {
    configurable: true,
    value: { ...window.location, reload },
  });
  // React logs every caught error; silencing keeps the run readable.
  consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  consoleError.mockRestore();
});

describe('a stale route chunk', () => {
  test('reloads the page once', () => {
    render(
      <ChunkErrorBoundary>
        <Boom error={chunkError()} />
      </ChunkErrorBoundary>
    );

    expect(reload).toHaveBeenCalledTimes(1);
  });

  test('renders nothing while the reload is on its way', () => {
    const { container } = render(
      <ChunkErrorBoundary>
        <Boom error={chunkError()} />
      </ChunkErrorBoundary>
    );

    // A failure notice that flashes for a moment on the way out is worse
    // than no notice at all.
    expect(container).toBeEmptyDOMElement();
  });

  test('does not reload again if one has just been tried', () => {
    // What a tab looks like immediately after the boundary reloaded it.
    sessionStorage.setItem('edupath:chunk-reload-at', String(Date.now()));

    render(
      <ChunkErrorBoundary>
        <Boom error={chunkError()} />
      </ChunkErrorBoundary>
    );

    // The whole point: a chunk that fails again must not loop the tab.
    expect(reload).not.toHaveBeenCalled();
    expect(screen.getByText(/out of date/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reload/i })).toBeInTheDocument();
  });

  test('a stale mark from long ago does not block a fresh incident', () => {
    // A tab left open across two deploys deserves its own reload each time.
    sessionStorage.setItem('edupath:chunk-reload-at', String(Date.now() - 60000));

    render(
      <ChunkErrorBoundary>
        <Boom error={chunkError()} />
      </ChunkErrorBoundary>
    );

    expect(reload).toHaveBeenCalledTimes(1);
  });

  test.each([
    ['Firefox', 'error loading dynamically imported module'],
    ['Safari', 'Importing a module script failed.'],
    ['Vite preload', 'Unable to preload CSS for /assets/x.css'],
  ])('%s wording is recognised too', (_browser, message) => {
    render(
      <ChunkErrorBoundary>
        <Boom error={new TypeError(message)} />
      </ChunkErrorBoundary>
    );

    expect(reload).toHaveBeenCalledTimes(1);
  });
});

describe('an ordinary render error', () => {
  test('is never reloaded away', () => {
    render(
      <ChunkErrorBoundary>
        <Boom error={new TypeError("Cannot read properties of undefined (reading 'map')")} />
      </ChunkErrorBoundary>
    );

    // Reloading a real bug produces an infinite refresh loop rather than a fix.
    expect(reload).not.toHaveBeenCalled();
  });

  test('still reaches the console instead of being swallowed', () => {
    const bug = new TypeError('genuinely broken');

    render(
      <ChunkErrorBoundary>
        <Boom error={bug} />
      </ChunkErrorBoundary>
    );

    expect(consoleError).toHaveBeenCalledWith(
      'Unhandled render error:',
      bug,
      expect.anything()
    );
  });

  test('shows a message rather than a blank page', () => {
    render(
      <ChunkErrorBoundary>
        <Boom error={new TypeError('genuinely broken')} />
      </ChunkErrorBoundary>
    );

    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
  });
});

test('children render untouched when nothing throws', () => {
  render(
    <ChunkErrorBoundary>
      <p>the actual page</p>
    </ChunkErrorBoundary>
  );

  expect(screen.getByText('the actual page')).toBeInTheDocument();
  expect(reload).not.toHaveBeenCalled();
});
