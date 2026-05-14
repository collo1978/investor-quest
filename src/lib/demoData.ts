/**
 * Legacy compatibility shim.
 *
 * The canonical data layer lives under `@/data/*`. Existing pages that
 * import from `@/lib/demoData` continue to work by going through this
 * thin adapter, which:
 *
 *   - Re-exports the new types from the data layer.
 *   - Provides a legacy `Quest` / `Pillar` shape derived from the new
 *     `QuestDefinition` (slug → id, description → prompt, rewardXp → xp).
 *   - Exposes `PILLARS` as a snapshot for the default company so callers
 *     that don't yet know about company-scoped quests keep rendering.
 *
 * New code should import directly from `@/data/*` and `@/engine`.
 */

import {
  COMPANIES,
  companyById,
  DEFAULT_COMPANY_ID,
  isCompanyId,
  type Company,
  type CompanyId
} from "@/data/companies";
import {
  PILLAR_META,
  PILLAR_ORDER,
  nextPillarId,
  pillarById,
  type PillarId,
  type PillarMeta
} from "@/data/pillars";
import { getCompanyPillarQuests } from "@/data/quests/library";
import {
  artifactLabel,
  type QuestDefinition
} from "@/data/quests/types";

export type { PillarId, PillarMeta, Company, CompanyId };
export {
  COMPANIES,
  companyById,
  DEFAULT_COMPANY_ID,
  isCompanyId,
  PILLAR_META,
  PILLAR_ORDER,
  pillarById,
  nextPillarId
};

/** Legacy quest shape used by older pages. New code should use `QuestDefinition`. */
export type Quest = {
  /** Slug (per-pillar) — preserved from the legacy shape. */
  id: string;
  title: string;
  prompt: string;
  artifact: string;
  xp: number;
};

export type Pillar = {
  id: PillarId;
  title: string;
  subtitle: string;
  quests: Quest[];
};

export function toLegacyQuest(q: QuestDefinition): Quest {
  return {
    id: q.slug,
    title: q.title,
    prompt: q.description,
    artifact: artifactLabel(q.artifactType),
    xp: q.rewardXp
  };
}

/** Default company snapshot (legacy). New code should call `getCompanyPillarQuests`. */
export const PILLARS: Pillar[] = PILLAR_META.map((meta) => ({
  id: meta.id,
  title: meta.title,
  subtitle: meta.subtitle,
  quests: getCompanyPillarQuests(DEFAULT_COMPANY_ID, meta.id).map(toLegacyQuest)
}));
