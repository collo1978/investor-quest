"use client";

import type { CSSProperties } from "react";

import { FORCES_MAP_CARD_WIDTH } from "@/app/forces/forcesQuestMapPositions";
import { hubMapCardThemeFromPillar } from "@/components/quest/hub/hubMapCardTheme";
import { SharedHubQuestMapCard } from "@/components/quest/hub/SharedHubQuestMapCard";
import type { ForcesHubQuestCard } from "@/lib/forces/forcesHubTypes";
import type { HubMapQuestCardData } from "@/lib/quests/hubMapQuestCardTypes";
import type { Company } from "@/data/companies";

type Props = {
  card: ForcesHubQuestCard;
  position: CSSProperties;
  company: Company;
  partnerId?: string;
  userId?: string;
  staggerIndex?: number;
  hubProgressPct?: number;
};

function toHubCard(card: ForcesHubQuestCard): HubMapQuestCardData {
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

export function ForcesQuestMapCard(props: Props) {
  return (
    <SharedHubQuestMapCard
      card={toHubCard(props.card)}
      position={props.position}
      cardWidth={FORCES_MAP_CARD_WIDTH}
      theme={hubMapCardThemeFromPillar("forces")}
      company={props.company}
      partnerId={props.partnerId}
      userId={props.userId}
      staggerIndex={props.staggerIndex}
      hubProgressPct={props.hubProgressPct}
      showCategoryIcon
    />
  );
}
