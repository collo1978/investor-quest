import type { QuestTemplate } from "@/data/quests/types";

/** Four FORCES quest groupings on the island map. */
export type ForcesCategoryId =
  | "positive-inside"
  | "negative-inside"
  | "positive-outside"
  | "negative-outside";

export const FORCES_CATEGORY_IDS: readonly ForcesCategoryId[] = [
  "positive-inside",
  "negative-inside",
  "positive-outside",
  "negative-outside"
] as const;

export function isForcesCategoryId(value: string): value is ForcesCategoryId {
  return (FORCES_CATEGORY_IDS as readonly string[]).includes(value);
}

export type ForcesCategoryMeta = {
  id: ForcesCategoryId;
  title: string;
  subtitle: string;
  /** Sort key for island / admin grouping. */
  order: number;
};

export const FORCES_CATEGORY_META: readonly ForcesCategoryMeta[] = [
  {
    id: "positive-inside",
    title: "Positive — Inside",
    subtitle: "Within the company's control",
    order: 1
  },
  {
    id: "negative-inside",
    title: "Negative — Inside",
    subtitle: "Within the company's control",
    order: 2
  },
  {
    id: "positive-outside",
    title: "Positive — Outside",
    subtitle: "Outside the company's control",
    order: 3
  },
  {
    id: "negative-outside",
    title: "Negative — Outside",
    subtitle: "Outside the company's control",
    order: 4
  }
] as const;

const CATEGORY_ORDER: Record<ForcesCategoryId, number> = {
  "positive-inside": 1,
  "negative-inside": 2,
  "positive-outside": 3,
  "negative-outside": 4
};

export function forcesCategoryMeta(
  id: ForcesCategoryId
): ForcesCategoryMeta {
  return (
    FORCES_CATEGORY_META.find((c) => c.id === id) ??
    FORCES_CATEGORY_META[0]
  );
}

/** Island hotspot targets — four quadrants on the forces artwork. */
export const FORCES_CATEGORY_HOTSPOTS: ReadonlyArray<{
  categoryId: ForcesCategoryId;
  box: { l: number; t: number; w: number; h: number };
}> = [
  {
    categoryId: "positive-inside",
    box: { l: 0.04, t: 0.14, w: 0.44, h: 0.36 }
  },
  {
    categoryId: "negative-inside",
    box: { l: 0.52, t: 0.14, w: 0.44, h: 0.36 }
  },
  {
    categoryId: "positive-outside",
    box: { l: 0.04, t: 0.52, w: 0.44, h: 0.36 }
  },
  {
    categoryId: "negative-outside",
    box: { l: 0.52, t: 0.52, w: 0.44, h: 0.36 }
  }
];

export function sortForcesQuestTemplates(
  templates: readonly QuestTemplate[]
): QuestTemplate[] {
  return [...templates].sort((a, b) => {
    const ca = a.forcesCategory
      ? (CATEGORY_ORDER[a.forcesCategory] ?? 99)
      : 99;
    const cb = b.forcesCategory
      ? (CATEGORY_ORDER[b.forcesCategory] ?? 99)
      : 99;
    if (ca !== cb) return ca - cb;
    return (a.displayOrder ?? 0) - (b.displayOrder ?? 0);
  });
}

export function getForcesQuestsInCategory(
  templates: readonly QuestTemplate[],
  categoryId: ForcesCategoryId
): QuestTemplate[] {
  return sortForcesQuestTemplates(
    templates.filter(
      (t) =>
        t.forcesCategory === categoryId &&
        !t.slug.startsWith("forces-hub-")
    )
  );
}
