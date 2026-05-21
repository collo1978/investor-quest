import type { CompanyId } from "@/data/companies";
import type { PillarId } from "@/data/pillars";
import { getCompanyPillarQuests } from "@/data/quests/library";
import type { QuestDefinition } from "@/data/quests/types";
import { isForcesHubSlug } from "@/lib/sec/forcesTopicSectionMap";
import { pillarHasQuestPipeline } from "@/lib/quests/pillarQuestPipelineConfig";

/**
 * Quest slugs that would be playable when all template prerequisites are satisfied
 * (hub chain + unlockRequirements.questSlugs + forces prevSlug).
 * Excludes CMS force-locked hub entries (`hubLocked === true`).
 */
export function resolveUnlockedQuestSlugs(
  companyId: CompanyId,
  pillarId: PillarId
): Set<string> {
  const quests = getCompanyPillarQuests(companyId, pillarId).filter(
    (q) => !isForcesHubSlug(q.slug) && pillarHasQuestPipeline(pillarId)
  );

  const unlocked = new Set<string>();
  let changed = true;

  while (changed) {
    changed = false;
    for (const quest of quests) {
      if (unlocked.has(quest.slug)) continue;
      if (quest.hubLocked === true) continue;
      if (prerequisitesMet(quest, unlocked)) {
        unlocked.add(quest.slug);
        changed = true;
      }
    }
  }

  return unlocked;
}

function prerequisitesMet(
  quest: QuestDefinition,
  unlocked: Set<string>
): boolean {
  const req = quest.unlockRequirements;
  const slugs = req?.questSlugs ?? [];
  if (slugs.length > 0 && !slugs.every((s) => unlocked.has(s))) {
    return false;
  }
  if (slugs.length > 0) return true;
  if (req?.minLevel != null || req?.minXp != null) return true;
  return true;
}

/** First quest in each hub chain (no prior questSlugs) — “fresh player” set. */
export function resolveFreshPlayerQuestSlugs(
  companyId: CompanyId,
  pillarId: PillarId
): Set<string> {
  const quests = getCompanyPillarQuests(companyId, pillarId).filter(
    (q) => !isForcesHubSlug(q.slug) && pillarHasQuestPipeline(pillarId)
  );

  const out = new Set<string>();
  for (const quest of quests) {
    if (quest.hubLocked === true) continue;
    const slugs = quest.unlockRequirements?.questSlugs ?? [];
    if (slugs.length === 0) {
      out.add(quest.slug);
    }
  }
  return out;
}
