"use client";

import { useMemo } from "react";
import { useGame } from "@/components/GameProvider";
import { buildBusinessHubCards } from "@/lib/business/buildBusinessHubCards";
import { usePillarHubQuestData } from "@/hooks/usePillarHubQuestData";
import { STORAGE_KEY } from "@/engine";
import type { CompanyId } from "@/data/companies";

/**
 * Dev-only control to clear stale Business Island progress in localStorage.
 * Parent renders this only when `/business?dev=1`.
 */
export function BusinessIslandDevReset() {
  const { actions, state } = useGame();
  const companyId = state.activeCompanyId as CompanyId;
  const { quests, readSet, questViewBySlug } = usePillarHubQuestData(
    "business",
    companyId
  );

  const hubCards = useMemo(
    () => buildBusinessHubCards(quests, questViewBySlug, readSet),
    [quests, questViewBySlug, readSet]
  );

  const islandProgressPct = useMemo(() => {
    if (hubCards.length === 0) return 0;
    const sum = hubCards.reduce(
      (acc, c) => acc + (c.locked ? 0 : c.completed ? 100 : c.progressPct),
      0
    );
    return Math.round(sum / hubCards.length);
  }, [hubCards]);

  return (
    <div className="mx-auto mt-4 flex max-w-md flex-col items-center gap-2 px-3">
      <button
        type="button"
        onClick={() => {
          if (
            !window.confirm(
              "Reset Business Island progress for this company? (read + completion + quiz work)"
            )
          ) {
            return;
          }
          actions.clearPillarProgress("business");
        }}
        className="rounded-lg border border-amber-400/30 bg-black/40 px-3 py-2 text-[11px] font-medium text-amber-200/80 transition hover:bg-amber-400/10"
      >
        Dev: reset Business Island progress
      </button>
      <p className="text-center text-[10px] leading-snug text-ink-2/70">
        Clears saved reads/completions in{" "}
        <code className="text-ink-2/90">{STORAGE_KEY}</code> for the active
        company. Use if a quest card looks wrongly unlocked.
      </p>
      <ul className="w-full max-w-sm space-y-0.5 rounded border border-white/[0.06] bg-black/30 px-2 py-2 font-mono text-[9px] text-ink-2/80">
        {hubCards.map((c) => {
          const visualLocked =
            c.locked || (islandProgressPct === 0 && c.orderNumber > 1);
          return (
            <li key={c.slug}>
              {c.orderNumber}. {c.slug}: dataLocked={String(c.locked)}{" "}
              visualLocked={String(visualLocked)} state={c.visualState}
              {c.isPrimaryActive ? " ★" : ""}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
