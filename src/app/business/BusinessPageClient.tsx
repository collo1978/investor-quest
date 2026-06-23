"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { useGame } from "@/components/GameProvider";
import {
  isSchoolsDemoPath,
  stripSchoolsDemoPrefix
} from "@/lib/schools/schoolsDemoHref";
import { BusinessIslandMissionBriefOverlay } from "@/components/business/BusinessIslandMissionBriefOverlay";
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
import { SCHOOLS_MISSION_BRIEF_IMG_SRC } from "@/lib/schools/schoolsMapConfig";
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
  const learnerPath = schoolsDemoFullscreen
    ? stripSchoolsDemoPrefix(pathname)
    : pathname;
  const isSchoolsBusinessHub =
    learnerPath === "/schools/business" ||
    learnerPath.startsWith("/schools/business/");
  const { state, actions, raw, hydrated } = useGame();
  const [hydrationReady, setHydrationReady] = useState(false);
  const [briefDismissedLocal, setBriefDismissedLocal] = useState(false);

  const companyId = state.activeCompanyId as CompanyId;
  const company = companyById(companyId);

  useLayoutEffect(() => {
    setHydrationReady(true);
    actions.setActivePillar("business");
    preloadImage(BUSINESS_HUB_IMG_SRC);
    preloadImage(SCHOOLS_MISSION_BRIEF_IMG_SRC);
    preloadQuestDetailChunks();
  }, [actions]);

  useEffect(() => {
    void prewarmQuestAnswers(company.ticker, "business", "what-they-do");
  }, [company.ticker]);
  const userId = getAnalyticsUserId();

  const { partnerId, quests, readSet, questViewBySlug } =
    usePillarHubQuestData("business", companyId);

  const companyProgress =
    raw.companies[raw.activeCompanyId] ?? initialCompanyProgress();

  const questCompletedAtBySlug = useMemo(
    () => companyProgress.pillars.business?.completedAt ?? {},
    [companyProgress.pillars.business?.completedAt]
  );

  const hubCards = useMemo(
    () =>
      buildBusinessHubCards(
        quests,
        questViewBySlug,
        readSet,
        questCompletedAtBySlug
      ),
    [quests, questViewBySlug, readSet, questCompletedAtBySlug]
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
    hydrationReady &&
    hydrated &&
    !islandBriefDismissed &&
    hubCards.length > 0 &&
    !isSchoolsBusinessHub;

  const handleDismissBrief = useCallback(() => {
    setBriefDismissedLocal(true);
    markBusinessIslandBriefSeen();
    actions.dismissBusinessIslandBrief();
  }, [actions]);

  return (
    <main
      className={[
        "pointer-events-auto relative w-full",
        showIslandBrief ? "bg-black" : "bg-bg-0",
        schoolsDemoFullscreen
          ? "iq-schools-business-hub-main flex min-h-0 flex-1 flex-col overflow-hidden"
          : "flex min-h-[100dvh] max-h-[100dvh] flex-col overflow-hidden max-md:pt-2",
        hydrationReady ? "" : "static-ui"
      ].join(" ")}
    >
      <BusinessIslandMissionBriefOverlay
        open={showIslandBrief}
        onDismiss={handleDismissBrief}
      />

      <div
        className={[
          "w-full",
          showIslandBrief ? "pointer-events-none" : "",
          schoolsDemoFullscreen
            ? "iq-schools-business-hub-stage flex min-h-0 w-full flex-1 flex-col"
            : "business-hub-page-stage flex min-h-0 w-full flex-1 flex-col max-md:min-h-[100dvh]",
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
              missionBriefOpen={showIslandBrief}
            />
            {showDevPanel && !showIslandBrief ? <BusinessIslandDevReset /> : null}
          </>
        )}
      </div>
    </main>
  );
}
