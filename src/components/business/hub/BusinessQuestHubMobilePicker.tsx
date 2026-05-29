"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";

import { BusinessHubIslandProgressPill } from "@/components/business/hub/BusinessHubIslandProgressPill";
import { BusinessHubQuestCarouselCard } from "@/components/business/hub/BusinessHubQuestCarouselCard";
import {
  pickBusinessHubCarouselIndex,
  resolveBusinessHubCardLocked
} from "@/components/business/hub/resolveBusinessHubCardLocked";
import { hubMapCardThemeFromPillar } from "@/components/quest/hub/hubMapCardTheme";
import type { BusinessHubQuestCard } from "@/lib/business/businessHubTypes";
import { resolveCompanyLogoUrl } from "@/lib/business/buildBusinessHubCards";
import type { Company } from "@/data/companies";

type Props = {
  cards: BusinessHubQuestCard[];
  company: Company;
  companyLogoUrl?: string | null;
  hubProgressPct: number;
  partnerId?: string;
  userId?: string;
};

/**
 * Phone portrait — CSS scroll-snap vertical deck (reliable on iOS PWA).
 * One centered card, subtle peek of neighbors, no desktop scene.
 */
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
  const [index, setIndex] = useState(initialIndex);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const logo = resolveCompanyLogoUrl(company, companyLogoUrl);
  const focused = cards[index] ?? cards[0];

  useEffect(() => {
    setIndex(initialIndex);
  }, [initialIndex]);

  const scrollToIndex = useCallback((next: number) => {
    const clamped = Math.max(0, Math.min(cards.length - 1, next));
    setIndex(clamped);
    slideRefs.current[clamped]?.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });
  }, [cards.length]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    requestAnimationFrame(() => scrollToIndex(initialIndex));
  }, [initialIndex, scrollToIndex]);

  const onScroll = useCallback(() => {
    const root = scrollerRef.current;
    if (!root) return;
    const rootRect = root.getBoundingClientRect();
    const mid = rootRect.top + rootRect.height / 2;
    let best = index;
    let bestDist = Infinity;
    slideRefs.current.forEach((slide, i) => {
      if (!slide) return;
      const r = slide.getBoundingClientRect();
      const center = r.top + r.height / 2;
      const dist = Math.abs(center - mid);
      if (dist < bestDist) {
        bestDist = dist;
        best = i;
      }
    });
    if (best !== index) setIndex(best);
  }, [index]);

  return (
    <section
      className="iq-business-hub-mobile"
      data-business-quest-hub-mobile
      aria-label="Business island quests"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(480px_320px_at_50%_8%,rgba(245,197,71,0.08),transparent_68%)]"
      />

      <header className="iq-business-hub-mobile-header relative z-20 flex shrink-0 items-center justify-between gap-3 px-4">
        <div className="min-w-0">
          <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-[rgba(255,229,141,0.45)]">
            Business island
          </p>
          <BusinessHubIslandProgressPill pct={pct} compact />
        </div>
        {logo ? (
          <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg border border-[rgba(245,197,71,0.22)] bg-black/55 p-0.5">
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
        ref={scrollerRef}
        className="iq-business-hub-mobile-scroller relative z-10 min-h-0 flex-1 snap-y snap-mandatory overflow-y-auto overflow-x-hidden overscroll-y-contain"
        onScroll={onScroll}
      >
        {cards.map((card, i) => {
          const distance = Math.abs(i - index);
          return (
            <div
              key={card.slug}
              ref={(el) => {
                slideRefs.current[i] = el;
              }}
              className="iq-business-hub-mobile-slide flex snap-center items-center justify-center px-4"
            >
              <div className="w-full max-w-[21rem]">
                <BusinessHubQuestCarouselCard
                  card={card}
                  company={company}
                  theme={theme}
                  hubProgressPct={pct}
                  focused={i === index}
                  distance={distance}
                  partnerId={partnerId}
                  userId={userId}
                  variant="mobile"
                />
              </div>
            </div>
          );
        })}
      </div>

      <footer className="iq-business-hub-mobile-footer relative z-20 shrink-0 space-y-2">
        <div className="flex justify-center gap-1.5">
          {cards.map((card, i) => (
            <button
              key={card.slug}
              type="button"
              className={[
                "h-2 min-w-[8px] rounded-full transition-all duration-300",
                i === index
                  ? "w-6 bg-[rgba(255,229,141,0.9)]"
                  : "w-2 bg-[rgba(255,229,141,0.28)]"
              ].join(" ")}
              onClick={() => scrollToIndex(i)}
              aria-label={`Quest ${i + 1}: ${card.title}`}
              aria-current={i === index ? "true" : undefined}
            />
          ))}
        </div>
        <p className="text-center text-[0.7rem] font-medium text-[rgba(255,229,141,0.55)]">
          Swipe up or down · tap card to play
        </p>
        {focused ? (
          <p className="text-center text-[10px] font-semibold uppercase tracking-[0.16em] text-[rgba(255,229,141,0.65)]">
            {index + 1} / {cards.length}
            {resolveBusinessHubCardLocked(focused, pct)
              ? " · locked"
              : focused.isPrimaryActive
                ? " · next up"
                : ""}
          </p>
        ) : null}
      </footer>
    </section>
  );
}
