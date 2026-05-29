"use client";

import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";

import { BusinessHubIslandProgressPill } from "@/components/business/hub/BusinessHubIslandProgressPill";
import { BusinessHubQuestCarouselCard } from "@/components/business/hub/BusinessHubQuestCarouselCard";
import {
  pickBusinessHubCarouselIndex,
  resolveBusinessHubCardLocked
} from "@/components/business/hub/resolveBusinessHubCardLocked";
import { hubMapCardThemeFromPillar } from "@/components/quest/hub/hubMapCardTheme";
import { useHubQuestCarousel } from "@/hooks/useHubQuestCarousel";
import type { BusinessHubQuestCard } from "@/lib/business/businessHubTypes";
import { resolveCompanyLogoUrl } from "@/lib/business/buildBusinessHubCards";
import type { Company } from "@/data/companies";

const SLIDE_GAP = 10;
const SLIDE_VH = 0.5;

type Props = {
  cards: BusinessHubQuestCard[];
  company: Company;
  companyLogoUrl?: string | null;
  hubProgressPct: number;
  partnerId?: string;
  userId?: string;
};

/** Phone portrait — vertical quest deck, one focused card, subtle peek above/below. */
export function BusinessQuestHubMobilePicker({
  cards,
  company,
  companyLogoUrl,
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
    axis: "vertical",
    slideVh: SLIDE_VH,
    slideGap: SLIDE_GAP
  });
  const reduceMotion = useReducedMotion();
  const logo = resolveCompanyLogoUrl(company, companyLogoUrl);
  const focused = cards[carousel.index];

  return (
    <section
      className="iq-business-hub-mobile relative flex h-[100dvh] max-h-[100dvh] w-full flex-col overflow-hidden bg-[#050508]"
      aria-label="Business island quests"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(520px_360px_at_50%_12%,rgba(245,197,71,0.07),transparent_65%)]"
      />

      <header className="relative z-20 flex shrink-0 items-center justify-between gap-3 border-b border-[rgba(245,197,71,0.1)] px-4 pb-2.5 pt-[max(0.6rem,env(safe-area-inset-top))]">
        <BusinessHubIslandProgressPill pct={pct} compact />
        {logo ? (
          <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-lg border border-[rgba(245,197,71,0.22)] bg-black/55 p-0.5">
            <Image
              src={logo}
              alt={`${company.name} logo`}
              width={32}
              height={32}
              className="h-full w-full object-contain"
              sizes="32px"
            />
          </div>
        ) : null}
      </header>

      <div
        ref={carousel.trackRef}
        className="relative z-10 mx-auto w-full max-w-[22rem] min-h-0 flex-1 touch-pan-y overflow-hidden px-3"
      >
        <motion.div
          className="absolute inset-x-0 top-0 flex w-full flex-col items-center will-change-transform"
          style={{ y: carousel.offset, gap: SLIDE_GAP }}
          drag="y"
          dragConstraints={{ top: carousel.dragMin, bottom: carousel.dragMax }}
          dragElastic={0.06}
          onDrag={carousel.onDrag}
          onDragEnd={carousel.onDragEnd}
        >
          {cards.map((card, i) => (
            <div
              key={card.slug}
              className="relative w-full shrink-0 px-1"
              style={{ height: carousel.slideSize }}
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
                variant="mobile"
              />
            </div>
          ))}
        </motion.div>
      </div>

      <footer className="relative z-20 shrink-0 space-y-2.5 border-t border-[rgba(245,197,71,0.08)] px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2.5">
        <div className="flex justify-center gap-1.5" aria-hidden>
          {cards.map((card, i) => (
            <button
              key={card.slug}
              type="button"
              className={[
                "h-1.5 rounded-full transition-all duration-300",
                i === carousel.index
                  ? "w-5 bg-[rgba(255,229,141,0.85)]"
                  : "w-1.5 bg-[rgba(255,229,141,0.28)]"
              ].join(" ")}
              onClick={() => carousel.snapToIndex(i)}
              aria-label={`Go to quest ${i + 1}`}
            />
          ))}
        </div>
        <p className="text-center text-[0.68rem] font-medium tracking-[0.03em] text-[rgba(255,229,141,0.52)]">
          Swipe up or down · tap card to play
        </p>
        {focused ? (
          <motion.p
            key={focused.slug}
            className="text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-[rgba(255,229,141,0.68)]"
            initial={reduceMotion ? false : { opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22 }}
          >
            {carousel.index + 1} / {cards.length}
            {resolveBusinessHubCardLocked(focused, pct)
              ? " · locked"
              : focused.isPrimaryActive
                ? " · next up"
                : ""}
          </motion.p>
        ) : null}
      </footer>
    </section>
  );
}
