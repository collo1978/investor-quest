import { loadState } from "@/engine/progression/persistence";
import { initialState, type GameState } from "@/engine/progression/state";

const LOG_PREFIX = "[quest-progress]";
const DEBUG_LOG_MIN_INTERVAL_MS = 1000;
const lastDebugLogAt = new Map<string, number>();

/** `?questProgressDebug=1` or `localStorage.setItem('iq-quest-progress-debug','1')` */
export function isQuestProgressDebugEnabled(): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (window.localStorage.getItem("iq-quest-progress-debug") === "1") {
      return true;
    }
    return new URLSearchParams(window.location.search).get("questProgressDebug") === "1";
  } catch {
    return false;
  }
}

export function logQuestProgress(
  event: string,
  detail?: Record<string, unknown>
): void {
  if (!isQuestProgressDebugEnabled()) return;
  const now = Date.now();
  const lastLoggedAt = lastDebugLogAt.get(event) ?? 0;
  if (now - lastLoggedAt < DEBUG_LOG_MIN_INTERVAL_MS) return;
  lastDebugLogAt.set(event, now);

  if (detail) {
    console.info(LOG_PREFIX, event, detail);
  } else {
    console.info(LOG_PREFIX, event);
  }
}

/** Synchronous client load — use in `useLayoutEffect` after hydration, not in `useState`. */
export function readClientGameState(): GameState {
  if (typeof window === "undefined") return initialState();
  try {
    return loadState();
  } catch (err) {
    logQuestProgress("load.sync.error", {
      message: err instanceof Error ? err.message : String(err)
    });
    return initialState();
  }
}

export function summarizeReadProgress(state: GameState): Record<string, unknown> {
  const companyId = state.activeCompanyId;
  const prog = state.companies[companyId];
  if (!prog) return { companyId, pillars: {} };

  const pillars: Record<string, { read: number; completed: number }> = {};
  for (const [pid, ps] of Object.entries(prog.pillars)) {
    pillars[pid] = {
      read: ps.readQuestSlugs.length,
      completed: ps.completedQuestSlugs.length
    };
  }
  return { companyId, pillars };
}
