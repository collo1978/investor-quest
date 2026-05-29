"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";

import { BusinessHubSceneImage } from "@/components/business/BusinessHubSceneImage";
import { BusinessHubIslandProgressPill } from "@/components/business/hub/BusinessHubIslandProgressPill";
import { BusinessHubQuestCarouselCard } from "@/components/business/hub/BusinessHubQuestCarouselCard";
import {
  pickBusinessHubCarouselIndex,
  resolveBusinessHubCardLocked
} from "@/components/business/hub/resolveBusinessHubCardLocked";
import { hubMapCardThemeFromPillar } from "@/components/quest/hub/hubMapCardTheme";
import { useHubQuestCarousel } from "@/hooks/useHubQuestCarousel";
import type { BusinessHubQuestCard } from "@/lib/business/businessHubTypes";
import type { Company } from "@/data/companies";

const SLIDE_GAP = 14;
const SLIDE_VW = 0.58;

type Props = {
  cards: BusinessHubQuestCard[];
  company: Company;
  hubProgressPct: number;
  partnerId?: string;
  userId?: string;
};

/** iPad / tablet — scene strip + moderate-depth carousel (not full desktop orbit). */
export function BusinessQuestHubTabletPicker({
  cards,
  company,
  hubProgressPct,
  partnerId,
  userId
}: Props) {
  const theme = hubMapCardThemeFromPillar("business");
  const pct = Math.max(0, Math.min(100, Math.round(hubProgressPct)));
  const initialIndex = useMemo(
    () => pickBusinessHubCarouselIndex(cards, pct),
    [cards, pct]
  );
  const carousel = useHubQuestCarousel(cards.length, initialIndex, {
    slideVw: SLIDE_VW,
    slideGap: SLIDE_GAP
  });
  const focused = cards[carousel.index];

  return (
    <section
      className="relative mx-auto flex h-full min-h-[min(100dvh,calc(100dvh-env(safe-area-inset-top)-env(safe-area-inset-bottom)))] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-[rgba(245,197,71,0.22)] bg-[#050508] shadow-[0_24px_70px_rgba(0,0,0,0.55)]"
      aria-label="Business island quests"
    >
      <div className="relative h-[28%] min-h-[7.5rem] max-h-[11rem] shrink-0 overflow-hidden">
        <BusinessHubSceneImage />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#050508] via-[rgba(5,5,8,0.35)] to-transparent"
        />
        <div className="absolute left-4 top-[max(0.5rem,env(safe-area-inset-top))] z-10">
          <BusinessHubIslandProgressPill pct={pct} />
        </div>
      </div>

      <div
        ref={carousel.trackRef}
        className="relative min-h-[12rem] flex-1 touch-pan-y overflow-hidden py-3"
      >
        <motion.div
          className="absolute inset-y-0 left-0 flex h-full items-center will-change-transform"
          style={{ x: carousel.x, gap: SLIDE_GAP }}
          drag="x"
          dragConstraints={{ left: carousel.dragMin, right: carousel.dragMax }}
          dragElastic={0.08}
          onDrag={carousel.onDrag}
          onDragEnd={carousel.onDragEnd}
        >
          {cards.map((card, i) => (
            <div
              key={card.slug}
              className="relative shrink-0"
              style={{ width: carousel.slideWidth }}
            >
              <BusinessHubQuestCarouselCard
                card={card}
                company={company}
                theme={theme}
                hubProgressPct={pct}
                focused={i === carousel.index}
                distance={Math.abs(i - carousel.index)}
                partnerId={partnerId}
                userId={userId}
                variant="tablet"
              />
            </div>
          ))}
        </motion.div>
      </div>

      <footer className="shrink-0 border-t border-[rgba(245,197,71,0.12)] px-5 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <p className="text-center text-[11px] tracking-[0.06em] text-[rgba(255,229,141,0.58)]">
          Swipe the deck · tap a quest card to open
        </p>
        {focused ? (
          <p className="mt-1.5 text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-[rgba(255,229,141,0.7)]">
            Quest {carousel.index + 1} of {cards.length}
            {resolveBusinessHubCardLocked(focused, pct) ? " · locked" : ""}
          </p>
        ) : null}
      </footer>
    </section>
  );
}
