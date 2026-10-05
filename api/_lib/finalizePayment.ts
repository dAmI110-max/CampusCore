import type { SupabaseClient } from '@supabase/supabase-js';
import { paymentMatchesOrder } from './orderLogic.js';

export interface FinalizeResult {
  ok: boolean;
  kind?: 'order' | 'service';
  status?: string;
  alreadyProcessed?: boolean;
  code?: 'NOT_FOUND' | 'MISMATCH' | 'ITEM_UNAVAILABLE' | 'DB_ERROR';
  message?: string;
}

/**
 * Idempotently turns a *Paystack-confirmed* payment into a funded escrow order.
 * Called from both the browser-return verify route and the webhook, so a paid order is
 * never lost if the buyer closes the tab.
 */
async function finalizeOrderPayment(
  db: SupabaseClient,
  tx: { status?: string; amount?: number; currency?: string; reference?: string },
  secretKey: string
): Promise<FinalizeResult> {
  const reference = String(tx.reference || '');
  const { data: order, error } = await db.from('orders').select('*').eq('order_number', reference).maybeSingle();
  if (error) return { ok: false, code: 'DB_ERROR' as const, message: error.message };
  if (!order) return { ok: false, code: 'NOT_FOUND' as const, message: 'Order not found for this payment.' };
  if (order.status !== 'pending_payment') return { ok: true, status: order.status, alreadyProcessed: true };

  const match = paymentMatchesOrder(tx, order);
  if (!match.ok) return { ok: false, code: 'MISMATCH' as const, message: match.error };

  // Atomically reserve the item: only one buyer can win a single-quantity listing.
  const { data: reserved } = await db
    .from('listings').update({ status: 'pending', updated_at: new Date().toISOString() })
    .eq('id', order.listing_id).eq('status', 'active').select('id');

  if (!reserved || reserved.length === 0) {
    // Item was taken by another buyer between checkout and payment -> refund automatically.
    try {
      await fetch('https://api.paystack.co/refund', {
        method: 'POST',
        headers: { Authorization: `Bearer ${secretKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ transaction: reference }),
      });
    } catch (e) { console.error('Auto-refund failed for', reference, e); }
    await db.from('orders').update({ status: 'refunded', escrow_status: 'refunded', updated_at: new Date().toISOString() })
      .eq('id', order.id).eq('status', 'pending_payment');
    return { ok: false, code: 'ITEM_UNAVAILABLE' as const, message: 'This item was just bought by someone else. Your payment is being refunded.' };
  }

  const now = new Date().toISOString();
  const { error: upErr } = await db.from('orders').update({
    status: 'escrow_funded', escrow_status: 'held', paid_at: now, updated_at: now, payment_reference: reference,
  }).eq('id', order.id).eq('status', 'pending_payment');
  if (upErr) return { ok: false, code: 'DB_ERROR' as const, message: upErr.message };
  return { ok: true, status: 'escrow_funded' };
}


async function refundTransaction(reference: string, secretKey: string) {
  try {
    await fetch('https://api.paystack.co/refund', {
      method: 'POST',
      headers: { Authorization: `Bearer ${secretKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ transaction: reference }),
    });
  } catch (e) { console.error('Auto-refund failed for', reference, e); }
}

/** Service-job escrow: a quoted request becomes in_progress once the client's payment is confirmed. */
async function finalizeServicePayment(
  db: SupabaseClient,
  tx: { status?: string; amount?: number; currency?: string; reference?: string },
  secretKey: string
): Promise<FinalizeResult> {
  const reference = String(tx.reference || '');
  const { data: job, error } = await db.from('service_requests').select('*').eq('payment_reference', reference).maybeSingle();
  if (error) return { ok: false, code: 'DB_ERROR' as const, message: error.message };
  if (!job) {
    // A successful charge we cannot match (e.g. stale checkout link for an old quote): never keep the money.
    await refundTransaction(reference, secretKey);
    return { ok: false, code: 'NOT_FOUND' as const, message: 'This payment link has expired. Any charge is being refunded.' };
  }
  if (job.status !== 'quoted') {
    if (job.status === 'in_progress' || job.status === 'ready_for_review' || job.status === 'completed') {
      return { ok: true, status: job.status, alreadyProcessed: true };
    }
    await refundTransaction(reference, secretKey); // request was declined/cancelled while the client was paying
    return { ok: false, code: 'ITEM_UNAVAILABLE' as const, message: 'This request is no longer open. Your payment is being refunded.' };
  }
  const match = paymentMatchesOrder(tx, { total_amount: Number(job.quote_amount), order_number: reference });
  if (!match.ok) {
    await refundTransaction(reference, secretKey);
    return { ok: false, code: 'MISMATCH' as const, message: match.error };
  }
  const now = new Date().toISOString();
  const { error: upErr } = await db.from('service_requests').update({
    status: 'in_progress', escrow_status: 'held', paid_at: now, updated_at: now,
  }).eq('id', job.id).eq('status', 'quoted');
  if (upErr) return { ok: false, code: 'DB_ERROR' as const, message: upErr.message };
  return { ok: true, status: 'in_progress' };
}

/** Entry point for the verify route and the webhook: picks order vs service by the reference prefix. */
export async function finalizePayment(
  db: SupabaseClient,
  tx: { status?: string; amount?: number; currency?: string; reference?: string },
  secretKey: string
): Promise<FinalizeResult> {
  const reference = String(tx.reference || '');
  if (reference.startsWith('CP-SRV-')) return { ...(await finalizeServicePayment(db, tx, secretKey)), kind: 'service' };
  if (reference.startsWith('CP-ORD-')) return { ...(await finalizeOrderPayment(db, tx, secretKey)), kind: 'order' };
  return { ok: false, code: 'NOT_FOUND' as const, message: 'Unknown payment reference.' };
}
