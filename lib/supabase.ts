import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const supabaseKey = (
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)?.trim();

/**
 * True when the browser/build environment contains the required Supabase
 * public configuration. Both the newer Publishable Key and the legacy Anon
 * Key are supported.
 */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);

// Keep Next.js/Cloudflare prerendering alive even when deployment variables
// have not been configured yet. Real requests will still fail safely until
// the correct Cloudflare variables are added.
const safeUrl = supabaseUrl || "https://placeholder.supabase.co";
const safeKey = supabaseKey || "sb_publishable_placeholder";

export const supabase = createClient(safeUrl, safeKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export function getSupabaseConfigurationMessage(): string | null {
  if (!supabaseUrl) {
    return "Missing NEXT_PUBLIC_SUPABASE_URL.";
  }

  if (!supabaseKey) {
    return "Missing NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (or legacy NEXT_PUBLIC_SUPABASE_ANON_KEY).";
  }

  return null;
}
