"use client";

import { useEffect, useMemo, useState } from "react";
import { useGame } from "@/components/GameProvider";
import { BusinessQuestRouteLoading } from "@/components/business/BusinessQuestRouteLoading";
import { ForcesQuestMap } from "@/components/forces/ForcesQuestMap";
import { useHubRoutePrefetch } from "@/hooks/useHubRoutePrefetch";
import { usePillarHubQuestData } from "@/hooks/usePillarHubQuestData";
import { getAnalyticsUserId } from "@/lib/analytics/identity";
import { buildForcesHubCards } from "@/lib/forces/buildForcesHubCards";
import { companyById, type CompanyId } from "@/data/companies";
import { FORCES_HUB_IMG_SRC } from "@/lib/screenAssetUrls";
import { preloadImage } from "@/lib/preloadImage";

export default function ForcesPageClient() {
  const { state, actions, hydrated } = useGame();
  const [hydrationReady, setHydrationReady] = useState(false);

  useEffect(() => {
    setHydrationReady(true);
    actions.setActivePillar("forces");
    preloadImage(FORCES_HUB_IMG_SRC);
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
  } = usePillarHubQuestData("forces", companyId);

  const hubCards = useMemo(
    () => buildForcesHubCards(quests, questViewBySlug, readSet, companyId),
    [quests, questViewBySlug, readSet, companyId, contentVersion]
  );

  useHubRoutePrefetch(hydrated ? hubCards : []);

  return (
    <main
      className={[
        "pointer-events-auto relative -mb-24 w-full bg-bg-0 pb-10 pt-2",
        hydrationReady ? "" : "static-ui"
      ].join(" ")}
    >
      <div className="flex items-center justify-center px-1 py-3 sm:px-3 sm:py-5 md:py-6">
        {!hydrated ? (
          <BusinessQuestRouteLoading />
        ) : (
          <ForcesQuestMap
            cards={hubCards}
            company={company}
            companyLogoUrl={company.companyLogoUrl}
            hubProgressPct={hubProgressPct}
            partnerId={partnerId}
            userId={userId}
          />
        )}
      </div>
    </main>
  );
}
