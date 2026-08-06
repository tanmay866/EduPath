/**
 * Text to speech for the mock interview, on the browser's own speech engine.
 *
 * This file used to say it provided "high-quality Microsoft neural voices". It
 * cannot: `speechSynthesis.getVoices()` returns what is installed on the
 * listener's machine and nothing else. The old priority list named five
 * Microsoft voices first, all of which exist only on Windows 11, so on macOS,
 * iOS and Android every one of them missed and selection fell through to
 * whatever happened to be there — including the novelty voices macOS ships
 * (Albert, Zarvox, Bubbles), since the last resort was `voices[0]` and that
 * list is alphabetical.
 *
 * Voices are scored instead of matched by name. The signals that actually
 * predict quality are the same on every platform:
 *
 *   "Natural"            Windows 11 neural voices
 *   "(Premium)"          macOS/iOS downloaded high-quality voices
 *   "(Enhanced)"         macOS/iOS mid-tier, still far better than compact
 *   "Google …"           Chrome's network voices, better than legacy locals
 *   localService: false  network-backed, generally better than on-device
 *
 * A learner can override the choice in Settings; that wins over any score.
 */

const STORAGE_KEY = 'preferredVoiceURI';

/** Names that are jokes rather than voices. macOS ships all of these. */
const NOVELTY = /\b(Albert|Bad News|Bahh|Bells|Boing|Bubbles|Cellos|Deranged|Good News|Hysterical|Jester|Junior|Organ|Ralph|Superstar|Trinoids|Whisper|Wobble|Zarvox|Grandma|Grandpa|Rocko|Shelley|Sandy|Flo|Eddy|Reed|Kathy|Fred)\b/i;

/** Known-good names, as a tiebreak once the structural signals are equal. */
const GOOD_NAMES = [
  'Google UK English Female',
  'Google US English',
  'Google UK English Male',
  'Microsoft Aria',
  'Microsoft Jenny',
  'Microsoft Guy',
  'Ava',
  'Samantha',
  'Serena',
  'Daniel',
  'Karen',
  'Moira',
];

/**
 * Higher is better. Anything not English scores below zero and is skipped —
 * the interview is in English, and a Hindi voice reading an English question
 * is worse than a plain one.
 */
export const scoreVoice = (voice) => {
  if (!voice || !/^en/i.test(voice.lang || '')) return -1;

  const name = voice.name || '';
  let score = 1;

  if (NOVELTY.test(name)) return -1;

  if (/natural/i.test(name)) score += 100;
  if (/\(premium\)/i.test(name)) score += 90;
  if (/\(enhanced\)/i.test(name)) score += 60;
  if (/^google\b/i.test(name)) score += 70;
  if (voice.localService === false) score += 30;

  const known = GOOD_NAMES.findIndex((n) => name.includes(n));
  if (known !== -1) score += 40 - known;

  // en-US and en-GB are what the questions are written in.
  if (/^en[-_](US|GB)$/i.test(voice.lang)) score += 10;

  return score;
};

/** Every usable English voice, best first. */
export const getVoiceOptions = () => {
  const voices = window.speechSynthesis?.getVoices?.() || [];
  return voices
    .map((voice) => ({ voice, score: scoreVoice(voice) }))
    .filter((entry) => entry.score >= 0)
    .sort((a, b) => b.score - a.score)
    .map(({ voice, score }) => ({
      uri: voice.voiceURI,
      name: voice.name,
      lang: voice.lang,
      score,
    }));
};

/** The learner's explicit choice, if the voice is still installed. */
const storedVoice = () => {
  let uri = null;
  try { uri = localStorage.getItem(STORAGE_KEY); } catch { /* private mode */ }
  if (!uri) return null;
  const voices = window.speechSynthesis?.getVoices?.() || [];
  return voices.find((v) => v.voiceURI === uri) || null;
};

/**
 * The voice to speak with.
 *
 * Deliberately not cached. The old version stored its choice in a module
 * variable on first use and never looked again — and on Chrome `getVoices()`
 * is empty on first call and fills in asynchronously, so a selection made
 * before the list arrived was kept for the rest of the session even once the
 * good voices had loaded. Scoring a short list costs nothing.
 */
export const getBestVoice = () => {
  const chosen = storedVoice();
  if (chosen) return chosen;

  const voices = window.speechSynthesis?.getVoices?.() || [];
  let best = null;
  let bestScore = 0;
  for (const voice of voices) {
    const score = scoreVoice(voice);
    if (score > bestScore) { best = voice; bestScore = score; }
  }
  return best;
};

export const setPreferredVoice = (uri) => {
  try {
    if (uri) localStorage.setItem(STORAGE_KEY, uri);
    else localStorage.removeItem(STORAGE_KEY);
  } catch { /* private mode — the session still works, it just will not persist */ }
};

export const getPreferredVoiceURI = () => {
  try { return localStorage.getItem(STORAGE_KEY); } catch { return null; }
};

/** Resolves once the browser has published its voice list. */
export const voicesReady = () => new Promise((resolve) => {
  const synth = window.speechSynthesis;
  if (!synth) { resolve([]); return; }
  if (synth.getVoices().length) { resolve(synth.getVoices()); return; }

  let settled = false;
  const done = () => {
    if (settled) return;
    settled = true;
    resolve(synth.getVoices());
  };
  synth.addEventListener('voiceschanged', done, { once: true });
  // Some browsers never fire the event when the list was already warm.
  setTimeout(done, 1200);
});

/**
 * Speak text.
 *
 * @param {string} text
 * @param {object} options rate / pitch / volume / lang and lifecycle callbacks
 * @returns {Promise<void>} resolves when speech ends
 */
export function speakText(text, options = {}) {
  return new Promise((resolve, reject) => {
    const synth = window.speechSynthesis;
    if (!synth) {
      reject(new Error('This browser has no speech synthesis'));
      return;
    }

    synth.cancel();

    const speak = () => {
      const utterance = new SpeechSynthesisUtterance(text);
      const voice = getBestVoice();
      if (voice) {
        utterance.voice = voice;
        // Matching the voice's own locale avoids the engine substituting a
        // different one mid-sentence.
        utterance.lang = voice.lang;
      } else {
        utterance.lang = options.lang || 'en-US';
      }

      // 0.85 was slow enough to sound laboured, which reads as more robotic
      // rather than clearer. Just under natural pace keeps it intelligible.
      utterance.rate = options.rate ?? 0.95;
      utterance.pitch = options.pitch ?? 1;
      utterance.volume = options.volume ?? 1;

      utterance.onstart = () => options.onStart?.();
      utterance.onend = () => { options.onEnd?.(); resolve(); };
      utterance.onerror = (event) => {
        // Cancelling on purpose fires an error; it is not one.
        if (event.error === 'canceled' || event.error === 'interrupted') {
          resolve();
          return;
        }
        console.error('Speech error:', event.error);
        options.onError?.(event);
        reject(event);
      };

      synth.speak(utterance);
    };

    if (synth.getVoices().length === 0) voicesReady().then(speak);
    else speak();
  });
}

export function stopSpeaking() {
  window.speechSynthesis?.cancel();
}

export function isSpeaking() {
  return window.speechSynthesis?.speaking || false;
}

export function pauseSpeaking() {
  window.speechSynthesis?.pause();
}

export function resumeSpeaking() {
  window.speechSynthesis?.resume();
}

export function getAvailableVoices() {
  return window.speechSynthesis?.getVoices?.() || [];
}

export function getCurrentVoice() {
  return getBestVoice();
}

/** Reads an interview question. */
export function speakInterviewQuestion(question, onStart, onEnd) {
  return speakText(question, { rate: 0.95, onStart, onEnd });
}

/** Reads feedback, a touch quicker — it is longer and less consequential. */
export function speakFeedback(feedback, onStart, onEnd) {
  return speakText(feedback, { rate: 1, onStart, onEnd });
}

// Warm the voice list so the first question does not wait for it.
if (typeof window !== 'undefined' && window.speechSynthesis) voicesReady();

export default {
  speakText,
  stopSpeaking,
  isSpeaking,
  pauseSpeaking,
  resumeSpeaking,
  getAvailableVoices,
  getCurrentVoice,
  getVoiceOptions,
  getBestVoice,
  setPreferredVoice,
  getPreferredVoiceURI,
  voicesReady,
  speakInterviewQuestion,
  speakFeedback,
};
