import type { QuestCardSpec } from "@/lib/sec/questCardSpec";

export function filterQuestCardSpecs(
  specs: QuestCardSpec[],
  opts?: { questSlug?: string; cardIds?: string[] }
): QuestCardSpec[] {
  let out = specs;
  if (opts?.questSlug) {
    out = out.filter((s) => s.questSlug === opts.questSlug);
  }
  if (opts?.cardIds?.length) {
    const allowed = new Set(opts.cardIds);
    out = out.filter((s) => allowed.has(s.cardId));
  }
  return out;
}
