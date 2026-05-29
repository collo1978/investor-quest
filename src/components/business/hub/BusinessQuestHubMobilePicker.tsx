"use client";

import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";

import { BusinessHubIslandProgressPill } from "@/components/business/hub/BusinessHubIslandProgressPill";
import { BusinessHubQuestCarouselCard } from "@/components/business/hub/BusinessHubQuestCarouselCard";
import {
  pickBusinessHubCarouselIndex,
  resolveBusinessHubCardLocked
} from "@/components/business/hub/resolveBusinessHubCardLocked";
import Image from "next/image";
import { hubMapCardThemeFromPillar } from "@/components/quest/hub/hubMapCardTheme";
import { useHubQuestCarousel } from "@/hooks/useHubQuestCarousel";
import { BUSINESS_HUB_DEVICE } from "@/lib/business/businessHubResponsive";
import type { BusinessHubQuestCard } from "@/lib/business/businessHubTypes";
import { resolveCompanyLogoUrl } from "@/lib/business/buildBusinessHubCards";
import type { Company } from "@/data/companies";

const SLIDE_GAP = 12;
const SLIDE_VW = 0.86;

type Props = {
  cards: BusinessHubQuestCard[];
  company: Company;
  companyLogoUrl?: string | null;
  hubProgressPct: number;
  partnerId?: string;
  userId?: string;
};

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
    slideVw: SLIDE_VW,
    slideGap: SLIDE_GAP
  });
  const reduceMotion = useReducedMotion();
  const logo = resolveCompanyLogoUrl(company, companyLogoUrl);
  const focused = cards[carousel.index];

  return (
    <section
      className={`relative flex h-[min(100dvh,calc(100dvh-env(safe-area-inset-top)-env(safe-area-inset-bottom)))] w-full flex-col overflow-hidden bg-[#050508] ${BUSINESS_HUB_DEVICE.mobileOnly}`}
      aria-label="Business island quests"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_480px_at_50%_0%,rgba(245,197,71,0.08),transparent_62%),radial-gradient(600px_400px_at_80%_90%,rgba(139,92,246,0.06),transparent_55%)]"
      />

      <header className="relative z-20 flex shrink-0 items-center justify-between gap-3 px-4 pb-2 pt-[max(0.65rem,env(safe-area-inset-top))]">
        <BusinessHubIslandProgressPill pct={pct} compact />
        {logo ? (
          <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg border border-[rgba(245,197,71,0.28)] bg-black/55 p-0.5">
            <Image
              src={logo}
              alt={`${company.name} logo`}
              width={36}
              height={36}
              className="h-full w-full object-contain"
              sizes="36px"
            />
          </div>
        ) : null}
      </header>

      <div
        ref={carousel.trackRef}
        className="relative z-10 min-h-0 flex-1 touch-pan-y overflow-hidden px-0"
      >
        <motion.div
          className="absolute inset-y-4 left-0 flex items-stretch will-change-transform"
          style={{ x: carousel.x, gap: SLIDE_GAP }}
          drag="x"
          dragConstraints={{ left: carousel.dragMin, right: carousel.dragMax }}
          dragElastic={0.06}
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
                variant="mobile"
              />
            </div>
          ))}
        </motion.div>
      </div>

      <footer className="relative z-20 shrink-0 px-4 pb-[max(0.85rem,env(safe-area-inset-bottom))] pt-2">
        <p className="text-center text-[0.7rem] font-medium tracking-[0.04em] text-[rgba(255,229,141,0.55)]">
          Swipe to browse quests · tap the card to enter
        </p>
        {focused ? (
          <motion.p
            key={focused.slug}
            className="mt-2 text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-[rgba(255,229,141,0.72)]"
            initial={reduceMotion ? false : { opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            {carousel.index + 1} / {cards.length}
            {resolveBusinessHubCardLocked(focused, pct)
              ? " · locked"
              : focused.isPrimaryActive
                ? " · your next quest"
                : ""}
          </motion.p>
        ) : null}
      </footer>
    </section>
  );
}
