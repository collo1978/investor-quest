import "server-only";

import { getSupabaseEnv } from "./env";

/**
 * Server-only privileged key — bypasses RLS. Never prefix with NEXT_PUBLIC_
 * or read this from client code; the `server-only` import above throws a
 * build error if this module is ever pulled into a client bundle.
 */
function resolveServiceRoleKey(): string | undefined {
  return process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
}

export function isServiceRoleConfigured(): boolean {
  const { url, anonKey } = getSupabaseEnv();
  return Boolean(url && anonKey && resolveServiceRoleKey());
}

export function requireSupabaseServiceEnv(): { url: string; serviceRoleKey: string } {
  const { url } = getSupabaseEnv();
  const serviceRoleKey = resolveServiceRoleKey();
  if (!url || !serviceRoleKey) {
    throw new Error(
      "Supabase service role is not configured. Set SUPABASE_SERVICE_ROLE_KEY " +
        "(Supabase → Settings → API → service_role key) as a server-only env var " +
        "— never NEXT_PUBLIC_-prefixed."
    );
  }
  return { url: url.trim(), serviceRoleKey };
}
