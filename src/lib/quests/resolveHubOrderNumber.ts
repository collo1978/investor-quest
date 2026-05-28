import type { QuestDefinition } from "@/data/quests/types";

/**
 * Map `display_order` from Supabase (often 10, 20, … or 1–6) to hub slot 1–6.
 */
export function resolveHubOrderNumber(
  displayOrder: number | null | undefined,
  slug: string,
  slugFallbackOrder: Readonly<Record<string, number>>
): number {
  const maxSlot = Math.max(0, ...Object.values(slugFallbackOrder));
  const cap = maxSlot > 0 ? maxSlot : 6;
  const d = displayOrder ?? 0;
  if (d >= 1 && d <= cap) return d;
  if (d > cap) return Math.min(cap, Math.max(1, Math.round(d / 10)));
  return slugFallbackOrder[slug] ?? 0;
}

/**
 * Assign hub map slots (1–6 for Business). Canonical slugs from `slugFallbackOrder` always
 * keep their slot so completed quests never vanish when CMS adds extra rows.
 */
export function assignHubSlotQuests(
  quests: readonly QuestDefinition[],
  slugFallbackOrder: Readonly<Record<string, number>>
): { quest: QuestDefinition; orderNumber: number }[] {
  const maxSlot = Math.max(0, ...Object.values(slugFallbackOrder));
  const questBySlug = new Map(quests.map((q) => [q.slug, q]));
  const claimed = new Set<string>();
  const assigned: { quest: QuestDefinition; orderNumber: number }[] = [];

  const canonical = Object.entries(slugFallbackOrder).sort(
    ([, a], [, b]) => a - b
  );
  for (const [slug, orderNumber] of canonical) {
    const quest = questBySlug.get(slug);
    if (!quest) continue;
    assigned.push({ quest, orderNumber });
    claimed.add(slug);
  }

  const openSlots: number[] = [];
  for (let s = 1; s <= maxSlot; s++) {
    if (!assigned.some((a) => a.orderNumber === s)) openSlots.push(s);
  }

  const remaining = [...quests]
    .filter((q) => !claimed.has(q.slug))
    .sort(
      (a, b) =>
        resolveHubOrderNumber(a.displayOrder, a.slug, slugFallbackOrder) -
          resolveHubOrderNumber(b.displayOrder, b.slug, slugFallbackOrder) ||
        a.title.localeCompare(b.title)
    );

  for (const quest of remaining) {
    const slot = openSlots.shift();
    if (slot == null) break;
    assigned.push({ quest, orderNumber: slot });
    claimed.add(quest.slug);
  }

  return assigned.sort((a, b) => a.orderNumber - b.orderNumber);
}
