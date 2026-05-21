"use client";

import type { CSSProperties } from "react";

import { MANAGEMENT_MAP_CARD_WIDTH } from "@/app/management/managementQuestMapPositions";
import { hubMapCardThemeFromPillar } from "@/components/quest/hub/hubMapCardTheme";
import { SharedHubQuestMapCard } from "@/components/quest/hub/SharedHubQuestMapCard";
import type { ManagementHubQuestCard } from "@/lib/management/managementHubTypes";
import type { HubMapQuestCardData } from "@/lib/quests/hubMapQuestCardTypes";
import type { Company } from "@/data/companies";

type Props = {
  card: ManagementHubQuestCard;
  position: CSSProperties;
  company: Company;
  partnerId?: string;
  userId?: string;
  staggerIndex?: number;
  hubProgressPct?: number;
};

function toHubCard(card: ManagementHubQuestCard): HubMapQuestCardData {
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

export function ManagementQuestMapCard(props: Props) {
  return (
    <SharedHubQuestMapCard
      card={toHubCard(props.card)}
      position={props.position}
      cardWidth={MANAGEMENT_MAP_CARD_WIDTH}
      theme={hubMapCardThemeFromPillar("management")}
      company={props.company}
      partnerId={props.partnerId}
      userId={props.userId}
      staggerIndex={props.staggerIndex}
      hubProgressPct={props.hubProgressPct}
    />
  );
}
