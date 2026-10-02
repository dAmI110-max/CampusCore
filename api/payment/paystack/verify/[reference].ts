import { verifyUser } from '../../../_lib/verifyUser';
import { getAdminClient } from '../../../_lib/supabaseAdmin';
import { finalizePayment } from '../../../_lib/finalizePayment';
import { rateLimit } from '../../../_lib/http';

export default async function handler(req: any, res: any) {
  const user = await verifyUser(req);
  if (!user) return res.status(401).json({ error: 'Please sign in to verify a payment.' });
  if (!rateLimit(`pay-verify:${user.id}`, 30, 60_000)) return res.status(429).json({ error: 'Too many requests.' });

  try {
    const reference = req.params?.reference || req.query?.reference;
    if (typeof reference !== 'string' || !/^[A-Za-z0-9\-_.=]{6,100}$/.test(reference)) {
      return res.status(400).json({ error: 'Invalid transaction reference.' });
    }
    const secretKey = (process.env.PAYSTACK_SECRET_KEY || '').trim();
    const db = getAdminClient();
    if (!secretKey.startsWith('sk_') || !db) return res.status(503).json({ error: 'Payments are not configured on this server yet.' });

    // A buyer may only verify their own order.
    const { data: order } = await db.from('orders').select('id,buyer_id,seller_id,status').eq('order_number', reference).maybeSingle();
    if (!order || order.buyer_id !== user.id) return res.status(404).json({ error: 'Order not found.' });

    const vr = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      headers: { Authorization: `Bearer ${secretKey}` },
    });
    const vd = await vr.json().catch(() => ({}));
    if (!vr.ok || !vd.status) return res.status(502).json({ verified: false, error: 'Could not reach Paystack. Your order will update automatically once payment is confirmed.' });

    if (vd.data.status !== 'success') {
      return res.status(200).json({ verified: false, paystackStatus: vd.data.status, orderStatus: order.status });
    }
    const result = await finalizePayment(db, vd.data, secretKey);
    if (!result.ok) return res.status(result.code === 'ITEM_UNAVAILABLE' ? 409 : 400).json({ verified: false, code: result.code, error: result.message });
    return res.status(200).json({ verified: true, orderId: order.id, orderStatus: result.status });
  } catch (err) {
    console.error('Paystack verification error:', err);
    return res.status(500).json({ error: 'Failed to verify transaction.' });
  }
}
