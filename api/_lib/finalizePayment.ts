import type { SupabaseClient } from '@supabase/supabase-js';
import { paymentMatchesOrder } from './orderLogic';

export interface FinalizeResult {
  ok: boolean;
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
export async function finalizePayment(
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
