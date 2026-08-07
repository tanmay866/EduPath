/**
 * Phone numbers, in one place.
 *
 * EduPath collects Indian mobile numbers, and the backend enforces exactly ten
 * digits (`/^\d{10}$/` in profileController). So the country code is chrome
 * rather than data: it is shown beside the field and put back when a number is
 * displayed or emailed, but never stored. That way there is nothing to
 * validate, nothing to strip on the server, and no way to end up with the same
 * number saved three different ways.
 */

export const PHONE_COUNTRY_CODE = '+91';
export const PHONE_DIGITS = 10;

/**
 * Ten bare digits, whatever was typed or pasted.
 *
 * A pasted number usually arrives carrying the code the field already shows —
 * "+91 98765 43210", "091-98765-43210" — so the code and any trunk zero come
 * off first. Only then is the rest capped, and from the front: taking the last
 * ten instead would mean an accidental eleventh keystroke silently deleted the
 * first digit, leaving a wrong number that still looks right.
 */
export const normalizePhone = (raw) => {
  let digits = String(raw ?? '').replace(/\D/g, '');
  // Trunk zero before country code, not after: "091 98765 43210" is written
  // both ways round, and stripping the 91 first leaves the 0 in front of a
  // number that is then cut to ten from the wrong end.
  if (digits.length > PHONE_DIGITS && digits.startsWith('0')) digits = digits.slice(1);
  if (digits.length > PHONE_DIGITS && digits.startsWith('91')) digits = digits.slice(2);
  return digits.slice(0, PHONE_DIGITS);
};

/** True only for exactly ten digits — the shape this codebase stores. */
export const isStoredPhone = (value) => new RegExp(`^\\d{${PHONE_DIGITS}}$`).test(String(value ?? '').trim());

/**
 * A stored number with its country code back on, for showing to a person.
 *
 * Deliberately not `normalizePhone` + prefix: resumes and portfolios predate
 * this field and some hold numbers written out in full, occasionally for other
 * countries. Normalising those would keep the last ten digits and stamp +91 on
 * them — a wrong number on somebody's CV, which is worse than an inconsistent
 * one. Anything that is not already ten bare digits is passed through.
 */
export const formatPhone = (value) => {
  const raw = String(value ?? '').trim();
  return isStoredPhone(raw) ? `${PHONE_COUNTRY_CODE} ${raw}` : raw;
};
