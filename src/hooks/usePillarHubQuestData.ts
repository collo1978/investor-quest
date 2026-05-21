"use client";

import { useMemo } from "react";
import { useGame } from "@/components/GameProvider";
import { useQuestCatalog } from "@/components/platform/QuestContentCatalogProvider";
import { getAnalyticsPartnerId } from "@/lib/analytics/identity";
import type { CompanyId } from "@/data/companies";
import type { PillarId } from "@/data/pillars";
import { getCompanyPillarQuests } from "@/data/quests/library";
import {
  getPillarQuestViews,
  getQuestProgressPct,
  type QuestView
} from "@/engine";
import type { QuestDefinition } from "@/data/quests/types";

/** Loads pillar quests after Supabase catalog hydration and builds progress views. */
export function usePillarHubQuestData(pillarId: PillarId, companyId: CompanyId) {
  const partnerId = getAnalyticsPartnerId();
  const { version: contentVersion } = useQuestCatalog();
  const { raw, state } = useGame();

  const quests = useMemo(
    () => getCompanyPillarQuests(companyId, pillarId),
    [companyId, pillarId, contentVersion]
  );

  const readSlugs = state.pillars[pillarId].readQuestSlugs;
  const readSet = useMemo(
    () => new Set(readSlugs),
    [readSlugs]
  );

  const questViewBySlug = useMemo(() => {
    const views = getPillarQuestViews(raw, pillarId);
    return Object.fromEntries(views.map((v) => [v.quest.slug, v])) as Record<
      string,
      QuestView
    >;
  }, [raw, pillarId, contentVersion]);

  const hubProgressPct = useMemo(() => {
    const views = Object.values(questViewBySlug);
    if (views.length === 0) return 0;
    const sum = views.reduce(
      (acc, v) => acc + (v.unlocked ? getQuestProgressPct(v) : 0),
      0
    );
    return sum / views.length;
  }, [questViewBySlug]);

  return {
    partnerId,
    contentVersion,
    quests: quests as readonly QuestDefinition[],
    readSet,
    questViewBySlug,
    hubProgressPct
  };
}
