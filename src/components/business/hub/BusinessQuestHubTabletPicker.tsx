"use client";

import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";

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

const SLIDE_GAP = 12;
const SLIDE_VW = 0.62;

type Props = {
  cards: BusinessHubQuestCard[];
  company: Company;
  hubProgressPct: number;
  partnerId?: string;
  userId?: string;
};

/** Tablet — scene strip + horizontal deck with moderate depth (not desktop orbit). */
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
    axis: "horizontal",
    slideVw: SLIDE_VW,
    slideGap: SLIDE_GAP
  });
  const reduceMotion = useReducedMotion();
  const focused = cards[carousel.index];

  return (
    <section
      className="iq-business-hub-tablet relative mx-auto flex h-[100dvh] max-h-[100dvh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-[rgba(245,197,71,0.2)] bg-[#050508] shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
      aria-label="Business island quests"
    >
      <div className="relative h-[22%] max-h-[9.5rem] min-h-[6.5rem] shrink-0 overflow-hidden">
        <BusinessHubSceneImage />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#050508] via-[rgba(5,5,8,0.4)] to-transparent"
        />
        <div className="absolute left-4 top-3 z-10">
          <BusinessHubIslandProgressPill pct={pct} />
        </div>
      </div>

      <div
        ref={carousel.trackRef}
        className="relative min-h-[13rem] flex-1 touch-pan-y overflow-hidden py-2"
      >
        <motion.div
          className="absolute inset-y-0 left-0 flex h-full items-center will-change-transform"
          style={{ x: carousel.offset, gap: SLIDE_GAP }}
          drag="x"
          dragConstraints={{ left: carousel.dragMin, right: carousel.dragMax }}
          dragElastic={0.07}
          onDrag={carousel.onDrag}
          onDragEnd={carousel.onDragEnd}
        >
          {cards.map((card, i) => {
            const distance = Math.abs(i - carousel.index);
            const stackLift = distance === 0 ? 0 : distance === 1 ? 6 : 12;
            return (
              <div
                key={card.slug}
                className="relative shrink-0"
                style={{
                  width: carousel.slideSize,
                  transform: `translateY(${stackLift}px) scale(${distance === 0 ? 1 : distance === 1 ? 0.94 : 0.88})`,
                  zIndex: 10 - distance
                }}
              >
                <BusinessHubQuestCarouselCard
                  card={card}
                  company={company}
                  theme={theme}
                  hubProgressPct={pct}
                  focused={i === carousel.index}
                  distance={distance}
                  partnerId={partnerId}
                  userId={userId}
                  variant="tablet"
                />
              </div>
            );
          })}
        </motion.div>
      </div>

      <footer className="shrink-0 border-t border-[rgba(245,197,71,0.1)] px-5 py-3 pb-[max(0.65rem,env(safe-area-inset-bottom))]">
        <p className="text-center text-[11px] tracking-[0.05em] text-[rgba(255,229,141,0.55)]">
          Swipe the deck · tap a quest to open
        </p>
        {focused ? (
          <motion.p
            key={focused.slug}
            className="mt-1.5 text-center text-[10px] font-semibold uppercase tracking-[0.16em] text-[rgba(255,229,141,0.68)]"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            Quest {carousel.index + 1} of {cards.length}
            {resolveBusinessHubCardLocked(focused, pct) ? " · locked" : ""}
          </motion.p>
        ) : null}
      </footer>
    </section>
  );
}
