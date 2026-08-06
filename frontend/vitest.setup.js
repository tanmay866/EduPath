import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach, vi } from 'vitest';

/**
 * jsdom implements neither of the speech APIs, and several components reach
 * for them on mount. Without stubs those tests fail on the environment rather
 * than on the behaviour being checked.
 *
 * The stubs are deliberately thin: enough shape to construct and drive, no
 * pretend behaviour. A test that wants a result event dispatches it itself, so
 * what is asserted is the component's handling and not a fake's guesses.
 */
class MockSpeechRecognition {
  static instances = [];

  constructor() {
    this.continuous = false;
    this.interimResults = false;
    this.lang = '';
    this.started = 0;
    this.stopped = 0;
    this.aborted = 0;
    this.running = false;
    MockSpeechRecognition.instances.push(this);
  }

  start() {
    // The real one throws when a session is already running, and code that
    // does not expect that is exactly the bug this guards.
    if (this.running) {
      const err = new Error('recognition already started');
      err.name = 'InvalidStateError';
      throw err;
    }
    this.running = true;
    this.started += 1;
  }

  stop() {
    this.stopped += 1;
    this.running = false;
    this.onend?.();
  }

  abort() {
    this.aborted += 1;
    this.running = false;
  }

  /** Test helper: deliver a transcript the way the browser would. */
  emit(chunks) {
    const results = chunks.map(([transcript, isFinal]) => {
      const alt = [{ transcript }];
      alt.isFinal = isFinal;
      return alt;
    });
    results.forEach((r, i) => { r.isFinal = chunks[i][1]; });
    this.onresult?.({ resultIndex: 0, results });
  }

  /** Test helper: the browser giving up on its own. */
  fail(error) {
    this.onerror?.({ error });
  }
}

const speechSynthesisStub = {
  speak: vi.fn(),
  cancel: vi.fn(),
  pause: vi.fn(),
  resume: vi.fn(),
  getVoices: () => [],
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  speaking: false,
};

beforeEach(() => {
  MockSpeechRecognition.instances = [];
  vi.stubGlobal('SpeechRecognition', MockSpeechRecognition);
  vi.stubGlobal('webkitSpeechRecognition', MockSpeechRecognition);
  vi.stubGlobal('speechSynthesis', speechSynthesisStub);
  vi.stubGlobal('SpeechSynthesisUtterance', class { constructor(text) { this.text = text; } });
  window.speechSynthesis = speechSynthesisStub;
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
  localStorage.clear();
  sessionStorage.clear();
});

export { MockSpeechRecognition };
