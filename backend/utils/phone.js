/**
 * Phone numbers, as they are written out.
 *
 * The mirror of frontend/src/design/phone.js. Numbers are stored as ten bare
 * digits — the profile route has always enforced that — and the country code
 * is added back wherever a number is shown to a person: the notification
 * email, a generated resume, a deployed portfolio page.
 *
 * Anything that does not look like a stored Indian mobile number is passed
 * through untouched. Resumes and portfolios predate this rule and some of them
 * hold numbers written out in full, sometimes for other countries; rewriting
 * those would put a wrong code on somebody's CV.
 */

export const PHONE_COUNTRY_CODE = '+91';
export const PHONE_DIGITS = 10;

/** True only for exactly ten digits — the shape this codebase stores. */
export const isStoredPhone = (value) => new RegExp(`^\\d{${PHONE_DIGITS}}$`).test(String(value ?? '').trim());

/** A stored number with its country code back on. Anything else is left alone. */
export const formatPhone = (value) => {
  const raw = String(value ?? '').trim();
  return isStoredPhone(raw) ? `${PHONE_COUNTRY_CODE} ${raw}` : raw;
};

export default formatPhone;
