import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
// Publishable key (sb_publishable_...). Older projects call it the "anon" key; both work the same way.
const publicKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;

/** True once the project URL and public key are set (.env.local / Vercel settings). */
export const isSupabaseConfigured = Boolean(url && publicKey);

// The session is kept in sessionStorage, like the demo session: it survives a reload
// and ends when the browser tab is closed, which suits shared computers.
const sessionStore = (() => {
  try {
    return typeof window !== 'undefined' ? window.sessionStorage : undefined;
  } catch {
    return undefined;
  }
})();

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url as string, publicKey as string, {
      auth: { persistSession: true, autoRefreshToken: true, storage: sessionStore },
    })
  : null;

/**
 * Staff sign in with their identifier. Supabase Auth works with e-mail addresses,
 * so each identifier maps to an internal address that is never used for mail.
 */
export const staffEmail = (staffId: string) =>
  `${staffId.trim().toLowerCase()}@staff.medsuite.local`;
