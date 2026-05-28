/**
 * Data Layer, company content registry.
 *
 * Hand-authored overrides merge over templates at instantiation time.
 * DB-generated answers only fill gaps (see mergeGeneratedQuestContent).
 */
import type { CompanyId } from "@/data/companies";
import { APPLE_CONTENT } from "@/data/quests/content/apple";
import { NVIDIA_CONTENT } from "@/data/quests/content/nvidia";
import { NIKE_CONTENT } from "@/data/quests/content/nike";
import {
  CONTROLLED_DEMO_COMPANY_ID,
  CONTROLLED_DEMO_MODE
} from "@/lib/demo/controlledDemo";
import { resolveControlledDemoContentKey } from "@/lib/demo/controlledDemoContent";
import { mergeNvidiaDemoQuestOverride } from "@/lib/demo/nvidiaDemoVoice";
import type {
  CompanyContent,
  QuestContentOverride
} from "@/data/quests/content/types";
import type { PillarId } from "@/data/pillars";

export type { CompanyContent, QuestContentOverride } from "@/data/quests/content/types";
export { contentKey } from "@/data/quests/content/types";

const REGISTRY: readonly CompanyContent[] = [
  APPLE_CONTENT,
  NVIDIA_CONTENT,
  NIKE_CONTENT
];

export const COMPANY_CONTENT_BY_ID: Partial<Record<CompanyId, CompanyContent>> =
  Object.fromEntries(REGISTRY.map((c) => [c.companyId, c])) as Partial<
    Record<CompanyId, CompanyContent>
  >;

function resolveRawQuestOverride(
  companyId: CompanyId,
  key: string
): QuestContentOverride | undefined {
  const overrides = COMPANY_CONTENT_BY_ID[companyId]?.overrides;
  const direct = overrides?.[key];
  if (direct) return direct;

  if (
    CONTROLLED_DEMO_MODE &&
    companyId === CONTROLLED_DEMO_COMPANY_ID &&
    overrides
  ) {
    const sep = key.indexOf(":");
    if (sep > 0) {
      const pillarId = key.slice(0, sep) as PillarId;
      const slug = key.slice(sep + 1);
      const canonicalKey = resolveControlledDemoContentKey(pillarId, slug);
      if (canonicalKey !== key) {
        return overrides[canonicalKey];
      }
    }
  }

  return undefined;
}

export function getQuestContentOverride(
  companyId: CompanyId,
  key: string
): QuestContentOverride | undefined {
  const sep = key.indexOf(":");
  const pillarId = sep > 0 ? (key.slice(0, sep) as PillarId) : null;
  const slug = sep > 0 ? key.slice(sep + 1) : "";
  const raw = resolveRawQuestOverride(companyId, key);
  if (
    companyId === CONTROLLED_DEMO_COMPANY_ID &&
    pillarId &&
    slug
  ) {
    return mergeNvidiaDemoQuestOverride(pillarId, slug, raw);
  }
  return raw;
}