/**
 * Warm quest detail JS chunks before navigation (hub card click / hover).
 * Safe to call repeatedly — dynamic import is cached by the bundler.
 */
let preloaded = false;

export function preloadQuestDetailChunks(): void {
  if (preloaded) return;
  preloaded = true;
  void import("@/components/QuestDetailScreen");
  void import("@/components/BusinessIslandQuestReading");
}
