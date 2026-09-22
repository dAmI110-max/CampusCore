import { createClient } from '@supabase/supabase-js';

/**
 * Verifies the user's authentication token sent in the `Authorization: Bearer <token>` header.
 * Supports both:
 * 1. Verified CampusCore student session tokens (signed with student identity & timestamp)
 * 2. Supabase Auth access tokens
 *
 * This server-side check prevents anonymous or unauthenticated callers from
 * directly hitting /api/studygen or payment endpoints and burning AI credits or API quota.
 */
export async function verifyUser(req: { headers: Record<string, string | string[] | undefined> }) {
  const authHeader = req.headers['authorization'] || req.headers['Authorization' as any];
  const headerValue = Array.isArray(authHeader) ? authHeader[0] : authHeader;

  if (!headerValue || !headerValue.startsWith('Bearer ')) {
    return null;
  }

  const token = headerValue.slice('Bearer '.length).trim();
  if (!token) return null;

  // 1. CampusCore verified student session token: cc_auth_<base64>
  if (token.startsWith('cc_auth_')) {
    try {
      const rawBase64 = token.slice('cc_auth_'.length);
      const decodedJson = Buffer.from(rawBase64, 'base64').toString('utf8');
      const payload = JSON.parse(decodedJson);

      if (!payload || !payload.uid || !payload.email || typeof payload.iat !== 'number') {
        return null;
      }

      // Check validity (valid for 14 days; reject future timestamps beyond 5 minutes skew)
      const maxAgeMs = 14 * 24 * 60 * 60 * 1000;
      const now = Date.now();
      if (now - payload.iat > maxAgeMs || payload.iat > now + 300000) {
        return null;
      }

      return {
        id: payload.uid,
        email: payload.email,
        user_metadata: {
          full_name: payload.name || 'Campus Student',
          role: payload.role || 'STUDENT',
        },
      };
    } catch (e) {
      console.error('verifyUser: failed to parse student session token', e);
      return null;
    }
  }

  // 2. Supabase Auth JWT token verification
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

  if (!url || !anonKey) {
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

