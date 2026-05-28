import type {
  ProductCategoryGroup,
  ProductLineItem,
  ProductServiceReport
} from "@/lib/productService/types";

const WEARABLE_PRODUCT_KEYS = new Set([
  "apple_watch",
  "airpods",
  "airpods_pro",
  "watch",
  "wearables",
  "homepod"
]);

const ECOSYSTEM_CATEGORY_KEYS = new Set(["ecosystem"]);

function verifiedPercentLabels(report: ProductServiceReport): Set<string> {
  const labels = new Set<string>();
  for (const mix of report.revenueMix ?? []) {
    labels.add(mix.label.trim().toLowerCase());
  }
  for (const cat of report.categories) {
    for (const item of cat.items) {
      if (item.percent != null && item.percent > 0) {
        labels.add(item.label.trim().toLowerCase());
      }
    }
  }
  return labels;
}

function itemMayShowPercent(
  item: ProductLineItem,
  verified: Set<string>
): boolean {
  if (item.percent == null || item.percent <= 0) return false;
  if (item.revenueUsd != null && item.revenueUsd > 0) return true;
  return verified.has(item.label.trim().toLowerCase());
}

function mergeWearablesInGroup(group: ProductCategoryGroup): ProductCategoryGroup {
  const wearableItems = group.items.filter((i) =>
    WEARABLE_PRODUCT_KEYS.has(i.productKey.toLowerCase())
  );
  if (wearableItems.length < 2) return group;

  const rest = group.items.filter(
    (i) => !WEARABLE_PRODUCT_KEYS.has(i.productKey.toLowerCase())
  );

  const mixPercent = wearableItems.find((i) => i.percent != null)?.percent;
  const merged: ProductLineItem = {
    productKey: "wearables",
    label: "Wearables",
    category: group.categoryKey,
    tag: "Apple Watch, AirPods, and accessories",
    percent: mixPercent ?? null,
    recurring: wearableItems.some((i) => i.recurring)
  };

  return { ...group, items: [...rest, merged] };
}

function mergeMinorCategories(groups: ProductCategoryGroup[]): ProductCategoryGroup[] {
  return groups.map((g) => {
    if (g.items.length <= 5) return mergeWearablesInGroup(g);

    const primary = g.items.filter((i) => i.isPrimary || (i.percent ?? 0) >= 5);
    const minor = g.items.filter((i) => !i.isPrimary && (i.percent ?? 0) < 5);

    if (minor.length < 2) return mergeWearablesInGroup(g);

    const merged: ProductLineItem = {
      productKey: `${g.categoryKey}_other`,
      label: "Other",
      category: g.categoryKey,
      tag: minor.map((i) => i.label).slice(0, 4).join(", ")
    };

    return mergeWearablesInGroup({
      ...g,
      items: [...primary, merged]
    });
  });
}

function applyRevenueMixToItems(
  groups: ProductCategoryGroup[],
  revenueMix: { label: string; percent: number }[]
): ProductCategoryGroup[] {
  const byLabel = new Map(
    revenueMix.map((m) => [m.label.trim().toLowerCase(), m.percent])
  );
  return groups.map((g) => ({
    ...g,
    items: g.items.map((item) => {
      const fromMix = byLabel.get(item.label.trim().toLowerCase());
      if (fromMix != null) {
        return { ...item, percent: fromMix };
      }
      return item;
    })
  }));
}

function stripItemPercents(
  groups: ProductCategoryGroup[],
  verified: Set<string>
): ProductCategoryGroup[] {
  return groups.map((g) => ({
    ...g,
    items: g.items.map((item) => {
      if (!itemMayShowPercent(item, verified)) {
        const { percent: _p, ...rest } = item;
        return rest;
      }
      return item;
    })
  }));
}

export function normalizeProductServiceReport(
  report: ProductServiceReport
): ProductServiceReport {
  const verified = verifiedPercentLabels(report);

  const categories = mergeMinorCategories(
    report.categories
      .filter((c) => !ECOSYSTEM_CATEGORY_KEYS.has(c.categoryKey))
      .filter((c) => c.items.length > 0)
  );

  const revenueMix = (report.revenueMix ?? []).filter(
    (m) => m.percent > 0 && Number.isFinite(m.percent)
  );

  const categoriesWithMix = applyRevenueMixToItems(categories, revenueMix);

  return {
    ...report,
    headline: report.headline?.trim() || null,
    revenueMix: revenueMix.length > 0 ? revenueMix : undefined,
    categories: stripItemPercents(categoriesWithMix, verified),
    investorInsight: null,
    howToReadThis: null
  };
}
