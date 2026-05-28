"use client";

import { useEffect, useMemo, useState } from "react";
import { useGame } from "@/components/GameProvider";
import { BusinessQuestRouteLoading } from "@/components/business/BusinessQuestRouteLoading";
import { DemoComingSoonPanel } from "@/components/demo/DemoComingSoonPanel";
import { ManagementQuestMap } from "@/components/management/ManagementQuestMap";
import { useHubRoutePrefetch } from "@/hooks/useHubRoutePrefetch";
import { usePillarHubQuestData } from "@/hooks/usePillarHubQuestData";
import { getAnalyticsUserId } from "@/lib/analytics/identity";
import { buildManagementHubCards } from "@/lib/management/buildManagementHubCards";
import { companyById, type CompanyId } from "@/data/companies";
import { isPillarComingSoon } from "@/lib/demo/playableDemo";
import { MANAGEMENT_HUB_IMG_SRC } from "@/lib/screenAssetUrls";
import { preloadImage } from "@/lib/preloadImage";

export default function ManagementPageClient() {
  const { state, actions, hydrated } = useGame();
  const [hydrationReady, setHydrationReady] = useState(false);

  useEffect(() => {
    setHydrationReady(true);
    actions.setActivePillar("management");
    preloadImage(MANAGEMENT_HUB_IMG_SRC);
  }, [actions]);

  const companyId = state.activeCompanyId as CompanyId;
  const company = companyById(companyId);
  const userId = getAnalyticsUserId();
  const pillarComingSoon = isPillarComingSoon(companyId, "management");

  const { partnerId, quests, readSet, questViewBySlug, hubProgressPct } =
    usePillarHubQuestData("management", companyId);

  const hubCards = useMemo(
    () => buildManagementHubCards(quests, questViewBySlug, readSet),
    [quests, questViewBySlug, readSet]
  );

  useHubRoutePrefetch(hydrated ? hubCards : []);

  if (pillarComingSoon) {
    return (
      <main
        className={[
          "pointer-events-auto relative -mb-24 w-full bg-bg-0 pb-10 pt-2",
          hydrationReady ? "" : "static-ui"
        ].join(" ")}
      >
        <DemoComingSoonPanel
          title={`Management — ${company.ticker}`}
          message="We're building management quests from SEC proxy filings. For now, explore Business, Financials, and Forces on the map — those islands are ready."
          backHref="/map"
          backLabel="Back to map"
        />
      </main>
    );
  }

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
          <ManagementQuestMap
            cards={hubCards}
            company={company}
            hubProgressPct={hubProgressPct}
            partnerId={partnerId}
            userId={userId}
          />
        )}
      </div>
    </main>
  );
}
