"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { useGame } from "@/components/GameProvider";
import { isSchoolsDemoPath } from "@/lib/schools/schoolsDemoHref";
import { BusinessIslandMissionBriefModal } from "@/components/business/BusinessIslandMissionBriefModal";
import { BusinessQuestMap } from "@/components/business/BusinessQuestMap";
import { BusinessQuestRouteLoading } from "@/components/business/BusinessQuestRouteLoading";
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
import { prewarmQuestAnswers } from "@/lib/quests/questPrewarmClient";
import { preloadQuestDetailChunks } from "@/lib/quests/preloadQuestDetailChunks";

type Props = {
  /** When true, show `/business?dev=1` reset + debug panel. */
  showDevPanel?: boolean;
};

export default function BusinessPageClient({ showDevPanel = false }: Props) {
  const pathname = usePathname();
  const schoolsDemoFullscreen = isSchoolsDemoPath(pathname);
  const { state, actions, raw, hydrated } = useGame();
  const [hydrationReady, setHydrationReady] = useState(false);
  const [briefDismissedLocal, setBriefDismissedLocal] = useState(false);

  const companyId = state.activeCompanyId as CompanyId;
  const company = companyById(companyId);

  useEffect(() => {
    setHydrationReady(true);
    actions.setActivePillar("business");
    preloadImage(BUSINESS_HUB_IMG_SRC);
    preloadQuestDetailChunks();
  }, [actions]);

  useEffect(() => {
    void prewarmQuestAnswers(company.ticker, "business", "what-they-do");
  }, [company.ticker]);
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

  useHubRoutePrefetch(hydrated ? hubCards : []);

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
        "pointer-events-auto relative w-full bg-bg-0",
        schoolsDemoFullscreen
          ? "iq-schools-business-hub-main flex min-h-0 flex-1 flex-col overflow-hidden"
          : "max-md:min-h-[100dvh] max-md:overflow-hidden max-md:pb-0 max-md:pt-0 -mb-24 pb-10 pt-2 md:overflow-visible",
        hydrationReady ? "" : "static-ui"
      ].join(" ")}
    >
      <BusinessIslandMissionBriefModal
        open={showIslandBrief}
        onDismiss={handleDismissBrief}
      />

      <div
        className={[
          schoolsDemoFullscreen
            ? "flex min-h-0 flex-1 w-full flex-col overflow-hidden max-md:overflow-hidden"
            : "flex w-full items-center justify-center px-0 py-0 max-md:overflow-hidden md:px-3 md:py-5 lg:py-6"
        ].join(" ")}
      >
        {!hydrated ? (
          <BusinessQuestRouteLoading />
        ) : (
          <>
            <BusinessQuestMap
              cards={hubCards}
              company={company}
              companyLogoUrl={company.companyLogoUrl}
              hubProgressPct={islandProgressPct}
              partnerId={partnerId}
              userId={userId}
            />
            {showDevPanel ? <BusinessIslandDevReset /> : null}
          </>
        )}
      </div>
    </main>
  );
}
