"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";

import { BusinessIslandQuestMarker } from "@/components/business/hub/BusinessIslandQuestMarker";
import type { QuestMarkerVisualState } from "@/components/business/hub/BusinessIslandQuestMarker";
import type { BusinessHubQuestCard } from "@/lib/business/businessHubTypes";
import {
  BUSINESS_ISLAND_QUEST_MARKER_SLOTS,
  BUSINESS_ISLAND_QUEST_MARKER_SLOTS_MOBILE,
  resolveBusinessIslandQuestMarkerSlot
} from "@/lib/business/businessIslandQuestMarkerPositions";
import { resolveBusinessHubJourney } from "@/lib/business/resolveBusinessHubJourney";
import type { Company } from "@/data/companies";
import { trackUserEvent } from "@/lib/analytics/trackUserEvent";
import { preloadQuestDetailChunks } from "@/lib/quests/preloadQuestDetailChunks";
import { resolveSchoolsHubQuestHref } from "@/lib/schools/schoolsDemoHref";

type Props = {
  cards: readonly BusinessHubQuestCard[];
  company: Company;
  partnerId?: string;
  userId?: string;
  onBeforeQuestNavigate?: (href: string) => void;
};

function resolveMarkerState(
  card: BusinessHubQuestCard,
  current: BusinessHubQuestCard
): QuestMarkerVisualState {
  if (card.completed) return "completed";
  if (card.locked) return "locked";
  if (
    card.isPrimaryActive ||
    card.slug === current.slug ||
    card.orderNumber === current.orderNumber
  ) {
    return "active";
  }
  return "available";
}

/**
 * World-placed quest pins on the zoomed Business Island — tap ? to enter quest directly.
 */
export function BusinessIslandQuestMarkers({
  cards,
  company,
  partnerId,
  userId,
  onBeforeQuestNavigate
}: Props) {
  const pathname = usePathname();
  const [mobile, setMobile] = useState(false);
  const { current } = useMemo(() => resolveBusinessHubJourney(cards), [cards]);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const sync = () => setMobile(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const handleMarkerNavigate = useCallback(
    (card: BusinessHubQuestCard) => {
      const questHref =
        resolveSchoolsHubQuestHref(card.route, pathname) ?? card.route;
      preloadQuestDetailChunks();
      trackUserEvent({
        eventType: "user_started_quest",
        pillar: "Business",
        questId: card.questId,
        companyTicker: company.ticker,
        companyName: company.name,
        partnerId,
        userId,
        metadata: {
          questTitle: card.title,
          orderNumber: card.orderNumber,
          route: card.route,
          visualState: card.visualState,
          entry: "island-quest-marker"
        }
      });
      if (onBeforeQuestNavigate) {
        onBeforeQuestNavigate(questHref);
      }
    },
    [pathname, company, partnerId, userId, onBeforeQuestNavigate]
  );

  const sorted = useMemo(
    () => [...cards].sort((a, b) => a.orderNumber - b.orderNumber),
    [cards]
  );

  const slots = mobile
    ? BUSINESS_ISLAND_QUEST_MARKER_SLOTS_MOBILE
    : BUSINESS_ISLAND_QUEST_MARKER_SLOTS;

  return (
    <div
      className="iq-business-island-quest-markers pointer-events-none"
      aria-label="Business Island quests"
    >
      {sorted.map((card) => {
        const slot =
          resolveBusinessIslandQuestMarkerSlot(card.orderNumber, mobile) ??
          slots.find((s) => s.orderNumber === card.orderNumber);
        if (!slot) return null;

        return (
          <BusinessIslandQuestMarker
            key={card.slug}
            card={card}
            slot={slot}
            state={resolveMarkerState(card, current)}
            onNavigate={handleMarkerNavigate}
          />
        );
      })}
    </div>
  );
}
