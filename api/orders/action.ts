import { verifyUser } from '../_lib/verifyUser';
import { getAdminClient, isAdminUser } from '../_lib/supabaseAdmin';
import { nextOrderState, cleanText, OrderAction } from '../_lib/orderLogic';
import { rateLimit } from '../_lib/http';

const ACTIONS: OrderAction[] = ['mark_delivered', 'confirm_received', 'dispute', 'cancel_unpaid', 'admin_refund', 'admin_release'];

/** POST { orderId, action, notes? } – every escrow state change goes through this state machine. */
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const user = await verifyUser(req);
  if (!user) return res.status(401).json({ error: 'Please sign in.' });
  if (!rateLimit(`order-action:${user.id}`, 30, 60_000)) return res.status(429).json({ error: 'Too many requests.' });
  const db = getAdminClient();
  if (!db) return res.status(503).json({ error: 'Server is not configured.' });

  try {
    const { orderId, action, notes } = req.body || {};
    if (typeof orderId !== 'string' || !/^[0-9a-f-]{36}$/i.test(orderId) || !ACTIONS.includes(action)) {
      return res.status(400).json({ error: 'Invalid request.' });
    }
    const { data: order } = await db.from('orders').select('*').eq('id', orderId).maybeSingle();
    if (!order) return res.status(404).json({ error: 'Order not found.' });

    const isAdmin = await isAdminUser(db, user.id);
    if (order.buyer_id !== user.id && order.seller_id !== user.id && !isAdmin) return res.status(404).json({ error: 'Order not found.' });

    const t = nextOrderState(order, action, { id: user.id, isAdmin });
    if (!t.ok) return res.status(t.code || 400).json({ error: t.error });

    const now = new Date().toISOString();
    const patch: Record<string, any> = { status: t.status as string, updated_at: now };
    if (action === 'mark_delivered' && notes) {
      patch.delivery_notes = [order.delivery_notes, cleanText(notes, 300)].filter(Boolean).join(' | ').slice(0, 600);
    }
    if (action === 'dispute' && notes) {
      patch.delivery_notes = [order.delivery_notes, cleanText(notes, 400)].filter(Boolean).join(' | ').slice(0, 900);
    }
    if (t.status === 'completed') { patch.escrow_status = 'released'; patch.completed_at = now; patch.payout_status = 'pending'; }
    if (t.status === 'disputed') patch.escrow_status = 'disputed';

    if (t.status === 'refunded') {
      const sk = (process.env.PAYSTACK_SECRET_KEY || '').trim();
      const rr = await fetch('https://api.paystack.co/refund', {
        method: 'POST', headers: { Authorization: `Bearer ${sk}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ transaction: order.payment_reference || order.order_number }),
      });
      const rd = await rr.json().catch(() => ({}));
      if (!rr.ok || !rd.status) return res.status(502).json({ error: 'Paystack refund failed. Nothing was changed.' });
      patch.escrow_status = 'refunded';
    }

    // Compare-and-set on the previous status prevents double release / double refund.
    const { data: updated } = await db.from('orders').update(patch).eq('id', order.id).eq('status', order.status).select().maybeSingle();
    if (!updated) return res.status(409).json({ error: 'Order was just updated. Please refresh.' });

    if (t.status === 'completed' && order.listing_id) await db.from('listings').update({ status: 'sold' }).eq('id', order.listing_id);
    if ((t.status === 'refunded' || t.status === 'cancelled') && order.listing_id && order.status !== 'pending_payment') {
      await db.from('listings').update({ status: 'active' }).eq('id', order.listing_id).eq('status', 'pending');
    }
    return res.status(200).json({ success: true, status: t.status });
  } catch (err) {
    console.error('order action error', err);
    return res.status(500).json({ error: 'Action failed. Please try again.' });
  }
}
