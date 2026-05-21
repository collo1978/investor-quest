/**
 * Data Layer — company content registry.
 *
 * Each company that has hand-authored or SEC-derived quest content
 * registers a `CompanyContent` blob here. The library merges these
 * over the company-agnostic templates at instantiation time.
 *
 * Companies without an entry use the template defaults verbatim
 * (typically renders the "awaiting SEC/AI content" placeholder).
 */
import { BUSINESS_AI_QUEST_SLUGS } from "@/app/business/businessQuestSlugs";
import { MANAGEMENT_AI_QUEST_SLUGS } from "@/app/management/managementQuestSlugs";
import { isForcesHubSlug } from "@/lib/sec/forcesTopicSectionMap";
import type { CompanyId } from "@/data/companies";
import { APPLE_CONTENT } from "@/data/quests/content/apple";
import type {
  CompanyContent,
  QuestContentOverride
} from "@/data/quests/content/types";

export type { CompanyContent, QuestContentOverride } from "@/data/quests/content/types";
export { contentKey } from "@/data/quests/content/types";

const REGISTRY: readonly CompanyContent[] = [APPLE_CONTENT];

export const COMPANY_CONTENT_BY_ID: Partial<Record<CompanyId, CompanyContent>> =
  Object.fromEntries(REGISTRY.map((c) => [c.companyId, c])) as Partial<
    Record<CompanyId, CompanyContent>
  >;

export function getQuestContentOverride(
  companyId: CompanyId,
  key: string
): QuestContentOverride | undefined {
  // Pillar answers from SEC → OpenAI → Supabase, not static files.
  if (key.startsWith("financials:")) {
    return undefined;
  }
  if (key.startsWith("business:")) {
    const slug = key.slice("business:".length);
    if ((BUSINESS_AI_QUEST_SLUGS as readonly string[]).includes(slug)) {
      return undefined;
    }
  }
  if (key.startsWith("management:")) {
    const slug = key.slice("management:".length);
    if ((MANAGEMENT_AI_QUEST_SLUGS as readonly string[]).includes(slug)) {
      return undefined;
    }
  }
  if (key.startsWith("forces:")) {
    const slug = key.slice("forces:".length);
    if (!isForcesHubSlug(slug)) {
      return undefined;
    }
  }
  return COMPANY_CONTENT_BY_ID[companyId]?.overrides[key];
}
