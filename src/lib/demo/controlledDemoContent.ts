import type { PillarId } from "@/data/pillars";
import { contentKey } from "@/data/quests/content";
import { findQuestDefinition } from "@/data/quests/library";
import {
  CONTROLLED_DEMO_COMPANY_ID,
  CONTROLLED_DEMO_ENTRY_QUEST,
  CONTROLLED_DEMO_MODE
} from "@/lib/demo/controlledDemo";
import { isForcesHubSlug } from "@/lib/sec/forcesTopicSectionMap";
import { resolveForcesQuestSlug } from "@/lib/forces/forcesQuestRoutes";

/**
 * Maps any visible hub quest to stable NVIDIA curated content (fake breadth, controlled depth).
 */
export function resolveControlledDemoCanonicalSlug(
  pillarId: PillarId,
  questSlug: string
): string {
  const resolved =
    pillarId === "forces" ? resolveForcesQuestSlug(questSlug) : questSlug;

  if (pillarId === "business") return CONTROLLED_DEMO_ENTRY_QUEST.business;
  if (pillarId === "financials") return CONTROLLED_DEMO_ENTRY_QUEST.financials;
  if (pillarId === "management") return CONTROLLED_DEMO_ENTRY_QUEST.management;
  if (pillarId === "forces") {
    if (isForcesHubSlug(resolved)) return resolved;
    return CONTROLLED_DEMO_ENTRY_QUEST.forces;
  }
  return resolved;
}

export function resolveControlledDemoContentKey(
  pillarId: PillarId,
  questSlug: string
): string {
  return contentKey(
    pillarId,
    resolveControlledDemoCanonicalSlug(pillarId, questSlug)
  );
}

/** True when this slug is a real template quest on the island (not a blocked route). */
export function isControlledDemoHubQuestVisible(
  pillarId: PillarId,
  questSlug: string
): boolean {
  if (!CONTROLLED_DEMO_MODE) return true;
  return (
    findQuestDefinition(
      CONTROLLED_DEMO_COMPANY_ID,
      pillarId,
      questSlug
    ) != null
  );
}
