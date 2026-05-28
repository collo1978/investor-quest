"use client";

/**
 * IslandQuestScreen — shared island-screen shell.
 *
 * Renders the same shape as `BusinessPageClient` (centered island
 * artwork + floating help banner) for Forces / Financials / Management.
 * Since these islands don't yet have hand-tuned hotspot coordinates
 * for the panels in their artwork, we overlay a floating glass strip
 * of compact quest tiles at the bottom of the image so every quest
 * is reachable without leaving the island screen. (Management uses
 * its own image + hotspot page instead of this shell.)
 *
 * Engine integration is identical to Business:
 *   - `actions.setActivePillar(pillarId)` on mount
 *   - reads from `useGame()` + `getCompanyPillarQuests()`
 *   - reads `state.pillars[pillarId].readQuestSlugs`
 *
 * Each tile navigates to the existing `/quest?pillar={id}&quest={slug}`
 * fallback — no new detail routes are introduced for non-business pillars.
 */

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useGame } from "@/components/GameProvider";
import { companyById, type CompanyId } from "@/data/companies";
import { type PillarId } from "@/data/pillars";
import { CONTROLLED_DEMO_MODE } from "@/lib/demo/controlledDemo";
import {
  demoPillarById,
  NVDA_ISLAND_BANNER
} from "@/lib/demo/nvidiaDemoVoice";
import { getCompanyPillarQuests } from "@/data/quests/library";

export type IslandQuestScreenProps = {
  pillarId: Exclude<PillarId, "business">;
};

export function IslandQuestScreen({ pillarId }: IslandQuestScreenProps) {
  const { state, actions } = useGame();
  const [hydrationReady, setHydrationReady] = useState(false);

  useEffect(() => {
    setHydrationReady(true);
    actions.setActivePillar(pillarId);
  }, [actions, pillarId]);

  const meta = demoPillarById(pillarId);
  const company = companyById(state.activeCompanyId);
  const companyId = state.activeCompanyId as CompanyId;
  const quests = useMemo(
    () => getCompanyPillarQuests(companyId, pillarId),
    [companyId, pillarId]
  );

  const pillarState = state.pillars[pillarId];
  const readSet = useMemo(
    () => new Set(pillarState.readQuestSlugs),
    [pillarState.readQuestSlugs]
  );
  const completedSet = useMemo(
    () => new Set(pillarState.completedQuestSlugs),
    [pillarState.completedQuestSlugs]
  );
  const readCount = readSet.size;
  const totalCount = quests.length;

  return (
    <main
      className={[
        "pointer-events-auto relative -mb-24 w-full bg-bg-0 pb-8",
        hydrationReady ? "" : "static-ui"
      ].join(" ")}
    >
      {/* Floating help banner — mirrors Business island shell. */}
      <div className="pointer-events-none mx-auto mb-4 max-w-xl px-4 pt-4 text-center">
        <div className="inline-flex flex-wrap items-center justify-center gap-2 rounded-full border border-[rgba(139,92,246,0.22)] bg-[rgba(7,7,18,0.55)] px-4 py-2 text-[11px] text-ink-2 shadow-glow backdrop-blur-xl">
          <span>
            {CONTROLLED_DEMO_MODE
              ? NVDA_ISLAND_BANNER(company.name, meta.title)
              : `${company.name} · ${meta.title} island — pick a quest below.`}
          </span>
          <span
            aria-label={`${readCount} of ${totalCount} cards read on this island`}
            className="inline-flex items-center gap-1 rounded-full border border-[rgba(168,85,247,0.40)] bg-[rgba(139,92,246,0.14)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-neon-300"
          >
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-neon-400 shadow-[0_0_8px_rgba(168,85,247,0.85)]" />
            {readCount}/{totalCount} read
          </span>
        </div>
      </div>

      <div className="flex items-center justify-center px-4 py-6">
        <div className="relative w-fit max-w-full">
          {/* Island background artwork. */}
          <img
            src={meta.screenImage}
            alt={`${meta.title} Island`}
            className="pointer-events-none relative z-0 max-h-[90vh] max-w-full object-contain"
          />

          {/* Quest tiles overlaid at the bottom of the artwork. */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex justify-center px-3 pb-4 md:px-6 md:pb-6">
            <div className="pointer-events-auto w-full max-w-3xl rounded-2xl border border-panel-border bg-[rgba(7,7,18,0.78)] p-2 shadow-glow backdrop-blur-xl md:p-2.5">
              <div className="grid gap-1.5 sm:grid-cols-2 md:grid-cols-3">
                {quests.map((q) => {
                  const read = readSet.has(q.slug);
                  const completed = completedSet.has(q.slug);
                  return (
                    <Link
                      key={q.slug}
                      href={`/quest?pillar=${pillarId}&quest=${q.slug}`}
                      prefetch
                      aria-label={`Open quest: ${q.title}${
                        read ? " (already read)" : ""
                      }`}
                      className={[
                        "group block rounded-xl border bg-[rgba(255,255,255,0.03)] p-3 text-left transition",
                        "hover:border-[rgba(168,85,247,0.55)] hover:bg-[rgba(139,92,246,0.10)]",
                        "focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/75",
                        read
                          ? "border-[rgba(168,85,247,0.55)] shadow-[inset_0_0_0_1px_rgba(168,85,247,0.35)]"
                          : "border-panel-border"
                      ].join(" ")}
                    >
                      <div className="flex items-center justify-between gap-2 text-[10px] uppercase tracking-[0.16em] text-ink-2">
                        <span>{q.type}</span>
                        <span
                          className={[
                            "inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[9px] font-semibold",
                            read
                              ? "border-[rgba(168,85,247,0.55)] bg-[rgba(139,92,246,0.18)] text-neon-300"
                              : "border-panel-border bg-[rgba(255,255,255,0.03)] text-ink-2"
                          ].join(" ")}
                        >
                          {read ? (
                            <>
                              <CheckIcon className="h-2.5 w-2.5" /> Read
                            </>
                          ) : (
                            "New"
                          )}
                        </span>
                      </div>
                      <div className="mt-1.5 font-[var(--font-grotesk)] text-sm leading-tight text-ink-0">
                        {q.title}
                      </div>
                      <div className="mt-1 line-clamp-2 text-[12px] leading-snug text-ink-1">
                        {q.investorQuestion}
                      </div>
                      {completed ? (
                        <div className="mt-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-neon-300">
                          Quiz passed
                        </div>
                      ) : null}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      <path d="M3 8.5l3 3 7-7.5" />
    </svg>
  );
}
