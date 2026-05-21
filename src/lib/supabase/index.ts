export { createSupabaseBrowserClient } from "./client";
export { updateSupabaseSession } from "./middleware";
export { getSupabaseEnv, isSupabaseConfigured, requireSupabaseEnv } from "./env";

/** Import `@/lib/supabase/server` directly in Server Components and route handlers only. */
