"use client";

import { useEffect, useMemo, useState } from "react";
import { useGame } from "@/components/GameProvider";
import { ManagementQuestMap } from "@/components/management/ManagementQuestMap";
import { useHubRoutePrefetch } from "@/hooks/useHubRoutePrefetch";
import { usePillarHubQuestData } from "@/hooks/usePillarHubQuestData";
import { getAnalyticsUserId } from "@/lib/analytics/identity";
import { buildManagementHubCards } from "@/lib/management/buildManagementHubCards";
import { companyById, type CompanyId } from "@/data/companies";
import { MANAGEMENT_HUB_IMG_SRC } from "@/lib/screenAssetUrls";
import { preloadImage } from "@/lib/preloadImage";

export default function ManagementPageClient() {
  const { state, actions } = useGame();
  const [hydrationReady, setHydrationReady] = useState(false);

  useEffect(() => {
    setHydrationReady(true);
    actions.setActivePillar("management");
    preloadImage(MANAGEMENT_HUB_IMG_SRC);
  }, [actions]);

  const companyId = state.activeCompanyId as CompanyId;
  const company = companyById(companyId);
  const userId = getAnalyticsUserId();

  const { partnerId, quests, readSet, questViewBySlug, hubProgressPct } =
    usePillarHubQuestData("management", companyId);

  const hubCards = useMemo(
    () => buildManagementHubCards(quests, questViewBySlug, readSet),
    [quests, questViewBySlug, readSet]
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
        <ManagementQuestMap
          cards={hubCards}
          company={company}
          hubProgressPct={hubProgressPct}
          partnerId={partnerId}
          userId={userId}
        />
      </div>
    </main>
  );
}
