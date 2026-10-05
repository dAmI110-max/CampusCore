import test from 'node:test';
import assert from 'node:assert/strict';
import { nextServiceState, validateNewRequest, validateQuote, validateDelivery } from '../api/_lib/serviceLogic';
import { generateReference } from '../api/_lib/orderLogic';

const r = (status: any) => ({ status, client_id: 'C', provider_id: 'P' });
const C = { id: 'C', isAdmin: false }, P = { id: 'P', isAdmin: false }, X = { id: 'X', isAdmin: false }, A = { id: 'A', isAdmin: true };
const UUID = '123e4567-e89b-12d3-a456-426614174000';

test('only the right party can move a job forward', () => {
  assert.equal(nextServiceState(r('requested'), 'quote', P).ok, true);
  assert.equal(nextServiceState(r('requested'), 'quote', C).ok, false, 'client cannot quote themselves');
  assert.equal(nextServiceState(r('in_progress'), 'deliver', P).ok, true);
  assert.equal(nextServiceState(r('in_progress'), 'deliver', C).ok, false);
  assert.equal(nextServiceState(r('ready_for_review'), 'approve', C).ok, true);
  assert.equal(nextServiceState(r('ready_for_review'), 'approve', P).ok, false, 'provider cannot release own payment');
  assert.equal(nextServiceState(r('in_progress'), 'approve', C).ok, false, 'cannot release before delivery');
  assert.equal(nextServiceState(r('quoted'), 'deliver', P).ok, false, 'cannot deliver unpaid job');
  assert.equal(nextServiceState(r('completed'), 'approve', C).ok, false, 'no double release');
  assert.equal(nextServiceState(r('requested'), 'approve', X).ok, false);
});
test('decline/dispute/admin rules', () => {
  assert.equal(nextServiceState(r('quoted'), 'decline', C).ok, true);
  assert.equal(nextServiceState(r('in_progress'), 'decline', C).ok, false, 'cannot walk away from funded job');
  assert.equal(nextServiceState(r('in_progress'), 'dispute', P).ok, true);
  assert.equal(nextServiceState(r('in_progress'), 'dispute', X).ok, false);
  assert.equal(nextServiceState(r('disputed'), 'admin_refund', C).ok, false);
  assert.equal(nextServiceState(r('disputed'), 'admin_refund', A).ok, true);
  assert.equal(nextServiceState(r('in_progress'), 'admin_release', A).ok, false);
});
test('input validation', () => {
  assert.equal(validateNewRequest({ serviceId: UUID, description: 'Need a logo design', budget: 5000 }).ok, true);
  assert.equal(validateNewRequest({ serviceId: 'srv-1', description: 'Need a logo design', budget: 5000 }).ok, false);
  assert.equal(validateNewRequest({ serviceId: UUID, description: 'short', budget: 5000 }).ok, false);
  assert.equal(validateNewRequest({ serviceId: UUID, description: 'Need a logo design', budget: 5 }).ok, false);
  assert.equal(validateNewRequest({ serviceId: UUID, description: 'Need a logo design', budget: 9e9 }).ok, false);
  assert.equal(validateQuote({ quoteAmount: 3000, quoteDeliveryDays: 3 }).ok, true);
  assert.equal(validateQuote({ quoteAmount: -1, quoteDeliveryDays: 3 }).ok, false);
  assert.equal(validateQuote({ quoteAmount: 3000, quoteDeliveryDays: 0 }).ok, false);
  assert.equal(validateDelivery({ deliveryNotes: '' }).ok, false);
  const d = validateDelivery({ deliveryNotes: 'done', deliveryUrls: ['javascript:alert(1)', 'https://drive.google.com/x', 'ftp://a'] });
  assert.deepEqual(d.value?.urls, ['https://drive.google.com/x'], 'only http(s) links allowed');
});
test('service payment references are Paystack-safe and distinct from orders', () => {
  assert.match(generateReference('SRV'), /^CP-SRV-\d{8}-[A-F0-9]{10}$/);
  assert.match(generateReference('ORD'), /^CP-ORD-/);
});
