import { describe, test, expect, beforeEach, vi } from 'vitest';

import { scoreVoice, getVoiceOptions, getBestVoice, setPreferredVoice } from './voiceService';

/**
 * The bug this guards: the old selector matched voice names against a
 * Windows-first list, so on macOS every entry missed and it fell through to
 * `voices[0]` — an alphabetical list whose front end is Albert, Bad News,
 * Bahh, Bells, Boing, Bubbles. Thirty-five of the forty-four English voices on
 * a stock Mac are novelty voices, so the fallback was likely to pick a joke.
 */
const voice = (name, over = {}) => ({
  name,
  lang: 'en-US',
  voiceURI: name,
  localService: true,
  ...over,
});

/** A stock macOS list, in the order the browser reports it. */
const MAC_VOICES = [
  voice('Albert'),
  voice('Bad News'),
  voice('Bahh'),
  voice('Bells'),
  voice('Boing'),
  voice('Bubbles'),
  voice('Daniel', { lang: 'en-GB' }),
  voice('Samantha'),
  voice('Zarvox'),
  voice('Google US English', { localService: false }),
  voice('Google UK English Female', { lang: 'en-GB', localService: false }),
];

const useVoices = (list) => {
  window.speechSynthesis.getVoices = () => list;
};

describe('scoring', () => {
  test('novelty voices are rejected outright', () => {
    for (const name of ['Albert', 'Bad News', 'Bubbles', 'Zarvox', 'Jester', 'Boing']) {
      expect(scoreVoice(voice(name)), name).toBeLessThan(0);
    }
  });

  test('a Windows neural voice outranks a plain local one', () => {
    expect(scoreVoice(voice('Microsoft Aria Online (Natural) - English (United States)')))
      .toBeGreaterThan(scoreVoice(voice('Samantha')));
  });

  test('a downloaded macOS premium voice outranks the compact default', () => {
    expect(scoreVoice(voice('Ava (Premium)'))).toBeGreaterThan(scoreVoice(voice('Samantha')));
    expect(scoreVoice(voice('Ava (Enhanced)'))).toBeGreaterThan(scoreVoice(voice('Samantha')));
  });

  test('a network voice outranks the same voice on device', () => {
    expect(scoreVoice(voice('Some Voice', { localService: false })))
      .toBeGreaterThan(scoreVoice(voice('Some Voice', { localService: true })));
  });

  test('non-English voices are rejected — the questions are in English', () => {
    expect(scoreVoice(voice('Lekha', { lang: 'hi-IN' }))).toBeLessThan(0);
    expect(scoreVoice(voice('Rishi', { lang: 'en-IN' }))).toBeGreaterThanOrEqual(0);
  });

  test('a missing or malformed voice does not throw', () => {
    expect(scoreVoice(null)).toBeLessThan(0);
    expect(scoreVoice({})).toBeLessThan(0);
  });
});

describe('selection', () => {
  beforeEach(() => useVoices(MAC_VOICES));

  test('never returns a novelty voice, even though one is first in the list', () => {
    const picked = getBestVoice();
    expect(picked).toBeTruthy();
    expect(['Albert', 'Bad News', 'Bahh', 'Bells', 'Boing', 'Bubbles', 'Zarvox'])
      .not.toContain(picked.name);
  });

  test('options are ranked best first and exclude the unusable', () => {
    const options = getVoiceOptions();
    expect(options[0].name).toBe('Google UK English Female');
    expect(options.map((o) => o.name)).not.toContain('Albert');
    // Descending, so the picker's first entry is the one that would be chosen.
    const scores = options.map((o) => o.score);
    expect([...scores].sort((a, b) => b - a)).toEqual(scores);
  });

  test('an explicit choice beats the score', () => {
    setPreferredVoice('Samantha');
    expect(getBestVoice().name).toBe('Samantha');
  });

  test('a stored choice that is no longer installed falls back rather than failing', () => {
    setPreferredVoice('Voice From Another Machine');
    const picked = getBestVoice();
    expect(picked).toBeTruthy();
    expect(picked.name).toBe('Google UK English Female');
  });

  test('an empty voice list returns nothing instead of throwing', () => {
    useVoices([]);
    expect(getBestVoice()).toBeNull();
    expect(getVoiceOptions()).toEqual([]);
  });

  test('selection is re-evaluated, not cached from the first call', () => {
    // Chrome returns an empty list on the first call and fills it in
    // asynchronously. The old code cached whatever it found first and kept it
    // for the whole session, so a choice made before the good voices arrived
    // was never revisited.
    useVoices([]);
    expect(getBestVoice()).toBeNull();

    useVoices(MAC_VOICES);
    expect(getBestVoice()?.name).toBe('Google UK English Female');
  });

  test('a private-mode localStorage failure does not break selection', () => {
    const spy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('denied');
    });
    expect(() => getBestVoice()).not.toThrow();
    expect(getBestVoice()?.name).toBe('Google UK English Female');
    spy.mockRestore();
  });
});
