import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null | undefined;

/**
 * Lazily creates the Supabase service-role client used by serverless
 * functions to write waitlist signups. Returns null when SUPABASE_URL /
 * SUPABASE_SERVICE_ROLE_KEY aren't configured, so callers can treat Supabase
 * persistence as best-effort rather than failing the request.
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (client !== undefined) {
    return client;
  }

  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    client = null;
    return client;
  }

  client = createClient(url, serviceRoleKey, {
    auth: { persistSession: false },
  });
  return client;
}
