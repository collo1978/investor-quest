/** Resolved Supabase URL (client + server). Supports common Vercel naming mistakes. */
function resolveSupabaseUrl(): string | undefined {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_URL ??
    process.env.SUPABASE_URL ??
    process.env.NEXT_PUBLIC_SUPABASE_PROJECT_URL
  )?.trim();
}

/** Resolved anon/publishable key (never use service_role here). */
function resolveSupabaseAnonKey(): string | undefined {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.SUPABASE_ANON_KEY ??
    process.env.SUPABASE_PUBLISHABLE_KEY
  )?.trim();
}

const url = resolveSupabaseUrl();
const anonKey = resolveSupabaseAnonKey();

const PLACEHOLDER_URL_FRAGMENTS = ["your-project", "YOUR_PROJECT_REF"];

export type SupabaseEnvDiagnostics = {
  configured: boolean;
  urlHost: string | null;
  hasNextPublicUrl: boolean;
  hasServerUrl: boolean;
  hasNextPublicAnonKey: boolean;
  hasPublishableKey: boolean;
  hasServerAnonKey: boolean;
  urlLooksValid: boolean;
  hint: string;
};

export function getSupabaseEnvDiagnostics(): SupabaseEnvDiagnostics {
  const resolvedUrl = resolveSupabaseUrl();
  const resolvedKey = resolveSupabaseAnonKey();
  const trimmedUrl = resolvedUrl ?? "";
  const urlLooksValid =
    Boolean(trimmedUrl) &&
    !PLACEHOLDER_URL_FRAGMENTS.some((f) => trimmedUrl.includes(f)) &&
    trimmedUrl.startsWith("https://") &&
    (trimmedUrl.includes(".supabase.co") || trimmedUrl.includes("supabase.com"));

  let urlHost: string | null = null;
  try {
    if (trimmedUrl) urlHost = new URL(trimmedUrl).host;
  } catch {
    urlHost = null;
  }

  const configured = Boolean(trimmedUrl && resolvedKey && urlLooksValid);

  let hint = "Supabase env looks good.";
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.SUPABASE_URL) {
    hint =
      "Missing NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL) on Vercel → Settings → Environment Variables.";
  } else if (
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY &&
    !process.env.SUPABASE_ANON_KEY
  ) {
    hint =
      "Missing NEXT_PUBLIC_SUPABASE_ANON_KEY (or publishable/anon key) on Vercel. Use the anon/public key from Supabase → Settings → API.";
  } else if (!urlLooksValid) {
    hint = "SUPABASE_URL is set but does not look like a valid https://….supabase.co project URL.";
  } else if (trimmedUrl && !resolvedKey) {
    hint = "SUPABASE_URL is set but the anon key is missing.";
  } else if (!trimmedUrl && resolvedKey) {
    hint = "Anon key is set but SUPABASE_URL is missing.";
  }

  return {
    configured,
    urlHost,
    hasNextPublicUrl: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()),
    hasServerUrl: Boolean(process.env.SUPABASE_URL?.trim()),
    hasNextPublicAnonKey: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()),
    hasPublishableKey: Boolean(
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim()
    ),
    hasServerAnonKey: Boolean(process.env.SUPABASE_ANON_KEY?.trim()),
    urlLooksValid,
    hint
  };
}

export function getSupabaseEnv() {
  return { url, anonKey };
}

export function isSupabaseConfigured(): boolean {
  return getSupabaseEnvDiagnostics().configured;
}

export function requireSupabaseEnv(): { url: string; anonKey: string } {
  if (!isSupabaseConfigured()) {
    const d = getSupabaseEnvDiagnostics();
    throw new Error(
      d.hint ||
        "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }
  return { url: url!.trim(), anonKey: anonKey!.trim() };
}
