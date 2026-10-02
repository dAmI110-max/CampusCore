import { verifyUser } from '../../_lib/verifyUser';
import { getAdminClient } from '../../_lib/supabaseAdmin';
import { computeAmounts, generateOrderNumber, sanitizeDelivery } from '../../_lib/orderLogic';
import { rateLimit, getAppUrl } from '../../_lib/http';

/**
 * POST { listingId, delivery: { campus, location, notes } }
 * The price is ALWAYS read from the database – the browser can never choose what it pays.
 */
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const user = await verifyUser(req);
  if (!user) return res.status(401).json({ error: 'Please sign in to place an order.' });
  if (!rateLimit(`pay-init:${user.id}`, 10, 60_000)) return res.status(429).json({ error: 'Too many attempts. Please wait a minute.' });

  const secretKey = (process.env.PAYSTACK_SECRET_KEY || '').trim();
  const db = getAdminClient();
  if (!secretKey || !db) return res.status(503).json({ error: 'Payments are not configured on this server yet.' });

  try {
    const { listingId, delivery } = req.body || {};
    if (typeof listingId !== 'string' || !/^[0-9a-f-]{36}$/i.test(listingId)) {
      return res.status(400).json({ error: 'This item is out of date. Please refresh the page and try again.' });
    }

    const { data: listing } = await db.from('listings').select('*').eq('id', listingId).maybeSingle();
    if (!listing || listing.status !== 'active') return res.status(409).json({ error: 'This item is no longer available.' });
    if (listing.seller_id === user.id) return res.status(400).json({ error: 'You cannot buy your own listing.' });

    const [{ data: buyer }, { data: seller }] = await Promise.all([
      db.from('profiles').select('full_name,email,phone,avatar_url,campus_name,account_status').eq('id', user.id).maybeSingle(),
      db.from('profiles').select('full_name,avatar_url,campus_name,account_status').eq('id', listing.seller_id).maybeSingle(),
    ]);
    if (!buyer || buyer.account_status !== 'active') return res.status(403).json({ error: 'Your account cannot place orders.' });
    if (!seller || seller.account_status !== 'active') return res.status(409).json({ error: 'This seller is currently unavailable.' });

    const fee = Number(process.env.PLATFORM_FEE_PERCENT ?? 2);
    let amounts;
    try { amounts = computeAmounts(Number(listing.price), fee); }
    catch (e: any) { return res.status(400).json({ error: e.message }); }

    // Abandon this buyer's previous unpaid attempts for the same item.
    await db.from('orders').update({ status: 'cancelled', updated_at: new Date().toISOString() })
      .eq('buyer_id', user.id).eq('listing_id', listing.id).eq('status', 'pending_payment');

    const d = sanitizeDelivery(delivery);
    const orderNumber = generateOrderNumber();
    const { data: order, error: insErr } = await db.from('orders').insert({
      order_number: orderNumber, buyer_id: user.id, buyer_name: buyer.full_name, buyer_email: user.email || buyer.email,
      buyer_phone: buyer.phone, buyer_avatar: buyer.avatar_url, buyer_campus: buyer.campus_name,
      seller_id: listing.seller_id, seller_name: seller.full_name, seller_avatar: seller.avatar_url, seller_campus: seller.campus_name,
      listing_id: listing.id, listing_title: listing.title, listing_image: (listing.images || [])[0] || null,
      amount: amounts.amount, delivery_fee: 0, total_amount: amounts.totalAmount,
      platform_fee: amounts.platformFee, seller_receives: amounts.sellerReceives,
      status: 'pending_payment', escrow_status: 'held', payment_method: 'paystack', payment_reference: orderNumber,
      pickup_location: `${d.location}, ${d.campus}`, delivery_campus: d.campus, delivery_location: d.location, delivery_notes: d.notes,
    }).select().single();
    if (insErr || !order) {
      console.error('order insert failed', insErr);
      return res.status(500).json({ error: 'Could not create your order. Please try again.' });
    }

    const psRes = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: { Authorization: `Bearer ${secretKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: user.email, amount: amounts.totalKobo, currency: 'NGN', reference: orderNumber,
        callback_url: `${getAppUrl(req)}/?view=orders`,
        metadata: { order_id: order.id, listing_id: listing.id, buyer_id: user.id },
      }),
    });
    const ps = await psRes.json().catch(() => ({}));
    if (!psRes.ok || !ps.status) {
      await db.from('orders').update({ status: 'cancelled' }).eq('id', order.id);
      return res.status(502).json({ error: 'Paystack could not start the payment. Please try again.' });
    }

    return res.status(200).json({
      success: true, authorization_url: ps.data.authorization_url, reference: orderNumber, orderId: order.id,
    });
  } catch (err) {
    console.error('Paystack initialize error:', err);
    return res.status(500).json({ error: 'Unable to start payment. Please try again.' });
  }
}
