import crypto from 'node:crypto';
import { verifyUser } from '../_lib/verifyUser.js';
import { getAdminClient, isAdminUser } from '../_lib/supabaseAdmin.js';
import { rateLimit } from '../_lib/http.js';
import { cleanText } from '../_lib/orderLogic.js';
import {
  nextServiceState, validateNewRequest, validateQuote, validateDelivery, isUuid, ServiceAction,
} from '../_lib/serviceLogic.js';

const ACTIONS: ServiceAction[] = ['quote', 'decline', 'deliver', 'approve', 'dispute', 'admin_refund', 'admin_release'];

/**
 * POST { action: 'create' | 'quote' | 'decline' | 'deliver' | 'approve' | 'dispute' | 'admin_refund' | 'admin_release', ... }
 * Every change to a service job goes through here so status/payment can never be faked from the browser.
 * (Funding the escrow is done via /api/payment/paystack/initialize with kind: 'service_request'.)
 */
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const user = await verifyUser(req);
  if (!user) return res.status(401).json({ error: 'Please sign in.' });
  if (!rateLimit(`srv-req:${user.id}`, 40, 60_000)) return res.status(429).json({ error: 'Too many requests. Please wait a minute.' });
  const db = getAdminClient();
  if (!db) return res.status(503).json({ error: 'Server is not configured.' });

  try {
    const body = req.body || {};
    const action = body.action;

    // ---------------- create ----------------
    if (action === 'create') {
      if (!rateLimit(`srv-create:${user.id}`, 15, 3_600_000)) return res.status(429).json({ error: 'You have sent a lot of requests. Please try again later.' });
      const v = validateNewRequest(body);
      if (!v.ok || !v.value) return res.status(400).json({ error: v.error });

      const { data: service } = await db.from('services').select('*').eq('id', v.value.serviceId).maybeSingle();
      if (!service || service.status !== 'active') return res.status(409).json({ error: 'This service is no longer available.' });
      if (service.provider_id === user.id) return res.status(400).json({ error: 'You cannot request your own service.' });

      const [{ data: client }, { data: provider }] = await Promise.all([
        db.from('profiles').select('full_name,avatar_url,campus_name,account_status').eq('id', user.id).maybeSingle(),
        db.from('profiles').select('full_name,avatar_url,account_status').eq('id', service.provider_id).maybeSingle(),
      ]);
      if (!client || client.account_status !== 'active') return res.status(403).json({ error: 'Your account cannot send requests.' });
      if (!provider || provider.account_status !== 'active') return res.status(409).json({ error: 'This provider is currently unavailable.' });

      const { count } = await db.from('service_requests').select('id', { count: 'exact', head: true })
        .eq('client_id', user.id).eq('service_id', service.id).in('status', ['requested', 'quoted']);
      if ((count || 0) >= 3) return res.status(409).json({ error: 'You already have open requests for this service. Wait for a reply first.' });

      for (let attempt = 0; attempt < 3; attempt++) {
        const requestNumber = `SRQ-${new Date().getFullYear()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
        const { data: row, error } = await db.from('service_requests').insert({
          request_number: requestNumber, service_id: service.id, service_title: service.title,
          client_id: user.id, client_name: client.full_name, client_avatar: client.avatar_url, client_campus: client.campus_name,
          provider_id: service.provider_id, provider_name: provider.full_name, provider_avatar: provider.avatar_url,
          description: v.value.description, reference_images: v.value.referenceImages, budget: v.value.budget,
          deadline_date: v.value.deadlineDate || null, status: 'requested', max_revisions: 2,
        }).select().single();
        if (row) return res.status(200).json({ success: true, id: row.id, requestNumber });
        if (error && error.code !== '23505') { console.error('request insert', error); break; }
      }
      return res.status(500).json({ error: 'Could not send your request. Please try again.' });
    }

    // ---------------- state changes ----------------
    if (!ACTIONS.includes(action) || !isUuid(body.requestId)) return res.status(400).json({ error: 'Invalid request.' });

    const { data: job } = await db.from('service_requests').select('*').eq('id', body.requestId).maybeSingle();
    if (!job) return res.status(404).json({ error: 'Request not found.' });
    const isAdmin = await isAdminUser(db, user.id);
    if (job.client_id !== user.id && job.provider_id !== user.id && !isAdmin) return res.status(404).json({ error: 'Request not found.' });

    const t = nextServiceState(job, action, { id: user.id, isAdmin });
    if (!t.ok) return res.status(t.code || 400).json({ error: t.error });

    const now = new Date().toISOString();
    const patch: Record<string, any> = { status: t.status as string, updated_at: now };

    if (action === 'quote') {
      const q = validateQuote(body);
      if (!q.ok || !q.value) return res.status(400).json({ error: q.error });
      patch.quote_amount = q.value.amount; patch.quote_delivery_days = q.value.days; patch.quote_terms = q.value.terms;
      patch.payment_reference = null; // any earlier checkout link for an older price is now void
    }
    if (action === 'deliver') {
      const d = validateDelivery(body);
      if (!d.ok || !d.value) return res.status(400).json({ error: d.error });
      patch.delivery_notes = d.value.notes; patch.delivery_work_urls = d.value.urls;
    }
    if (action === 'approve' || action === 'admin_release') {
      patch.escrow_status = 'released'; patch.completed_at = now; patch.payout_status = 'pending';
    }
    if (action === 'dispute') {
      patch.escrow_status = 'disputed'; patch.dispute_reason = cleanText(body.reason, 500) || 'No reason given';
    }
    if (action === 'admin_refund') {
      const sk = (process.env.PAYSTACK_SECRET_KEY || '').trim();
      const rr = await fetch('https://api.paystack.co/refund', {
        method: 'POST', headers: { Authorization: `Bearer ${sk}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ transaction: job.payment_reference }),
      });
      const rd = await rr.json().catch(() => ({}));
      if (!rr.ok || !rd.status) return res.status(502).json({ error: 'Paystack refund failed. Nothing was changed.' });
      patch.escrow_status = 'refunded';
    }

    // compare-and-set on the previous status → no double release / double refund
    const { data: updated } = await db.from('service_requests').update(patch).eq('id', job.id).eq('status', job.status).select().maybeSingle();
    if (!updated) return res.status(409).json({ error: 'This request was just updated. Please refresh.' });
    return res.status(200).json({ success: true, status: t.status });
  } catch (err) {
    console.error('service request error', err);
    return res.status(500).json({ error: 'Action failed. Please try again.' });
  }
}
