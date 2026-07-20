import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { requireSupabaseServiceEnv } from "./serviceEnv";

/**
 * Privileged server-only client — bypasses RLS entirely via the service_role key.
 * Use only for trusted admin/pipeline writes that have already been authorized
 * by application logic (route auth, IP allowlist, etc). Never expose to the client.
 */
export function createSupabaseServiceRoleClient(): SupabaseClient {
  const { url, serviceRoleKey } = requireSupabaseServiceEnv();
  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
}
