import { CONTROLLED_DEMO_MODE } from "@/lib/demo/controlledDemo";

/**
 * In-game demo controls (reset / investor jump).
 * Off in production unless explicitly enabled; on in dev when demo funnel is active.
 */
export function isDemoControlsEnabled(): boolean {
  if (process.env.NEXT_PUBLIC_DEMO_CONTROLS === "false") return false;
  if (process.env.NEXT_PUBLIC_DEMO_CONTROLS === "true") return true;
  if (process.env.NODE_ENV !== "production") return true;
  return CONTROLLED_DEMO_MODE;
}
