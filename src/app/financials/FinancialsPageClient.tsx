"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useGame } from "@/components/GameProvider";
import { getCompanyPillarQuests } from "@/data/quests/library";
import { type CompanyId } from "@/data/companies";
import { pillarById } from "@/data/pillars";
import { hotspotStyle, useImageFrame } from "@/ui";

/**
 * Cinematic Financials island artwork — visual foundation only.
 * Five quest areas use seven `<Link>` nodes: Growth uses a main card hitbox
 * plus a small lower strip (same `/financials/growth`) so the painted
 * START QUEST sits above Profitability in z-order without stretching the
 * main Growth rect over the Profitability header. Cash uses the same
 * pattern so its START QUEST clears Financial Strength below it.
 */
const FINANCIALS_ISLAND_ARTWORK = pillarById("financials").screenImage;

const readGlow =
  "shadow-[0_0_28px_rgba(52,211,153,0.45),inset_0_0_0_1.5px_rgba(52,211,153,0.55)]";

const linkHitBase =
  "pointer-events-auto absolute box-border block cursor-pointer rounded-lg border-none bg-transparent outline-none ring-0 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 [touch-action:manipulation] " +
  "transition-[transform,filter,box-shadow] duration-200 ease-out will-change-transform " +
  "hover:shadow-[0_0_32px_rgba(52,211,153,0.42),0_0_16px_rgba(16,185,129,0.28)] " +
  "motion-reduce:transition-none motion-reduce:hover:shadow-none";

export default function FinancialsPageClient() {
  const { state, actions } = useGame();
  const [hydrationReady, setHydrationReady] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const imageFrame = useImageFrame(stageRef);

  useEffect(() => {
    setHydrationReady(true);
    actions.setActivePillar("financials");
  }, [actions]);

  const companyId = state.activeCompanyId as CompanyId;
  const quests = useMemo(
    () => getCompanyPillarQuests(companyId, "financials"),
    [companyId]
  );
  const readSet = useMemo(
    () => new Set(state.pillars.financials.readQuestSlugs),
    [state.pillars.financials.readQuestSlugs]
  );
  const completedSet = useMemo(
    () => new Set(state.pillars.financials.completedQuestSlugs),
    [state.pillars.financials.completedQuestSlugs]
  );

  const growthQuest = quests.find((q) => q.slug === "growth");
  const profitabilityQuest = quests.find((q) => q.slug === "profitability");
  const expensesQuest = quests.find((q) => q.slug === "expenses");
  const cashQuest = quests.find((q) => q.slug === "cash");
  const financialStrengthQuest = quests.find(
    (q) => q.slug === "financial-strength"
  );

  return (
    <main
      className={[
        "pointer-events-auto relative -mb-24 w-full bg-bg-0 pb-8",
        hydrationReady ? "" : "static-ui"
      ].join(" ")}
    >
      <div className="flex items-center justify-center px-4 py-6">
        <div
          ref={stageRef}
          className="relative w-fit max-w-full overflow-visible"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={FINANCIALS_ISLAND_ARTWORK}
            alt="Financials island quest layout"
            draggable={false}
            className="pointer-events-none relative z-0 max-h-[90vh] max-w-full select-none object-contain"
          />

          {/* Above quest hotspots — baked artwork includes “Back to map” top-left. */}
          <div className="pointer-events-none absolute inset-x-0 top-0 z-[200] flex justify-start px-2 pt-2 sm:px-3 sm:pt-3">
            <Link
              href="/map"
              prefetch
              scroll
              aria-label="Back to quest map"
              className="pointer-events-auto inline-flex items-center gap-2 rounded-xl border border-[rgba(52,211,153,0.38)] bg-[rgba(7,7,18,0.75)] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-0 shadow-glow backdrop-blur-md transition hover:border-[rgba(52,211,153,0.58)] hover:bg-[rgba(7,7,18,0.9)] hover:shadow-[0_0_22px_rgba(52,211,153,0.32)]"
            >
              <span aria-hidden className="text-emerald-300">
                ←
              </span>
              Back to map
            </Link>
          </div>

          <div className="pointer-events-none absolute inset-0 z-[100] isolate overflow-visible">
            <Link
              href="/financials/growth"
              prefetch
              scroll
              style={{
                ...hotspotStyle(imageFrame, {
                  l: 0.02,
                  t: 0.048,
                  w: 0.39,
                  h: 0.268
                }),
                zIndex: 133
              }}
              className={[
                linkHitBase,
                "origin-[50%_0%]",
                readSet.has("growth") ? readGlow : "",
                completedSet.has("growth") && !readSet.has("growth")
                  ? "shadow-[inset_0_0_0_1px_rgba(52,211,153,0.45)]"
                  : ""
              ].join(" ")}
              aria-label={`Open quest: ${growthQuest?.title ?? "Growth"}${
                readSet.has("growth") ? " (already read)" : ""
              }`}
            >
              <span className="sr-only">{growthQuest?.title ?? "Growth"}</span>
            </Link>

            {/* Lower strip: painted START QUEST overlaps Profitability in y —
                same `/financials/growth`, higher z so the CTA wins hit-testing. */}
            <Link
              href="/financials/growth"
              prefetch
              scroll
              style={{
                ...hotspotStyle(imageFrame, {
                  l: 0.02,
                  t: 0.292,
                  w: 0.39,
                  h: 0.112
                }),
                zIndex: 141
              }}
              className={[
                linkHitBase,
                "origin-[50%_100%]",
                readSet.has("growth") ? readGlow : "",
                completedSet.has("growth") && !readSet.has("growth")
                  ? "shadow-[inset_0_0_0_1px_rgba(52,211,153,0.45)]"
                  : ""
              ].join(" ")}
              aria-label={`Open quest: ${growthQuest?.title ?? "Growth"}${
                readSet.has("growth") ? " (already read)" : ""
              }`}
            >
              <span className="sr-only">
                {growthQuest?.title ?? "Growth"} — start
              </span>
            </Link>

            <Link
              href="/financials/profitability"
              prefetch
              scroll
              style={{
                ...hotspotStyle(imageFrame, {
                  l: 0.02,
                  t: 0.328,
                  w: 0.39,
                  h: 0.314
                }),
                zIndex: 132
              }}
              className={[
                linkHitBase,
                "origin-center",
                readSet.has("profitability") ? readGlow : "",
                completedSet.has("profitability") && !readSet.has("profitability")
                  ? "shadow-[inset_0_0_0_1px_rgba(52,211,153,0.45)]"
                  : ""
              ].join(" ")}
              aria-label={`Open quest: ${
                profitabilityQuest?.title ?? "Profitability"
              }${readSet.has("profitability") ? " (already read)" : ""}`}
            >
              <span className="sr-only">
                {profitabilityQuest?.title ?? "Profitability"}
              </span>
            </Link>

            <Link
              href="/financials/expenses"
              prefetch
              scroll
              style={{
                ...hotspotStyle(imageFrame, {
                  l: 0.02,
                  t: 0.641,
                  w: 0.39,
                  h: 0.215
                }),
                zIndex: 131
              }}
              className={[
                linkHitBase,
                "origin-[50%_100%]",
                readSet.has("expenses") ? readGlow : "",
                completedSet.has("expenses") && !readSet.has("expenses")
                  ? "shadow-[inset_0_0_0_1px_rgba(52,211,153,0.45)]"
                  : ""
              ].join(" ")}
              aria-label={`Open quest: ${expensesQuest?.title ?? "Expenses"}${
                readSet.has("expenses") ? " (already read)" : ""
              }`}
            >
              <span className="sr-only">
                {expensesQuest?.title ?? "Expenses"}
              </span>
            </Link>

            <Link
              href="/financials/cash"
              prefetch
              scroll
              style={{
                ...hotspotStyle(imageFrame, {
                  l: 0.555,
                  t: 0.05,
                  w: 0.41,
                  h: 0.275
                }),
                zIndex: 125
              }}
              className={[
                linkHitBase,
                "origin-[50%_0%]",
                readSet.has("cash") ? readGlow : "",
                completedSet.has("cash") && !readSet.has("cash")
                  ? "shadow-[inset_0_0_0_1px_rgba(52,211,153,0.45)]"
                  : ""
              ].join(" ")}
              aria-label={`Open quest: ${cashQuest?.title ?? "Cash"}${
                readSet.has("cash") ? " (already read)" : ""
              }`}
            >
              <span className="sr-only">{cashQuest?.title ?? "Cash"}</span>
            </Link>

            {/* Right column: Cash START QUEST sits low; Financial Strength starts
                at ~0.495 — narrow strip with higher z so the CTA is hit-testable. */}
            <Link
              href="/financials/cash"
              prefetch
              scroll
              style={{
                ...hotspotStyle(imageFrame, {
                  l: 0.555,
                  t: 0.318,
                  w: 0.41,
                  h: 0.185
                }),
                zIndex: 142
              }}
              className={[
                linkHitBase,
                "origin-[50%_100%]",
                readSet.has("cash") ? readGlow : "",
                completedSet.has("cash") && !readSet.has("cash")
                  ? "shadow-[inset_0_0_0_1px_rgba(52,211,153,0.45)]"
                  : ""
              ].join(" ")}
              aria-label={`Open quest: ${cashQuest?.title ?? "Cash"}${
                readSet.has("cash") ? " (already read)" : ""
              }`}
            >
              <span className="sr-only">
                {cashQuest?.title ?? "Cash"} — start
              </span>
            </Link>

            <Link
              href="/financials/financial-strength"
              prefetch
              scroll
              style={{
                ...hotspotStyle(imageFrame, {
                  l: 0.555,
                  t: 0.495,
                  w: 0.41,
                  h: 0.32
                }),
                zIndex: 124
              }}
              className={[
                linkHitBase,
                "origin-[50%_100%]",
                readSet.has("financial-strength") ? readGlow : "",
                completedSet.has("financial-strength") &&
                !readSet.has("financial-strength")
                  ? "shadow-[inset_0_0_0_1px_rgba(52,211,153,0.45)]"
                  : ""
              ].join(" ")}
              aria-label={`Open quest: ${
                financialStrengthQuest?.title ?? "Financial strength"
              }${readSet.has("financial-strength") ? " (already read)" : ""}`}
            >
              <span className="sr-only">
                {financialStrengthQuest?.title ?? "Financial strength"}
              </span>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
