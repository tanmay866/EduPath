import { test } from 'vitest';
import assert from 'node:assert/strict';

import { normalizePhone, formatPhone, isStoredPhone, PHONE_COUNTRY_CODE } from './phone.js';

/**
 * The field shows "+91" beside it and stores ten bare digits, so everything
 * here is about what survives the trip in. The two stripping rules have to run
 * in the right order — "091 93139 28398" is a real way to write a number, and
 * taking the country code off before the trunk zero cut it to 9193139283,
 * which is wrong while still looking like a phone number.
 */
test('a number already in the stored shape is left alone', () => {
  assert.equal(normalizePhone('9313928398'), '9313928398');
});

test('the country code is dropped however it was pasted', () => {
  for (const raw of ['+91 93139 28398', '+919313928398', '91 9313928398', '(+91)-93139-28398']) {
    assert.equal(normalizePhone(raw), '9313928398', raw);
  }
});

test('a trunk zero is dropped, before or after the country code', () => {
  assert.equal(normalizePhone('09313928398'), '9313928398');
  assert.equal(normalizePhone('091-93139-28398'), '9313928398');
  assert.equal(normalizePhone('0 +91 9313928398'), '9313928398');
});

test('a ten-digit number that happens to start 91 is not mistaken for a code', () => {
  assert.equal(normalizePhone('9193139283'), '9193139283');
});

test('an eleventh digit is ignored rather than pushing the first one off', () => {
  // Taking the last ten instead would return 3139283981 — a different number,
  // silently, from one stray keystroke.
  assert.equal(normalizePhone('93139283981'), '9313928398');
});

test('anything that is not a digit is discarded', () => {
  assert.equal(normalizePhone('93a13b92c8398'), '9313928398');
  assert.equal(normalizePhone('phone: none'), '');
});

test('empty and missing values stay empty rather than becoming "undefined"', () => {
  for (const raw of ['', null, undefined]) assert.equal(normalizePhone(raw), '');
});

test('formatPhone puts the code back for display, and leaves empty empty', () => {
  assert.equal(formatPhone('9313928398'), `${PHONE_COUNTRY_CODE} 9313928398`);
  assert.equal(formatPhone(''), '');
  assert.equal(formatPhone(undefined), '');
});

test('formatPhone leaves a number it did not store alone', () => {
  // Resumes and portfolios hold free-form numbers written before this field
  // existed. Prefixing one of those would put +91 on a US number.
  assert.equal(formatPhone('+1 415 555 0000'), '+1 415 555 0000');
  assert.equal(formatPhone('+44 20 7946 0958'), '+44 20 7946 0958');
  assert.equal(formatPhone('+91 9313928398'), '+91 9313928398');
});

test('isStoredPhone recognises only the ten-digit shape', () => {
  assert.equal(isStoredPhone('9313928398'), true);
  assert.equal(isStoredPhone('931392839'), false);
  assert.equal(isStoredPhone('+91 9313928398'), false);
  assert.equal(isStoredPhone(''), false);
});

test('normalizing is idempotent, so a stored value round-trips unchanged', () => {
  const once = normalizePhone('+91 93139 28398');
  assert.equal(normalizePhone(once), once);
});
