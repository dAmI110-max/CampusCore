import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Access environment variables safely with Vite and common hosting providers (Vercel, Netlify).
// IMPORTANT: the browser should only see anon/publishable values (VITE_ / NEXT_PUBLIC_).
// Never expose SUPABASE_SERVICE_ROLE_KEY to the frontend; keep it server-side only.
const metaEnv = ((import.meta as any).env || {}) as Record<string, string | undefined>;

const readClientEnv = (keys: string[]): string => {
  for (const key of keys) {
    const value = metaEnv[key]?.trim();
    if (value) return value;
  }

  if (typeof window !== 'undefined') {
    const injectedEnv = (window as any).__ENV || {};
    for (const key of keys) {
      const value = String(injectedEnv[key] ?? '').trim();
      if (value) return value;
    }
  }

  return '';
};

export const getSupabaseUrl = (): string => {
  return readClientEnv(['VITE_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_URL']);
};

export const getSupabaseAnonKey = (): string => {
  return readClientEnv([
    'VITE_SUPABASE_ANON_KEY',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'VITE_SUPABASE_KEY',
    'NEXT_PUBLIC_SUPABASE_KEY',
  ]);
};

export const isSupabaseConfigured = (): boolean => {
  const url = getSupabaseUrl();
  const key = getSupabaseAnonKey();
  return Boolean(
    url &&
    key &&
    url.startsWith('http') &&
    key.length > 20 &&
    !url.includes('placeholder') &&
    !key.includes('placeholder')
  );
};

export const isFrontendSupabaseServiceRoleExposed = (): boolean => {
  const keys = ['VITE_SUPABASE_SERVICE_ROLE_KEY', 'NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY', 'SUPABASE_SERVICE_ROLE_KEY'];
  for (const key of keys) {
    if (metaEnv[key] || (typeof window !== 'undefined' && (window as any).__ENV?.[key])) {
      return true;
    }
  }
  return false;
};

// Singleton Supabase client instance
let supabaseInstance: SupabaseClient | null = null;

export const getSupabase = (): SupabaseClient | null => {
  if (isFrontendSupabaseServiceRoleExposed()) {
    console.warn('Supabase service-role key detected in browser-exposed environment. This is a security risk and must remain server-side only.');
    return null;
  }

  if (!isSupabaseConfigured()) {
    return null;
  }
  if (!supabaseInstance) {
    const url = getSupabaseUrl();
    const key = getSupabaseAnonKey();
    supabaseInstance = createClient(url, key, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    });
  }
  return supabaseInstance;
};

// Export direct client or fallback
export const supabase = getSupabase();

/**
 * Upload an image (avatar, product photo, accommodation) to Supabase Storage.
 * Files are stored under the signed-in user's own folder (enforced by storage RLS).
 */
export async function uploadImageToSupabase(
  file: File | Blob,
  bucket: 'avatars' | 'listings' | 'accommodations' = 'listings',
  filePath?: string
): Promise<{ url: string | null; error: string | null }> {
  const client = getSupabase();
  if (!client) {
    return { url: null, error: 'Image storage is not configured' };
  }

  try {
    const { data: sess } = await client.auth.getSession();
    const uid = sess?.session?.user?.id;
    if (!uid) return { url: null, error: 'Your session has expired. Please log in again.' };

    const ext = (file.type.split('/')[1] || 'jpg').replace('jpeg', 'jpg').replace(/[^a-z0-9]/gi, '');
    const base = filePath ? filePath.split('/').pop()! : `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${ext}`;
    const fileName = `${uid}/${base.replace(/[^a-zA-Z0-9._-]/g, '_')}`;

    const { data, error: uploadError } = await client.storage
      .from(bucket)
      .upload(fileName, file, { cacheControl: '31536000', upsert: false, contentType: file.type || 'image/jpeg' });

    if (uploadError) {
      return { url: null, error: uploadError.message };
    }

    const { data: publicUrlData } = client.storage.from(bucket).getPublicUrl(data.path);
    return { url: publicUrlData.publicUrl, error: null };
  } catch (err: any) {
    return { url: null, error: err.message || 'Image upload failed' };
  }
}
