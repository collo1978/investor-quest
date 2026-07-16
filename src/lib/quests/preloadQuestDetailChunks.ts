/**
 * Warm quest detail JS chunks before navigation (hub card click / hover).
 * Safe to call repeatedly — dynamic import is cached by the bundler.
 * Failures (stale HMR / ChunkLoadError) are swallowed so startup prefetch
 * never takes down the page; the next call may retry.
 */
let preloaded = false;

function warmChunk(loader: () => Promise<unknown>): void {
  void loader().catch(() => {
    // Allow a later navigation/prefetch to try again after a rebuild.
    preloaded = false;
  });
}

export function preloadQuestDetailChunks(): void {
  if (preloaded) return;
  preloaded = true;
  warmChunk(() => import("@/components/QuestDetailScreen"));
  warmChunk(() => import("@/components/BusinessIslandQuestReading"));
}
