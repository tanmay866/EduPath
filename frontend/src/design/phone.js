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
 * "+91 93139 28398", "091-93139-28398" — so the code and any trunk zero come
 * off first. Only then is the rest capped, and from the front: taking the last
 * ten instead would mean an accidental eleventh keystroke silently deleted the
 * first digit, leaving a wrong number that still looks right.
 */
export const normalizePhone = (raw) => {
  let digits = String(raw ?? '').replace(/\D/g, '');
  // Trunk zero before country code, not after: "091 93139 28398" is written
  // both ways round, and stripping the 91 first leaves the 0 in front of a
  // number that is then cut to ten from the wrong end.
  if (digits.length > PHONE_DIGITS && digits.startsWith('0')) digits = digits.slice(1);
  if (digits.length > PHONE_DIGITS && digits.startsWith('91')) digits = digits.slice(2);
  return digits.slice(0, PHONE_DIGITS);
};

/** A stored number as it should be read by a person. Empty stays empty. */
export const formatPhone = (raw) => {
  const digits = normalizePhone(raw);
  return digits ? `${PHONE_COUNTRY_CODE} ${digits}` : '';
};
