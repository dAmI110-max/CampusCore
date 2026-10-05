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

    // Only the paying user may verify, and only for their own order / service job.
    const isService = reference.startsWith('CP-SRV-');
    let ownerOk = false;
    let rowId = '';
    let rowStatus = '';
    if (isService) {
      const { data: job } = await db.from('service_requests').select('id,client_id,status').eq('payment_reference', reference).maybeSingle();
      ownerOk = !!job && job.client_id === user.id; rowId = job?.id || ''; rowStatus = job?.status || '';
    } else {
      const { data: order } = await db.from('orders').select('id,buyer_id,status').eq('order_number', reference).maybeSingle();
      ownerOk = !!order && order.buyer_id === user.id; rowId = order?.id || ''; rowStatus = order?.status || '';
    }
    if (!ownerOk) return res.status(404).json({ error: 'Payment record not found.' });

    const vr = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      headers: { Authorization: `Bearer ${secretKey}` },
    });
    const vd = await vr.json().catch(() => ({}));
    if (!vr.ok || !vd.status) return res.status(502).json({ verified: false, error: 'Could not reach Paystack. Your order will update automatically once payment is confirmed.' });

    if (vd.data.status !== 'success') {
      return res.status(200).json({ verified: false, kind: isService ? 'service' : 'order', paystackStatus: vd.data.status, orderStatus: rowStatus });
    }
    const result = await finalizePayment(db, vd.data, secretKey);
    if (!result.ok) return res.status(result.code === 'ITEM_UNAVAILABLE' ? 409 : 400).json({ verified: false, code: result.code, error: result.message });
    return res.status(200).json({ verified: true, kind: result.kind, orderId: rowId, orderStatus: result.status });
  } catch (err) {
    console.error('Paystack verification error:', err);
    return res.status(500).json({ error: 'Failed to verify transaction.' });
  }
}
