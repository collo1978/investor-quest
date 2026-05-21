"use client";

import type { CSSProperties } from "react";

import { FINANCIALS_MAP_CARD_WIDTH } from "@/app/financials/financialQuestMapPositions";
import { hubMapCardThemeFromPillar } from "@/components/quest/hub/hubMapCardTheme";
import { SharedHubQuestMapCard } from "@/components/quest/hub/SharedHubQuestMapCard";
import type { FinancialsHubQuestCard } from "@/lib/financials/financialsHubTypes";
import type { HubMapQuestCardData } from "@/lib/quests/hubMapQuestCardTypes";
import type { Company } from "@/data/companies";

type Props = {
  card: FinancialsHubQuestCard;
  position: CSSProperties;
  company: Company;
  partnerId?: string;
  userId?: string;
  staggerIndex?: number;
  hubProgressPct?: number;
};

function toHubCard(card: FinancialsHubQuestCard): HubMapQuestCardData {
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
    unlockSource: card.unlockSource ?? null
  };
}

export function FinancialsQuestMapCard(props: Props) {
  return (
    <SharedHubQuestMapCard
      card={toHubCard(props.card)}
      position={props.position}
      cardWidth={FINANCIALS_MAP_CARD_WIDTH}
      theme={hubMapCardThemeFromPillar("financials")}
      company={props.company}
      partnerId={props.partnerId}
      userId={props.userId}
      staggerIndex={props.staggerIndex}
      hubProgressPct={props.hubProgressPct}
    />
  );
}
