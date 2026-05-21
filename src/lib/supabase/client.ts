import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

import { requireSupabaseEnv } from "./env";

let browserClient: SupabaseClient | undefined;

/** Browser Supabase client for Client Components. */
export function createSupabaseBrowserClient(): SupabaseClient {
  if (browserClient) return browserClient;

  const { url, anonKey } = requireSupabaseEnv();
  browserClient = createBrowserClient(url, anonKey);
  return browserClient;
}
