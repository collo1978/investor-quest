"use client";

import type { CSSProperties } from "react";
import { usePathname } from "next/navigation";

import { resolveBusinessMapCardWidth } from "@/app/business/businessQuestMapPositions";
import { hubMapCardThemeFromPillar } from "@/components/quest/hub/hubMapCardTheme";
import { SharedHubQuestMapCard } from "@/components/quest/hub/SharedHubQuestMapCard";
import { SchoolsBusinessMissionCard } from "@/components/schools/SchoolsBusinessMissionCard";
import type { BusinessHubQuestCard } from "@/lib/business/businessHubTypes";
import type { HubMapQuestCardData } from "@/lib/quests/hubMapQuestCardTypes";
import type { Company } from "@/data/companies";
import { isSchoolsDemoPath } from "@/lib/schools/schoolsDemoHref";

type Props = {
  card: BusinessHubQuestCard;
  position: CSSProperties;
  company: Company;
  partnerId?: string;
  userId?: string;
  staggerIndex?: number;
  hubProgressPct?: number;
  /** Schools hub grid — cards sit in a CSS grid, not orbit slots. */
  cardLayout?: "orbit" | "grid";
  /** Journey hub — sizes the card for current / next / previous focus. */
  journeyRole?: "current" | "next" | "previous";
  onBeforeQuestNavigate?: (href: string) => void;
};

function toHubCard(card: BusinessHubQuestCard): HubMapQuestCardData {
  return {
    orderNumber: card.orderNumber,
    slug: card.slug,
    questId: card.questId,
    title: card.title,
    subtitle: card.subtitle,
    icon: card.icon,
    cardCount: card.cardCount,
    progressPct: card.progressPct,
    route: card.route,
    locked: card.locked,
    visualState: card.visualState,
    isPrimaryActive: card.isPrimaryActive,
    completed: card.completed,
    read: card.read,
    unlockSource: card.unlockSource,
    unlockEpoch: card.unlockEpoch
  };
}

export function BusinessQuestMapCard(props: Props) {
  const pathname = usePathname();
  const schoolsBusinessIsland =
    isSchoolsDemoPath(pathname) || pathname.startsWith("/schools/business");

  if (schoolsBusinessIsland) {
    return (
      <SchoolsBusinessMissionCard
        card={props.card}
        company={props.company}
        partnerId={props.partnerId}
        userId={props.userId}
        staggerIndex={props.staggerIndex}
        cardLayout={props.cardLayout ?? "orbit"}
        journeyRole={props.journeyRole}
        onBeforeQuestNavigate={props.onBeforeQuestNavigate}
      />
    );
  }

  return (
    <SharedHubQuestMapCard
      card={toHubCard(props.card)}
      mysteryLockedCards
      position={props.position}
      cardWidth={resolveBusinessMapCardWidth(props.card.orderNumber)}
      cardSlotClassName={[
        "business-hub-quest-card",
        "business-hub-orbit-slot",
        `business-hub-orbit-slot-${props.card.orderNumber}`
      ].join(" ")}
      theme={hubMapCardThemeFromPillar("business")}
      company={props.company}
      partnerId={props.partnerId}
      userId={props.userId}
      staggerIndex={props.staggerIndex}
      hubProgressPct={props.hubProgressPct}
    />
  );
}
