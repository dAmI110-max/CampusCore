import { createClient, SupabaseClient } from '@supabase/supabase-js';

let admin: SupabaseClient | null = null;

/** Service-role client. SERVER ONLY – bypasses RLS. Never import from src/. */
export function getAdminClient(): SupabaseClient | null {
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || '';
  if (!url || !key || key.length < 20) return null;
  if (!admin) admin = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
  return admin;
}

export async function isAdminUser(db: SupabaseClient, userId: string): Promise<boolean> {
  const { data } = await db.from('profiles').select('role,account_status').eq('id', userId).maybeSingle();
  return !!data && data.account_status === 'active' && (data.role === 'ADMIN' || data.role === 'SUPER_ADMIN');
}
