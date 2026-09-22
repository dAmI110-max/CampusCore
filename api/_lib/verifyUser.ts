import { createClient } from '@supabase/supabase-js';

/**
 * Verifies the Supabase access token sent by the client in the
 * `Authorization: Bearer <token>` header. Returns the authenticated user,
 * or null if the request has no valid session.
 *
 * This is the server-side enforcement point: without it, any of these
 * API routes can be called directly (bypassing the UI entirely) by anyone
 * on the internet, with no rate limit and no cost control.
 */
export async function verifyUser(req: { headers: Record<string, string | string[] | undefined> }) {
  const authHeader = req.headers['authorization'] || req.headers['Authorization' as any];
  const headerValue = Array.isArray(authHeader) ? authHeader[0] : authHeader;

  if (!headerValue || !headerValue.startsWith('Bearer ')) {
    return null;
  }

  const token = headerValue.slice('Bearer '.length).trim();
  if (!token) return null;

  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

  if (!url || !anonKey) {
    console.error('verifyUser: Supabase server env vars are not configured.');
    return null;
  }

  try {
    const supabase = createClient(url, anonKey);
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data?.user) return null;
    return data.user;
  } catch (err) {
    console.error('verifyUser: token verification failed', err);
    return null;
  }
}
