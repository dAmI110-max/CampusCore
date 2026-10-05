import { getAdminClient } from '../../_lib/supabaseAdmin.js';
import { finalizePayment } from '../../_lib/finalizePayment.js';
import { verifyPaystackSignature } from '../../_lib/orderLogic.js';
import { readRawBody } from '../../_lib/http.js';

// Raw body is required to verify Paystack's HMAC signature.
export const config = { api: { bodyParser: false } };

/** Set this URL in Paystack Dashboard → Settings → API Keys & Webhooks: https://YOUR-DOMAIN/api/payment/paystack/webhook */
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).end();
  const secretKey = (process.env.PAYSTACK_SECRET_KEY || '').trim();
  const db = getAdminClient();
  if (!secretKey || !db) return res.status(503).end();

  let raw: string;
  try { raw = await readRawBody(req); } catch { return res.status(400).end(); }
  if (!verifyPaystackSignature(raw, req.headers['x-paystack-signature'] as string | undefined, secretKey)) {
    return res.status(401).end();
  }
  try {
    const event = JSON.parse(raw);
    if (event?.event === 'charge.success' && event.data?.reference) {
      const result = await finalizePayment(db, event.data, secretKey);
      if (!result.ok && result.code === 'DB_ERROR') return res.status(500).end(); // let Paystack retry
    }
    return res.status(200).json({ received: true });
  } catch (err) {
    console.error('webhook error', err);
    return res.status(200).json({ received: true });
  }
}
