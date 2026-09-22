import { verifyUser } from '../../_lib/verifyUser';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user = await verifyUser(req);
  if (!user) {
    return res.status(401).json({ error: 'You must be signed in to make a payment.' });
  }

  try {
    const { email, amount, metadata, reference, callback_url } = req.body || {};

    if (!email || !amount || Number(amount) <= 0) {
      return res.status(400).json({ error: 'Valid email and positive amount are required' });
    }

    // --- Amount trust boundary -------------------------------------------------
    // IMPORTANT: this still trusts the amount the client sends. That's acceptable
    // only because nothing in the app currently creates a real priced order before
    // calling this endpoint (the wallet/checkout flow is a client-side simulation
    // right now, per WalletView.tsx). Before wiring this up to real money:
    //   1. Look up the real amount server-side from the order/listing record the
    //      `reference` or `metadata` points to.
    //   2. Use THAT amount when calling Paystack below — never `req.body.amount`.
    // Until then, this sanity cap just guards against obvious typos/abuse.
    const MAX_SANE_AMOUNT_NGN = 5_000_000;
    if (Number(amount) > MAX_SANE_AMOUNT_NGN) {
      return res.status(400).json({ error: 'Amount exceeds the allowed transaction limit.' });
    }

    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
      return res.status(503).json({ error: 'Payments are not configured on this server yet.' });
    }

    const paystackResponse = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        amount: Math.round(Number(amount) * 100), // NGN to kobo
        metadata,
        reference,
        callback_url,
      }),
    });

    const paystackData = await paystackResponse.json();
    if (!paystackResponse.ok || !paystackData.status) {
      return res.status(400).json({
        error: paystackData.message || 'Failed to initialize Paystack transaction',
        details: paystackData,
      });
    }

    return res.status(200).json({
      success: true,
      authorization_url: paystackData.data.authorization_url,
      access_code: paystackData.data.access_code,
      reference: paystackData.data.reference,
    });
  } catch (err: any) {
    console.error('Paystack initialize error:', err);
    return res.status(500).json({ error: 'Unable to initialize payment. Please try again.' });
  }
}
