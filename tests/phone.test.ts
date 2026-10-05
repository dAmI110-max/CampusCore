import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizePhone, phoneDigits, formatPhoneDisplay, isValidPhone } from '../src/lib/phone';

test('Nigerian numbers normalise from every common format', () => {
  for (const v of ['08031234567', '0803 123 4567', '0803-123-4567', '8031234567', '2348031234567', '+2348031234567', '+234 803 123 4567', '+23408031234567', '002348031234567'])
    assert.equal(normalizePhone(v), '+2348031234567', v);
});
test('invalid numbers are rejected', () => {
  for (const v of ['', '   ', 'abc', '0803123', '12345', '0603123456789', '+234123', '080312345678901', null, undefined])
    assert.equal(normalizePhone(v as any), null, String(v));
  assert.equal(isValidPhone('hello'), false);
});
test('international numbers kept, digits + display helpers', () => {
  assert.equal(normalizePhone('+44 7911 123456'), '+447911123456');
  assert.equal(phoneDigits('0803 123 4567'), '2348031234567');
  assert.equal(formatPhoneDisplay('+2348031234567'), '0803 123 4567');
  assert.equal(phoneDigits('nope'), '');
});
