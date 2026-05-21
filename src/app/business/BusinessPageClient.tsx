"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useGame } from "@/components/GameProvider";
import { BusinessIslandMissionBriefModal } from "@/components/business/BusinessIslandMissionBriefModal";
import { BusinessQuestMap } from "@/components/business/BusinessQuestMap";
import { initialCompanyProgress } from "@/engine/progression/state";
import { useHubRoutePrefetch } from "@/hooks/useHubRoutePrefetch";
import { usePillarHubQuestData } from "@/hooks/usePillarHubQuestData";
import { getAnalyticsUserId } from "@/lib/analytics/identity";
import { BusinessIslandDevReset } from "@/components/business/BusinessIslandDevReset";
import { buildBusinessHubCards } from "@/lib/business/buildBusinessHubCards";
import {
  markBusinessIslandBriefSeen,
  wasBusinessIslandBriefSeen
} from "@/lib/businessIslandBriefSession";
import { companyById, type CompanyId } from "@/data/companies";
import { BUSINESS_HUB_IMG_SRC } from "@/lib/screenAssetUrls";
import { preloadImage } from "@/lib/preloadImage";

type Props = {
  /** When true, show `/business?dev=1` reset + debug panel. */
  showDevPanel?: boolean;
};

export default function BusinessPageClient({ showDevPanel = false }: Props) {
  const { state, actions, raw, hydrated } = useGame();
  const [hydrationReady, setHydrationReady] = useState(false);
  const [briefDismissedLocal, setBriefDismissedLocal] = useState(false);

  useEffect(() => {
    setHydrationReady(true);
    actions.setActivePillar("business");
    preloadImage(BUSINESS_HUB_IMG_SRC);
  }, [actions]);

  const companyId = state.activeCompanyId as CompanyId;
  const company = companyById(companyId);
  const userId = getAnalyticsUserId();

  const { partnerId, quests, readSet, questViewBySlug } =
    usePillarHubQuestData("business", companyId);

  const hubCards = useMemo(
    () => buildBusinessHubCards(quests, questViewBySlug, readSet),
    [quests, questViewBySlug, readSet]
  );

  /** Island badge — average of all five hub slots (locked slots count as 0%). */
  const islandProgressPct = useMemo(() => {
    if (hubCards.length === 0) return 0;
    const sum = hubCards.reduce(
      (acc, c) => acc + (c.locked ? 0 : c.completed ? 100 : c.progressPct),
      0
    );
    return Math.round(sum / hubCards.length);
  }, [hubCards]);

  useHubRoutePrefetch(hubCards);

  const companyProgress =
    raw.companies[raw.activeCompanyId] ?? initialCompanyProgress();

  useEffect(() => {
    if (companyProgress.businessIslandBriefDismissedAt != null) {
      markBusinessIslandBriefSeen();
    }
  }, [companyProgress.businessIslandBriefDismissedAt]);

  const islandBriefDismissed =
    companyProgress.businessIslandBriefDismissedAt != null ||
    wasBusinessIslandBriefSeen() ||
    briefDismissedLocal;

  const showIslandBrief =
    hydrationReady && hydrated && !islandBriefDismissed;

  const handleDismissBrief = useCallback(() => {
    setBriefDismissedLocal(true);
    markBusinessIslandBriefSeen();
    actions.dismissBusinessIslandBrief();
  }, [actions]);

  return (
    <main
      className={[
        "pointer-events-auto relative -mb-24 w-full bg-bg-0 pb-10 pt-2",
        hydrationReady ? "" : "static-ui"
      ].join(" ")}
    >
      <BusinessIslandMissionBriefModal
        open={showIslandBrief}
        onDismiss={handleDismissBrief}
      />

      <div className="flex items-center justify-center px-1 py-3 sm:px-3 sm:py-5 md:py-6">
        <BusinessQuestMap
          cards={hubCards}
          company={company}
          companyLogoUrl={company.companyLogoUrl}
          hubProgressPct={islandProgressPct}
          partnerId={partnerId}
          userId={userId}
        />
        {showDevPanel ? <BusinessIslandDevReset /> : null}
      </div>
    </main>
  );
}
