/**
 * In-game demo controls (reset / investor jump).
 * Off in production unless explicitly enabled via NEXT_PUBLIC_DEMO_CONTROLS=true;
 * on in dev. Previously fell back to CONTROLLED_DEMO_MODE in production, which
 * defaults to true — that let reset/jump-state buttons appear on general pages
 * (/map, /business) in production whenever the env var was left unset.
 */
export function isDemoControlsEnabled(): boolean {
  if (process.env.NEXT_PUBLIC_DEMO_CONTROLS === "false") return false;
  if (process.env.NEXT_PUBLIC_DEMO_CONTROLS === "true") return true;
  return process.env.NODE_ENV !== "production";
}
