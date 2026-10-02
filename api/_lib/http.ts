// Shared HTTP helpers for serverless handlers (Vercel) and the local Express dev server.
const buckets = new Map<string, { n: number; reset: number }>();

/** Best-effort in-memory rate limit (per warm instance). Returns true if the call is allowed. */
export function rateLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || b.reset < now) {
    buckets.set(key, { n: 1, reset: now + windowMs });
    if (buckets.size > 5000) for (const [k, v] of buckets) if (v.reset < now) buckets.delete(k);
    return true;
  }
  b.n += 1;
  return b.n <= max;
}

export function clientIp(req: any): string {
  const xf = req.headers?.['x-forwarded-for'];
  return String(Array.isArray(xf) ? xf[0] : xf || req.socket?.remoteAddress || 'unknown').split(',')[0].trim();
}

export function getAppUrl(req: any): string {
  const env = (process.env.APP_URL || '').trim().replace(/\/+$/, '');
  if (/^https?:\/\/[^\s]+$/.test(env) && !env.includes('MY_APP_URL')) return env;
  const host = String(req.headers?.['x-forwarded-host'] || req.headers?.host || '').split(',')[0];
  if (!/^[a-zA-Z0-9.\-:]+$/.test(host)) return 'http://localhost:3000';
  const proto = host.startsWith('localhost') || host.startsWith('127.') ? 'http' : 'https';
  return `${proto}://${host}`;
}

export async function readRawBody(req: any): Promise<string> {
  if (typeof req.rawBody === 'string') return req.rawBody;
  if (Buffer.isBuffer(req.rawBody)) return req.rawBody.toString('utf8');
  if (Buffer.isBuffer(req.body)) return req.body.toString('utf8');
  return await new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (c: any) => { data += c; if (data.length > 1_000_000) reject(new Error('Body too large')); });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}
