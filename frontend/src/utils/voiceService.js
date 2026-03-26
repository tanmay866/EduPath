/**
 * Voice Service Utility
 * Provides high-quality text-to-speech using Microsoft neural voices
 */

// Store the selected voice for reuse
let cachedVoice = null;
let voicesLoaded = false;

/**
 * Microsoft neural voice priority list
 */
const PREFERRED_VOICES = [
  'Microsoft Jenny',
  'Microsoft Aria',
  'Microsoft Guy',
  'Microsoft Zira',
  'Microsoft David',
  'Google US English',
  'Samantha', // macOS
  'Alex', // macOS
];

/**
 * Get the best available voice
 * Prioritizes Microsoft neural voices for natural speech
 */
function getBestVoice() {
  const synth = window.speechSynthesis;
  const voices = synth.getVoices();

  if (voices.length === 0) return null;

  // Try to find preferred voices in order
  for (const preferredName of PREFERRED_VOICES) {
    const voice = voices.find(v =>
      v.name.includes(preferredName) && v.lang.startsWith('en')
    );
    if (voice) {
      console.log(`🎤 Selected voice: ${voice.name}`);
      return voice;
    }
  }

  // Fallback: Find any English US voice
  const englishUSVoice = voices.find(v => v.lang === 'en-US');
  if (englishUSVoice) {
    console.log(`🎤 Fallback voice: ${englishUSVoice.name}`);
    return englishUSVoice;
  }

  // Fallback: Find any English voice
  const englishVoice = voices.find(v => v.lang.startsWith('en'));
  if (englishVoice) {
    console.log(`🎤 Fallback voice: ${englishVoice.name}`);
    return englishVoice;
  }

  // Last resort: Use first available voice
  console.log(`🎤 Using default voice: ${voices[0]?.name}`);
  return voices[0] || null;
}

/**
 * Initialize voices and cache the best one
 */
function initializeVoices() {
  return new Promise((resolve) => {
    const synth = window.speechSynthesis;

    const loadVoices = () => {
      const voices = synth.getVoices();
      if (voices.length > 0) {
        cachedVoice = getBestVoice();
        voicesLoaded = true;
        resolve(cachedVoice);
      }
    };

    // Try to load voices immediately
    loadVoices();

    // If voices aren't loaded yet, wait for the event
    if (!voicesLoaded) {
      synth.onvoiceschanged = () => {
        loadVoices();
      };

      // Fallback timeout
      setTimeout(() => {
        if (!voicesLoaded) {
          loadVoices();
          resolve(cachedVoice);
        }
      }, 1000);
    }
  });
}

/**
 * Speak text using high-quality Microsoft neural voice
 * @param {string} text - Text to speak
 * @param {object} options - Optional configuration
 * @returns {Promise} - Resolves when speech ends
 */
export function speakText(text, options = {}) {
  return new Promise((resolve, reject) => {
    if (!window.speechSynthesis) {
      console.error('Speech synthesis not supported');
      reject(new Error('Speech synthesis not supported'));
      return;
    }

    const synth = window.speechSynthesis;

    // Cancel any ongoing speech
    synth.cancel();

    const speak = () => {
      // Get or use cached voice
      const voice = cachedVoice || getBestVoice();

      const utterance = new SpeechSynthesisUtterance(text);

      // Set voice if available
      if (voice) {
        utterance.voice = voice;
      }

      // Voice configuration for natural speech
      utterance.lang = options.lang || 'en-US';
      utterance.rate = options.rate || 0.9;  // Slightly slower for clarity
      utterance.pitch = options.pitch || 1;
      utterance.volume = options.volume || 1;

      // Event handlers
      utterance.onstart = () => {
        console.log('🔊 Speech started');
        if (options.onStart) options.onStart();
      };

      utterance.onend = () => {
        console.log('🔇 Speech ended');
        if (options.onEnd) options.onEnd();
        resolve();
      };

      utterance.onerror = (event) => {
        console.error('Speech error:', event.error);
        if (options.onError) options.onError(event);
        reject(event);
      };

      utterance.onpause = () => {
        if (options.onPause) options.onPause();
      };

      utterance.onresume = () => {
        if (options.onResume) options.onResume();
      };

      // Speak the text
      synth.speak(utterance);
    };

    // Ensure voices are loaded before speaking
    if (synth.getVoices().length === 0) {
      synth.onvoiceschanged = () => {
        cachedVoice = getBestVoice();
        speak();
      };

      // Fallback if voices don't load
      setTimeout(() => {
        if (synth.getVoices().length === 0) {
          speak(); // Try anyway with default voice
        }
      }, 500);
    } else {
      if (!cachedVoice) {
        cachedVoice = getBestVoice();
      }
      speak();
    }
  });
}

/**
 * Stop any ongoing speech
 */
export function stopSpeaking() {
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
    console.log('🔇 Speech cancelled');
  }
}

/**
 * Check if speech synthesis is currently speaking
 * @returns {boolean}
 */
export function isSpeaking() {
  return window.speechSynthesis?.speaking || false;
}

/**
 * Pause current speech
 */
export function pauseSpeaking() {
  if (window.speechSynthesis) {
    window.speechSynthesis.pause();
  }
}

/**
 * Resume paused speech
 */
export function resumeSpeaking() {
  if (window.speechSynthesis) {
    window.speechSynthesis.resume();
  }
}

/**
 * Get list of all available voices
 * @returns {Array} - Array of available voices
 */
export function getAvailableVoices() {
  if (!window.speechSynthesis) return [];
  return window.speechSynthesis.getVoices();
}

/**
 * Get the currently selected voice
 * @returns {SpeechSynthesisVoice|null}
 */
export function getCurrentVoice() {
  return cachedVoice;
}

/**
 * Set a specific voice by name
 * @param {string} voiceName - Name of the voice to use
 */
export function setVoice(voiceName) {
  const voices = window.speechSynthesis?.getVoices() || [];
  const voice = voices.find(v => v.name.includes(voiceName));
  if (voice) {
    cachedVoice = voice;
    console.log(`🎤 Voice set to: ${voice.name}`);
    return true;
  }
  return false;
}

/**
 * Speak text for interview questions with optimal settings
 * @param {string} question - Interview question to speak
 * @param {function} onStart - Callback when speech starts
 * @param {function} onEnd - Callback when speech ends
 */
export function speakInterviewQuestion(question, onStart, onEnd) {
  return speakText(question, {
    rate: 0.85,  // Slightly slower for interview questions
    pitch: 1,
    volume: 1,
    onStart,
    onEnd
  });
}

/**
 * Speak feedback with slightly faster rate
 * @param {string} feedback - Feedback text to speak
 * @param {function} onStart - Callback when speech starts
 * @param {function} onEnd - Callback when speech ends
 */
export function speakFeedback(feedback, onStart, onEnd) {
  return speakText(feedback, {
    rate: 0.95,  // Slightly faster for feedback
    pitch: 1,
    volume: 1,
    onStart,
    onEnd
  });
}

// Initialize voices on module load
if (typeof window !== 'undefined' && window.speechSynthesis) {
  initializeVoices();
}

export default {
  speakText,
  stopSpeaking,
  isSpeaking,
  pauseSpeaking,
  resumeSpeaking,
  getAvailableVoices,
  getCurrentVoice,
  setVoice,
  speakInterviewQuestion,
  speakFeedback
};
