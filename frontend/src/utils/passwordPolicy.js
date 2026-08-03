/**
 * Password rules, mirrored from the server.
 *
 * The API enforces length plus an uppercase/lowercase/digit mix in
 * backend/middlewares/validationMiddleware.js, but the forms only checked
 * length. A password like "newpassword" passed here and was then rejected by
 * the API with a bare "Validation failed", which gave no hint about what was
 * actually wrong.
 *
 * Keep this in step with the server regex if that rule ever changes.
 */

export const PASSWORD_MIN_LENGTH = 6;

const HAS_UPPER_LOWER_DIGIT = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;

/**
 * @param {string} value - candidate password
 * @returns {string|null} message describing the first unmet rule, or null if valid
 */
export const getPasswordError = (value) => {
  if (!value) {
    return 'Password is required';
  }

  if (value.length < PASSWORD_MIN_LENGTH) {
    return `Password must be at least ${PASSWORD_MIN_LENGTH} characters`;
  }

  if (!HAS_UPPER_LOWER_DIGIT.test(value)) {
    return 'Password must include an uppercase letter, a lowercase letter and a number';
  }

  return null;
};

/**
 * Pull the most specific message out of an API error, since the validation
 * middleware returns per-field detail under `errors` while `message` is only
 * ever the generic "Validation failed".
 *
 * @param {Object} error - parsed error body from the API
 * @param {string} fallback - message to use when nothing better is available
 * @returns {string}
 */
export const getApiErrorMessage = (error, fallback) =>
  error?.errors?.[0]?.message || error?.message || fallback;
