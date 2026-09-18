import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Access environment variables safely with Vite and common hosting providers (Vercel, Netlify)
const metaEnv = ((import.meta as any).env || {}) as Record<string, string | undefined>;

export const getSupabaseUrl = (): string => {
  return (
    metaEnv.VITE_SUPABASE_URL ||
    metaEnv.SUPABASE_URL ||
    metaEnv.NEXT_PUBLIC_SUPABASE_URL ||
    (typeof window !== 'undefined' && (window as any).__ENV__?.VITE_SUPABASE_URL) ||
    ''
  ).trim();
};

export const getSupabaseAnonKey = (): string => {
  return (
    metaEnv.VITE_SUPABASE_ANON_KEY ||
    metaEnv.VITE_SUPABASE_KEY ||
    metaEnv.SUPABASE_ANON_KEY ||
    metaEnv.SUPABASE_KEY ||
    metaEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    metaEnv.NEXT_PUBLIC_SUPABASE_KEY ||
    (typeof window !== 'undefined' && (window as any).__ENV__?.VITE_SUPABASE_ANON_KEY) ||
    ''
  ).trim();
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

// Singleton Supabase client instance
let supabaseInstance: SupabaseClient | null = null;

export const getSupabase = (): SupabaseClient | null => {
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
 * Upload an image (avatar, product photo, accommodation) to Supabase Storage
 */
export async function uploadImageToSupabase(
  file: File | Blob,
  bucket: 'avatars' | 'listings' | 'accommodations' = 'listings',
  filePath?: string
): Promise<{ url: string | null; error: string | null }> {
  const client = getSupabase();
  if (!client) {
    return { url: null, error: 'Supabase storage is not configured' };
  }

  try {
    const ext = file.type.split('/')[1] || 'jpg';
    const fileName = filePath || `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${ext}`;

    const { data, error: uploadError } = await client.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) {
      return { url: null, error: uploadError.message };
    }

    const { data: publicUrlData } = client.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return { url: publicUrlData.publicUrl, error: null };
  } catch (err: any) {
    return { url: null, error: err.message || 'Image upload failed' };
  }
}
