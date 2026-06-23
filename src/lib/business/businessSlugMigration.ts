/**
 * Business island v2 slugs (adaptive learning sections) and legacy mapping.
 */
export const BUSINESS_QUEST_SLUGS = [
  "what-they-do",
  "why-buying",
  "everyday-life",
  "how-it-works",
  "why-they-stay",
  "competition",
  "who-competes"
] as const;

export type BusinessQuestSlug = (typeof BUSINESS_QUEST_SLUGS)[number];

export const LEGACY_BUSINESS_SLUGS = [
  "snapshot",
  "revenue",
  "operations",
  "advantage",
  "industry"
] as const;

export type LegacyBusinessQuestSlug = (typeof LEGACY_BUSINESS_SLUGS)[number];

/** Legacy hub slug → new section slug (everyday-life has no legacy twin). */
export const BUSINESS_SLUG_FROM_LEGACY: Record<
  LegacyBusinessQuestSlug,
  BusinessQuestSlug
> = {
  snapshot: "what-they-do",
  revenue: "why-buying",
  operations: "how-it-works",
  advantage: "why-they-stay",
  industry: "competition"
};

export function isLegacyBusinessSlug(
  slug: string
): slug is LegacyBusinessQuestSlug {
  return (LEGACY_BUSINESS_SLUGS as readonly string[]).includes(slug);
}

export function isBusinessQuestSlug(slug: string): slug is BusinessQuestSlug {
  return (BUSINESS_QUEST_SLUGS as readonly string[]).includes(slug);
}

export function canonicalBusinessQuestSlug(slug: string): string {
  if (isLegacyBusinessSlug(slug)) return BUSINESS_SLUG_FROM_LEGACY[slug];
  return slug;
}

/** Migrate quest slug or composite read slug (`parent#card-1`). */
export function migrateBusinessProgressSlug(slug: string): string {
  const hash = slug.indexOf("#");
  if (hash === -1) return canonicalBusinessQuestSlug(slug);
  const base = slug.slice(0, hash);
  const rest = slug.slice(hash);
  return `${canonicalBusinessQuestSlug(base)}${rest}`;
}

function migrateSlugList(slugs: readonly string[]): string[] {
  return [...new Set(slugs.map(migrateBusinessProgressSlug))];
}

function migrateTimestampMap(
  map: Record<string, number>
): Record<string, number> {
  const out: Record<string, number> = {};
  for (const [slug, ts] of Object.entries(map)) {
    out[migrateBusinessProgressSlug(slug)] = Math.max(
      out[migrateBusinessProgressSlug(slug)] ?? 0,
      ts
    );
  }
  return out;
}

/** Remap legacy Business slugs in saved pillar + quest-work state. */
export function migrateBusinessIslandProgress<
  T extends {
    pillars: {
      business?: {
        readQuestSlugs: string[];
        completedQuestSlugs: string[];
        readAt: Record<string, number>;
        completedAt: Record<string, number>;
      };
    };
    questWork: Record<string, unknown>;
    activeQuestSlug?: string | null;
  }
>(progress: T): T {
  const business = progress.pillars.business;
  if (!business) return progress;

  const questWork: Record<string, unknown> = {};
  for (const [key, work] of Object.entries(progress.questWork)) {
    if (!key.startsWith("business:")) {
      questWork[key] = work;
      continue;
    }
    const slug = key.slice("business:".length);
    const nextKey = `business:${canonicalBusinessQuestSlug(slug)}`;
    questWork[nextKey] = work;
  }

  const activeSlug = progress.activeQuestSlug;
  const activeBase = activeSlug?.split("#")[0] ?? "";
  const migrateActive =
    activeSlug &&
    (isBusinessQuestSlug(activeBase) || isLegacyBusinessSlug(activeBase));

  return {
    ...progress,
    pillars: {
      ...progress.pillars,
      business: {
        ...business,
        readQuestSlugs: migrateSlugList(business.readQuestSlugs),
        completedQuestSlugs: migrateSlugList(business.completedQuestSlugs),
        readAt: migrateTimestampMap(business.readAt),
        completedAt: migrateTimestampMap(business.completedAt)
      }
    },
    questWork,
    activeQuestSlug: migrateActive
      ? migrateBusinessProgressSlug(activeSlug)
      : activeSlug
  };
}
