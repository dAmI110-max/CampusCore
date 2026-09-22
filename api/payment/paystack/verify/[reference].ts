import { verifyUser } from '../../../_lib/verifyUser';

export default async function handler(req: any, res: any) {
  const user = await verifyUser(req);
  if (!user) {
    return res.status(401).json({ error: 'You must be signed in to verify a payment.' });
  }

  try {
    // Vercel's dynamic route puts this in req.query; Express (local dev, via server.ts)
    // puts it in req.params — support both so this same file works in either runtime.
    const reference = req.params?.reference || req.query?.reference;
    if (!reference || typeof reference !== 'string') {
      return res.status(400).json({ error: 'Transaction reference is required' });
    }

    const secretKey = process.env.PAYSTACK_SECRET_KEY;

    if (secretKey && secretKey.trim().startsWith('sk_')) {
      const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
        headers: { Authorization: `Bearer ${secretKey.trim()}` },
      });

      const verifyData = await verifyRes.json();
      if (!verifyRes.ok || !verifyData.status) {
        return res.status(400).json({ status: false, message: verifyData.message || 'Verification failed' });
      }

      return res.status(200).json({
        status: true,
        verified: verifyData.data.status === 'success',
        data: verifyData.data,
      });
    }

    // --- Test-mode fallback -----------------------------------------------------
    // SECURITY FIX: the original version of this endpoint returned `verified: true`
    // for ANY reference — including made-up ones — whenever PAYSTACK_SECRET_KEY was
    // unset. That's fine for local testing but is a critical hole in production: if
    // the key was ever missing/misconfigured on a live deployment, anyone could fake
    // a successful payment for free by calling this endpoint directly.
    //
    // Now this fallback only ever runs if you explicitly opt in with
    // PAYSTACK_ALLOW_TEST_MODE=true — never as a silent default.
    if (process.env.PAYSTACK_ALLOW_TEST_MODE === 'true') {
      return res.status(200).json({
        status: true,
        verified: true,
        data: {
          reference,
          status: 'success',
          gateway_response: 'Successful (Test Mode)',
          paid_at: new Date().toISOString(),
          channel: 'card',
        },
      });
    }

    return res.status(503).json({ status: false, message: 'Payments are not configured on this server yet.' });
  } catch (err: any) {
    console.error('Paystack verification error:', err);
    return res.status(500).json({ error: 'Failed to verify transaction' });
  }
}
