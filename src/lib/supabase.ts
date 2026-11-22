import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/** True once the project URL and public key are set (.env.local / Vercel settings). */
export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url as string, anonKey as string, {
      auth: { persistSession: true, autoRefreshToken: true },
    })
  : null;

/**
 * Staff sign in with their identifier. Supabase Auth works with e-mail addresses,
 * so each identifier maps to an internal address that is never used for mail.
 */
export const staffEmail = (staffId: string) =>
  `${staffId.trim().toLowerCase()}@staff.medsuite.local`;
