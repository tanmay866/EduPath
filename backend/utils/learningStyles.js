/**
 * How a learner prefers to work, which decides how the weekly plan is phrased.
 *
 * These strings are the keys the AI service looks its task templates up by
 * (ai_service/utils/time_allocator.py). It falls back to "mixed" for anything
 * it does not recognise, so a value that drifts from this list does not error —
 * the setting just silently stops having an effect.
 */
export const LEARNING_STYLES = ['mixed', 'video', 'reading', 'project'];

export const isLearningStyle = (value) => LEARNING_STYLES.includes(String(value || '').trim());

export default LEARNING_STYLES;
