import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { computeAmounts, verifyPaystackSignature, nextOrderState, paymentMatchesOrder, generateOrderNumber, sanitizeDelivery } from '../api/_lib/orderLogic';

const order = (status: any) => ({ status, buyer_id: 'B', seller_id: 'S' });

test('amounts: server computes kobo + fee, rejects bad/huge prices', () => {
  const a = computeAmounts(10000, 2);
  assert.equal(a.totalKobo, 1_000_000); assert.equal(a.platformFee, 200); assert.equal(a.sellerReceives, 9800);
  assert.throws(() => computeAmounts(0, 2)); assert.throws(() => computeAmounts(-5, 2));
  assert.throws(() => computeAmounts(NaN as any, 2)); assert.throws(() => computeAmounts(6_000_000, 2));
});

test('webhook signature: valid accepted, tampered/missing rejected', () => {
  const body = JSON.stringify({ event: 'charge.success' });
  const sig = crypto.createHmac('sha512', 'sk_test_x').update(body).digest('hex');
  assert.equal(verifyPaystackSignature(body, sig, 'sk_test_x'), true);
  assert.equal(verifyPaystackSignature(body + ' ', sig, 'sk_test_x'), false);
  assert.equal(verifyPaystackSignature(body, 'abc', 'sk_test_x'), false);
  assert.equal(verifyPaystackSignature(body, undefined, 'sk_test_x'), false);
  assert.equal(verifyPaystackSignature(body, sig, ''), false);
});

test('payment must match order amount, currency, reference and be successful', () => {
  const o = { total_amount: 5000, order_number: 'CP-1', payment_reference: 'CP-1' };
  assert.equal(paymentMatchesOrder({ status: 'success', amount: 500000, currency: 'NGN', reference: 'CP-1' }, o).ok, true);
  assert.equal(paymentMatchesOrder({ status: 'success', amount: 100, currency: 'NGN', reference: 'CP-1' }, o).ok, false);
  assert.equal(paymentMatchesOrder({ status: 'failed', amount: 500000, reference: 'CP-1' }, o).ok, false);
  assert.equal(paymentMatchesOrder({ status: 'success', amount: 500000, currency: 'USD', reference: 'CP-1' }, o).ok, false);
  assert.equal(paymentMatchesOrder({ status: 'success', amount: 500000, reference: 'OTHER' }, o).ok, false);
});

test('escrow state machine enforces who can do what', () => {
  const buyer = { id: 'B', isAdmin: false }, seller = { id: 'S', isAdmin: false }, rando = { id: 'X', isAdmin: false }, admin = { id: 'A', isAdmin: true };
  assert.equal(nextOrderState(order('escrow_funded'), 'mark_delivered', seller).ok, true);
  assert.equal(nextOrderState(order('escrow_funded'), 'mark_delivered', buyer).ok, false);
  assert.equal(nextOrderState(order('pending_payment'), 'confirm_received', buyer).ok, false, 'cannot release unpaid order');
  assert.equal(nextOrderState(order('escrow_funded'), 'confirm_received', seller).ok, false, 'seller cannot release own escrow');
  assert.equal(nextOrderState(order('item_delivered'), 'confirm_received', buyer).ok, true);
  assert.equal(nextOrderState(order('completed'), 'confirm_received', buyer).ok, false, 'no double release');
  assert.equal(nextOrderState(order('escrow_funded'), 'dispute', rando).ok, false);
  assert.equal(nextOrderState(order('disputed'), 'admin_refund', buyer).ok, false);
  assert.equal(nextOrderState(order('disputed'), 'admin_refund', admin).ok, true);
  assert.equal(nextOrderState(order('escrow_funded'), 'admin_refund', admin).ok, false);
  assert.equal(nextOrderState(order('refunded'), 'admin_release', admin).ok, false);
});

test('order numbers are unique and Paystack-safe; delivery input sanitized', () => {
  const set = new Set(Array.from({ length: 500 }, () => generateOrderNumber()));
  assert.equal(set.size, 500);
  for (const n of set) assert.match(n, /^CP-ORD-\d{8}-[A-F0-9]{10}$/);
  const d = sanitizeDelivery({ campus: 'A'.repeat(500), location: 'x\u0000y', notes: 5 });
  assert.equal(d.campus.length, 80); assert.ok(!d.location.includes('\u0000'));
});
