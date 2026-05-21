const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

const PLACEHOLDER_URL_FRAGMENTS = ["your-project", "YOUR_PROJECT_REF"];

export function getSupabaseEnv() {
  return { url, anonKey };
}

export function isSupabaseConfigured(): boolean {
  const trimmedUrl = url?.trim();
  if (!trimmedUrl || !anonKey?.trim()) return false;
  if (PLACEHOLDER_URL_FRAGMENTS.some((f) => trimmedUrl.includes(f))) return false;
  return trimmedUrl.startsWith("https://") && trimmedUrl.includes(".supabase.co");
}

export function requireSupabaseEnv(): { url: string; anonKey: string } {
  if (!isSupabaseConfigured()) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local."
    );
  }
  return { url: url!.trim(), anonKey: anonKey!.trim() };
}
