"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useGame } from "@/components/GameProvider";
import { getCompanyPillarQuests } from "@/data/quests/library";
import { companyById, type CompanyId } from "@/data/companies";
import { hotspotStyle, useImageFrame, type NormRect } from "@/ui";

/**
 * Cinematic island artwork used as the Business quest layout's visual
 * foundation. Swapping this file is the *only* visual change required
 * — the hotspot system below is image-agnostic and snaps to the
 * rendered content rectangle via `useImageFrame`, so it tolerates the
 * aspect-ratio difference between artworks (the previous screen was
 * 1660×948; this one is 1740×904).
 */
const BUSINESS_ISLAND_ARTWORK = "/screens/business-island-quests.png";

/**
 * Layout of the 5 Business quest cards on the island artwork.
 * Coordinates are normalized (0..1) against the rendered image content,
 * so they stay accurate regardless of `object-contain` letterboxing.
 *
 * Tuning the layout:
 *   • `l` = left edge as a fraction of the image content width.
 *   • `t` = top edge as a fraction of the image content height.
 *   • `w` / `h` = box size as fractions of the same dimensions.
 *   • The five rows correspond 1:1 to the five Business quest slugs.
 *     Re-order them freely — render order doesn't affect routing.
 *   • If a card in the artwork shifts position, nudge only `l`/`t`/`w`/`h`
 *     for that slug. Nothing else in this file needs to change.
 */
const BUSINESS_QUEST_HOTSPOTS: ReadonlyArray<{
  slug: "snapshot" | "revenue" | "operations" | "advantage" | "industry";
  box: NormRect;
}> = [
  { slug: "snapshot", box: { l: 0.14, t: 0.1, w: 0.72, h: 0.14 } },
  { slug: "revenue", box: { l: 0.08, t: 0.28, w: 0.4, h: 0.14 } },
  { slug: "operations", box: { l: 0.46, t: 0.24, w: 0.48, h: 0.2 } },
  { slug: "advantage", box: { l: 0.02, t: 0.46, w: 0.48, h: 0.36 } },
  { slug: "industry", box: { l: 0.5, t: 0.46, w: 0.48, h: 0.36 } }
] as const;

const hotspotLinkClass = [
  "pointer-events-auto absolute block cursor-pointer rounded-lg border-0 bg-transparent [touch-action:manipulation]",
  "origin-center transition-[transform,filter,box-shadow] duration-200 ease-out will-change-transform",
  "hover:z-[250] hover:scale-[1.03] hover:brightness-125",
  "hover:shadow-[0_0_48px_rgba(168,85,247,0.55),0_0_24px_rgba(139,92,246,0.35),inset_0_0_0_1px_rgba(216,180,254,0.35)]",
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[rgba(3,3,8,0.55)]",
  "motion-reduce:transition-none motion-reduce:hover:scale-100 motion-reduce:hover:brightness-100 motion-reduce:hover:shadow-none"
].join(" ");

const READ_HOTSPOT_GLOW =
  "shadow-[0_0_28px_rgba(168,85,247,0.45),inset_0_0_0_1.5px_rgba(168,85,247,0.55)]";

export default function BusinessPageClient() {
  const { state, actions } = useGame();
  const [hydrationReady, setHydrationReady] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const imageFrame = useImageFrame(stageRef);

  useEffect(() => {
    setHydrationReady(true);
    actions.setActivePillar("business");
  }, [actions]);

  const company = companyById(state.activeCompanyId);
  const companyId = state.activeCompanyId as CompanyId;
  const questsForArt = getCompanyPillarQuests(companyId, "business");
  const completedSet = new Set(state.pillars.business.completedQuestSlugs);
  const readSet = new Set(state.pillars.business.readQuestSlugs);
  const readCount = readSet.size;
  const totalCount = questsForArt.length;

  return (
    <main
      className={[
        "pointer-events-auto relative -mb-24 w-full bg-bg-0 pb-8",
        hydrationReady ? "" : "static-ui"
      ].join(" ")}
    >
      <div className="pointer-events-none mx-auto mb-4 max-w-lg px-4 pt-4 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(139,92,246,0.22)] bg-[rgba(7,7,18,0.55)] px-4 py-2 text-[11px] text-ink-2 shadow-glow backdrop-blur-xl">
          <span>
            {company.name} · Business island — tap any panel to open a quest.
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
        <div ref={stageRef} className="relative w-fit max-w-full">
          <img
            src={BUSINESS_ISLAND_ARTWORK}
            alt="Business Island quest layout"
            draggable={false}
            className="pointer-events-none relative z-0 max-h-[90vh] max-w-full object-contain"
          />

          {/* Clickable quest hotspots, perfectly aligned to image content. */}
          <div className="pointer-events-none absolute inset-0 z-10">
            {/*
              Read / completed state is conveyed by the persistent inset
              glow on each hotspot itself (`READ_HOTSPOT_GLOW`) plus the
              progress ticks baked into the artwork's quest cards. No
              floating checkmark badge is rendered — it would read as
              visual clutter scattered across the island background.
              Screen readers still get the state cue via `aria-label`.
            */}
            {BUSINESS_QUEST_HOTSPOTS.map((hs) => {
              const quest = questsForArt.find((q) => q.slug === hs.slug);
              const read = readSet.has(hs.slug);
              const completed = completedSet.has(hs.slug);
              return (
                <Link
                  key={hs.slug}
                  href={`/business/${hs.slug}`}
                  prefetch
                  scroll
                  style={hotspotStyle(imageFrame, hs.box)}
                  className={[
                    hotspotLinkClass,
                    read ? READ_HOTSPOT_GLOW : "",
                    completed && !read
                      ? "shadow-[inset_0_0_0_1px_rgba(168,85,247,0.45)]"
                      : ""
                  ].join(" ")}
                  aria-label={`Open quest: ${quest?.title ?? hs.slug}${
                    read ? " (already read)" : ""
                  }`}
                />
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}
