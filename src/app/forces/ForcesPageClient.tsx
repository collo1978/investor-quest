"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useGame } from "@/components/GameProvider";
import { getCompanyPillarQuests } from "@/data/quests/library";
import { type CompanyId } from "@/data/companies";
import { pillarById } from "@/data/pillars";
import {
  getPillarReadingProgress,
  getPillarViews
} from "@/engine";
import { hotspotStyle, useImageFrame, type NormRect } from "@/ui";

type PathSlug = "inside-forces" | "outside-forces";

const FORCES_PATH_HOTSPOTS: ReadonlyArray<{
  slug: PathSlug;
  label: string;
  box: NormRect;
}> = [
  {
    slug: "inside-forces",
    label: "Inside Forces — factors the company can control",
    box: { l: 0.055, t: 0.17, w: 0.255, h: 0.58 }
  },
  {
    slug: "outside-forces",
    label: "Outside Forces — factors beyond the company's control",
    box: { l: 0.69, t: 0.17, w: 0.255, h: 0.58 }
  }
];

const hotspotLinkClass = [
  "pointer-events-auto absolute block cursor-pointer rounded-xl border-0 bg-transparent [touch-action:manipulation]",
  "origin-center transition-[transform,filter,box-shadow] duration-200 ease-out will-change-transform",
  "hover:z-[250] hover:scale-[1.03] hover:brightness-125",
  "hover:shadow-[0_0_40px_rgba(248,113,113,0.45),0_0_24px_rgba(96,165,250,0.35),inset_0_0_0_1px_rgba(255,255,255,0.25)]",
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[rgba(3,3,8,0.55)]",
  "motion-reduce:transition-none motion-reduce:hover:scale-100 motion-reduce:hover:brightness-100 motion-reduce:hover:shadow-none"
].join(" ");

const READ_GLOW =
  "shadow-[0_0_28px_rgba(34,197,139,0.45),inset_0_0_0_1.5px_rgba(34,197,139,0.45)]";

export default function ForcesPageClient() {
  const { state, raw, actions } = useGame();
  const [hydrationReady, setHydrationReady] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const imageFrame = useImageFrame(stageRef);

  useEffect(() => {
    setHydrationReady(true);
    actions.setActivePillar("forces");
  }, [actions]);

  const meta = pillarById("forces");
  const companyId = state.activeCompanyId as CompanyId;
  const quests = useMemo(
    () => getCompanyPillarQuests(companyId, "forces"),
    [companyId]
  );
  const readSlugs = state.pillars.forces.readQuestSlugs;
  const completedSet = useMemo(
    () => new Set(state.pillars.forces.completedQuestSlugs),
    [state.pillars.forces.completedQuestSlugs]
  );

  const reading = getPillarReadingProgress(raw, "forces");
  const pillarView = getPillarViews(raw).find((v) => v.id === "forces");
  const pillarPct = pillarView?.progressPct ?? 0;

  return (
    <main
      className={[
        "pointer-events-auto relative -mb-24 min-h-0 w-full bg-bg-0 pb-8",
        hydrationReady ? "" : "static-ui"
      ].join(" ")}
    >
      <div className="flex items-center justify-center px-3 py-4 sm:px-4 sm:py-6">
        <div ref={stageRef} className="relative w-fit max-w-full">
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={meta.screenImage}
              alt="Forces island"
              draggable={false}
              className="pointer-events-none relative z-0 max-h-[min(92vh,92vw)] max-w-full select-none object-contain md:max-h-[90vh]"
            />
            {/* Fade out the baked-in bottom utility strip (Pillar Info / Your
                Progress) so the screen reads as a pure game level — no extra
                dashboard chrome over the artwork. */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 bottom-0 z-[5] h-[12%] bg-gradient-to-t from-bg-0 via-bg-0/92 to-transparent"
            />
          </div>

          {/* Top chrome — back + pillar progress (above artwork). */}
          <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-3 px-2 pt-2 sm:px-3 sm:pt-3">
            <Link
              href="/map"
              prefetch
              className="pointer-events-auto inline-flex items-center gap-2 rounded-xl border border-[rgba(248,113,113,0.35)] bg-[rgba(7,7,18,0.72)] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-0 shadow-glow backdrop-blur-md transition hover:border-[rgba(248,113,113,0.55)] hover:bg-[rgba(7,7,18,0.88)]"
            >
              <span aria-hidden className="text-red-300">
                ←
              </span>
              Back to map
            </Link>

            <div className="pointer-events-none w-[min(200px,42vw)] shrink-0 rounded-2xl border border-[rgba(96,165,250,0.35)] bg-[rgba(7,7,18,0.72)] px-3 py-2 shadow-glow backdrop-blur-md">
              <div className="text-[9px] font-semibold uppercase tracking-[0.18em] text-ink-2">
                Pillar progress
              </div>
              <div className="mt-1 text-right font-[var(--font-grotesk)] text-lg font-semibold tabular-nums text-ink-0">
                {pillarPct}% complete
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full border border-[rgba(96,165,250,0.25)] bg-[rgba(255,255,255,0.05)]">
                <div
                  className="h-full rounded-full transition-[width] duration-500 ease-out"
                  style={{
                    width: `${Math.max(0, Math.min(100, pillarPct))}%`,
                    background:
                      "linear-gradient(90deg, rgba(248,113,113,0.55), rgba(96,165,250,0.85))"
                  }}
                />
              </div>
              <div className="mt-1.5 text-[9px] text-ink-2">
                Reading: {reading.read}/{reading.total} quests
              </div>
            </div>
          </div>

          {/* Click targets: entire Inside / Outside cards + ENTER rows. */}
          <div className="pointer-events-none absolute inset-0 z-10">
            {FORCES_PATH_HOTSPOTS.map((hs) => {
              const quest = quests.find((q) => q.slug === hs.slug);
              const done = readSlugs.includes(hs.slug);
              const completed = completedSet.has(hs.slug);
              return (
                <Link
                  key={hs.slug}
                  href={`/forces/${hs.slug}`}
                  prefetch
                  scroll
                  style={hotspotStyle(imageFrame, hs.box)}
                  className={[
                    hotspotLinkClass,
                    done ? READ_GLOW : "",
                    completed && !done
                      ? "shadow-[inset_0_0_0_1px_rgba(96,165,250,0.45)]"
                      : ""
                  ].join(" ")}
                  aria-label={`Enter ${quest?.title ?? hs.slug}`}
                >
                  <span className="sr-only">{hs.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}
