"use client";

import { useEffect, useMemo, useState } from "react";
import { useGame } from "@/components/GameProvider";
import { FinancialsQuestMap } from "@/components/financials/FinancialsQuestMap";
import { useHubRoutePrefetch } from "@/hooks/useHubRoutePrefetch";
import { usePillarHubQuestData } from "@/hooks/usePillarHubQuestData";
import { getAnalyticsUserId } from "@/lib/analytics/identity";
import { buildFinancialsHubCards } from "@/lib/financials/buildFinancialsHubCards";
import { companyById, type CompanyId } from "@/data/companies";
import { FINANCIAL_HUB_IMG_SRC } from "@/lib/screenAssetUrls";
import { preloadImage } from "@/lib/preloadImage";

export default function FinancialsPageClient() {
  const { state, actions } = useGame();
  const [hydrationReady, setHydrationReady] = useState(false);

  useEffect(() => {
    setHydrationReady(true);
    actions.setActivePillar("financials");
    preloadImage(FINANCIAL_HUB_IMG_SRC);
  }, [actions]);

  const companyId = state.activeCompanyId as CompanyId;
  const company = companyById(companyId);
  const userId = getAnalyticsUserId();

  const {
    partnerId,
    contentVersion,
    quests,
    readSet,
    questViewBySlug,
    hubProgressPct
  } = usePillarHubQuestData("financials", companyId);

  const hubCards = useMemo(
    () => buildFinancialsHubCards(quests, questViewBySlug, readSet),
    [quests, questViewBySlug, readSet, contentVersion]
  );

  useHubRoutePrefetch(hubCards);

  return (
    <main
      className={[
        "pointer-events-auto relative -mb-24 w-full bg-bg-0 pb-10 pt-2",
        hydrationReady ? "" : "static-ui"
      ].join(" ")}
    >
      <div className="flex items-center justify-center px-1 py-3 sm:px-3 sm:py-5 md:py-6">
        <FinancialsQuestMap
          cards={hubCards}
          company={company}
          companyLogoUrl={company.companyLogoUrl}
          hubProgressPct={hubProgressPct}
          partnerId={partnerId}
          userId={userId}
        />
      </div>
    </main>
  );
}
