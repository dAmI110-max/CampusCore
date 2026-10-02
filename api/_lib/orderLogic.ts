// Pure, dependency-free logic for payments & escrow. Unit-tested in tests/orderLogic.test.ts.
import crypto from 'node:crypto';

export const MAX_SANE_AMOUNT_NGN = 5_000_000;

export type DbOrderStatus =
  | 'pending_payment' | 'escrow_funded' | 'item_delivered' | 'completed'
  | 'disputed' | 'cancelled' | 'refunded';

export type OrderAction =
  | 'mark_delivered' | 'confirm_received' | 'dispute' | 'cancel_unpaid' | 'admin_refund' | 'admin_release';

export function computeAmounts(priceNgn: number, feePercent: number) {
  const price = Math.round(Number(priceNgn));
  if (!Number.isFinite(price) || price <= 0) throw new Error('Invalid price');
  if (price > MAX_SANE_AMOUNT_NGN) throw new Error('Amount exceeds the allowed transaction limit.');
  const pct = Number.isFinite(feePercent) && feePercent >= 0 && feePercent <= 30 ? feePercent : 5;
  const platformFee = Math.round(price * (pct / 100));
  return { amount: price, platformFee, sellerReceives: price - platformFee, totalAmount: price, totalKobo: price * 100 };
}

export function generateOrderNumber(now = new Date()): string {
  const d = now.toISOString().slice(0, 10).replace(/-/g, '');
  const rand = crypto.randomBytes(5).toString('hex').toUpperCase();
  return `CP-ORD-${d}-${rand}`; // also used as the Paystack reference (alnum + dashes only)
}

export function verifyPaystackSignature(rawBody: string | Uint8Array, signature: string | undefined, secret: string): boolean {
  if (!signature || !secret) return false;
  const expected = crypto.createHmac('sha512', secret).update(rawBody).digest('hex');
  const a = Buffer.from(expected, 'utf8');
  const b = Buffer.from(String(signature), 'utf8');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export function cleanText(v: unknown, max: number): string {
  return String(v ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, max);
}

export function sanitizeDelivery(d: any) {
  return {
    campus: cleanText(d?.campus, 80) || 'Osogbo (Main Campus)',
    location: cleanText(d?.location, 120) || 'Student Union Building (SUB)',
    notes: cleanText(d?.notes, 300),
  };
}

/** Returns the next status or an error. `actor` is derived server-side, never from the request body. */
export function nextOrderState(
  order: { status: DbOrderStatus; buyer_id: string; seller_id: string },
  action: OrderAction,
  actor: { id: string; isAdmin: boolean }
): { ok: boolean; status?: DbOrderStatus; error?: string; code?: number } {
  const isBuyer = actor.id === order.buyer_id;
  const isSeller = actor.id === order.seller_id;
  const deny = (error: string, code = 403) => ({ ok: false, error, code });
  const s = order.status;
  switch (action) {
    case 'mark_delivered':
      if (!isSeller) return deny('Only the seller can mark an order as delivered.');
      if (s !== 'escrow_funded') return deny(`Cannot mark delivered while order is ${s}.`, 409);
      return { ok: true, status: 'item_delivered' as DbOrderStatus };
    case 'confirm_received':
      if (!isBuyer) return deny('Only the buyer can confirm receipt.');
      if (s !== 'escrow_funded' && s !== 'item_delivered') return deny(`Cannot confirm receipt while order is ${s}.`, 409);
      return { ok: true, status: 'completed' as DbOrderStatus };
    case 'dispute':
      if (!isBuyer && !isSeller) return deny('Not your order.');
      if (s !== 'escrow_funded' && s !== 'item_delivered') return deny(`Cannot dispute while order is ${s}.`, 409);
      return { ok: true, status: 'disputed' as DbOrderStatus };
    case 'cancel_unpaid':
      if (!isBuyer) return deny('Only the buyer can cancel.');
      if (s !== 'pending_payment') return deny('Only unpaid orders can be cancelled.', 409);
      return { ok: true, status: 'cancelled' as DbOrderStatus };
    case 'admin_refund':
      if (!actor.isAdmin) return deny('Admin only.');
      if (s !== 'disputed') return deny('Only disputed orders can be refunded.', 409);
      return { ok: true, status: 'refunded' as DbOrderStatus };
    case 'admin_release':
      if (!actor.isAdmin) return deny('Admin only.');
      if (s !== 'disputed') return deny('Only disputed orders can be released.', 409);
      return { ok: true, status: 'completed' as DbOrderStatus };
    default:
      return deny('Unknown action.', 400);
  }
}

/** Validates a Paystack transaction payload against our order before we trust it. */
export function paymentMatchesOrder(
  tx: { status?: string; amount?: number; currency?: string; reference?: string },
  order: { total_amount: number; payment_reference?: string | null; order_number: string }
): { ok: boolean; error?: string } {
  if (tx.status !== 'success') return { ok: false, error: 'Payment not successful.' };
  if ((tx.currency || 'NGN') !== 'NGN') return { ok: false, error: 'Unexpected currency.' };
  if (Number(tx.amount) !== Math.round(Number(order.total_amount) * 100)) return { ok: false, error: 'Amount mismatch.' };
  if (tx.reference !== order.order_number) return { ok: false, error: 'Reference mismatch.' };
  return { ok: true };
}
