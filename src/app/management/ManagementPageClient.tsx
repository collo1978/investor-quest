"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useGame } from "@/components/GameProvider";
import { getCompanyPillarQuests } from "@/data/quests/library";
import { type CompanyId } from "@/data/companies";
import { pillarById } from "@/data/pillars";
import { hotspotStyle, useImageFrame, type NormRect } from "@/ui";

const MANAGEMENT_ISLAND_ARTWORK = pillarById("management").screenImage;

/** Island labels (artwork) → quest slugs; existing mgmt-1 / mgmt-2 / mgmt-quiz unchanged. */
type ManagementIslandSlug =
  | "mgmt-1"
  | "mgmt-quiz"
  | "mgmt-2"
  | "mgmt-governance"
  | "mgmt-financial-strength";

const MANAGEMENT_QUEST_HOTSPOTS: ReadonlyArray<{
  slug: ManagementIslandSlug;
  label: string;
  box: NormRect;
}> = [
  {
    slug: "mgmt-1",
    label: "Board & Leadership",
    box: { l: 0.04, t: 0.08, w: 0.30, h: 0.20 }
  },
  {
    slug: "mgmt-quiz",
    label: "Executive Compensation",
    box: { l: 0.66, t: 0.08, w: 0.30, h: 0.20 }
  },
  {
    slug: "mgmt-2",
    label: "Capital Allocation",
    box: { l: 0.04, t: 0.56, w: 0.30, h: 0.22 }
  },
  {
    slug: "mgmt-governance",
    label: "Governance & Control",
    box: { l: 0.66, t: 0.56, w: 0.30, h: 0.22 }
  },
  {
    slug: "mgmt-financial-strength",
    label: "Financial Strength",
    box: { l: 0.35, t: 0.76, w: 0.30, h: 0.12 }
  }
];

const hotspotLinkClass = [
  "pointer-events-auto absolute block cursor-pointer rounded-lg border-0 bg-transparent [touch-action:manipulation]",
  "origin-center transition-[transform,filter,box-shadow] duration-200 ease-out will-change-transform",
  "hover:z-[250] hover:scale-[1.03] hover:brightness-110",
  "hover:shadow-[0_0_36px_rgba(168,85,247,0.55),0_0_20px_rgba(139,92,246,0.35),inset_0_0_0_1px_rgba(216,180,254,0.45)]",
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/85 focus-visible:ring-offset-2 focus-visible:ring-offset-[rgba(3,3,8,0.55)]",
  "motion-reduce:transition-none motion-reduce:hover:scale-100 motion-reduce:hover:brightness-100 motion-reduce:hover:shadow-none"
].join(" ");

const READ_HOTSPOT_GLOW =
  "shadow-[0_0_26px_rgba(168,85,247,0.5),inset_0_0_0_1.5px_rgba(192,132,252,0.55)]";

function questHref(slug: ManagementIslandSlug): string {
  return `/quest?pillar=management&quest=${encodeURIComponent(slug)}`;
}

export default function ManagementPageClient() {
  const { state, actions } = useGame();
  const [hydrationReady, setHydrationReady] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const imageFrame = useImageFrame(stageRef);

  useEffect(() => {
    setHydrationReady(true);
    actions.setActivePillar("management");
  }, [actions]);

  const companyId = state.activeCompanyId as CompanyId;
  const quests = useMemo(
    () => getCompanyPillarQuests(companyId, "management"),
    [companyId]
  );
  const readSet = useMemo(
    () => new Set(state.pillars.management.readQuestSlugs),
    [state.pillars.management.readQuestSlugs]
  );
  const completedSet = useMemo(
    () => new Set(state.pillars.management.completedQuestSlugs),
    [state.pillars.management.completedQuestSlugs]
  );

  return (
    <main
      className={[
        "pointer-events-auto relative -mb-24 w-full bg-bg-0 pb-8",
        hydrationReady ? "" : "static-ui"
      ].join(" ")}
    >
      <div className="flex items-center justify-center px-4 py-6">
        <div ref={stageRef} className="relative w-fit max-w-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={MANAGEMENT_ISLAND_ARTWORK}
            alt=""
            draggable={false}
            className="pointer-events-none relative z-0 max-h-[90vh] max-w-full select-none object-contain"
          />

          <div className="pointer-events-none absolute inset-0 z-10">
            {MANAGEMENT_QUEST_HOTSPOTS.map((hs) => {
              const quest = quests.find((q) => q.slug === hs.slug);
              const read = readSet.has(hs.slug);
              const completed = completedSet.has(hs.slug);
              return (
                <Link
                  key={hs.slug}
                  href={questHref(hs.slug)}
                  prefetch
                  scroll
                  style={hotspotStyle(imageFrame, hs.box)}
                  className={[
                    hotspotLinkClass,
                    read ? READ_HOTSPOT_GLOW : "",
                    completed && !read
                      ? "shadow-[inset_0_0_0_1px_rgba(168,85,247,0.5)]"
                      : ""
                  ].join(" ")}
                  aria-label={`Open quest: ${hs.label}${
                    quest ? ` — ${quest.title}` : ""
                  }${read ? " (already read)" : ""}`}
                >
                  <span className="sr-only">
                    {hs.label}
                    {quest ? ` — ${quest.title}` : ""}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}
