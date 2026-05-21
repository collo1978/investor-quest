/**
 * Quest generation speed / quality tradeoffs (server).
 * Enable fast iteration: QUEST_FAST_DEV=true in .env.local
 * Client poll tuning: NEXT_PUBLIC_QUEST_FAST_DEV=true
 */

export type QuestGenerationOptions = {
  /** Skip cards that already have answers in DB. */
  forceRegenerate?: boolean;
  /** Local dev: shorter prompts, no jargon rewrites, accept best-effort. */
  fastMode?: boolean;
  maxJargonRewrites?: number;
  /** Save answer even if jargon gate fails (after rewrites / timeout). */
  acceptJargonOnFail?: boolean;
  finalizeTimeoutMs?: number;
};

function envFlag(name: string): boolean {
  const v = process.env[name]?.trim().toLowerCase();
  return v === "1" || v === "true" || v === "yes";
}

export function isServerFastQuestMode(): boolean {
  return envFlag("QUEST_FAST_DEV");
}

export function resolveQuestGenerationOptions(
  overrides?: Partial<QuestGenerationOptions>
): QuestGenerationOptions {
  const fastMode = overrides?.fastMode ?? isServerFastQuestMode();

  return {
    forceRegenerate: overrides?.forceRegenerate ?? false,
    fastMode,
    maxJargonRewrites:
      overrides?.maxJargonRewrites ?? (fastMode ? 0 : 1),
    acceptJargonOnFail:
      overrides?.acceptJargonOnFail ?? fastMode,
    finalizeTimeoutMs:
      overrides?.finalizeTimeoutMs ?? (fastMode ? 10_000 : 35_000)
  };
}

/** Condensed rules appended to system prompt in fast mode. */
export const QUEST_FAST_DEV_SYSTEM_APPEND = `
FAST DEV MODE (speed over polish):
- Max 3 short sentences before "Why investors care:" (skip sentence 4).
- One everyday hook, one analogy, one plain "what they help do" line.
- Zero technical terms (no GPU, platform, infrastructure, semiconductor).
- Facts from excerpts only.`;
