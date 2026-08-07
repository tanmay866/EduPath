import test from 'node:test';
import assert from 'node:assert/strict';

import { formatPhone, isStoredPhone, PHONE_COUNTRY_CODE } from '../utils/phone.js';

/**
 * This runs on the two things a stranger reads: the generated resume and the
 * deployed portfolio page. Both used to print whatever was stored, which is
 * ten bare digits — a number nobody outside the country could dial.
 *
 * The pass-through cases matter more than the formatting one. Resumes and
 * portfolios were saved before this field was constrained, and some hold
 * numbers written out in full. Prefixing one of those puts +91 on a US number
 * and sends the reader to the wrong place.
 */
test('a stored number is printed with its country code', () => {
  assert.equal(formatPhone('9876543210'), `${PHONE_COUNTRY_CODE} 9876543210`);
});

test('a number already carrying a code is left exactly as it was', () => {
  for (const raw of ['+91 9876543210', '+1 415 555 0000', '+44 20 7946 0958', '91-9876543210']) {
    assert.equal(formatPhone(raw), raw, raw);
  }
});

test('empty and missing values stay empty rather than becoming "undefined"', () => {
  for (const raw of ['', null, undefined]) assert.equal(formatPhone(raw), '');
});

test('surrounding whitespace does not stop a stored number being recognised', () => {
  assert.equal(formatPhone('  9876543210  '), `${PHONE_COUNTRY_CODE} 9876543210`);
});

test('formatting twice changes nothing the second time', () => {
  const once = formatPhone('9876543210');
  assert.equal(formatPhone(once), once);
});

test('isStoredPhone accepts only ten digits', () => {
  assert.equal(isStoredPhone('9876543210'), true);
  assert.equal(isStoredPhone('931392839'), false);
  assert.equal(isStoredPhone('98765432101'), false);
  assert.equal(isStoredPhone('+91 9876543210'), false);
  assert.equal(isStoredPhone('          '), false);
});
