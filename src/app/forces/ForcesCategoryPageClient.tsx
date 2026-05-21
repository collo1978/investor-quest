"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";
import { useGame } from "@/components/GameProvider";
import { FORCES_ISLAND, FORCES_ISLAND_TW } from "@/components/quest/forcesIslandColors";
import {
  forcesCategoryMeta,
  getForcesQuestsInCategory,
  type ForcesCategoryId
} from "@/data/quests/forcesCategories";
import { pillarById } from "@/data/pillars";
import { getPillarReadingProgress } from "@/engine";
import { getPillarQuestTemplates } from "@/platform/quests/questContentRegistry";

type Props = {
  categoryId: ForcesCategoryId;
};

export default function ForcesCategoryPageClient({ categoryId }: Props) {
  const { state, raw, actions } = useGame();
  const meta = forcesCategoryMeta(categoryId);
  const pillar = pillarById("forces");

  useEffect(() => {
    actions.setActivePillar("forces");
  }, [actions]);

  const templates = useMemo(
    () => getForcesQuestsInCategory(getPillarQuestTemplates("forces"), categoryId),
    [categoryId]
  );

  const readSet = useMemo(
    () => new Set(state.pillars.forces.readQuestSlugs),
    [state.pillars.forces.readQuestSlugs]
  );

  const categoryRead = templates.filter((t) => readSet.has(t.slug)).length;
  const pillarReading = getPillarReadingProgress(raw, "forces");

  return (
    <main className="pointer-events-auto relative mx-auto w-full max-w-3xl px-4 pb-24 pt-6 md:px-6 md:pt-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/forces"
          className={[
            "inline-flex items-center gap-2 rounded-xl border bg-[rgba(7,7,18,0.72)] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-0 shadow-glow backdrop-blur-md transition hover:bg-[rgba(7,7,18,0.88)]",
            FORCES_ISLAND_TW.backBorder,
            FORCES_ISLAND_TW.backBorderHover
          ].join(" ")}
        >
          <span aria-hidden className="text-red-300">
            ←
          </span>
          Back to Forces island
        </Link>

        <div className="text-right text-[10px] uppercase tracking-[0.18em] text-ink-2">
          Island · {pillarReading.read}/{pillarReading.total} read
        </div>
      </div>

      <header className="mt-8 text-center">
        <p
          className="text-[10px] font-bold uppercase tracking-[0.28em]"
          style={{ color: FORCES_ISLAND.hi }}
        >
          {meta.title}
        </p>
        <p className="mt-2 text-[13px] text-ink-2">{meta.subtitle}</p>
        <p className="mt-3 font-[var(--font-grotesk)] text-2xl text-ink-0 md:text-3xl">
          {pillar.title} · Topic deck
        </p>
        <p className="mt-2 text-sm text-ink-1">
          {categoryRead} of {templates.length} topics marked read in this category.
        </p>
      </header>

      <ul className="mt-8 space-y-3">
        {templates.map((quest, index) => {
          const read = readSet.has(quest.slug);
          return (
            <li key={quest.slug}>
              <Link
                href={`/forces/${quest.slug}`}
                prefetch
                className={[
                  "group block rounded-2xl border px-4 py-4 transition hover:brightness-110",
                  read
                    ? "border-emerald-400/35 bg-emerald-500/[0.06]"
                    : "border-red-400/25 bg-[rgba(7,7,18,0.55)] hover:border-red-400/45"
                ].join(" ")}
              >
                <div className="flex items-start gap-4">
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border text-[12px] font-bold tabular-nums"
                    style={{
                      borderColor: read
                        ? "rgba(52,211,153,0.45)"
                        : "rgba(248,113,113,0.35)",
                      color: read ? "#34D399" : FORCES_ISLAND.hi
                    }}
                  >
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1 text-left">
                    <div className="font-semibold text-ink-0 group-hover:text-white">
                      {quest.title}
                    </div>
                    <p className="mt-1 line-clamp-2 text-[13px] leading-snug text-ink-2">
                      {quest.description}
                    </p>
                    {read ? (
                      <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-400/90">
                        Read ✓
                      </p>
                    ) : (
                      <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-red-300/80">
                        Open topic →
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
