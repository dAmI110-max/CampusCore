/**
 * GET /api/health                  → { status: 'ok' }
 * GET /api/health?check=payments   → readiness report for payments (booleans / short status only, never secret values)
 */
export default async function handler(req: any, res: any) {
  const base = { status: 'ok', platform: 'CampusCore', release: 'Phase 1 Launch', timestamp: new Date().toISOString() };
  if (req.query?.check !== 'payments') return res.status(200).json(base);

  const has = (n: string) => !!(process.env[n] || '').trim();
  const sk = (process.env.PAYSTACK_SECRET_KEY || '').trim();
  const report: Record<string, any> = {
    env: {
      VITE_SUPABASE_URL: has('VITE_SUPABASE_URL'),
      VITE_SUPABASE_ANON_KEY: has('VITE_SUPABASE_ANON_KEY'),
      SUPABASE_SERVICE_ROLE_KEY: has('SUPABASE_SERVICE_ROLE_KEY'),
      PAYSTACK_SECRET_KEY_looks_valid: sk.startsWith('sk_'),
      PAYSTACK_PUBLIC_KEY: has('PAYSTACK_PUBLIC_KEY'),
      APP_URL: has('APP_URL'),
    },
  };

  // 1. Do the payment modules load on this server? (the usual failure is a module that crashes on import)
  let getAdminClient: any = null;
  try {
    await import('./_lib/orderLogic.js');
    await import('./_lib/finalizePayment.js');
    await import('./_lib/verifyUser.js');
    ({ getAdminClient } = await import('./_lib/supabaseAdmin.js'));
    report.modulesLoad = true;
  } catch (e: any) {
    report.modulesLoad = false;
    report.moduleError = String(e?.message || e).slice(0, 220);
  }

  // 2. Can the server reach the database and do the tables exist?
  try {
    const db = getAdminClient?.();
    if (!db) report.database = 'service key missing or invalid';
    else {
      const tables: Record<string, string> = {};
      for (const t of ['listings', 'orders', 'services', 'service_requests']) {
        const { error } = await db.from(t).select('id', { head: true, count: 'exact' }).limit(1);
        tables[t] = error ? `problem: ${String(error.message).slice(0, 100)}` : 'ok';
      }
      report.database = tables;
    }
  } catch (e: any) {
    report.database = `unreachable: ${String(e?.message || e).slice(0, 100)}`;
  }

  // 3. Does Paystack accept the secret key?
  try {
    if (!sk) report.paystackKey = 'missing';
    else {
      const r = await fetch('https://api.paystack.co/bank?perPage=1', { headers: { Authorization: `Bearer ${sk}` } });
      report.paystackKey = r.ok ? 'accepted by Paystack' : `rejected by Paystack (HTTP ${r.status})`;
    }
  } catch {
    report.paystackKey = 'could not reach Paystack';
  }

  return res.status(200).json({ ...base, payments: report });
}
