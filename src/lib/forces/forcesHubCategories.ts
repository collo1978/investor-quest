import type { ForcesCategoryId } from "@/data/quests/forcesCategories";

export type ForcesHubCategorySlot = {
  orderNumber: number;
  categoryId: ForcesCategoryId;
  defaultTitle: string;
  defaultSubtitle: string;
  hubSlug: string;
};

/** Hub map slots — order matches user layout (not FORCES_CATEGORY_META sort). */
export const FORCES_HUB_CATEGORY_SLOTS: readonly ForcesHubCategorySlot[] = [
  {
    orderNumber: 1,
    categoryId: "positive-inside",
    defaultTitle: "Positive Inside Forces",
    defaultSubtitle: "Strengths within the company's control",
    hubSlug: "forces-hub-positive-inside"
  },
  {
    orderNumber: 2,
    categoryId: "positive-outside",
    defaultTitle: "Positive Outside Forces",
    defaultSubtitle: "Tailwinds outside the company's control",
    hubSlug: "forces-hub-positive-outside"
  },
  {
    orderNumber: 3,
    categoryId: "negative-inside",
    defaultTitle: "Negative Inside Forces",
    defaultSubtitle: "Risks within the company's control",
    hubSlug: "forces-hub-negative-inside"
  },
  {
    orderNumber: 4,
    categoryId: "negative-outside",
    defaultTitle: "Negative Outside Forces",
    defaultSubtitle: "Headwinds outside the company's control",
    hubSlug: "forces-hub-negative-outside"
  }
] as const;

export function forcesCategoryPath(categoryId: ForcesCategoryId): string {
  return `/forces/category/${categoryId}`;
}

export function isForcesHubQuest(quest: {
  slug: string;
  displayOrder?: number | null;
}): boolean {
  if (quest.slug.startsWith("forces-hub-")) return true;
  const d = quest.displayOrder ?? 99;
  return d >= 1 && d <= 4;
}
