import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Service-role client: bypasses row level security.
// SERVER ONLY — never import this from a component or any file under pages/
// that ships to the browser.
//
// Built lazily so that `next build` succeeds without secrets present; the
// error only surfaces when a request actually needs the admin client.
let cached: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (cached) return cached;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY."
    );
  }

  cached = createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return cached;
}
